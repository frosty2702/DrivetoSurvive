import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define Hedera Testnet chain
export const hederaTestnet = defineChain({
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
});

export const config = getDefaultConfig({
  appName: 'DrivetoSurvive',
  projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'your_walletconnect_project_id_here',
  chains: [hederaTestnet],
  ssr: false,
});