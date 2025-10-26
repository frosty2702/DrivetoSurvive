'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const metamaskConnector = connectors.find(c => c.name === 'MetaMask');

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <button 
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      disabled={isPending}
      onClick={() => metamaskConnector && connect({ connector: metamaskConnector })}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
