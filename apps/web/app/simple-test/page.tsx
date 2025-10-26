'use client';

import React, { useState } from 'react';

export default function SimpleTestPage() {
  const [account, setAccount] = useState('');

  async function connectWallet() {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    try {
      // Simple direct request for accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting: ' + (error as Error).message);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Super Simple Wallet Test</h1>
      
      <div style={{ marginTop: '20px' }}>
        {account ? (
          <div>Connected: {account.slice(0, 6)}...{account.slice(-4)}</div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p>Everything in one file. No imports.</p>
      </div>
    </div>
  );
}
