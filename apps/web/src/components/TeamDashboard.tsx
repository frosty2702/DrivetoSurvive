import React from 'react';

const TeamDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">DrivetoSurvive</h1>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
              <h3 className="text-lg font-semibold">Red Bull Racing</h3>
              <p className="text-sm opacity-90">Team Budget: $145M</p>
              <p className="text-sm opacity-90">Sponsorship Pool: $2.5M</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <h3 className="text-lg font-semibold">Reputation Score</h3>
              <p className="text-2xl font-bold">95/100</p>
              <p className="text-sm opacity-90">HHI: 0.15</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <h3 className="text-lg font-semibold">Recent Payouts</h3>
              <p className="text-2xl font-bold">$1.2M</p>
              <p className="text-sm opacity-90">Last 30 days</p>
            </div>
          </div>
        </div>

        {/* Next Race Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Race</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monaco Grand Prix</h3>
              <p className="text-gray-600">Circuit de Monaco</p>
              <p className="text-sm text-gray-500">May 26, 2024</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Days until race</p>
              <p className="text-2xl font-bold text-red-500">12</p>
            </div>
          </div>
        </div>

        {/* Driver Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Max Verstappen */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Max Verstappen</h3>
              <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">#1</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">NFT Market Value:</span>
                <span className="font-semibold">$2.5M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performance Score:</span>
                <span className="font-semibold">98/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fan Holders:</span>
                <span className="font-semibold">1,247</span>
              </div>
            </div>
          </div>

          {/* Yuki Tsunoda */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yuki Tsunoda</h3>
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">#22</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">NFT Market Value:</span>
                <span className="font-semibold">$850K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Performance Score:</span>
                <span className="font-semibold">82/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fan Holders:</span>
                <span className="font-semibold">456</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Spend */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Spend</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Sponsorship Allocation</span>
                <span className="font-semibold">$2.5M / $3M</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Driver Salaries</span>
                <span className="font-semibold">$1.8M / $2M</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Fan Rewards</span>
                <span className="font-semibold">$500K / $1M</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Fan Engagement */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fan Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">1,703</p>
              <p className="text-gray-600">NFT Holders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">892</p>
              <p className="text-gray-600">Stakers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">$500K</p>
              <p className="text-gray-600">Rewards Distributed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamDashboard;