'use client';

import React from 'react';
import Link from 'next/link';
import { DriverValuation } from './components/DriverValuation';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-black">Red Bull Racing</h1>
        <p className="text-gray-600">Team Dashboard</p>
      </header>

      <div className="mb-8 p-6 bg-white border-2 border-black rounded-xl">
        <h2 className="text-2xl font-bold mb-4 text-black">Team Performance</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Driver Card - Max */}
        <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-black">Max Verstappen</h3>
              <p className="text-gray-600">3-Time World Champion</p>
            </div>
            <div className="bg-red-600 w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold text-white border-2 border-black">
              1
            </div>
          </div>
          
          <DriverValuation driverName="Max Verstappen" baseValue={42000000} />
          
          <Link href="/drivers/max-verstappen">
            <button className="mt-4 bg-white border-2 border-black text-black hover:bg-gray-100 transition-colors w-full px-4 py-2 rounded-lg text-sm font-medium">
              View Driver Details
            </button>
          </Link>
        </div>

        {/* Driver Card - Yuki */}
        <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-black">Yuki Tsunoda</h3>
              <p className="text-gray-600">Rising Star</p>
            </div>
            <div className="bg-red-600 w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold text-white border-2 border-black">
              22
            </div>
          </div>
          
          <DriverValuation driverName="Yuki Tsunoda" baseValue={18000000} />
          
          <Link href="/drivers/yuki-tsunoda">
            <button className="mt-4 bg-white border-2 border-black text-black hover:bg-gray-100 transition-colors w-full px-4 py-2 rounded-lg text-sm font-medium">
              View Driver Details
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white border-2 border-black rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-black">Team Budget</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Season Budget</p>
            <p className="text-2xl font-bold text-black">$145,000,000</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sponsor Pool</p>
            <p className="text-2xl font-bold text-black">$87,500,000</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Development Budget</p>
            <p className="text-2xl font-bold text-black">$42,300,000</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Operations</p>
            <p className="text-2xl font-bold text-black">$15,200,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}