'use client';

import React, { useState, useEffect } from 'react';
import { Driver, getDrivers } from '../../lib/api';
import Link from 'next/link';
import { MintDriverNFT } from '../components/MintDriverNFT';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call the API
        // const data = await getDrivers();
        
        // For demo purposes, we'll create mock data
        const mockDrivers: Driver[] = [
          {
            id: 'max-verstappen',
            name: 'Max Verstappen',
            nationality: 'Dutch',
            dateOfBirth: '1997-09-30',
            teamId: 'red-bull',
            team: {
              id: 'red-bull',
              name: 'Red Bull Racing',
              teamConstructor: 'Red Bull Racing',
              nationality: 'Austria',
              budget: 450000000,
              sponsorValue: 120000000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            marketValue: 42000000,
            performanceScore: 95,
            totalRaces: 204,
            totalWins: 62,
            totalPodiums: 103,
            totalPoints: 2817.5,
            nftTokenId: '1',
            nftContractAddress: '0xE9C5C9f67fD1C53bA8D8F4D5E8751f7B1bD8B1c9',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'yuki-tsunoda',
            name: 'Yuki Tsunoda',
            nationality: 'Japanese',
            dateOfBirth: '2000-05-11',
            teamId: 'red-bull',
            team: {
              id: 'red-bull',
              name: 'Red Bull Racing',
              teamConstructor: 'Red Bull Racing',
              nationality: 'Austria',
              budget: 450000000,
              sponsorValue: 120000000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            marketValue: 18000000,
            performanceScore: 84,
            totalRaces: 86,
            totalWins: 1,
            totalPodiums: 4,
            totalPoints: 128,
            nftTokenId: '22',
            nftContractAddress: '0xE9C5C9f67fD1C53bA8D8F4D5E8751f7B1bD8B1c9',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'lewis-hamilton',
            name: 'Lewis Hamilton',
            nationality: 'British',
            dateOfBirth: '1985-01-07',
            teamId: 'ferrari',
            team: {
              id: 'ferrari',
              name: 'Scuderia Ferrari',
              teamConstructor: 'Ferrari',
              nationality: 'Italy',
              budget: 445000000,
              sponsorValue: 115000000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            marketValue: 35000000,
            performanceScore: 88,
            totalRaces: 344,
            totalWins: 103,
            totalPodiums: 197,
            totalPoints: 4639.5,
            nftTokenId: '44',
            nftContractAddress: '0xE9C5C9f67fD1C53bA8D8F4D5E8751f7B1bD8B1c9',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'charles-leclerc',
            name: 'Charles Leclerc',
            nationality: 'Monégasque',
            dateOfBirth: '1997-10-16',
            teamId: 'ferrari',
            team: {
              id: 'ferrari',
              name: 'Scuderia Ferrari',
              teamConstructor: 'Ferrari',
              nationality: 'Italy',
              budget: 445000000,
              sponsorValue: 115000000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            marketValue: 28000000,
            performanceScore: 85,
            totalRaces: 141,
            totalWins: 7,
            totalPodiums: 35,
            totalPoints: 1434,
            nftTokenId: '16',
            nftContractAddress: '0xE9C5C9f67fD1C53bA8D8F4D5E8751f7B1bD8B1c9',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'lando-norris',
            name: 'Lando Norris',
            nationality: 'British',
            dateOfBirth: '1999-11-13',
            teamId: 'mclaren',
            team: {
              id: 'mclaren',
              name: 'McLaren F1 Team',
              teamConstructor: 'McLaren',
              nationality: 'United Kingdom',
              budget: 380000000,
              sponsorValue: 90000000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            marketValue: 35000000,
            performanceScore: 90,
            totalRaces: 122,
            totalWins: 5,
            totalPodiums: 25,
            totalPoints: 974,
            nftTokenId: '4',
            nftContractAddress: '0xE9C5C9f67fD1C53bA8D8F4D5E8751f7B1bD8B1c9',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'andrea-kimi-antonelli',
            name: 'Andrea Kimi Antonelli',
            nationality: 'Italian',
            dateOfBirth: '2006-08-25',
            teamId: 'mercedes',
            team: {
              id: 'mercedes',
              name: 'Mercedes AMG Petronas',
              teamConstructor: 'Mercedes',
              nationality: 'Germany',
              budget: 440000000,
              sponsorValue: 110000000,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            marketValue: 12000000,
            performanceScore: 75,
            totalRaces: 0,
            totalWins: 0,
            totalPodiums: 0,
            totalPoints: 0,
            nftTokenId: '87',
            nftContractAddress: '0xE9C5C9f67fD1C53bA8D8F4D5E8751f7B1bD8B1c9',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        
        setDrivers(mockDrivers);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch drivers:', err);
        setError(err.message || 'Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const getTeamColor = (teamName?: string) => {
    switch (teamName) {
      case 'Red Bull Racing': return 'bg-blue-600';
      case 'Mercedes AMG Petronas': return 'bg-teal-600';
      case 'Scuderia Ferrari': return 'bg-red-600';
      case 'McLaren F1 Team': return 'bg-orange-600';
      case 'Aston Martin Aramco': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-8 flex items-center justify-center">
        <div className="text-xl">Loading drivers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-8 flex items-center justify-center">
        <div className="text-xl text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-black">F1 Drivers</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div className={`h-2 ${getTeamColor(driver.team?.name)}`}></div>
              <div className="p-6">
                {/* NFT Card Display */}
                <div className="mb-4 bg-gradient-to-br from-blue-800 to-black rounded-lg p-3 border border-blue-700/30 relative overflow-hidden">
                  {/* NFT Badge */}
                  <div className="absolute top-2 right-2 bg-purple-600 text-xs text-white px-2 py-1 rounded-full">
                    NFT #{driver.nftTokenId}
                  </div>
                  
                  {/* Driver Number */}
                  <div className={`w-16 h-16 mx-auto ${getTeamColor(driver.team?.name)} flex items-center justify-center text-2xl font-bold rounded-lg mb-2`}>
                    {driver.nftTokenId || '#'}
                  </div>
                  
                  {/* Driver Name */}
                  <h2 className="text-lg font-bold text-center text-white">{driver.name}</h2>
                  <p className="text-blue-300 text-xs text-center mb-2">{driver.team?.name}</p>
                  
                  {/* NFT Details */}
                  <div className="flex justify-between text-xs mt-2 bg-black/30 p-2 rounded">
                    <span className="text-gray-400">Token ID: {driver.nftTokenId}</span>
                    <span className="text-purple-400">View on Chain</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-1 font-semibold">Performance Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 border border-black">
                    <div 
                      className={`${getTeamColor(driver.team?.name)} h-2 rounded-full`}
                      style={{ width: `${driver.performanceScore}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-black">
                    <span>{driver.performanceScore}/100</span>
                    <span>${(driver.marketValue / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-100 border border-black p-2 rounded">
                    <p className="text-xs text-gray-600">Wins</p>
                    <p className="font-bold text-black">{driver.totalWins}</p>
                  </div>
                  <div className="bg-gray-100 border border-black p-2 rounded">
                    <p className="text-xs text-gray-600">Podiums</p>
                    <p className="font-bold text-black">{driver.totalPodiums}</p>
                  </div>
                  <div className="bg-gray-100 border border-black p-2 rounded">
                    <p className="text-xs text-gray-600">Points</p>
                    <p className="font-bold text-black">{driver.totalPoints}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <Link href={`/drivers/${driver.id}`}>
                    <button className="w-full bg-blue-700 hover:bg-blue-600 text-white transition-colors px-4 py-2 rounded-lg text-sm font-medium border-2 border-black">
                      View Details
                    </button>
                  </Link>
                  <MintDriverNFT 
                    driverName={driver.name} 
                    tokenId={parseInt(driver.nftTokenId || '0')} 
                    carNumber={parseInt(driver.nftTokenId || '0')} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
