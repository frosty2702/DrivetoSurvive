'use client';

import { useState, useEffect } from 'react';
import { getDriverPrice, calculatePerformanceScore, calculateMarketValue } from '../../lib/pyth';

interface DriverValuationProps {
  driverName: string;
  initialMarketValue?: number;
  performanceScore?: number;
  baseValue?: number;
}

export function DriverValuation({ driverName, initialMarketValue, performanceScore: initialPerformanceScore, baseValue = 1000000 }: DriverValuationProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [performanceScore, setPerformanceScore] = useState<number | null>(initialPerformanceScore || null);
  const [marketValue, setMarketValue] = useState<number | null>(initialMarketValue || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Simulated 24h price change - in a real app, you'd fetch this from an API
  const getSimulated24hChange = () => {
    // Random value between -15% and +15%
    return (Math.random() * 30 - 15);
  };

  const fetchDriverValuation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get price data from Pyth
      const priceData = await getDriverPrice(driverName);
      setPrice(priceData.price);
      
      // Calculate performance score
      const priceChange24h = getSimulated24hChange();
      const score = calculatePerformanceScore(priceData.price, priceChange24h);
      setPerformanceScore(score);
      
      // Calculate market value
      const value = calculateMarketValue(score, baseValue);
      setMarketValue(value);
      
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching driver valuation:', err);
      setError(err.message || 'Failed to fetch driver valuation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverValuation();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDriverValuation();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [driverName, baseValue]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading && !price) {
    return (
      <div className="mt-6 animate-pulse">
        <h4 className="text-sm text-gray-600 mb-2">Driver Market Value</h4>
        <div className="h-4 bg-gray-200 rounded-full w-full border border-black"></div>
        <div className="mt-2 h-6 bg-gray-200 rounded-lg w-1/3 border border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h4 className="text-sm text-gray-600 mb-2">Driver Market Value</h4>
        <div className="bg-red-100 border-2 border-red-600 p-2 rounded-lg text-xs text-black">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm text-gray-600 mb-2 font-semibold">Driver Market Value (Live)</h4>
      <div className="flex items-center">
        <div className="flex-1 bg-gray-200 rounded-full h-4 border border-black">
          <div 
            className="bg-blue-600 h-4 rounded-full"
            style={{ width: `${performanceScore}%` }}
          ></div>
        </div>
        <span className="ml-3 font-bold text-black">{marketValue ? formatCurrency(marketValue) : '-'}</span>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-700">
        <div>Performance: {performanceScore ? `${performanceScore.toFixed(1)}%` : '-'}</div>
        <div>
          {lastUpdated && (
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      
      <button 
        onClick={fetchDriverValuation}
        className="mt-2 text-xs bg-white border-2 border-black text-black hover:bg-gray-100 px-3 py-1 rounded font-medium"
      >
        Refresh Valuation
      </button>
    </div>
  );
}
