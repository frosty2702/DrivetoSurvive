'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { parseEther } from 'viem';

// ABI for the mint function - replace with your actual ABI if different
const MINT_ABI = [{
  name: 'mint',
  type: 'function',
  stateMutability: 'payable',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'uri', type: 'string' }
  ],
  outputs: []
}];

interface MintDriverNFTProps {
  driverName: string;
  tokenId: number;
  carNumber: number;
}

export function MintDriverNFT({ driverName, tokenId, carNumber }: MintDriverNFTProps) {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { writeContract, isPending } = useWriteContract();

  const handleMint = async () => {
    if (!address) return;
    
    setIsMinting(true);
    setErrorMessage('');
    
    try {
      // Generate a simple metadata URI - in production this would point to IPFS
      const tokenURI = `https://drivetosurvive.example/metadata/${driverName.toLowerCase().replace(/\s+/g, '-')}-${tokenId}`;
      
      writeContract({
        address: CONTRACTS.sepolia.driverNFT as `0x${string}`,
        abi: MINT_ABI,
        functionName: 'mint',
        args: [address, BigInt(tokenId), tokenURI],
        value: parseEther('0.01') // 0.01 ETH mint price
      }, {
        onSuccess: () => {
          setMintSuccess(true);
          setIsMinting(false);
        },
        onError: (error) => {
          console.error('Mint error:', error);
          setErrorMessage(error.message || 'Failed to mint NFT');
          setIsMinting(false);
        }
      });
    } catch (error: any) {
      console.error('Mint error:', error);
      setErrorMessage(error.message || 'Failed to mint NFT');
      setIsMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="mt-4 p-3 bg-blue-900/50 rounded-lg text-center">
        <p className="text-sm">Connect wallet to mint {driverName} NFT</p>
      </div>
    );
  }

  if (mintSuccess) {
    return (
      <div className="mt-4 p-3 bg-green-700/50 rounded-lg text-center">
        <p className="text-sm">Successfully minted {driverName} NFT #{carNumber}!</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleMint}
        disabled={isPending || isMinting}
        className="bg-red-600 hover:bg-red-700 text-white w-full py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending || isMinting ? 'Minting...' : `Mint ${driverName} NFT #${carNumber}`}
      </button>
      
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-600/50 rounded-lg text-xs">
          Error: {errorMessage}
        </div>
      )}
    </div>
  );
}