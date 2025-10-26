'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '../config/contracts';

// ABI for the DriverNFT contract (just the mint function)
const DRIVER_NFT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "uri",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

interface MintNFTButtonProps {
  driverName: string;
  tokenId: number;
  carNumber: number;
}

const MintNFTButton: React.FC<MintNFTButtonProps> = ({ driverName, tokenId, carNumber }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to mint NFTs');
      return;
    }

    setIsMinting(true);
    setError(null);
    setTxHash(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if we're on Sepolia
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        alert('Please switch to Sepolia testnet in your MetaMask wallet');
        setIsMinting(false);
        return;
      }
      
      const signer = await provider.getSigner();
      
      // Create contract instance
      const driverNFT = new ethers.Contract(
        CONTRACTS.sepolia.driverNFT,
        DRIVER_NFT_ABI,
        signer
      );

      // Prepare metadata URI (in a real app, this would be IPFS/Arweave)
      const metadataUri = `https://drivetosurvive.example/metadata/${tokenId}`;
      
      // Execute mint transaction
      const tx = await driverNFT.mint(userAddress, tokenId, metadataUri);
      
      // Wait for transaction to be mined
      setTxHash(tx.hash);
      await tx.wait();
      
      // Success!
      alert(`Successfully minted ${driverName} NFT!`);
    } catch (err: any) {
      console.error('Minting error:', err);
      setError(err.message || 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleMint}
        disabled={isMinting}
        className={`bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors ${
          isMinting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isMinting ? 'Minting...' : `Mint ${driverName} NFT #${carNumber}`}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {txHash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 text-sm hover:underline"
        >
          View transaction
        </a>
      )}
    </div>
  );
};

export default MintNFTButton;