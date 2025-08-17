'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Id } from '@/convex/_generated/dataModel';
import { BusinessAnalytics } from '@/components/crm/BusinessAnalytics';
import { ClientList } from '@/components/crm/ClientList';
import { ClientProfile } from '@/components/crm/ClientProfile';

export default function CRMDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'clients'>('overview');
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  
  // Get current user and salon data
  const viewer = useQuery(api.users.viewer);
  const dashboardData = useQuery(api.dashboard.getDashboardData);
  
  // Redirect if not authenticated
  if (!user) {
    router.push('/sign-in');
    return null;
  }
  
  // Loading state
  if (!viewer || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading CRM...</p>
        </div>
      </div>
    );
  }
  
  // Check if user has completed onboarding
  if (!dashboardData.onboardingComplete) {
    router.push('/onboarding');
    return null;
  }
  
  const salonId = dashboardData.salon._id;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">CRM Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {dashboardData.salon.name}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Overview
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'clients'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Client Management
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <BusinessAnalytics salonId={salonId} />
        )}
        
        {activeTab === 'clients' && (
          <>
            <ClientList 
              salonId={salonId} 
              onSelectClient={setSelectedClientId}
            />
            
            {selectedClientId && (
              <ClientProfile
                clientId={selectedClientId}
                salonId={salonId}
                onClose={() => setSelectedClientId(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}