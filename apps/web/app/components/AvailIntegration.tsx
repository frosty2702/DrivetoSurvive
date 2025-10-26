'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from './ConnectButton';
import { AVAIL_CHAINS, bridgeAssets, bridgeAndExecute, crossChainSwap, getUnifiedBalance } from '../../lib/avail-nexus';

export function AvailIntegration() {
  const { address, isConnected } = useAccount();
  const [selectedFeature, setSelectedFeature] = useState<'bridge' | 'bridge-execute' | 'swap' | 'balance'>('bridge');
  const [fromChain, setFromChain] = useState(2); // Sepolia
  const [toChain, setToChain] = useState(1); // Polygon Amoy
  const [amount, setAmount] = useState('0.1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [unifiedBalance, setUnifiedBalance] = useState<any>(null);

  const handleBridge = async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const txHash = await bridgeAssets(fromChain, toChain, amount, '0x0000000000000000000000000000000000000000');
      setResult(`Bridge successful! TX: ${txHash}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBridgeAndExecute = async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const txHash = await bridgeAndExecute(
        fromChain,
        toChain,
        amount,
        '0x8613078BC48B578eC47B46145bBb49257a30dbfc', // Sponsor Pool
        '0x00' // Function data
      );
      setResult(`Bridge & Execute successful! TX: ${txHash}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const txHash = await crossChainSwap(fromChain, toChain, 'ETH', 'MATIC', amount);
      setResult(`XCS Swap successful! TX: ${txHash}`);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetBalance = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const balance = await getUnifiedBalance(address);
      setUnifiedBalance(balance);
      setResult('Unified balance retrieved');
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white border-2 border-black rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-black">Avail Nexus Integration</h3>
        <p className="text-gray-600 mb-4">Connect wallet to use cross-chain features</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 text-black">Avail Nexus Cross-Chain Features</h3>
      
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedFeature('bridge')}
          className={`px-4 py-2 rounded-lg border-2 border-black ${selectedFeature === 'bridge' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
        >
          Bridge
        </button>
        <button
          onClick={() => setSelectedFeature('bridge-execute')}
          className={`px-4 py-2 rounded-lg border-2 border-black ${selectedFeature === 'bridge-execute' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
        >
          Bridge & Execute
        </button>
        <button
          onClick={() => setSelectedFeature('swap')}
          className={`px-4 py-2 rounded-lg border-2 border-black ${selectedFeature === 'swap' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
        >
          XCS Swap
        </button>
        <button
          onClick={() => setSelectedFeature('balance')}
          className={`px-4 py-2 rounded-lg border-2 border-black ${selectedFeature === 'balance' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
        >
          Unified Balance
        </button>
      </div>

      {selectedFeature === 'bridge' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-black">From Chain</label>
            <select
              value={fromChain}
              onChange={(e) => setFromChain(Number(e.target.value))}
              className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 text-black"
            >
              {AVAIL_CHAINS.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-black">To Chain</label>
            <select
              value={toChain}
              onChange={(e) => setToChain(Number(e.target.value))}
              className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 text-black"
            >
              {AVAIL_CHAINS.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 text-black"
            />
          </div>
          <button
            onClick={handleBridge}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium border-2 border-black disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Bridge Assets'}
          </button>
        </div>
      )}

      {selectedFeature === 'bridge-execute' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Bridge assets and execute sponsor deposit in one transaction
          </p>
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Amount (ETH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 text-black"
            />
          </div>
          <button
            onClick={handleBridgeAndExecute}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium border-2 border-black disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Bridge & Execute Deposit'}
          </button>
        </div>
      )}

      {selectedFeature === 'swap' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Cross-chain swap between ETH and MATIC
          </p>
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 text-black"
            />
          </div>
          <button
            onClick={handleSwap}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium border-2 border-black disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Execute XCS Swap'}
          </button>
        </div>
      )}

      {selectedFeature === 'balance' && (
        <div className="space-y-4">
          <button
            onClick={handleGetBalance}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium border-2 border-black disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Unified Balance'}
          </button>
          {unifiedBalance && (
            <div className="bg-gray-100 border border-black rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-black">Unified Balance</h4>
              {Object.entries(unifiedBalance).map(([chainId, balance]: [string, any]) => (
                <div key={chainId} className="mb-2">
                  <p className="text-sm font-medium text-black">Chain {chainId}</p>
                  <p className="text-xs text-gray-600">Native: {balance.native}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result && (
        <div className={`mt-4 p-3 rounded-lg border-2 border-black ${result.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          <p className="text-sm">{result}</p>
        </div>
      )}
    </div>
  );
}

