'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConnectButton } from '../components/ConnectButton';
import { AvailIntegration } from '../components/AvailIntegration';
import { useAccount, useWriteContract } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { parseEther, formatEther } from 'viem';

// Mock data for sponsors
const MOCK_SPONSORS = [
  { name: 'Oracle', logo: '🔵', amount: 30000000, ethAmount: 10.2, percentage: 34.3, date: '2025-01-15', txHash: '0x1234...5678', address: '0x1234567890123456789012345678901234567890' },
  { name: 'Honda', logo: '🏁', amount: 25000000, ethAmount: 8.5, percentage: 28.6, date: '2025-02-01', txHash: '0x2345...6789', address: '0x2345678901234567890123456789012345678901' },
  { name: 'Bybit', logo: '₿', amount: 15000000, ethAmount: 5.1, percentage: 17.1, date: '2025-02-10', txHash: '0x3456...7890', address: '0x3456789012345678901234567890123456789012' },
  { name: 'Tag Heuer', logo: '⌚', amount: 10000000, ethAmount: 3.4, percentage: 11.4, date: '2025-02-20', txHash: '0x4567...8901', address: '0x4567890123456789012345678901234567890123' },
  { name: 'Pirelli', logo: '⚙️', amount: 7500000, ethAmount: 2.55, percentage: 8.6, date: '2025-03-01', txHash: '0x5678...9012', address: '0x5678901234567890123456789012345678901234' },
];

const MOCK_RELEASES = [
  { trigger: 'Performance Milestone', description: 'After 7 wins', amount: '35%', recipient: 'Max Verstappen', status: 'pending', date: '2025-06-15' },
  { trigger: 'Season Midpoint', description: 'Vesting schedule', amount: '25%', recipient: 'Team Account', status: 'scheduled', date: '2025-07-01' },
  { trigger: 'Manual Release', description: 'Team request', amount: '10%', recipient: 'Yuki Tsunoda', status: 'queued', date: '2025-04-10' },
];

const MOCK_AUDIT_TRAIL = [
  { timestamp: '2025-03-15 14:30', type: 'Deposit', amount: '5.1 ETH', actor: 'Bybit', txHash: '0x3456...7890', note: 'Quarterly contribution' },
  { timestamp: '2025-03-14 10:15', type: 'Release', amount: '2.0 ETH', actor: 'Contract', txHash: '0x7890...1234', note: 'Auto-release after podium #3' },
  { timestamp: '2025-03-10 16:45', type: 'Deposit', amount: '8.5 ETH', actor: 'Honda', txHash: '0x2345...6789', note: 'Marketing sponsorship' },
];

// Calculate HHI from sponsors
const calculateHHI = (sponsors: typeof MOCK_SPONSORS) => {
  const total = sponsors.reduce((sum, s) => sum + s.amount, 0);
  if (total === 0) return 0;
  
  let hhi = 0;
  sponsors.forEach(sponsor => {
    const share = (sponsor.amount / total) * 100;
    hhi += share * share;
  });
  
  return Math.round(hhi);
};

