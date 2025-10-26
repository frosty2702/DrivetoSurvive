import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class F1DataService {
  private readonly logger = new Logger(F1DataService.name);
  private readonly fastF1ApiUrl = 'http://localhost:8000'; // FastF1 API microservice URL

  constructor(private prisma: PrismaService) {}

  /**
   * Fetch driver data from FastF1 API and update the database
   */
  async syncDriverData(year: number = 2024): Promise<any> {
    try {
      this.logger.log(`Syncing driver data for ${year} season...`);
      
      // Get drivers from FastF1 API
      const driversResponse = await axios.get(`${this.fastF1ApiUrl}/drivers/${year}`);
      const drivers = driversResponse.data.drivers;
      
      // Get championship standings
      const standingsResponse = await axios.get(`${this.fastF1ApiUrl}/championship-standings/${year}`);
      const driverStandings = standingsResponse.data.driver_standings;
      
      // Get driver performance metrics
      const performanceResponse = await axios.get(`${this.fastF1ApiUrl}/driver-performance/${year}`);
      const performanceData = performanceResponse.data.performance_data;
      
      // Process and update database
      let updatedCount = 0;
      const processedTeams = new Set();
      
      for (const driver of drivers) {
        // Find driver in standings
        const standing = driverStandings.find(s => s.DriverId === driver.abbreviation);
        
        // Find performance metrics
        const performances = performanceData.filter(p => p.driver === driver.abbreviation);
        const avgPerformance = performances.length > 0 
          ? performances.reduce((sum, p) => sum + p.consistency_score, 0) / performances.length
          : 0.5;
        
        // Create or update team
        if (!processedTeams.has(driver.team)) {
          const team = await this.prisma.team.upsert({
            where: { name: driver.team },
            update: {
              teamConstructor: driver.team,
              // Update other fields if needed
            },
            create: {
              name: driver.team,
              teamConstructor: driver.team,
              nationality: 'Unknown', // Would need additional API call to get this
              budget: 400000000, // Default budget
              sponsorValue: Math.random() * 50000000, // Random sponsor value
            },
          });
          processedTeams.add(driver.team);
          this.logger.debug(`Team ${driver.team} processed`);
        }
        
        // Calculate market value based on performance and standings
        const points = standing ? parseFloat(standing.points) : 0;
        const position = standing ? parseInt(standing.position) : 20;
        const marketValue = this.calculateMarketValue(points, position, avgPerformance);
        const performanceScore = this.calculatePerformanceScore(points, position, avgPerformance);
        
        // Get team ID
        const team = await this.prisma.team.findUnique({
          where: { name: driver.team }
        });
        
        if (!team) {
          this.logger.warn(`Team ${driver.team} not found for driver ${driver.full_name}`);
          continue;
        }
        
        // Create or update driver
        await this.prisma.driver.upsert({
          where: { 
            // Use a combination of name and team as unique identifier
            id: `${driver.full_name}-${driver.team}`.replace(/\s+/g, '-').toLowerCase()
          },
          update: {
            teamId: team.id,
            totalPoints: points,
            totalWins: standing ? parseInt(standing.wins) : 0,
            performanceScore,
            marketValue,
          },
          create: {
            id: `${driver.full_name}-${driver.team}`.replace(/\s+/g, '-').toLowerCase(),
            name: driver.full_name,
            nationality: 'Unknown', // Would need additional API call
            dateOfBirth: new Date(), // Would need additional API call
            teamId: team.id,
            totalPoints: points,
            totalWins: standing ? parseInt(standing.wins) : 0,
            totalRaces: performances.length,
            totalPodiums: performances.filter(p => p.position <= 3).length,
            performanceScore,
            marketValue,
            nftTokenId: driver.driver_number,
          },
        });
        
        updatedCount++;
        this.logger.debug(`Driver ${driver.full_name} processed`);
      }
      
      return {
        success: true,
        message: 'F1 data synchronized successfully',
        driversUpdated: updatedCount,
        teamsUpdated: processedTeams.size,
      };
    } catch (error) {
      this.logger.error(`Failed to sync F1 data: ${error.message}`, error.stack);
      return {
        success: false,
        error: 'Failed to sync F1 data',
        details: error.message,
      };
    }
  }
  
  /**
   * Fetch race results and update performance metrics
   */
  async syncRaceResults(year: number = 2024, round: number = 1): Promise<any> {
    try {
      this.logger.log(`Syncing race results for ${year} R${round}...`);
      
      // Get session data from FastF1 API
      const sessionResponse = await axios.get(`${this.fastF1ApiUrl}/session/${year}/${round}/R`);
      const sessionData = sessionResponse.data;
      
      // Get lap times
      const lapTimesResponse = await axios.get(`${this.fastF1ApiUrl}/lap-times/${year}/${round}`);
      const lapTimes = lapTimesResponse.data.laps;
      
      let metricsCreated = 0;
      
      // Process each driver's results
      for (const result of sessionData.results) {
        // Find driver in database
        const driver = await this.prisma.driver.findFirst({
          where: {
            name: { contains: result.full_name }
          }
        });
        
        if (!driver) {
          this.logger.warn(`Driver ${result.full_name} not found in database`);
          continue;
        }
        
        // Calculate metrics
        const driverLaps = lapTimes.filter(lap => lap.driver === result.driver_abbr);
        const fastestLap = driverLaps.reduce((fastest, lap) => {
          if (!fastest.lap_time || (lap.lap_time && lap.lap_time < fastest.lap_time)) {
            return lap;
          }
          return fastest;
        }, { lap_time: null });
        
        // Create performance metric
        await this.prisma.performanceMetric.upsert({
          where: {
            driverId_raceId: {
              driverId: driver.id,
              raceId: `${year}-${round}`
            }
          },
          update: {
            position: result.position,
            points: result.points,
            fastestLap: fastestLap.is_personal_best || false,
            lapTime: fastestLap.lap_time || null,
            attested: true, // Verified by FastF1 API
            attestationHash: `fastf1-${year}-${round}-${result.driver_abbr}`,
            attestedBy: 'FastF1 API',
          },
          create: {
            driverId: driver.id,
            raceId: `${year}-${round}`,
            raceName: sessionData.event_name,
            season: year,
            raceDate: new Date(), // Would need to extract from session data
            position: result.position,
            points: result.points,
            fastestLap: fastestLap.is_personal_best || false,
            polePosition: result.grid_position === 1,
            lapTime: fastestLap.lap_time || null,
            attested: true,
            attestationHash: `fastf1-${year}-${round}-${result.driver_abbr}`,
            attestedBy: 'FastF1 API',
          }
        });
        
        metricsCreated++;
      }
      
      return {
        success: true,
        message: `Race results for ${year} R${round} synchronized successfully`,
        metricsCreated,
      };
    } catch (error) {
      this.logger.error(`Failed to sync race results: ${error.message}`, error.stack);
      return {
        success: false,
        error: 'Failed to sync race results',
        details: error.message,
      };
    }
  }
  
  /**
   * Update driver valuations based on performance metrics
   */
  async updateDriverValuations(): Promise<any> {
    try {
      this.logger.log('Updating driver valuations...');
      
      // Get all drivers with their performance metrics
      const drivers = await this.prisma.driver.findMany({
        include: {
          performanceMetrics: true,
        },
      });
      
      let updatedCount = 0;
      
      for (const driver of drivers) {
        // Calculate new performance score and market value
        const metrics = driver.performanceMetrics;
        
        if (metrics.length === 0) {
          continue; // Skip drivers with no metrics
        }
        
        // Calculate performance score based on recent results
        const totalPoints = metrics.reduce((sum, metric) => sum + metric.points, 0);
        const avgPosition = metrics.reduce((sum, metric) => sum + (metric.position || 20), 0) / metrics.length;
        const recentForm = metrics
          .sort((a, b) => b.raceDate.getTime() - a.raceDate.getTime()) // Sort by most recent
          .slice(0, 3) // Last 3 races
          .reduce((sum, metric) => sum + (metric.points / 3), 0); // Average points
          
        const performanceScore = this.calculatePerformanceScore(
          totalPoints,
          avgPosition,
          recentForm / 10 // Scale recent form to 0-1 range
        );
        
        // Calculate market value based on performance
        const marketValue = this.calculateMarketValue(
          totalPoints,
          avgPosition,
          recentForm / 10
        );
        
        // Update driver
        await this.prisma.driver.update({
          where: { id: driver.id },
          data: {
            performanceScore,
            marketValue,
          },
        });
        
        updatedCount++;
      }
      
      return {
        success: true,
        message: 'Driver valuations updated successfully',
        driversUpdated: updatedCount,
      };
    } catch (error) {
      this.logger.error(`Failed to update driver valuations: ${error.message}`, error.stack);
      return {
        success: false,
        error: 'Failed to update driver valuations',
        details: error.message,
      };
    }
  }
  
  /**
   * Calculate driver performance score (0-100)
   */
  private calculatePerformanceScore(
    points: number,
    position: number,
    performanceFactor: number
  ): number {
    // Base score from points (0-50)
    const pointsScore = Math.min(points / 4, 50);
    
    // Position factor (0-30)
    const positionScore = Math.max(0, 30 - (position * 1.5));
    
    // Performance factor (0-20)
    const performanceBonus = performanceFactor * 20;
    
    // Combine scores and ensure range 0-100
    return Math.min(100, Math.max(0, pointsScore + positionScore + performanceBonus));
  }
  
  /**
   * Calculate driver market value in USD
   */
  private calculateMarketValue(
    points: number,
    position: number,
    performanceFactor: number
  ): number {
    // Base value from points
    const baseValue = points * 100000;
    
    // Position multiplier (better positions get higher values)
    const positionMultiplier = Math.max(0.5, 2 - (position * 0.1));
    
    // Performance bonus (0-50% extra)
    const performanceBonus = 1 + (performanceFactor * 0.5);
    
    // Combine factors
    return baseValue * positionMultiplier * performanceBonus;
  }
}