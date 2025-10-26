'use client';

import React from 'react';
import Image from 'next/image';
import SimpleWalletButton from './SimpleWalletButton';

const RedBullDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      <header className="bg-blue-950 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Use GitHub Gist URL for SVG logo, fallback to local PNG */}
            <img
              src="https://gist.githubusercontent.com/your-username/your-gist-id/raw/red-bull-logo.svg"
              alt="Red Bull Racing Logo"
              width={60}
              height={60}
              className="object-contain"
              onError={(e) => {
                // Fallback to local PNG if Gist fails
                e.currentTarget.src = '/logos/red-bull-logo.png';
              }}
            />
            <h1 className="text-2xl font-bold">Red Bull Racing</h1>
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">2025 Season</span>
            <span className="bg-blue-800 text-white text-xs px-2 py-1 rounded-full">Team Dashboard</span>
          </div>
          <SimpleWalletButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Top-level wallet connect alert */}
        <div className="mb-6 p-4 bg-blue-900/50 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Connect Your Wallet</h2>
              <p className="text-blue-300">Connect your wallet to interact with the Red Bull Racing ecosystem</p>
            </div>
            <div className="w-full md:w-auto">
              <SimpleWalletButton />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Stats */}
            <div className="col-span-1 lg:col-span-2 bg-blue-950/50 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Team Performance - 2025 Season</h2>

              <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recent Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-800">
                      <th className="text-left py-2">Race</th>
                      <th className="text-left py-2">Max Verstappen</th>
                      <th className="text-left py-2">Yuki Tsunoda</th>
                      <th className="text-left py-2">Team Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-blue-800/50">
                      <td className="py-2">United States GP</td>
                      <td className="py-2">1st</td>
                      <td className="py-2">16th</td>
                      <td className="py-2">25</td>
                    </tr>
                    <tr className="border-b border-blue-800/50">
                      <td className="py-2">Brazil GP</td>
                      <td className="py-2">2nd</td>
                      <td className="py-2">18th</td>
                      <td className="py-2">18</td>
                    </tr>
                    <tr className="border-b border-blue-800/50 bg-blue-800/30">
                      <td className="py-2 font-bold">Abu Dhabi GP (Next Race)</td>
                      <td className="py-2">-</td>
                      <td className="py-2">-</td>
                      <td className="py-2">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Team Budget */}
          <div className="bg-blue-950/50 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Team Budget</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-blue-300">Season Budget</p>
                <p className="text-2xl font-bold">$175,000,000</p>
              </div>
              <div>
                <p className="text-sm text-blue-300">Sponsor Pool</p>
                <p className="text-2xl font-bold">$105,500,000</p>
              </div>
              <div>
                <p className="text-sm text-blue-300">Development Budget</p>
                <p className="text-2xl font-bold">$48,700,000</p>
              </div>
              <div>
                <p className="text-sm text-blue-300">Operations</p>
                <p className="text-2xl font-bold">$20,800,000</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Top Sponsors</h3>
              
              {/* Sponsor section with wallet connect */}
              <div className="mb-4 p-3 border border-blue-700 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Add Sponsor Funds</h4>
                <SimpleWalletButton />  
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Oracle</span>
                  <span className="text-blue-300">$45M</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Honda</span>
                  <span className="text-blue-300">$30M</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Bybit</span>
                  <span className="text-blue-300">$18M</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Tag Heuer</span>
                  <span className="text-blue-300">$12.5M</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Driver Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Max Verstappen */}
          <div className="bg-gradient-to-br from-blue-800 to-blue-950 rounded-xl overflow-hidden shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Max Verstappen</h3>
                  <p className="text-blue-300">4-Time World Champion</p>
                </div>
                <div className="bg-red-600 w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold">
                  1
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm text-blue-300 mb-2">Driver Market Value</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 border border-black">
                    <div className="bg-blue-600 h-4 rounded-full w-[90%]"></div>
                  </div>
                  <span className="ml-3 font-bold">$48M</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={() => alert('Performance data for Max Verstappen')}
                  className="bg-green-700 hover:bg-green-600 transition-colors w-full px-4 py-2 rounded-lg text-sm font-medium"
                >
                  View Performance Data
                </button>
              </div>
            </div>
          </div>
          
          {/* Yuki Tsunoda */}
          <div className="bg-gradient-to-br from-blue-800 to-blue-950 rounded-xl overflow-hidden shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Yuki Tsunoda</h3>
                  <p className="text-blue-300">Rising Star</p>
                </div>
                <div className="bg-red-600 w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold">
                  22
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm text-blue-300 mb-2">Driver Market Value</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 border border-black">
                    <div className="bg-blue-600 h-4 rounded-full w-[55%]"></div>
                  </div>
                  <span className="ml-3 font-bold">$18M</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={() => alert('Performance data for Yuki Tsunoda')}
                  className="bg-green-700 hover:bg-green-600 transition-colors w-full px-4 py-2 rounded-lg text-sm font-medium"
                >
                  View Performance Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-blue-950 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-blue-400">
          <p>DriveToSurvive - Decentralized Motorsport Ecosystem</p>
          <p className="mt-2">Demo Version</p>
        </div>
      </footer>
    </div>
  );
};

export default RedBullDashboard;