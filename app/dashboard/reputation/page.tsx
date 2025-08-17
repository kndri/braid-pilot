"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SalonReviewSetupSMS } from "@/components/reputation/SalonReviewSetupSMS";
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar';
import { Suspense, useState } from "react";
import { redirect } from 'next/navigation';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ReputationManagementContent() {
  const { user } = useUser();
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  
  const salon = useQuery(api.salons.getSalonById, {
    salonId: userData?.salonId || ("" as any),
  });
  
  const analytics = useQuery(api.reputationSMS.getReviewAnalytics, {
    salonId: userData?.salonId || ("" as any),
    days: 30,
  });
  
  const quota = useQuery(api.reputationSMS.checkReviewQuota, {
    salonId: userData?.salonId || ("" as any),
  });

  if (!userData?.salonId) {
    return (
      <div className="max-w-[1600px] mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Salon Setup Required</h2>
          <p className="text-yellow-700">
            Please complete your salon setup before accessing reputation management features.
          </p>
        </div>
      </div>
    );
  }

  const hasReviewUrls = !!(salon?.googleReviewUrl || salon?.yelpReviewUrl);

  return (
    <div className="max-w-[1600px] mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SMS Review Collection</h1>
            <p className="text-gray-600 mt-2">
              Automatically text clients for reviews after appointments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              📱 SMS Automation
            </span>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">🚀 Automated SMS</h3>
            <p className="text-purple-100 text-sm">
              Text review requests automatically after each completed appointment.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">📱 Direct to Phone</h3>
            <p className="text-pink-100 text-sm">
              One-click review links sent directly to client phones for instant access.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">📊 Track Results</h3>
            <p className="text-purple-100 text-sm">
              Monitor delivery rates and optimize your review collection strategy.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {hasReviewUrls && analytics && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.successRate || 0}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">SMS delivery rate</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SMS Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalSent || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.avgResponseTime || 0}h
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Average</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SMS Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quota?.used || 0}/{quota?.limit || '∞'}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>
        </div>
      )}

      {/* Main Settings Component */}
      <Suspense fallback={<LoadingSpinner />}>
        <SalonReviewSetupSMS salonId={userData.salonId} />
      </Suspense>

      {/* How It Works */}
      <div className="mt-8 bg-gray-50 border border-gray-200 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">📱 How SMS Reviews Work</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Complete Service</h4>
            <p className="text-xs text-gray-600">Mark appointment done</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">SMS Sent</h4>
            <p className="text-xs text-gray-600">Text sent after delay</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-pink-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">One-Click Review</h4>
            <p className="text-xs text-gray-600">Client clicks link to review</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">4</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Build Reputation</h4>
            <p className="text-xs text-gray-600">Get more 5-star reviews</p>
          </div>
        </div>
      </div>

      {/* Platform Benefits */}
      <div className="mt-8 bg-white border border-gray-200 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">✨ SMS Review Benefits</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Why SMS Works Better</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 98% of SMS messages are opened (vs 20% for email)</li>
              <li>• 90% are read within 3 minutes</li>
              <li>• Direct link makes reviewing effortless</li>
              <li>• Mobile-optimized for instant reviews</li>
              <li>• Higher response rates than any other channel</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Included in Your Plan</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• No setup required - we handle SMS delivery</li>
              <li>• Automated sending after appointments</li>
              <li>• Opt-out compliance management</li>
              <li>• Real-time delivery tracking</li>
              <li>• Professional, tested message templates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SMS Best Practices */}
      <div className="mt-8 bg-purple-50 border border-purple-200 p-6 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-4">💡 SMS Review Best Practices</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Timing Tips</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Send 2-4 hours after service for best results</li>
              <li>• Avoid early morning or late night sends</li>
              <li>• Strike while the experience is fresh</li>
              <li>• Test different delays to optimize</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-2">Message Optimization</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Keep messages short and personal</li>
              <li>• Include client's first name</li>
              <li>• One clear call-to-action (review link)</li>
              <li>• Consider offering small incentives</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      {quota && (
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">📈 Your SMS Plan</h3>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-800">
                  {quota.tier === 'unlimited' ? 'Unlimited' : 
                   quota.tier === 'professional' ? 'Professional' : 'Starter'} Plan
                </h4>
                <p className="text-sm text-gray-600">
                  {quota.limit ? `${quota.limit} SMS reviews/month` : 'Unlimited SMS reviews'}
                </p>
              </div>
              {quota.tier !== 'unlimited' && (
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-shadow">
                  Upgrade Plan
                </button>
              )}
            </div>
            
            {quota.limit && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>SMS usage this month</span>
                  <span>{quota.used} / {quota.limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(quota.percentUsed || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="mt-4 text-sm text-green-600 font-medium">
              ✅ SMS delivery included in all plans
            </div>
          </div>
        </div>
      )}

      {/* Success Stats */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">📊 Industry Statistics</h3>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">98%</p>
            <p className="text-sm text-green-700">SMS Open Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">45%</p>
            <p className="text-sm text-green-700">SMS Response Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">3 min</p>
            <p className="text-sm text-green-700">Average Read Time</p>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help with SMS Reviews?</h3>
        <p className="text-blue-700 text-sm mb-4">
          Setting up SMS review automation takes just minutes. We're here to help you get more 5-star reviews.
        </p>
        <div className="flex flex-wrap gap-3">
          <a 
            href="https://docs.braidpilot.com/sms-reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            📚 SMS Guide
          </a>
          <button 
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-300 hover:bg-blue-50"
          >
            💬 Chat Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReputationManagementPage() {
  const { isLoaded, user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoaded && !user) {
    redirect('/sign-in');
  }

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <LoadingSpinner />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ReputationManagementContent />
        </main>
      </div>
    </div>
  );
}