'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { driverApi, type Driver } from '@/lib/api';

export default function Home() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrivers() {
      try {
        setLoading(true);
        const data = await driverApi.getAll();
        setDrivers(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch drivers:', err);
        setError('Failed to load drivers. Make sure the API is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchDrivers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏎️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DrivetoSurvive</h1>
              <p className="text-xs text-gray-400">Decentralized Motorsport Economy</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          Performance Over Politics
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Trade driver NFTs, support teams, and earn rewards based on verified race performance.
          No bias. No pay-to-play. Pure meritocracy.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
            Explore Drivers
          </button>
          <button className="px-8 py-3 bg-white/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20">
            How It Works
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-white mb-2">{drivers.length}</div>
            <div className="text-gray-400">Active Drivers</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-white mb-2">
              ${(drivers.reduce((sum, d) => sum + d.marketValue, 0) / 1_000_000).toFixed(1)}M
            </div>
            <div className="text-gray-400">Total Market Value</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-white mb-2">
              {drivers.reduce((sum, d) => sum + d.totalPoints, 0)}
            </div>
            <div className="text-gray-400">Total Points</div>
          </div>
        </div>
      </section>

      {/* Drivers Grid */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-white mb-8">2024 F1 Drivers</h3>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading drivers...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-gray-400 text-sm">Run: cd apps/api && npm run dev</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/20 group cursor-pointer"
              >
                {/* Driver Card Header */}
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-pulse"></div>
                  <div className="relative">
                    <div className="text-4xl mb-2">🏁</div>
                    <h4 className="text-xl font-bold text-white">{driver.name}</h4>
                    <p className="text-sm text-gray-300">{driver.nationality}</p>
                  </div>
                </div>

                {/* Driver Stats */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Team</span>
                    <span className="text-white font-semibold text-sm">
                      {driver.team?.name || 'No Team'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Market Value</span>
                    <span className="text-green-400 font-bold">
                      ${(driver.marketValue / 1_000_000).toFixed(1)}M
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Performance</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                          style={{ width: `${driver.performanceScore}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold text-sm">
                        {driver.performanceScore}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-white font-bold">{driver.totalWins}</div>
                      <div className="text-xs text-gray-400">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{driver.totalPodiums}</div>
                      <div className="text-xs text-gray-400">Podiums</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{driver.totalPoints}</div>
                      <div className="text-xs text-gray-400">Points</div>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
                    Trade NFT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>Powered by Hedera, Pyth, and Avail</p>
          <p className="text-sm mt-2">© 2024 DrivetoSurvive - Where merit drives success</p>
        </div>
      </footer>
    </div>
  );
}
