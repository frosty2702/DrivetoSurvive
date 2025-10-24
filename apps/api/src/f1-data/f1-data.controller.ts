import { Controller, Get, Param, Query } from '@nestjs/common';
import { F1DataService } from './f1-data.service';

@Controller('f1-data')
export class F1DataController {
  constructor(private readonly f1DataService: F1DataService) {}

  @Get('driver-performance/:year')
  getDriverPerformance(@Param('year') year: number) {
    return this.f1DataService.getDriverPerformance(year);
  }

  @Get('championship-standings/:year')
  getChampionshipStandings(@Param('year') year: number) {
    return this.f1DataService.getChampionshipStandings(year);
  }

  @Get('race-calendar/:year')
  getRaceCalendar(@Param('year') year: number) {
    return this.f1DataService.getRaceCalendar(year);
  }

  @Get('team-analysis/:year')
  getTeamAnalysis(@Param('year') year: number) {
    return this.f1DataService.getTeamAnalysis(year);
  }

  @Get('session/:year/:round/:sessionType')
  getSessionData(
    @Param('year') year: number,
    @Param('round') round: number,
    @Param('sessionType') sessionType: string
  ) {
    return this.f1DataService.getSessionData(year, round, sessionType);
  }

  @Get('telemetry/:year/:round/:driver')
  getDriverTelemetry(
    @Param('year') year: number,
    @Param('round') round: number,
    @Param('driver') driver: string
  ) {
    return this.f1DataService.getDriverTelemetry(year, round, driver);
  }

  @Get('lap-times/:year/:round')
  getLapTimes(
    @Param('year') year: number,
    @Param('round') round: number,
    @Query('driver') driver?: string
  ) {
    return this.f1DataService.getLapTimes(year, round, driver);
  }

  @Get('driver-summary/:driverName/:year')
  getDriverSeasonSummary(
    @Param('driverName') driverName: string,
    @Param('year') year: number
  ) {
    return this.f1DataService.getDriverSeasonSummary(driverName, year);
  }

  @Get('team-summary/:teamName/:year')
  getTeamSeasonSummary(
    @Param('teamName') teamName: string,
    @Param('year') year: number
  ) {
    return this.f1DataService.getTeamSeasonSummary(teamName, year);
  }

  @Get('current-season/:year?')
  getCurrentSeasonData(@Param('year') year?: number) {
    return this.f1DataService.getCurrentSeasonData(year);
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'F1 Data Service'
    };
  }
}
