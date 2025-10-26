import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const FASTF1_API_URL = 'http://localhost:8000';
const NESTJS_API_URL = 'http://localhost:3000';

async function main() {
  console.log('🏎️  Syncing F1 data with database...');

  try {
    // Step 1: Check if FastF1 API is running
    console.log('\n📡 Checking FastF1 API status...');
    const fastf1Status = await axios.get(`${FASTF1_API_URL}/health`).catch(() => null);
    
    if (!fastf1Status) {
      console.error('❌ FastF1 API is not running. Please start it with:');
      console.error('   cd services/fastf1-api && ./start.sh');
      process.exit(1);
    }
    
    console.log(`✅ FastF1 API is running (version: ${fastf1Status.data.fastf1_version})`);

    // Step 2: Sync driver data
    console.log('\n👨‍🏎️ Syncing driver data...');
    const year = 2024; // Current F1 season
    
    // Get drivers from FastF1 API
    const driversResponse = await axios.get(`${FASTF1_API_URL}/drivers/${year}`);
    const drivers = driversResponse.data.drivers;
    console.log(`📊 Found ${drivers.length} drivers for ${year} season`);
    
    // Get championship standings
    console.log('\n🏆 Fetching championship standings...');
    const standingsResponse = await axios.get(`${FASTF1_API_URL}/championship-standings/${year}`);
    const driverStandings = standingsResponse.data.driver_standings;
    const constructorStandings = standingsResponse.data.constructor_standings;
    
    console.log(`📊 Found ${driverStandings.length} driver standings entries`);
    console.log(`📊 Found ${constructorStandings.length} constructor standings entries`);
    
    // Step 3: Process teams first
    console.log('\n🏢 Processing teams...');
    const processedTeams = new Set();
    
    for (const driver of drivers) {
      if (!processedTeams.has(driver.team)) {
        // Find team in constructor standings
        const constructor = constructorStandings.find(c => c.Constructor.name === driver.team);
        
        const team = await prisma.team.upsert({
          where: { name: driver.team },
          update: {
            teamConstructor: driver.team,
            nationality: constructor?.Constructor.nationality || 'Unknown',
            // Update other fields as needed
          },
          create: {
            name: driver.team,
            teamConstructor: driver.team,
            nationality: constructor?.Constructor.nationality || 'Unknown',
            budget: 400000000, // Default budget
            sponsorValue: constructor ? parseFloat(constructor.points) * 500000 : 20000000,
          },
        });
        
        processedTeams.add(driver.team);
        console.log(`  ✅ Team: ${team.name}`);
      }
    }
    
    // Step 4: Process drivers
    console.log('\n🏎️ Processing drivers...');
    let driversProcessed = 0;
    
    for (const driver of drivers) {
      // Find driver in standings
      const standing = driverStandings.find(s => 
        s.Driver.code === driver.abbreviation || 
        s.Driver.familyName.includes(driver.full_name.split(' ').pop() || '')
      );
      
      // Get team
      const team = await prisma.team.findUnique({
        where: { name: driver.team }
      });
      
      if (!team) {
        console.warn(`  ⚠️ Team ${driver.team} not found for driver ${driver.full_name}`);
        continue;
      }
      
      // Calculate market value and performance score
      const points = standing ? parseFloat(standing.points) : 0;
      const position = standing ? parseInt(standing.position) : drivers.length;
      const marketValue = points * 500000 + (21 - position) * 1000000;
      const performanceScore = Math.min(100, Math.max(0, points * 1.5 + (21 - position) * 2));
      
      // Create or update driver
      const driverId = `${driver.full_name.replace(/\s+/g, '-').toLowerCase()}-${year}`;
      
      const createdDriver = await prisma.driver.upsert({
        where: { id: driverId },
        update: {
          teamId: team.id,
          totalPoints: points,
          totalWins: standing ? parseInt(standing.wins) : 0,
          performanceScore,
          marketValue,
          nftTokenId: driver.driver_number,
        },
        create: {
          id: driverId,
          name: driver.full_name,
          nationality: standing?.Driver.nationality || 'Unknown',
          dateOfBirth: new Date(), // Would need additional data
          teamId: team.id,
          totalPoints: points,
          totalWins: standing ? parseInt(standing.wins) : 0,
          totalRaces: 5, // Current season races so far
          totalPodiums: 0, // Would need race results
          performanceScore,
          marketValue,
          nftTokenId: driver.driver_number,
        },
      });
      
      driversProcessed++;
      console.log(`  ✅ Driver: ${createdDriver.name} (${team.name})`);
    }
    
    // Step 5: Process race results for current season
    console.log('\n🏁 Processing race results...');
    
    // Get race calendar
    const calendarResponse = await axios.get(`${FASTF1_API_URL}/race-calendar/${year}`);
    const races = calendarResponse.data.calendar;
    
    // Process completed races (assuming first 5 races are completed)
    const completedRaces = races.slice(0, 5);
    let racesProcessed = 0;
    
    for (const race of completedRaces) {
      try {
        console.log(`  🏎️ Processing ${race.event_name} (Round ${race.round})...`);
        
        // Get session data
        const sessionResponse = await axios.get(`${FASTF1_API_URL}/session/${year}/${race.round}/R`);
        const sessionData = sessionResponse.data;
        
        // Process each driver's results
        let driversInRace = 0;
        
        for (const result of sessionData.results) {
          // Find driver in database
          const driverId = `${result.full_name.replace(/\s+/g, '-').toLowerCase()}-${year}`;
          const driver = await prisma.driver.findFirst({
            where: {
              OR: [
                { id: driverId },
                { name: { contains: result.full_name } }
              ]
            }
          });
          
          if (!driver) {
            console.warn(`    ⚠️ Driver ${result.full_name} not found in database`);
            continue;
          }
          
          // Create performance metric
          await prisma.performanceMetric.upsert({
            where: {
              driverId_raceId: {
                driverId: driver.id,
                raceId: `${year}-${race.round}`
              }
            },
            update: {
              position: result.position,
              points: result.points,
              // Other fields as needed
            },
            create: {
              driverId: driver.id,
              raceId: `${year}-${race.round}`,
              raceName: race.event_name,
              season: year,
              raceDate: new Date(), // Would need to extract from session data
              position: result.position,
              points: result.points,
              fastestLap: false, // Would need additional data
              polePosition: result.grid_position === 1,
              attested: true,
              attestationHash: `fastf1-${year}-${race.round}-${result.driver_abbr}`,
              attestedBy: 'FastF1 API',
            }
          });
          
          driversInRace++;
        }
        
        console.log(`    ✅ Processed ${driversInRace} drivers for ${race.event_name}`);
        racesProcessed++;
      } catch (error: any) {
        console.error(`    ❌ Error processing race ${race.event_name}: ${error?.message || 'Unknown error'}`);
      }
    }
    
    // Step 6: Update driver valuations based on performance
    console.log('\n💰 Updating driver valuations...');
    
    const dbDrivers = await prisma.driver.findMany({
      include: {
        performanceMetrics: true,
      },
    });
    
    let valuationsUpdated = 0;
    
    for (const driver of dbDrivers) {
      // Skip drivers with no metrics
      if (driver.performanceMetrics.length === 0) continue;
      
      // Calculate new performance score and market value
      const metrics = driver.performanceMetrics;
      const totalPoints = metrics.reduce((sum, metric) => sum + metric.points, 0);
      const avgPosition = metrics.reduce((sum, metric) => sum + (metric.position || 20), 0) / metrics.length;
      
      // Recent form - last 3 races
      const recentMetrics = [...metrics]
        .sort((a, b) => b.raceDate.getTime() - a.raceDate.getTime())
        .slice(0, 3);
      
      const recentForm = recentMetrics.length > 0
        ? recentMetrics.reduce((sum, metric) => sum + metric.points, 0) / recentMetrics.length
        : 0;
      
      // Calculate performance score
      const performanceScore = Math.min(100, Math.max(0, 
        totalPoints * 1.2 + // Points contribution
        (21 - avgPosition) * 2 + // Position contribution
        recentForm * 2 // Recent form bonus
      ));
      
      // Calculate market value
      const marketValue = 
        1000000 + // Base value
        totalPoints * 500000 + // Points contribution
        (21 - avgPosition) * 1000000 + // Position contribution
        recentForm * 300000; // Recent form bonus
      
      // Update driver
      await prisma.driver.update({
        where: { id: driver.id },
        data: {
          performanceScore,
          marketValue,
        },
      });
      
      valuationsUpdated++;
      console.log(`  ✅ Updated valuation for ${driver.name}: $${(marketValue/1000000).toFixed(1)}M (Score: ${performanceScore.toFixed(1)})`);
    }
    
    // Summary
    console.log('\n🎉 F1 data sync completed!');
    console.log(`  ✅ Teams processed: ${processedTeams.size}`);
    console.log(`  ✅ Drivers processed: ${driversProcessed}`);
    console.log(`  ✅ Races processed: ${racesProcessed}`);
    console.log(`  ✅ Driver valuations updated: ${valuationsUpdated}`);
    
  } catch (error: any) {
    console.error(`\n❌ Error syncing F1 data: ${error?.message || 'Unknown error'}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
