import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  getHello(): string {
    return 'DrivetoSurvive API - Ready to race! 🏎️';
  }

  async getF1Data(endpoint: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:8000${endpoint}`)
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch F1 data: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getDriverPerformance(year: number) {
    return this.getF1Data(`/driver-performance/${year}`);
  }

  async getChampionshipStandings(year: number) {
    return this.getF1Data(`/championship-standings/${year}`);
  }

  async getRaceCalendar(year: number) {
    return this.getF1Data(`/race-calendar/${year}`);
  }

  async getTeamAnalysis(year: number) {
    return this.getF1Data(`/team-analysis/${year}`);
  }

  async getSessionData(year: number, round: number, sessionType: string) {
    return this.getF1Data(`/session/${year}/${round}/${sessionType}`);
  }

  async getDriverTelemetry(year: number, round: number, driver: string) {
    return this.getF1Data(`/telemetry/${year}/${round}/${driver}`);
  }

  async getLapTimes(year: number, round: number, driver?: string) {
    const endpoint = driver 
      ? `/lap-times/${year}/${round}?driver=${driver}`
      : `/lap-times/${year}/${round}`;
    return this.getF1Data(endpoint);
  }
}

