'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Calendar, 
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function PostOnboardingSetupPage() {
  const router = useRouter()
  const [selectedSteps, setSelectedSteps] = useState<string[]>([])

  const setupOptions = [
    {
      id: 'braiders',
      title: 'Add Your Braiders',
      description: 'Set up your team members, their specialties, and availability',
      icon: Users,
      href: '/dashboard/braiders?setup=true',
      benefits: [
        'Track individual braider performance',
        'Assign bookings to the right specialist',
        'Manage payouts efficiently'
      ],
      time: '5 min',
      priority: 'Recommended'
    },
    {
      id: 'capacity',
      title: 'Configure Booking Settings',
      description: 'Set up capacity limits, buffer times, and service durations',
      icon: Shield,
      href: '/dashboard/bookings?view=settings',
      benefits: [
        'Prevent overbooking disasters',
        'Ensure proper time between appointments',
        'Optimize your daily schedule'
      ],
      time: '3 min',
      priority: 'Recommended'
    },
    {
      id: 'calendar',
      title: 'Connect Your Calendar',
      description: 'Sync with Google Calendar or other calendar apps',
      icon: Calendar,
      href: '/dashboard/settings?tab=integrations',
      benefits: [
        'Automatic appointment syncing',
        'Avoid double bookings',
        'Get reminders on your phone'
      ],
      time: '2 min',
      priority: 'Optional'
    }
  ]

  const handleSkipAll = () => {
    router.push('/dashboard')
  }

  const handleContinue = () => {
    if (selectedSteps.length > 0) {
      // Navigate to the first selected step
      const firstStep = setupOptions.find(opt => opt.id === selectedSteps[0])
      if (firstStep) {
        router.push(firstStep.href)
      }
    } else {
      router.push('/dashboard')
    }
  }

  const toggleStep = (stepId: string) => {
    setSelectedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Great! Your Pricing is Set Up 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your quote tool is ready. Now let's optimize your operations (optional)
          </p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Your Quote Tool is Live!</h3>
              <p className="text-gray-600 mb-3">
                Clients can now get instant quotes for their braiding styles
              </p>
              <Link 
                href="/dashboard"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                View your quote URL
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Optional Setup Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Want to Set Up More? (Optional)
          </h2>
          <p className="text-gray-600 mb-6">
            These features help you manage your salon more efficiently. You can always set them up later.
          </p>

          <div className="space-y-4">
            {setupOptions.map((option) => (
              <div
                key={option.id}
                className={`bg-white rounded-xl border-2 transition-all cursor-pointer ${
                  selectedSteps.includes(option.id)
                    ? 'border-purple-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleStep(option.id)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedSteps.includes(option.id)
                        ? 'bg-purple-100'
                        : 'bg-gray-100'
                    }`}>
                      <option.icon className={`w-6 h-6 ${
                        selectedSteps.includes(option.id)
                          ? 'text-purple-600'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{option.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="inline-flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {option.time}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              option.priority === 'Recommended'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {option.priority}
                            </span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedSteps.includes(option.id)
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedSteps.includes(option.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                      <ul className="space-y-1">
                        {option.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-500">
                            <Check className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleContinue}
            className="flex-1 bg-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            {selectedSteps.length > 0 ? (
              <>
                Continue Setup ({selectedSteps.length} selected)
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
          <button
            onClick={handleSkipAll}
            className="sm:flex-none bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Skip for Now
          </button>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't worry! You can access all these features anytime from your dashboard.
        </p>
      </div>
    </div>
  )
}