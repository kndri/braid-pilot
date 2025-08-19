'use client';

import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';

interface DashboardHeaderProps {
  salonName: string;
}

export function DashboardHeader({ salonName }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {salonName}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/profile"
              className="text-gray-800 hover:text-black transition-colors"
            >
              View My Profile
            </Link>
            <SignOutButton redirectUrl="/">
              <button className="text-gray-800 hover:text-black transition-colors">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </header>
  );
}