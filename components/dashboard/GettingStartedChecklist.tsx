'use client'

import { CheckCircle, Circle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { FEATURE_FLAGS } from '@/lib/featureFlags'

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
  const baseChecklist = [
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
    }
  ]
  
  // Only add Virtual Receptionist if feature is enabled
  if (FEATURE_FLAGS.VIRTUAL_RECEPTIONIST) {
    baseChecklist.push({
      id: 'vr',
      label: 'Enable the Virtual Receptionist',
      completed: virtualReceptionistEnabled
    })
  }
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>(baseChecklist)

  useEffect(() => {
    const updatedChecklist = [
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
      }
    ]
    
    // Only add Virtual Receptionist if feature is enabled
    if (FEATURE_FLAGS.VIRTUAL_RECEPTIONIST) {
      updatedChecklist.push({
        id: 'vr',
        label: 'Enable the Virtual Receptionist',
        completed: virtualReceptionistEnabled
      })
    }
    
    setChecklist(updatedChecklist)
  }, [onboardingComplete, calendarConnected, priceMyStyleShared, firstBookingReceived, virtualReceptionistEnabled])

  const allCompleted = checklist.every(item => item.completed)
  
  if (allCompleted) {
    return null
  }

  return (
    <div className="bg-white p-5 mb-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Your Getting Started Checklist</h3>
      <div className="space-y-2.5">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5">
            {item.completed ? (
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
            )}
            <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {checklist.filter(item => item.completed).length} of {checklist.length} completed
          </span>
          <div className="w-28 bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(checklist.filter(item => item.completed).length / checklist.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}