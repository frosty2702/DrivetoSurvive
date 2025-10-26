/**
 * API client for interacting with the NestJS backend
 */

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API error: ${response.status}`);
  }
  
  return await response.json() as T;
}

/**
 * Driver API
 */
export interface Driver {
  id: string;
  name: string;
  nationality: string;
  dateOfBirth: string;
  teamId: string | null;
  team?: Team;
  marketValue: number;
  performanceScore: number;
  totalRaces: number;
  totalWins: number;
  totalPodiums: number;
  totalPoints: number;
  nftTokenId?: string;
  nftContractAddress?: string;
  createdAt: string;
  updatedAt: string;
  performanceMetrics?: PerformanceMetric[];
}

export async function getDrivers(): Promise<Driver[]> {
  return fetchAPI<Driver[]>('/drivers');
}

export async function getDriver(id: string): Promise<Driver> {
  return fetchAPI<Driver>(`/drivers/${id}`);
}

/**
 * Team API
 */
export interface Team {
  id: string;
  name: string;
  teamConstructor: string;
  nationality: string;
  budget: number;
  sponsorValue: number;
  nftTokenId?: string;
  nftContractAddress?: string;
  createdAt: string;
  updatedAt: string;
  drivers?: Driver[];
}

export async function getTeams(): Promise<Team[]> {
  return fetchAPI<Team[]>('/teams');
}

export async function getTeam(id: string): Promise<Team> {
  return fetchAPI<Team>(`/teams/${id}`);
}

/**
 * Performance Metrics API
 */
export interface PerformanceMetric {
  id: string;
  driverId: string;
  driver?: Driver;
  raceId: string;
  raceName: string;
  season: number;
  raceDate: string;
  position?: number;
  points: number;
  fastestLap: boolean;
  polePosition: boolean;
  lapTime?: string;
  gapToLeader?: string;
  overtakes: number;
  pitStops: number;
  attested: boolean;
  attestationHash?: string;
  attestedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getDriverPerformanceMetrics(driverId: string): Promise<PerformanceMetric[]> {
  return fetchAPI<PerformanceMetric[]>(`/drivers/${driverId}/performance`);
}

/**
 * F1 Data Sync API
 */
export interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  [key: string]: any;
}

export async function syncDriverData(year: number = 2024): Promise<SyncResponse> {
  return fetchAPI<SyncResponse>(`/f1-data/sync-drivers?year=${year}`, {
    method: 'POST',
  });
}

export async function syncRaceResults(year: number, round: number): Promise<SyncResponse> {
  return fetchAPI<SyncResponse>(`/f1-data/sync-race/${year}/${round}`, {
    method: 'POST',
  });
}

export async function updateDriverValuations(): Promise<SyncResponse> {
  return fetchAPI<SyncResponse>('/f1-data/update-valuations', {
    method: 'POST',
  });
}

export async function syncAllData(year: number = 2024): Promise<SyncResponse> {
  return fetchAPI<SyncResponse>(`/f1-data/sync-all?year=${year}`, {
    method: 'POST',
  });
}
