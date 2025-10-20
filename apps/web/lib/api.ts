import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types matching our backend
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
}

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
}

// API functions
export const driverApi = {
  getAll: async (): Promise<Driver[]> => {
    const response = await api.get('/drivers');
    return response.data;
  },

  fetchF1Data: async () => {
    const response = await api.post('/drivers/fetch-f1-data');
    return response.data;
  },
};

export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

