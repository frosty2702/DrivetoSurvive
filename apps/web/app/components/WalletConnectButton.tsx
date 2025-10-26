'use client';

import React, { useState, useEffect } from 'react';

export default function WalletConnectButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
    
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {
          console.log('Listener removed');
        });
      }
    };
  }, []);

  async function checkConnection() {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err) {
      console.error("Failed to check existing connection", err);
    }
  }

  async function connectWallet() {
    setIsConnecting(true);
    setError(null);
    
    if (!window.ethereum) {
      setError('MetaMask not installed! Please install MetaMask to connect.');
      setIsConnecting(false);
      return;
    }

    try {
      console.log("Requesting accounts...");
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      console.log("Accounts received:", accounts);
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        console.log("Connected to:", accounts[0]);
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }

  if (account) {
    return (
      <div className="bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center">
        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
        <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
      </div>
    );
  }

  return (
    <div>
      <button 
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}