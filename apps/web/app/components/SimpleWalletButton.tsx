'use client';

import React, { useState } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function SimpleWalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    setIsConnecting(true);
    setError(null);
    
    if (!window.ethereum) {
      setError('MetaMask not installed');
      setIsConnecting(false);
      return;
    }

    try {
      console.log('Requesting accounts...');
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      console.log('Accounts received:', accounts);
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        console.log('Connected to:', accounts[0]);
      } else {
        setError('No accounts found');
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {account ? (
        <div className="bg-green-700 text-white px-4 py-2 rounded-lg">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
}
