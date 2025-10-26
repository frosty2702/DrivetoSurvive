'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { DriverValuation } from '../../components/DriverValuation';
import { MintDriverNFT } from '../../components/MintDriverNFT';
import { ConnectButton } from '../../components/ConnectButton';
import Link from 'next/link';

interface DriverData {
  id: string;
  name: string;
  nationality: string;
  team: string;
  standing: number;
  nftTokenId: string;
  nftContractAddress: string;
  marketValue: number;
  marketValueETH: number;
  performanceScore: number;
  baseSalary: number;
  contractEnd: string;
  performanceBonus: number;
  totalContract: number;
  seasonPoints: number;
  seasonWins: number;
  seasonPodiums: number;
  seasonPoles: number;
  seasonFastestLaps: number;
  recentRaces: Array<{
    race: string;
    position: number;
    points: number;
    performanceScore: number;
  }>;
  sponsors: Array<{
    name: string;
    logo: string;
    amount: number;
  }>;
  sponsorPoolBalance: number;
  hhi: number;
  topFans: Array<{
    address: string;
    nftsHeld: number;
    engagementScore: number;
    tier: 'Gold' | 'Silver' | 'Bronze';
    perks: string[];
    claimed: boolean;
  }>;
}

export default function DriverDetailPage() {
  const params = useParams();
  const driverId = params.id as string;
  const { address, isConnected } = useAccount();
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('Last updated: 2m ago');
  const [liveUpdate, setLiveUpdate] = useState(false);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setLoading(true);
        // Mock data - replace with API call
        const mockDriver: DriverData = {
          id: driverId,
          name: driverId === 'max-verstappen' ? 'Max Verstappen' : 'Yuki Tsunoda',
          nationality: driverId === 'max-verstappen' ? 'Dutch' : 'Japanese',
          team: 'Red Bull Racing',
          standing: driverId === 'max-verstappen' ? 1 : 16,
          nftTokenId: driverId === 'max-verstappen' ? '1' : '22',
          nftContractAddress: '0xE9C5C9f67fD1C53bA8D8F4D5E8751f7B1bD8B1c9',
          marketValue: driverId === 'max-verstappen' ? 48000000 : 18000000,
          marketValueETH: driverId === 'max-verstappen' ? 16.2 : 6.1,
          performanceScore: driverId === 'max-verstappen' ? 95 : 75,
          baseSalary: driverId === 'max-verstappen' ? 50000000 : 8000000,
          contractEnd: '2028-12-31',
          performanceBonus: driverId === 'max-verstappen' ? 15000000 : 2000000,
          totalContract: driverId === 'max-verstappen' ? 65000000 : 10000000,
          seasonPoints: driverId === 'max-verstappen' ? 243 : 6,
          seasonWins: driverId === 'max-verstappen' ? 7 : 0,
          seasonPodiums: driverId === 'max-verstappen' ? 11 : 0,
          seasonPoles: driverId === 'max-verstappen' ? 8 : 0,
          seasonFastestLaps: driverId === 'max-verstappen' ? 6 : 0,
          recentRaces: [
            { race: 'United States GP', position: 1, points: 25, performanceScore: 98 },
            { race: 'Brazil GP', position: 2, points: 18, performanceScore: 92 },
            { race: 'Mexico GP', position: 1, points: 25, performanceScore: 95 },
          ],
          sponsors: [
            { name: 'Oracle', logo: '🔵', amount: 45000000 },
            { name: 'Honda', logo: '🏁', amount: 30000000 },
            { name: 'Bybit', logo: '₿', amount: 18000000 },
          ],
          sponsorPoolBalance: 105500000,
          hhi: 2450,
          topFans: [
            { address: '0x1234...5678', nftsHeld: 5, engagementScore: 950, tier: 'Gold', perks: ['VIP Access', 'Meet & Greet', 'Exclusive Merch'], claimed: false },
            { address: '0xabcd...ef01', nftsHeld: 3, engagementScore: 720, tier: 'Silver', perks: ['VIP Access', 'Exclusive Merch'], claimed: false },
            { address: '0x9876...5432', nftsHeld: 2, engagementScore: 580, tier: 'Bronze', perks: ['Exclusive Merch'], claimed: false },
          ],
        };
        setDriver(mockDriver);
      } catch (err) {
        console.error('Failed to fetch driver:', err);
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchDriver();
    }

    // Simulate live updates
    const interval = setInterval(() => {
      setStatus(`Last updated: ${Math.floor(Math.random() * 5) + 1}m ago`);
      setLiveUpdate(true);
      setTimeout(() => setLiveUpdate(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, [driverId]);

  const handleClaimReward = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    // Mock claim flow
    alert('Claim reward transaction initiated!');
  };

  const handleSponsorDeposit = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    alert('Sponsor deposit flow - coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-8 flex items-center justify-center">
        <div className="text-xl">Loading driver profile...</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-8 flex items-center justify-center">
        <div className="text-xl text-red-400">Driver not found</div>
      </div>
    );
  }

  const isTopFan = driver.topFans.some(fan => fan.address.toLowerCase() === address?.toLowerCase());

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header / Hero */}
      <div className="bg-gradient-to-r from-blue-800 to-purple-900 py-12 border-b-4 border-red-600">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center text-6xl font-bold border-4 border-white/20">
              {driver.nftTokenId}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold">{driver.name}</h1>
                <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-bold">#{driver.standing}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-blue-200">{driver.nationality}</span>
                <span>•</span>
                <span className="text-blue-200">{driver.team}</span>
                <span>•</span>
                <span className="text-purple-300">NFT #{driver.nftTokenId}</span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border border-black ${liveUpdate ? 'bg-green-500 text-white animate-pulse' : 'bg-blue-700 text-white'}`}>
                  {status}
                </span>
                <a 
                  href={`https://sepolia.etherscan.io/token/${driver.nftContractAddress}?a=${driver.nftTokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline font-semibold"
                >
                  View on Blockscout →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Live Valuation Ticker */}
        <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Market Value</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-black">${(driver.marketValue / 1000000).toFixed(1)}M</p>
                <span className="text-green-600 text-sm">+2.5%</span>
              </div>
              <p className="text-gray-700 mt-1">~{driver.marketValueETH.toFixed(2)} ETH</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Performance Score</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 bg-gray-200 rounded-full h-3 border border-black">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${driver.performanceScore}%` }}
                  ></div>
                </div>
                <span className="font-bold text-black">{driver.performanceScore}/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contract Card */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-black">Contract Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Base Salary</p>
                  <p className="text-2xl font-bold text-black">${(driver.baseSalary / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contract End</p>
                  <p className="text-xl font-bold text-black">{new Date(driver.contractEnd).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 border border-black p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 mb-2 font-semibold">Performance Bonus Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-black">
                    <span>Wins (7 × $500K)</span>
                    <span className="font-bold">$3.5M</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>Podiums (11 × $200K)</span>
                    <span className="font-bold">$2.2M</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>Championship Points Bonus</span>
                    <span className="font-bold">${((driver.performanceBonus - 5700000) / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="border-t border-black pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-black">Total Performance Bonus</span>
                    <span className="font-bold text-green-600">${(driver.performanceBonus / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border-2 border-green-600 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-green-700">Current Contract Total</p>
                    <p className="text-3xl font-bold text-black">${(driver.totalContract / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-700">Base + Bonuses</p>
                    <p className="text-sm text-green-800">{(driver.performanceBonus / driver.baseSalary * 100).toFixed(1)}% bonus</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-black">Performance Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-100 border border-black p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Points</p>
                  <p className="text-2xl font-bold text-black">{driver.seasonPoints}</p>
                </div>
                <div className="bg-gray-100 border border-black p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Wins</p>
                  <p className="text-2xl font-bold text-black">{driver.seasonWins}</p>
                </div>
                <div className="bg-gray-100 border border-black p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Podiums</p>
                  <p className="text-2xl font-bold text-black">{driver.seasonPodiums}</p>
                </div>
                <div className="bg-gray-100 border border-black p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Poles</p>
                  <p className="text-2xl font-bold text-black">{driver.seasonPoles}</p>
                </div>
                <div className="bg-gray-100 border border-black p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Fastest Laps</p>
                  <p className="text-2xl font-bold text-black">{driver.seasonFastestLaps}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2 font-semibold">Recent Races</p>
                <div className="overflow-x-auto border-2 border-black rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-black bg-gray-100">
                        <th className="text-left py-2 px-4 text-black">Race</th>
                        <th className="text-center py-2 px-4 text-black">Position</th>
                        <th className="text-center py-2 px-4 text-black">Points</th>
                        <th className="text-center py-2 px-4 text-black">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driver.recentRaces.map((race, idx) => (
                        <tr key={idx} className="border-b border-black">
                          <td className="py-2 px-4 text-black">{race.race}</td>
                          <td className="text-center py-2 px-4 text-black">{race.position}</td>
                          <td className="text-center py-2 px-4 text-black">{race.points}</td>
                          <td className="text-center py-2 px-4 text-black">{race.performanceScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sponsors & Sponsor Pool */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-black">Sponsors & Sponsor Pool</h2>
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-2 font-semibold">Top Sponsors</p>
                <div className="space-y-3">
                  {driver.sponsors.map((sponsor, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-100 border border-black p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sponsor.logo}</span>
                        <span className="font-medium text-black">{sponsor.name}</span>
                      </div>
                      <span className="font-bold text-black">${(sponsor.amount / 1000000).toFixed(1)}M</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-green-50 border-2 border-green-600 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-green-700">Sponsor Pool Balance</p>
                  <p className="text-2xl font-bold text-black">${(driver.sponsorPoolBalance / 1000000).toFixed(1)}M</p>
                </div>
                <p className="text-xs text-green-800">Funds released based on performance milestones</p>
              </div>
              
              <div className="bg-yellow-50 border-2 border-yellow-600 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-yellow-700">HHI Concentration</p>
                    <p className="text-xl font-bold text-black">{driver.hhi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-800">Limit: 2500</p>
                    <p className={`text-sm font-medium ${driver.hhi < 2500 ? 'text-green-600' : 'text-red-600'}`}>
                      {driver.hhi < 2500 ? '✓ Within limits' : '⚠ Exceeds limit'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Top Fans / Rewards */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-black">Top Fans & Rewards</h2>
              <div className="space-y-4">
                {driver.topFans.map((fan, idx) => (
                  <div key={idx} className={`border-2 rounded-lg p-4 bg-white ${fan.tier === 'Gold' ? 'border-yellow-500' : fan.tier === 'Silver' ? 'border-gray-400' : 'border-orange-600'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono text-sm text-black">{fan.address}</p>
                        <p className={`text-xs font-bold ${fan.tier === 'Gold' ? 'text-yellow-600' : fan.tier === 'Silver' ? 'text-gray-700' : 'text-orange-600'}`}>
                          {fan.tier} Tier
                        </p>
                      </div>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded border border-black">{fan.nftsHeld} NFTs</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-700 mb-1 font-semibold">Eligible Perks:</p>
                      <ul className="text-xs space-y-1">
                        {fan.perks.map((perk, pIdx) => (
                          <li key={pIdx} className="flex items-center gap-1 text-black">
                            <span className="text-green-600">✓</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {isConnected && address?.toLowerCase() === fan.address.toLowerCase() && !fan.claimed && (
                      <button
                        onClick={handleClaimReward}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium border border-black"
                      >
                        Claim Rewards
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-black">Actions</h2>
              <div className="space-y-3">
                {!isConnected && (
                  <div className="mb-4">
                    <ConnectButton />
                  </div>
                )}
                
                <MintDriverNFT 
                  driverName={driver.name} 
                  tokenId={parseInt(driver.nftTokenId)} 
                  carNumber={parseInt(driver.nftTokenId)} 
                />
                
                <button
                  onClick={handleSponsorDeposit}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors font-medium border-2 border-black"
                >
                  Sponsor Driver
                </button>
                
                <a
                  href={`https://sepolia.etherscan.io/address/${driver.nftContractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-purple-700 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors font-medium text-center border-2 border-black"
                >
                  View Contract on Blockscout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
