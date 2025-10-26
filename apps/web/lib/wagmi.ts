import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

// Create wagmi config
export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    metaMask()
  ],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia.publicnode.com'),
    [mainnet.id]: http('https://ethereum.publicnode.com'),
  },
});