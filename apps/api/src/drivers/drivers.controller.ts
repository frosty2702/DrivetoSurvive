import { Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Controller('drivers')
export class DriversController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    try {
      const drivers = await this.prisma.driver.findMany({
        include: {
          team: true,
        },
      });
      return drivers;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return { error: 'Failed to fetch drivers', details: error.message };
    }
  }

  @Post('fetch-f1-data')
  async fetchF1Data() {
    try {
      // Fetch 2024 F1 data from Ergast API
      const response = await axios.get('https://ergast.com/api/f1/2024/driverStandings.json');
      const driverStandings = response.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
      
      let updatedCount = 0;
      
      // Create/update drivers with real F1 data
      for (const standing of driverStandings.slice(0, 10)) { // Top 10 drivers
        const driver = standing.Driver;
        const constructor = standing.Constructors[0];
        
        // Create team first
        const team = await this.prisma.team.upsert({
          where: { name: constructor.name },
          update: {
            teamConstructor: constructor.name,
            nationality: constructor.nationality,
            sponsorValue: parseFloat(standing.points) * 1000000,
          },
          create: {
            name: constructor.name,
            teamConstructor: constructor.name,
            nationality: constructor.nationality,
            budget: 400000000,
            sponsorValue: parseFloat(standing.points) * 1000000,
          },
        });

        // Create driver
        await this.prisma.driver.upsert({
          where: { id: `${driver.givenName}-${driver.familyName}` },
          update: {
            nationality: driver.nationality,
            teamId: team.id,
            totalPoints: parseInt(standing.points),
            totalWins: parseInt(standing.wins),
            performanceScore: Math.min(parseInt(standing.points) * 2, 100),
            marketValue: parseInt(standing.points) * 1000000,
          },
          create: {
            id: `${driver.givenName}-${driver.familyName}`,
            name: `${driver.givenName} ${driver.familyName}`,
            nationality: driver.nationality,
            dateOfBirth: new Date(driver.dateOfBirth),
            teamId: team.id,
            totalPoints: parseInt(standing.points),
            totalWins: parseInt(standing.wins),
            totalRaces: 20, // Approximate
            totalPodiums: Math.floor(parseInt(standing.points) / 10),
            performanceScore: Math.min(parseInt(standing.points) * 2, 100),
            marketValue: parseInt(standing.points) * 1000000,
          },
        });
        
        updatedCount++;
      }

      return { 
        message: 'F1 data fetched and updated successfully',
        driversUpdated: updatedCount 
      };
    } catch (error) {
      return { 
        error: 'Failed to fetch F1 data', 
        details: error.message 
      };
    }
  }
}

