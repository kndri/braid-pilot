'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

interface QuickActionsProps {
  quoteToolUrl?: string | null;
  isBookingProEnabled?: boolean;
  isCrmEnabled?: boolean;
  onCopyLink?: () => void;
}

export function QuickActions({ 
  quoteToolUrl, 
  isBookingProEnabled = false, 
  isCrmEnabled = false,
  onCopyLink 
}: QuickActionsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = async () => {
    if (quoteToolUrl) {
      try {
        await navigator.clipboard.writeText(quoteToolUrl);
        setCopied(true);
        if (onCopyLink) onCopyLink();
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Silent fail - clipboard API might not be available
      }
    }
  };
  
  const actions = [
    {
      title: 'Copy Quote Link',
      description: 'Share your Price My Style tool',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      onClick: handleCopyLink,
      enabled: true,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'View Bookings',
      description: 'Manage your appointments',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => router.push('/bookings'),
      enabled: isBookingProEnabled,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Manage Clients',
      description: 'View client profiles and history',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      onClick: () => router.push('/dashboard/crm'),
      enabled: isCrmEnabled,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Analytics',
      description: 'View business insights',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => router.push('/dashboard/crm'),
      enabled: isCrmEnabled,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'Edit Pricing',
      description: 'Update your service prices',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => router.push('/onboarding?step=pricing'),
      enabled: true,
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      title: 'Virtual Receptionist',
      description: 'AI phone answering service',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      onClick: () => router.push('/dashboard/virtual-receptionist'),
      enabled: FEATURE_FLAGS.VIRTUAL_RECEPTIONIST,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
      isNew: true,
    },
    {
      title: 'Reputation',
      description: 'Automated review collection',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      onClick: () => router.push('/dashboard/reputation'),
      enabled: FEATURE_FLAGS.REPUTATION_MANAGEMENT,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
      isNew: true,
    },
    {
      title: 'Settings',
      description: 'Manage your salon profile',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => router.push('/settings'),
      enabled: true,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];
  
  const enabledActions = actions.filter(action => action.enabled);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {enabledActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex items-center p-4 rounded-lg text-white ${action.color} transition-colors shadow-sm hover:shadow-md`}
          >
            <div className="flex-shrink-0 mr-3">
              {action.icon}
            </div>
            <div className="text-left">
              <p className="font-medium">{action.title}</p>
              <p className="text-xs opacity-90">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
      
      {!isBookingProEnabled && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-orange-800">
              Upgrade to <span className="font-semibold">Booking Pro</span> to unlock appointment management features
            </p>
          </div>
        </div>
      )}
      
      {copied && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-800">Quote link copied to clipboard!</p>
          </div>
        </div>
      )}
    </div>
  );
}