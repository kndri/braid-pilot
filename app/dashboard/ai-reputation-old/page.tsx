"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VirtualReceptionistSettings } from "@/components/vapi/VirtualReceptionistSettings";
import { ReputationSettings } from "@/components/reputation/ReputationSettings";
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

function AIReputationContent() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'virtual-receptionist' | 'reputation'>('virtual-receptionist');
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  if (!userData?.salonId) {
    return (
      <div className="max-w-[1600px] mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Salon Setup Required</h2>
          <p className="text-yellow-700">
            Please complete your salon setup before accessing AI and reputation management features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Virtual Receptionist & Reputation</h1>
            <p className="text-gray-600 mt-2">
              AI-powered phone answering and automated review collection
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              🎯 Vapi Platform
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('virtual-receptionist')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'virtual-receptionist'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Virtual Receptionist
            </button>
            <button
              onClick={() => setActiveTab('reputation')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reputation'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reputation Management
            </button>
          </nav>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">📞 Virtual Receptionist</h3>
            <p className="text-blue-100 text-sm">
              Professional AI voice that answers calls instantly, handles inquiries, and books appointments 24/7.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">⭐ Reputation Management</h3>
            <p className="text-purple-100 text-sm">
              Automatically collect reviews after appointments to build your online presence and attract more clients.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Tab Content */}
        <Suspense fallback={<LoadingSpinner />}>
          {activeTab === 'virtual-receptionist' ? (
            <VirtualReceptionistSettings salonId={userData.salonId} />
          ) : (
            <ReputationSettings salonId={userData.salonId} />
          )}
        </Suspense>

        {/* Integration Tips */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">💡 Pro Tips for Success</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">AI Agent Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Share your AI number on social media and business cards</li>
                <li>• Customize the AI personality to match your brand</li>
                <li>• Monitor communication logs to improve responses</li>
                <li>• Use custom instructions for specific salon policies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Review Collection Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Set up both Google and Yelp for maximum impact</li>
                <li>• Consider immediate requests for satisfied clients</li>
                <li>• Test your review request templates regularly</li>
                <li>• Monitor analytics to track performance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help Getting Started?</h3>
          <p className="text-blue-700 text-sm mb-4">
            Our AI and reputation management features are designed to be easy to set up, but we&apos;re here to help if you need assistance.
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="mailto:support@braidpilot.com"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              📧 Contact Support
            </a>
            <a 
              href="/help/ai-reputation"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-300 hover:bg-blue-50"
            >
              📚 View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIReputationPage() {
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
          <AIReputationContent />
        </main>
      </div>
    </div>
  );
}