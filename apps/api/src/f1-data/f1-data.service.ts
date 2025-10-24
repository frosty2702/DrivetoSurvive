import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface DriverPerformance {
  year: number;
  round: number;
  event_name: string;
  driver: string;
  driver_name: string;
  team: string;
  position: number;
  points: number;
  fastest_lap_time: string;
  average_lap_time: string;
  consistency_score: number;
  laps_completed: number;
  total_race_time: string;
}

export interface ChampionshipStandings {
  year: number;
  driver_standings: any[];
  constructor_standings: any[];
}

export interface RaceCalendar {
  year: number;
  total_events: number;
  calendar: Array<{
    round: number;
    event_name: string;
    location: string;
    country: string;
    event_format: string;
    date_start: string;
    f1_support_series: string;
  }>;
}

export interface TeamAnalysis {
  year: number;
  teams: Array<{
    team_name: string;
    races: number;
    total_points: number;
    drivers: string[];
    positions: number[];
    fastest_laps: number;
    avg_position: number;
  }>;
}

@Injectable()
export class F1DataService {
  constructor(private readonly httpService: HttpService) {}

  private readonly FASTF1_BASE_URL = 'http://localhost:8000';

  async getF1Data(endpoint: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.FASTF1_BASE_URL}${endpoint}`)
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch F1 data: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getDriverPerformance(year: number): Promise<DriverPerformance[]> {
    const data = await this.getF1Data(`/driver-performance/${year}`);
    return data.performance_data;
  }

  async getChampionshipStandings(year: number): Promise<ChampionshipStandings> {
    return this.getF1Data(`/championship-standings/${year}`);
  }

  async getRaceCalendar(year: number): Promise<RaceCalendar> {
    return this.getF1Data(`/race-calendar/${year}`);
  }

  async getTeamAnalysis(year: number): Promise<TeamAnalysis> {
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

  async getDriverSeasonSummary(driverName: string, year: number) {
    const performanceData = await this.getDriverPerformance(year);
    const driverRaces = performanceData.filter(race => 
      race.driver_name.toLowerCase().includes(driverName.toLowerCase())
    );

    if (driverRaces.length === 0) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    const totalPoints = driverRaces.reduce((sum, race) => sum + race.points, 0);
    const avgPosition = driverRaces.reduce((sum, race) => sum + race.position, 0) / driverRaces.length;
    const avgConsistency = driverRaces.reduce((sum, race) => sum + race.consistency_score, 0) / driverRaces.length;
    const podiums = driverRaces.filter(race => race.position <= 3).length;
    const wins = driverRaces.filter(race => race.position === 1).length;

    return {
      driver_name: driverRaces[0].driver_name,
      team: driverRaces[0].team,
      year,
      races_participated: driverRaces.length,
      total_points: totalPoints,
      average_position: Math.round(avgPosition * 100) / 100,
      average_consistency: Math.round(avgConsistency * 100) / 100,
      podiums,
      wins,
      performance_trend: driverRaces.map(race => ({
        round: race.round,
        position: race.position,
        points: race.points,
        consistency_score: race.consistency_score
      }))
    };
  }

  async getTeamSeasonSummary(teamName: string, year: number) {
    const teamAnalysis = await this.getTeamAnalysis(year);
    const team = teamAnalysis.teams.find(t => 
      t.team_name.toLowerCase().includes(teamName.toLowerCase())
    );

    if (!team) {
      throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
    }

    return {
      team_name: team.team_name,
      year,
      races: team.races,
      total_points: team.total_points,
      drivers: team.drivers,
      average_position: Math.round(team.avg_position * 100) / 100,
      fastest_laps: team.fastest_laps,
      points_per_race: Math.round((team.total_points / team.races) * 100) / 100
    };
  }

  async getCurrentSeasonData(year: number = new Date().getFullYear()) {
    const [standings, calendar, teamAnalysis] = await Promise.all([
      this.getChampionshipStandings(year),
      this.getRaceCalendar(year),
      this.getTeamAnalysis(year)
    ]);

    return {
      year,
      standings,
      calendar,
      team_analysis: teamAnalysis,
      last_updated: new Date().toISOString()
    };
  }
}
