'use client'

import { useQuery, useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/convex/_generated/api'
import Link from 'next/link'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { ManualUserSync } from '@/components/ManualUserSync'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isInitializing, setIsInitializing] = useState(false)
  
  // Get current user data from Convex
  const viewer = useQuery(api.users.viewer)
  const currentUser = useQuery(api.users.getCurrentUser)
  const onboardingStatus = useQuery(api.users.checkOnboardingStatus)
  const createInitialSalonRecord = useMutation(api.users.createInitialSalonRecord)
  
  // Handle user initialization and onboarding redirect
  useEffect(() => {
    if (!isLoaded || !user || isInitializing) return
    
    async function initializeUser() {
      if (!viewer || isInitializing) {
        console.log('[Dashboard] initializeUser: skipped', { hasViewer: Boolean(viewer), isInitializing })
        return
      }
      
      // If user doesn't have a salon, create one
      if (viewer && !viewer.salonId) {
        setIsInitializing(true)
        try {
          console.log('[Dashboard] createInitialSalonRecord:start', { viewerEmail: viewer.email })
          await createInitialSalonRecord({
            salonData: {
              name: viewer.name || 'My Salon',
              email: viewer.email,
              phone: undefined,
            }
          })
          console.log('[Dashboard] createInitialSalonRecord:success')
        } catch (error) {
          console.error('Error creating salon record:', error)
        }
        setIsInitializing(false)
      }
      
      // Redirect to onboarding if not completed
      if (onboardingStatus && onboardingStatus.hasRecord && !onboardingStatus.onboardingComplete) {
        console.log('[Dashboard] redirecting to /onboarding')
        router.push('/onboarding')
      }
    }
    
    initializeUser()
  }, [viewer, onboardingStatus, router, createInitialSalonRecord, isInitializing, user, isLoaded])
  
  // Loading states
  if (!isLoaded || viewer === undefined || onboardingStatus === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    router.push('/sign-in')
    return null
  }
  
  if (!viewer) {
    // User is authenticated with Clerk but not yet in Convex - wait for sync
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Setting up your account...</p>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
          
          {/* Show debug info and manual sync */}
          <div className="mt-8 space-y-4">
            <div className="text-xs text-gray-400">
              <p>Clerk User ID: {user?.id}</p>
              <p>Email: {user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
            <ManualUserSync />
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Setting up your salon...</p>
        </div>
      </div>
    )
  }
  
  // Redirecting state - actually perform the redirect
  if (onboardingStatus && !onboardingStatus.onboardingComplete) {
    router.push('/onboarding');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Redirecting to onboarding...</p>
        </div>
      </div>
    )
  }
  
  // Main dashboard content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded"></div>
              <span className="text-xl font-semibold text-gray-900">braidpilot</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                Bookings
              </Link>
              <Link href="/clients" className="text-gray-600 hover:text-gray-900">
                Clients
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                Settings
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <SignOutButton>
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.firstName || 'User'} className="w-8 h-8 rounded-full" />
                      ) : (
                        <span className="text-sm font-medium">
                          {viewer?.name?.charAt(0).toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="hidden md:inline text-sm">Sign Out</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {currentUser?.salon?.name || viewer?.name || user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here&apos;s what&apos;s happening with your salon today.
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today&apos;s Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">$0</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/bookings/new"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <svg className="w-8 h-8 text-orange-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h3 className="font-medium text-gray-900">New Booking</h3>
              <p className="text-sm text-gray-600 mt-1">Schedule a new appointment</p>
            </Link>
            
            <Link
              href="/clients/new"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <svg className="w-8 h-8 text-orange-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <h3 className="font-medium text-gray-900">Add Client</h3>
              <p className="text-sm text-gray-600 mt-1">Register a new client</p>
            </Link>
            
            <Link
              href="/pricing"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <svg className="w-8 h-8 text-orange-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="font-medium text-gray-900">Update Pricing</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your service prices</p>
            </Link>
          </div>
        </div>
        
        {/* Debug Info - Remove in production */}
        {onboardingStatus && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <p>Debug Info: You have {onboardingStatus.pricingConfigCount || 0} pricing configurations.</p>
            <p>Onboarding Status: {onboardingStatus.onboardingComplete ? 'Complete' : 'Incomplete'}</p>
            <p>User Email: {viewer?.email || user?.emailAddresses?.[0]?.emailAddress}</p>
            <p>Clerk User ID: {user?.id}</p>
          </div>
        )}
      </main>
    </div>
  )
}