// Get HHI status
const getHHIStatus = (hhi: number) => {
  if (hhi <= 1500) return { color: 'green', label: 'Healthy', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-600' };
  if (hhi <= 2500) return { color: 'yellow', label: 'Watch', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-600' };
  return { color: 'red', label: 'Blocked', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-600' };
};

function SponsorPoolContent() {
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('0.1');
  const [depositMessage, setDepositMessage] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [previewHHI, setPreviewHHI] = useState<number | null>(null);
  
  const { writeContract, isPending } = useWriteContract();
  
  const poolBalance = 87500000; // USD
  const poolBalanceETH = 29.75; // ETH
  const hhi = calculateHHI(MOCK_SPONSORS);
  const hhiStatus = getHHIStatus(hhi);
  
  useEffect(() => {
    const driverParam = searchParams?.get('driver');
    if (driverParam) {
      setSelectedDriver(decodeURIComponent(driverParam));
    }
  }, [searchParams]);
  
  // Preview HHI when deposit amount changes
  useEffect(() => {
    if (depositAmount && parseFloat(depositAmount) > 0) {
      const ethAmount = parseFloat(depositAmount);
      const usdAmount = ethAmount * 2940; // Mock ETH price
      const newSponsors = [...MOCK_SPONSORS, { 
        name: 'New Sponsor', 
        logo: '🆕', 
        amount: usdAmount, 
        ethAmount, 
        percentage: 0, 
        date: new Date().toISOString().split('T')[0], 
        txHash: '', 
        address: address || '0x0000' 
      }];
      const newTotal = newSponsors.reduce((sum, s) => sum + s.amount, 0);
      newSponsors.forEach(s => s.percentage = (s.amount / newTotal) * 100);
      setPreviewHHI(calculateHHI(newSponsors));
    } else {
      setPreviewHHI(null);
    }
  }, [depositAmount, address]);
  
  const handleDeposit = async () => {
    if (!address || !depositAmount) return;
    
    setIsDepositing(true);
    
    try {
      writeContract({
        address: CONTRACTS.sepolia.sponsorPool as `0x${string}`,
        abi: [{
          name: 'deposit',
          type: 'function',
          stateMutability: 'payable',
          inputs: [
            { name: 'amount', type: 'uint256' },
            { name: 'message', type: 'string' }
          ],
          outputs: []
        }],
        functionName: 'deposit',
        args: [parseEther(depositAmount), depositMessage],
        value: parseEther(depositAmount)
      }, {
        onSuccess: () => {
          setDepositSuccess(true);
          setIsDepositing(false);
          setTimeout(() => {
            setShowDepositModal(false);
            setDepositSuccess(false);
            setDepositAmount('0.1');
            setDepositMessage('');
          }, 3000);
        },
        onError: (error) => {
          console.error('Deposit error:', error);
          setIsDepositing(false);
        }
      });
    } catch (error: any) {
      console.error('Deposit error:', error);
      setIsDepositing(false);
    }
  };
  
  const exportCSV = () => {
    const csv = [
      ['Timestamp', 'Type', 'Amount', 'Actor', 'TX Hash', 'Note'],
      ...MOCK_AUDIT_TRAIL.map(e => [e.timestamp, e.type, e.amount, e.actor, e.txHash, e.note])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sponsor-pool-audit.csv';
    a.click();
  };
  
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header / Summary Bar */}
      <div className="bg-white border-b-4 border-black shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Use GitHub Gist URL for SVG logo, fallback to local PNG */}
              <img
                src="https://gist.githubusercontent.com/your-username/your-gist-id/raw/red-bull-logo.svg"
                alt="Red Bull Racing"
                width={60}
                height={60}
                className="object-contain"
                onError={(e) => {
                  // Fallback to local PNG if Gist fails
                  e.currentTarget.src = '/logos/red-bull-logo.png';
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-black">Red Bull Racing</h1>
                <p className="text-gray-600">{selectedDriver ? `Supporting ${selectedDriver}` : 'Sponsor Pool'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pool Balance</p>
                <p className="text-3xl font-bold text-black">${(poolBalance / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-600">{poolBalanceETH.toFixed(2)} ETH</p>
              </div>
              
              <div className={`px-4 py-2 rounded-lg border-2 ${hhiStatus.border} ${hhiStatus.bg}`}>
                <p className="text-xs text-gray-600">HHI Score</p>
                <p className={`text-2xl font-bold ${hhiStatus.text}`}>{hhi.toLocaleString()}</p>
                <p className={`text-xs font-semibold ${hhiStatus.text}`}>{hhiStatus.label}</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium border-2 border-black"
                >
                  Sponsor Now
                </button>
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACTS.sepolia.sponsorPool}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium border-2 border-black"
                >
                  View Contract
                </a>
                <button
                  onClick={exportCSV}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium border-2 border-black"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Three Columns */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sponsor List */}
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-black">Top Sponsors</h2>
            <div className="space-y-3">
              {MOCK_SPONSORS.map((sponsor, idx) => (
                <div key={idx} className="bg-gray-100 border border-black rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{sponsor.logo}</span>
                      <div>
                        <p className="font-semibold text-black">{sponsor.name}</p>
                        <p className="text-xs text-gray-600">{sponsor.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">${(sponsor.amount / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-gray-600">{sponsor.ethAmount.toFixed(2)} ETH</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Share: {sponsor.percentage.toFixed(1)}%</span>
                      <a href={`https://sepolia.etherscan.io/tx/${sponsor.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View TX →
                      </a>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 border border-black">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${sponsor.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-gray-100 border border-black rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-black">Sponsor Tiers</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-black">Title Sponsors (≥$30M)</span>
                  <span className="font-bold text-black">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Gold (≥$15M)</span>
                  <span className="font-bold text-black">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Silver (≥$5M)</span>
                  <span className="font-bold text-black">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Bronze (&lt;$5M)</span>
                  <span className="font-bold text-black">0</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Middle Column - HHI Analytics */}
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-black">HHI & Concentration</h2>
            
            <div className={`mb-6 p-4 rounded-lg border-2 ${hhiStatus.border} ${hhiStatus.bg}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-black">Herfindahl-Hirschman Index</p>
                <p className={`text-2xl font-bold ${hhiStatus.text}`}>{hhi}</p>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Formula: HHI = Σ (market share_i × 100)²
              </p>
              <p className="text-xs text-gray-700">
                {hhi <= 1500 && '✓ Healthy decentralization (≤1500)'}
                {hhi > 1500 && hhi <= 2500 && '⚠ Concentration warning (1500-2500)'}
                {hhi > 2500 && '✗ Concentration cap breached (>2500) - New deposits paused'}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-black">Concentration Breakdown</h3>
              <div className="space-y-2">
                {MOCK_SPONSORS.slice(0, 5).map((sponsor, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-16 text-xs text-gray-600">{sponsor.name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 border border-black">
                      <div 
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${sponsor.percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-xs text-right text-black">{sponsor.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-3">
              <p className="text-xs font-semibold text-yellow-800 mb-1">Risk Indicators</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                {hhi > 2500 && <li>⚠ Single-sponsor dominance detected</li>}
                {hhi <= 2500 && <li>✓ No concentration risks</li>}
              </ul>
            </div>
          </div>
          
          {/* Right Column - Pool Mechanics */}
          <div className="bg-white border-2 border-black rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-black">Pool Details</h2>
            
            {/* Avail Integration */}
            <div className="mb-6">
              <AvailIntegration />
            </div>
            
            <div className="mb-6 space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Contract Address</p>
                <a 
                  href={`https://sepolia.etherscan.io/address/${CONTRACTS.sepolia.sponsorPool}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-mono text-xs break-all"
                >
                  {CONTRACTS.sepolia.sponsorPool}
                </a>
              </div>
              <div>
                <p className="text-gray-600">Accepted Tokens</p>
                <p className="text-black">ETH, USDC (Sepolia)</p>
              </div>
              <div>
                <p className="text-gray-600">Escrow Rules</p>
                <p className="text-black">Funds locked until performance milestones or vesting schedule</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-black">Release Schedule</h3>
              <div className="space-y-3">
                {MOCK_RELEASES.map((release, idx) => (
                  <div key={idx} className="bg-gray-100 border border-black rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-semibold text-sm text-black">{release.trigger}</p>
                        <p className="text-xs text-gray-600">{release.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${release.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : release.status === 'queued' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                        {release.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-gray-600">Amount: {release.amount}</span>
                      <span className="text-gray-600">→ {release.recipient}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Date: {release.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Audit Trail */}
        <div className="mt-8 bg-white border-2 border-black rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">Audit Trail</h2>
            <button
              onClick={exportCSV}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border-2 border-black"
            >
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100">
                  <th className="text-left py-2 px-4 text-black">Timestamp</th>
                  <th className="text-left py-2 px-4 text-black">Type</th>
                  <th className="text-left py-2 px-4 text-black">Amount</th>
                  <th className="text-left py-2 px-4 text-black">Actor</th>
                  <th className="text-left py-2 px-4 text-black">TX Hash</th>
                  <th className="text-left py-2 px-4 text-black">Note</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_AUDIT_TRAIL.map((event, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="py-2 px-4 text-black">{event.timestamp}</td>
                    <td className="py-2 px-4 text-black">{event.type}</td>
                    <td className="py-2 px-4 text-black">{event.amount}</td>
                    <td className="py-2 px-4 text-black">{event.actor}</td>
                    <td className="py-2 px-4">
                      <a href={`https://sepolia.etherscan.io/tx/${event.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">
                        {event.txHash}
                      </a>
                    </td>
                    <td className="py-2 px-4 text-gray-600">{event.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black">Sponsor Now</h2>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-gray-600 hover:text-black text-2xl"
              >
                ×
              </button>
            </div>
            
            {!isConnected ? (
              <div className="text-center py-6">
                <p className="mb-4 text-black">Connect your wallet to sponsor</p>
                <ConnectButton />
              </div>
            ) : depositSuccess ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✓</div>
                <p className="font-bold text-lg text-black mb-2">Thank you for your sponsorship!</p>
                <p className="text-sm text-gray-600">Your contribution has been added to the pool.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleDeposit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-black">Amount (ETH)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 text-black"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    ≈ ${(parseFloat(depositAmount || '0') * 2940).toFixed(2)} USD
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-black">Message (Optional)</label>
                  <textarea
                    value={depositMessage}
                    onChange={(e) => setDepositMessage(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 text-black h-24"
                    placeholder="Add a message..."
                  />
                </div>
                
                {previewHHI !== null && (
                  <div className={`p-3 rounded-lg border-2 ${getHHIStatus(previewHHI).border} ${getHHIStatus(previewHHI).bg}`}>
                    <p className="text-xs font-semibold text-black mb-1">HHI Impact Preview</p>
                    <p className="text-sm text-black">
                      After this deposit: HHI = {previewHHI} ({getHHIStatus(previewHHI).label})
                    </p>
                    {previewHHI > 2500 && (
                      <p className="text-xs text-red-800 mt-2 font-semibold">
                        ⚠ This deposit would breach concentration cap. Requires approval.
                      </p>
                    )}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isPending || isDepositing || (previewHHI !== null && previewHHI > 2500)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
                >
                  {isPending || isDepositing ? 'Processing...' : 'Confirm Deposit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SponsorPoolPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-black p-8 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <SponsorPoolContent />
    </Suspense>
  );
}
