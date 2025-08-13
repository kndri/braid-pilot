'use client'

import { useQuery, useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { ManualUserSync } from '@/components/ManualUserSync'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { WelcomeStatusBar } from '@/components/dashboard/WelcomeStatusBar'
import { MetricsCards } from '@/components/dashboard/MetricsCards'
import { PriceMyStyleCard } from '@/components/dashboard/PriceMyStyleCard'
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments'
import { NextStepsCTA } from '@/components/dashboard/NextStepsCTA'
import { DashboardLoading } from '@/components/dashboard/DashboardLoading'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isInitializing, setIsInitializing] = useState(false)
  
  // Get current user data from Convex
  const viewer = useQuery(api.users.viewer)
  const onboardingStatus = useQuery(api.users.checkOnboardingStatus)
  const createInitialSalonRecord = useMutation(api.users.createInitialSalonRecord)
  const ensureQuoteToolUrl = useMutation(api.pricing.ensureQuoteToolUrl)
  const dashboardData = useQuery(api.dashboard.getDashboardData)
  
  // ALL hooks must be called before any conditional returns
  
  // Handle user initialization (salon creation)
  useEffect(() => {
    if (!isLoaded || !user || isInitializing) return
    
    async function initializeUser() {
      if (!viewer || isInitializing) {
        console.log('[Dashboard] initializeUser: skipped', { hasViewer: Boolean(viewer), isInitializing })
        return
      }
      
      // If user doesn't have a salon, redirect to salon setup
      if (viewer && !viewer.salonId) {
        console.log('[Dashboard] No salon found, redirecting to salon setup')
        router.push('/salon-setup')
      }
    }
    
    initializeUser()
  }, [viewer, router, isInitializing, user, isLoaded])
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])
  
  // Handle onboarding redirect
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.onboardingComplete) {
      router.push('/onboarding');
    }
  }, [onboardingStatus, router])
  
  // Ensure quote tool URL exists for completed onboarding
  useEffect(() => {
    async function ensureUrl() {
      // Only proceed if we have valid dashboard data (not null from auth loading)
      if (dashboardData && dashboardData.onboardingComplete && !dashboardData.salon.quoteToolUrl) {
        try {
          const result = await ensureQuoteToolUrl();
          if (result.success) {
            console.log('Generated quote tool URL:', result.quoteToolUrl);
          } else {
            console.log('Could not generate URL:', result.error);
          }
        } catch (error) {
          console.error('Error generating quote tool URL:', error);
        }
      }
    }
    ensureUrl();
  }, [dashboardData, ensureQuoteToolUrl])
  
  // Now we can have conditional returns after all hooks are called
  
  // Loading states
  if (!isLoaded || viewer === undefined || onboardingStatus === undefined) {
    return <DashboardLoading />
  }
  
  if (!user) {
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
  
  // Show redirecting state
  if (onboardingStatus && !onboardingStatus.onboardingComplete) {
    return <DashboardLoading />
  }
  
  // Wait for dashboard data to load
  // dashboardData can be null during auth loading or undefined during query loading
  if (dashboardData === undefined || dashboardData === null) {
    return <DashboardLoading />
  }
  
  // Main dashboard content
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader salonName={dashboardData.salon.name} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeStatusBar 
          salonName={dashboardData.salon.name}
          isOnline={dashboardData.onboardingComplete}
        />
        
        <MetricsCards metrics={dashboardData.metrics} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PriceMyStyleCard quoteToolUrl={dashboardData.salon.quoteToolUrl} />
          <UpcomingAppointments 
            appointments={dashboardData.upcomingBookings}
            totalCount={dashboardData.metrics.upcomingAppointmentsCount}
          />
        </div>
        
        <NextStepsCTA />
      </div>
    </div>
  )
}