'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SignOutButton, useUser } from '@clerk/nextjs'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export default function OnboardingPage() {
  const router = useRouter()
  useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleting, setIsCompleting] = useState(false)
  
  const viewer = useQuery(api.users.viewer)
  const currentUser = useQuery(api.users.getCurrentUser)
  const onboardingStatus = useQuery(api.users.checkOnboardingStatus)
  const completeOnboarding = useMutation(api.users.completeOnboarding)
  
  // Redirect to dashboard if onboarding is already complete
  useEffect(() => {
    if (onboardingStatus?.onboardingComplete) {
      router.replace('/dashboard')
    }
  }, [onboardingStatus, router])
  
  const totalSteps = 3
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await completeOnboarding()
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsCompleting(false)
    }
  }
  
  const handleSkip = () => {
    router.push('/dashboard')
  }
  

  
  // Show loading while data is being fetched
  if (viewer === undefined || onboardingStatus === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-800">Setting up your account...</p>
          <p className="text-sm text-gray-700 mt-2">This may take a few seconds</p>
        </div>
      </div>
    )
  }
  
  // If viewer is null (user not in database), show error
  if (viewer === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-900 font-semibold mb-2">Account Setup Required</p>
          <p className="text-gray-800 mb-4">We&apos;re having trouble setting up your account.</p>
          <p className="text-sm text-gray-700 mb-6">Please try refreshing the page or sign out and back in.</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="block w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Refresh Page
            </button>
            <SignOutButton>
              <button className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    )
  }
  
  // Use the new comprehensive wizard if we have salon data
  if (currentUser?.salon?._id && currentUser.salon.name) {
    return (
      <OnboardingWizard 
        salonId={currentUser.salon._id} 
        salonName={currentUser.salon.name} 
      />
    );
  }
  
  // Fallback to simple onboarding for initial setup
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded"></div>
              <span className="text-xl font-semibold text-gray-900">braidpilot</span>
            </div>
            <SignOutButton>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>
      
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-800">Step {currentStep} of {totalSteps}</span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              Skip for now
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Braid Pilot, {viewer?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-lg text-gray-800 mb-8">
                Let&apos;s get your salon set up in just a few minutes. We&apos;ll help you configure your pricing, 
                set your availability, and customize your booking page.
              </p>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 What we&apos;ll cover:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Set up your service menu and pricing
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Configure your availability and booking rules
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Customize your booking page appearance
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Service Menu & Pricing
              </h2>
              <p className="text-gray-600 mb-8">
                Add your most popular services to get started. You can always add more later.
              </p>
              
              <div className="border border-gray-200 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 mb-4">
                  Pricing configuration will be implemented in the next phase
                </p>
                <p className="text-sm text-gray-400">
                  This is a placeholder for the pricing setup wizard
                </p>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You&apos;re All Set! 🎉
              </h2>
              <p className="text-gray-600 mb-8">
                Your salon is ready to start accepting bookings. Here&apos;s what you can do next:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Share your booking link</h3>
                    <p className="text-gray-600 text-sm">Send your personalized booking page to clients</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Customize your settings</h3>
                    <p className="text-gray-600 text-sm">Fine-tune your availability and booking rules</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Start accepting bookings</h3>
                    <p className="text-gray-600 text-sm">Watch your calendar fill up automatically</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? 'Completing...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}