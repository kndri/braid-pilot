"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { VirtualReceptionistSettings } from "@/components/vapi/VirtualReceptionistSettings";
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

function VirtualReceptionistContent() {
  const { user } = useUser();
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  if (!userData?.salonId) {
    return (
      <div className="max-w-[1600px] mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Salon Setup Required</h2>
          <p className="text-yellow-700">
            Please complete your salon setup before accessing the virtual receptionist feature.
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
            <h1 className="text-3xl font-bold text-gray-900">Virtual Receptionist</h1>
            <p className="text-gray-600 mt-2">
              AI-powered phone answering that never misses a call
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              🎯 Powered by Vapi
            </span>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">📞 24/7 Availability</h3>
            <p className="text-blue-100 text-sm">
              Never miss a call again. Your AI receptionist answers instantly, any time of day.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">🗓 Smart Booking</h3>
            <p className="text-purple-100 text-sm">
              Automatically schedules appointments based on your real-time availability.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">💬 Natural Conversations</h3>
            <p className="text-blue-100 text-sm">
              Handles inquiries about services, pricing, and policies with human-like responses.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <VirtualReceptionistSettings salonId={userData.salonId} />
      </Suspense>

      {/* Best Practices */}
      <div className="mt-8 bg-gray-50 border border-gray-200 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">💡 Virtual Receptionist Best Practices</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Setup Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Update your business hours and policies regularly</li>
              <li>• Test the AI with common customer questions</li>
              <li>• Add your phone number to all marketing materials</li>
              <li>• Monitor call logs to identify improvement areas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Performance Optimization</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Customize the AI personality to match your brand</li>
              <li>• Keep pricing and service information up-to-date</li>
              <li>• Review missed calls and adjust AI responses</li>
              <li>• Use call recordings to train staff</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call Analytics Preview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bookings Made</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Via AI assistant</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Call Time</p>
              <p className="text-2xl font-bold text-gray-900">0:00</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Minutes:Seconds</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">-%</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Resolved inquiries</p>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help Setting Up?</h3>
        <p className="text-blue-700 text-sm mb-4">
          Setting up your virtual receptionist takes just a few minutes. We're here to help if you need assistance.
        </p>
        <div className="flex flex-wrap gap-3">
          <a 
            href="https://docs.braidpilot.com/virtual-receptionist"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            📚 View Setup Guide
          </a>
          <a 
            href="mailto:support@braidpilot.com?subject=Virtual Receptionist Help"
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-300 hover:bg-blue-50"
          >
            📧 Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VirtualReceptionistPage() {
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
          <VirtualReceptionistContent />
        </main>
      </div>
    </div>
  );
}