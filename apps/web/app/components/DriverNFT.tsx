'use client';

import React from 'react';

interface DriverNFTProps {
  tokenId: number;
  driverName: string;
  carNumber: number;
  marketValue: string;
}

const DriverNFT: React.FC<DriverNFTProps> = ({ tokenId, driverName, carNumber, marketValue }) => {
  // Generate NFT-style visual representation
  const generateNFTBackground = (tokenId: number) => {
    const colors = [
      'from-blue-500 via-purple-500 to-pink-500',
      'from-green-500 via-teal-500 to-cyan-500',
      'from-red-500 via-orange-500 to-yellow-500',
      'from-indigo-500 via-purple-500 to-pink-500',
    ];
    return colors[tokenId % colors.length];
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* NFT Card Container */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700">
        {/* NFT Image/Visual */}
        <div className={`relative h-64 bg-gradient-to-br ${generateNFTBackground(tokenId)} flex items-center justify-center`}>
          {/* Overlay grid pattern for NFT aesthetic */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {[...Array(64)].map((_, i) => (
                <div key={i} className="border border-white/10"></div>
              ))}
            </div>
          </div>
          
          {/* Driver Number */}
          <div className="relative z-10 text-center">
            <div className="text-9xl font-bold text-white drop-shadow-2xl">
              {carNumber}
            </div>
            <div className="text-2xl font-bold text-white/90 mt-2 drop-shadow-lg">
              {driverName.split(' ')[0]}
            </div>
          </div>

          {/* NFT Badge */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-bold text-white">NFT #{tokenId}</span>
          </div>

          {/* Edition Badge */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-bold text-yellow-400">⚡ Season 2025</span>
          </div>
        </div>

        {/* NFT Metadata */}
        <div className="bg-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{driverName}</h3>
              <p className="text-sm text-gray-400">Car #{carNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Market Value</div>
              <div className="text-lg font-bold text-green-400">{marketValue}</div>
            </div>
          </div>

          {/* NFT Properties */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-xs text-gray-400">Rarity</div>
              <div className="text-sm font-bold text-purple-400">Legendary</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Chain</div>
              <div className="text-sm font-bold text-blue-400">Hedera</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Token</div>
              <div className="text-sm font-bold text-yellow-400">ERC-721</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverNFT;

