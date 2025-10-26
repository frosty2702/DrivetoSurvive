'use client';

import React from 'react';
import SimpleWalletButton from '../components/SimpleWalletButton';

export default function WalletTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Wallet Connection Test</h1>
        
        <div className="mb-8">
          <SimpleWalletButton />
        </div>
        
        <div className="text-gray-600 text-sm">
          <p className="mb-2">This is a minimal test page for wallet connection.</p>
          <p>Open your browser console to see detailed connection logs.</p>
        </div>
      </div>
    </div>
  );
}