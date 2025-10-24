import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'DrivetoSurvive API'
    };
  }

  @Get('f1/driver-performance/:year')
  getDriverPerformance(@Param('year') year: number) {
    return this.appService.getDriverPerformance(year);
  }

  @Get('f1/championship-standings/:year')
  getChampionshipStandings(@Param('year') year: number) {
    return this.appService.getChampionshipStandings(year);
  }

  @Get('f1/race-calendar/:year')
  getRaceCalendar(@Param('year') year: number) {
    return this.appService.getRaceCalendar(year);
  }

  @Get('f1/team-analysis/:year')
  getTeamAnalysis(@Param('year') year: number) {
    return this.appService.getTeamAnalysis(year);
  }

  @Get('f1/session/:year/:round/:sessionType')
  getSessionData(
    @Param('year') year: number,
    @Param('round') round: number,
    @Param('sessionType') sessionType: string
  ) {
    return this.appService.getSessionData(year, round, sessionType);
  }

  @Get('f1/telemetry/:year/:round/:driver')
  getDriverTelemetry(
    @Param('year') year: number,
    @Param('round') round: number,
    @Param('driver') driver: string
  ) {
    return this.appService.getDriverTelemetry(year, round, driver);
  }

  @Get('f1/lap-times/:year/:round')
  getLapTimes(
    @Param('year') year: number,
    @Param('round') round: number,
    @Query('driver') driver?: string
  ) {
    return this.appService.getLapTimes(year, round, driver);
  }
}

