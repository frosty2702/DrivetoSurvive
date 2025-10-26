'use client';

import React, { useState, useEffect } from 'react';
import { Driver, PerformanceMetric, getDriverPerformanceMetrics } from '../../lib/api';

interface DriverPerformanceChartProps {
  driver: Driver;
}

const DriverPerformanceChart: React.FC<DriverPerformanceChartProps> = ({ driver }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call the API
        // const data = await getDriverPerformanceMetrics(driver.id);
        
        // For demo purposes, we'll generate mock data
        const mockMetrics: PerformanceMetric[] = [];
        for (let i = 1; i <= 5; i++) {
          mockMetrics.push({
            id: `metric-${i}`,
            driverId: driver.id,
            raceId: `2024-${i}`,
            raceName: `Race ${i}`,
            season: 2024,
            raceDate: new Date(2024, 2 + i, 1).toISOString(),
            position: Math.floor(Math.random() * 10) + 1,
            points: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1][Math.floor(Math.random() * 10)],
            fastestLap: Math.random() > 0.8,
            polePosition: Math.random() > 0.8,
            lapTime: `1:${30 + Math.floor(Math.random() * 10)}.${100 + Math.floor(Math.random() * 900)}`,
            overtakes: Math.floor(Math.random() * 5),
            pitStops: Math.floor(Math.random() * 3) + 1,
            attested: true,
            attestationHash: `mock-hash-${i}`,
            attestedBy: 'FastF1 API',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        
        setMetrics(mockMetrics);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch performance metrics:', err);
        setError(err.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    if (driver.id) {
      fetchMetrics();
    }
  }, [driver.id]);

  if (loading) {
    return <div className="p-4 text-center text-blue-400">Loading performance data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-400">Error: {error}</div>;
  }

  if (metrics.length === 0) {
    return <div className="p-4 text-center text-blue-400">No performance data available</div>;
  }

  // Sort metrics by race date
  const sortedMetrics = [...metrics].sort(
    (a, b) => new Date(a.raceDate).getTime() - new Date(b.raceDate).getTime()
  );

  // Extract data for chart
  const raceNames = sortedMetrics.map(m => m.raceName.replace('Grand Prix', 'GP'));
  const positions = sortedMetrics.map(m => m.position || 20);
  const points = sortedMetrics.map(m => m.points);

  // Calculate stats
  const totalPoints = points.reduce((sum, p) => sum + p, 0);
  const bestPosition = Math.min(...positions);
  const podiums = positions.filter(p => p && p <= 3).length;

  return (
    <div className="bg-blue-950/50 rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-bold mb-4">Performance Analysis</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-900/50 p-3 rounded-lg text-center">
          <p className="text-xs text-blue-300">Total Points</p>
          <p className="text-xl font-bold">{totalPoints}</p>
        </div>
        <div className="bg-blue-900/50 p-3 rounded-lg text-center">
          <p className="text-xs text-blue-300">Best Position</p>
          <p className="text-xl font-bold">{bestPosition}</p>
        </div>
        <div className="bg-blue-900/50 p-3 rounded-lg text-center">
          <p className="text-xs text-blue-300">Podiums</p>
          <p className="text-xl font-bold">{podiums}</p>
        </div>
      </div>
      
      <h4 className="text-sm font-semibold mb-2">Race Results</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-blue-300 border-b border-blue-800">
              <th className="py-2 text-left">Race</th>
              <th className="py-2 text-center">Position</th>
              <th className="py-2 text-center">Points</th>
              <th className="py-2 text-center">Fastest Lap</th>
            </tr>
          </thead>
          <tbody>
            {sortedMetrics.map((metric) => (
              <tr key={metric.id} className="border-b border-blue-900/30">
                <td className="py-2 text-left">{metric.raceName}</td>
                <td className="py-2 text-center">{metric.position || 'DNF'}</td>
                <td className="py-2 text-center">{metric.points}</td>
                <td className="py-2 text-center">
                  {metric.fastestLap ? (
                    <span className="inline-block w-4 h-4 bg-purple-500 rounded-full"></span>
                  ) : (
                    <span className="inline-block w-4 h-4 bg-blue-900 rounded-full"></span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-2">Position Chart</h4>
        <div className="h-32 flex items-end justify-between">
          {positions.map((pos, idx) => {
            // Invert position for chart (1st = highest bar)
            const height = `${Math.max(5, 100 - (pos / 20) * 100)}%`;
            const bgColor = pos <= 3 ? 'bg-red-600' : 'bg-blue-600';
            
            return (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className="w-full flex justify-center">
                  <div 
                    className={`${bgColor} w-4 rounded-t-sm`} 
                    style={{ height }}
                    title={`${raceNames[idx]}: P${pos}`}
                  ></div>
                </div>
                <span className="text-xs mt-1">{pos}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          {raceNames.map((name, idx) => (
            <span key={idx} className="text-xs text-blue-400">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverPerformanceChart;
