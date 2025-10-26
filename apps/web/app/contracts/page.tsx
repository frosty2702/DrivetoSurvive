'use client';

import React from 'react';
import { CONTRACTS } from '../config/contracts';
import { sepolia } from 'wagmi/chains';

export default function ContractsPage() {
  const networkName = 'Sepolia Testnet';
  const explorerBaseUrl = sepolia.blockExplorers?.default.url || 'https://sepolia.etherscan.io';
  
  const contracts = Object.entries(CONTRACTS.sepolia);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Smart Contracts</h1>
        <p className="text-blue-300">Deployed on {networkName}</p>
      </header>

      <div className="bg-blue-950/50 rounded-xl p-6 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-800">
                <th className="text-left py-3 px-4">Contract</th>
                <th className="text-left py-3 px-4">Address</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(([name, address]) => (
                <tr key={name} className="border-b border-blue-800/30">
                  <td className="py-3 px-4 font-medium">{name}</td>
                  <td className="py-3 px-4 font-mono text-sm">
                    {address}
                  </td>
                  <td className="py-3 px-4">
                    <a 
                      href={`${explorerBaseUrl}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View on Explorer
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-950/50 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Network Information</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Network:</span>
            <span>{networkName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Chain ID:</span>
            <span>{sepolia.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Currency:</span>
            <span>{sepolia.nativeCurrency.name} ({sepolia.nativeCurrency.symbol})</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">RPC URL:</span>
            <span className="font-mono text-sm">{sepolia.rpcUrls.default.http[0]}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Explorer:</span>
            <a 
              href={explorerBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {sepolia.blockExplorers?.default.name || 'Block Explorer'}
            </a>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 py-6 text-center text-sm text-blue-400">
        <p>DriveToSurvive - Decentralized Motorsport Ecosystem</p>
        <p className="mt-2">Demo Version</p>
      </footer>
    </div>
  );
}