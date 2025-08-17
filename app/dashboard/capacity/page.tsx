'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { redirect } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Shield, Users } from 'lucide-react';
import { CapacityManagementPanel } from '@/components/capacity/CapacityManagementPanel';
import { BraiderManagementPanel } from '@/components/braiders/BraiderManagementPanel';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar';

export default function CapacityManagementPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'capacity' | 'braiders'>('capacity');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get current user data from Convex
  const viewer = useQuery(api.users.viewer);
  
  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    redirect('/sign-in');
  }
  
  if (!viewer || !viewer.salonId) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-100 rounded"></div>
                  <div className="h-32 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Capacity & Braider Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Prevent overbooking and manage your team effectively
              </p>
            </div>
      
            {/* Alert Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <div className="px-4 py-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Emergency Management Active:</strong> These features help prevent overbooking disasters and ensure proper service delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('capacity')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'capacity'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Shield className="inline w-4 h-4 mr-2" />
                    Capacity Management
                  </button>
                  <button
                    onClick={() => setActiveTab('braiders')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'braiders'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="inline w-4 h-4 mr-2" />
                    Braider Management
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Content */}
            <div className="mb-6">
              {activeTab === 'capacity' ? (
                <CapacityManagementPanel salonId={viewer.salonId} />
              ) : (
                <BraiderManagementPanel salonId={viewer.salonId} />
              )}
            </div>
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:p-6">
              <div className="bg-blue-50 rounded-lg p-4 lg:p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Why Capacity Management?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Prevents accepting more bookings than you can handle</li>
                  <li>• Ensures proper buffer time between appointments</li>
                  <li>• Tracks service duration to prevent scheduling conflicts</li>
                  <li>• Allows blocking time slots for administrative tasks</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 lg:p-6">
                <h3 className="font-semibold text-green-900 mb-2">Why Braider Assignment?</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Matches clients with qualified braiders for their style</li>
                  <li>• Prevents skill mismatches (e.g., junior doing complex styles)</li>
                  <li>• Balances workload across your team</li>
                  <li>• Tracks individual braider availability and specializations</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};