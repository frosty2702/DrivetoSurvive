'use client';

import React from 'react';

const WalletConnectButton: React.FC = () => {
  return (
    <button
      onClick={() => alert('Wallet functionality disabled for demo purposes')}
      className="px-6 py-2 rounded-full font-medium transition-all bg-black text-white hover:bg-gray-800"
    >
      Connect Wallet
    </button>
  );
};

export default WalletConnectButton;