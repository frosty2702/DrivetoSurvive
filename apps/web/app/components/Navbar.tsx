'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ConnectButton } from './ConnectButton';

export function Navbar() {
  const pathname = usePathname();
  const [fanView, setFanView] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <nav className="bg-white border-b-2 border-black shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 mr-8">
              {/* Use GitHub Gist URL for SVG logo, fallback to local PNG */}
              <img
                src="https://gist.githubusercontent.com/your-username/your-gist-id/raw/drive-to-survive-logo.svg"
                alt="DriveToSurvive Logo"
                width={40}
                height={40}
                className="object-contain"
                onError={(e) => {
                  // Fallback to local PNG if Gist fails
                  e.currentTarget.src = '/logos/drive-to-survive-logo.png';
                }}
              />
              <span className="text-xl font-bold text-black">DriveToSurvive</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {!fanView ? (
                <>
                  <Link 
                    href="/" 
                    className={`px-3 py-2 rounded-md border border-black ${isActive('/') 
                      ? 'bg-red-600 text-white' 
                      : 'text-black hover:bg-gray-100'}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/sponsor-pool" 
                    className={`px-3 py-2 rounded-md border border-black ${isActive('/sponsor-pool')
                      ? 'bg-red-600 text-white' 
                      : 'text-black hover:bg-gray-100'}`}
                  >
                    Sponsor Pool
                  </Link>
                  <Link 
                    href="/contracts" 
                    className={`px-3 py-2 rounded-md border border-black ${isActive('/contracts')
                      ? 'bg-red-600 text-white' 
                      : 'text-black hover:bg-gray-100'}`}
                  >
                    Contracts
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/driver-market" 
                    className={`px-3 py-2 rounded-md border border-black ${isActive('/driver-market')
                      ? 'bg-red-600 text-white' 
                      : 'text-black hover:bg-gray-100'}`}
                  >
                    Driver Market
                  </Link>
                  <Link 
                    href="/drivers" 
                    className={`px-3 py-2 rounded-md border border-black ${isActive('/drivers')
                      ? 'bg-red-600 text-white' 
                      : 'text-black hover:bg-gray-100'}`}
                  >
                    Drivers
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFanView(!fanView)}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors border-2 border-black bg-white text-black hover:bg-gray-100"
            >
              {fanView ? 'Exit Fan View' : 'Fan View'}
            </button>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}