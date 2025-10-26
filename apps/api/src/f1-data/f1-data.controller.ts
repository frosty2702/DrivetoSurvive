import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { F1DataService } from './f1-data.service';

@Controller('f1-data')
export class F1DataController {
  constructor(private readonly f1DataService: F1DataService) {}

  @Get('status')
  getStatus() {
    return {
      status: 'ok',
      service: 'F1 Data Integration',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('sync-drivers')
  async syncDriverData(@Query('year') year: number = 2024) {
    return await this.f1DataService.syncDriverData(year);
  }

  @Post('sync-race/:year/:round')
  async syncRaceResults(
    @Param('year') year: number,
    @Param('round') round: number,
  ) {
    return await this.f1DataService.syncRaceResults(year, round);
  }

  @Post('update-valuations')
  async updateDriverValuations() {
    return await this.f1DataService.updateDriverValuations();
  }

  @Post('sync-all')
  async syncAllData(@Query('year') year: number = 2024) {
    // Step 1: Sync driver data
    const driversResult = await this.f1DataService.syncDriverData(year);
    
    // Step 2: Sync race results for all completed rounds
    const raceResults = [];
    for (let round = 1; round <= 5; round++) { // Assuming 5 races completed
      try {
        const result = await this.f1DataService.syncRaceResults(year, round);
        raceResults.push(result);
      } catch (error) {
        raceResults.push({
          success: false,
          round,
          error: error.message,
        });
      }
    }
    
    // Step 3: Update driver valuations
    const valuationsResult = await this.f1DataService.updateDriverValuations();
    
    return {
      success: driversResult.success && valuationsResult.success,
      driversSync: driversResult,
      racesSync: raceResults,
      valuationsUpdate: valuationsResult,
    };
  }
}