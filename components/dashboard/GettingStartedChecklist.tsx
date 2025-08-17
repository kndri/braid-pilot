'use client'

import { CheckCircle, Circle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

interface GettingStartedChecklistProps {
  onboardingComplete?: boolean
  calendarConnected?: boolean
  priceMyStyleShared?: boolean
  firstBookingReceived?: boolean
  virtualReceptionistEnabled?: boolean
}

export function GettingStartedChecklist({
  onboardingComplete = false,
  calendarConnected = false,
  priceMyStyleShared = false,
  firstBookingReceived = false,
  virtualReceptionistEnabled = false
}: GettingStartedChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'onboarding',
      label: 'Finish the Onboarding Wizard to set your prices',
      completed: onboardingComplete
    },
    {
      id: 'calendar',
      label: 'Connect your calendar and set your availability',
      completed: calendarConnected
    },
    {
      id: 'share',
      label: 'Share your "Price My Style" link on Instagram',
      completed: priceMyStyleShared
    },
    {
      id: 'booking',
      label: 'Receive your first booking',
      completed: firstBookingReceived
    },
    {
      id: 'vr',
      label: 'Enable the Virtual Receptionist',
      completed: virtualReceptionistEnabled
    }
  ])

  useEffect(() => {
    setChecklist([
      {
        id: 'onboarding',
        label: 'Finish the Onboarding Wizard to set your prices',
        completed: onboardingComplete
      },
      {
        id: 'calendar',
        label: 'Connect your calendar and set your availability',
        completed: calendarConnected
      },
      {
        id: 'share',
        label: 'Share your "Price My Style" link on Instagram',
        completed: priceMyStyleShared
      },
      {
        id: 'booking',
        label: 'Receive your first booking',
        completed: firstBookingReceived
      },
      {
        id: 'vr',
        label: 'Enable the Virtual Receptionist',
        completed: virtualReceptionistEnabled
      }
    ])
  }, [onboardingComplete, calendarConnected, priceMyStyleShared, firstBookingReceived, virtualReceptionistEnabled])

  const allCompleted = checklist.every(item => item.completed)
  
  if (allCompleted) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Getting Started Checklist</h2>
      <div className="space-y-3">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            {item.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 mt-0.5" />
            )}
            <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {checklist.filter(item => item.completed).length} of {checklist.length} completed
          </span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checklist.filter(item => item.completed).length / checklist.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}