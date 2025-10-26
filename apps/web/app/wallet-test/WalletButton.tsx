'use client';

import React, { useState } from 'react';

export default function WalletButton() {
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
    }
  }

  if (account) {
    return <div>Connected: {account.slice(0, 6)}...{account.slice(-4)}</div>;
  }

  return <button onClick={connectWallet}>Connect Wallet</button>;
}
