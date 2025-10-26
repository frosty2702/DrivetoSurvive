'use client';

import React from 'react';

interface MintNFTButtonProps {
  driverName: string;
  tokenId: number;
  carNumber: number;
}

const MintNFTButton: React.FC<MintNFTButtonProps> = ({ driverName, carNumber }) => {
  return (
    <button
      onClick={() => alert(`NFT minting disabled for demo purposes. Would mint ${driverName} #${carNumber} NFT.`)}
      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
    >
      Mint {driverName} NFT #{carNumber}
    </button>
  );
};

export default MintNFTButton;