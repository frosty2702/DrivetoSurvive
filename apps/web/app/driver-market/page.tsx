'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract } from 'wagmi';
import { ConnectButton } from '../components/ConnectButton';
import { CONTRACTS } from '../config/contracts';
import { parseEther } from 'viem';
import { DriverValuation } from '../components/DriverValuation';

// ABI for the mint function
const MINT_ABI = [{
  name: 'mint',
  type: 'function',
  stateMutability: 'payable',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'uri', type: 'string' }
  ],
  outputs: []
}];

const DRIVERS = [
  {
    name: 'Max Verstappen',
    team: 'Red Bull Racing',
    number: 1,
    championships: 4,
    baseValue: 48000000,
  },
  {
    name: 'Yuki Tsunoda',
    team: 'Red Bull Racing',
    number: 22,
    championships: 0,
    baseValue: 18000000,
  },
  {
    name: 'Lewis Hamilton',
    team: 'Scuderia Ferrari',
    number: 44,
    championships: 7,
    baseValue: 40000000,
  },
  {
    name: 'Andrea Kimi Antonelli',
    team: 'Mercedes AMG Petronas',
    number: 87,
    championships: 0,
    baseValue: 12000000,
  },
  {
    name: 'Charles Leclerc',
    team: 'Scuderia Ferrari',
    number: 16,
    championships: 0,
    baseValue: 28000000,
  },
  {
    name: 'Lando Norris',
    team: 'McLaren F1 Team',
    number: 4,
    championships: 0,
    baseValue: 35000000,
  },
];

export default function DriverMarketPage() {
  const [sortBy, setSortBy] = useState<'name' | 'team' | 'value'>('value');
  const [mintingDrivers, setMintingDrivers] = useState<Record<string, boolean>>({});
  const [mintSuccess, setMintSuccess] = useState<Record<string, boolean>>({});
  const [mintErrors, setMintErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  
  const handleInvestInDriver = async (driver: typeof DRIVERS[0]) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }
    
    setMintingDrivers(prev => ({ ...prev, [driver.name]: true }));
    setMintErrors(prev => ({ ...prev, [driver.name]: '' }));
    
    try {
      // Generate a simple metadata URI
      const tokenURI = `https://drivetosurvive.example/metadata/${driver.name.toLowerCase().replace(/\s+/g, '-')}-${driver.number}`;
      
      writeContract({
        address: CONTRACTS.sepolia.driverNFT as `0x${string}`,
        abi: MINT_ABI,
        functionName: 'mint',
        args: [address, BigInt(driver.number), tokenURI],
        value: parseEther('0.003') // 0.003 ETH mint price
      }, {
        onSuccess: () => {
          setMintSuccess(prev => ({ ...prev, [driver.name]: true }));
          setMintingDrivers(prev => ({ ...prev, [driver.name]: false }));
          setTimeout(() => {
            setMintSuccess(prev => {
              const newState = { ...prev };
              delete newState[driver.name];
              return newState;
            });
          }, 5000);
        },
        onError: (error) => {
          console.error('Mint error:', error);
          setMintErrors(prev => ({ ...prev, [driver.name]: error.message || 'Failed to mint NFT' }));
          setMintingDrivers(prev => ({ ...prev, [driver.name]: false }));
        }
      });
    } catch (error: any) {
      console.error('Mint error:', error);
      setMintErrors(prev => ({ ...prev, [driver.name]: error.message || 'Failed to mint NFT' }));
      setMintingDrivers(prev => ({ ...prev, [driver.name]: false }));
    }
  };
  
  const handleViewDetails = (driverName: string) => {
    // Convert driver name to ID format (lowercase with dashes)
    const driverId = driverName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/drivers/${driverId}`);
  };
  
  return (
    <div className="min-h-screen bg-white text-black p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-black">Driver Market</h1>
        <p className="text-gray-600">Live driver valuations powered by Pyth Oracle | Next race: Abu Dhabi Grand Prix (Dec 7, 2025)</p>
      </header>

      <div className="mb-6 bg-white border-2 border-black rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">How It Works</h2>
        <p className="mb-4 text-black">
          Driver market values are calculated in real-time using Pyth Oracle price feeds. Each driver's performance is simulated
          using cryptocurrency price movements, creating a dynamic valuation system.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 border border-black p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-black">Performance Score</h3>
            <p className="text-sm text-black">
              Performance scores are derived from price data and recent price movements, simulating race performance.
              Higher scores mean better recent performance.
            </p>
          </div>
          <div className="bg-gray-100 border border-black p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-black">Market Value</h3>
            <p className="text-sm text-black">
              Market values combine performance scores with base value, sponsor interest, and fan demand to create
              a comprehensive valuation for each driver.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {DRIVERS.map((driver) => (
          <div key={driver.number} className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-black">{driver.name}</h3>
                <p className="text-gray-600">{driver.team}</p>
                {driver.championships > 0 && (
                  <p className="text-xs mt-1 text-black">
                    {driver.championships}x World Champion
                  </p>
                )}
              </div>
              <div className="bg-red-600 w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold text-white border-2 border-black">
                {driver.number}
              </div>
            </div>
            
            <DriverValuation driverName={driver.name} baseValue={driver.baseValue} />
            
            <div className="mt-4 space-y-2">
              {!isConnected && (
                <div className="mb-2">
                  <ConnectButton />
                </div>
              )}
              
              {mintSuccess[driver.name] && (
                <div className="p-2 bg-green-100 border-2 border-green-600 rounded-lg text-sm text-green-800 text-center">
                  ✓ Successfully minted {driver.name} NFT #{driver.number}!
                </div>
              )}
              
              {mintErrors[driver.name] && (
                <div className="p-2 bg-red-100 border-2 border-red-600 rounded-lg text-sm text-red-800">
                  Error: {mintErrors[driver.name]}
                </div>
              )}
              
              <div className="flex justify-between gap-2">
                <button 
                  onClick={() => handleViewDetails(driver.name)}
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm border-2 border-black flex-1"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleInvestInDriver(driver)}
                  disabled={isPending || mintingDrivers[driver.name] || !isConnected}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm border-2 border-black flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mintingDrivers[driver.name] ? 'Minting...' : `Invest (0.003 ETH)`}
                </button>
              </div>
              {isConnected && (
                <p className="text-xs text-gray-600 text-center">
                  Mint {driver.name} NFT #{driver.number} for 0.003 ETH
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
