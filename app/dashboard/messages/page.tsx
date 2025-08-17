'use client'

import { useState } from 'react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { MessageSquare, Phone, Mail, Clock, CheckCircle } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function MessagesPage() {
  const { user, isLoaded } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  // In the future, this will pull from communication logs
  const mockMessages = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      type: 'sms',
      message: 'Hi, can I reschedule my appointment to next week?',
      time: '2 hours ago',
      status: 'unread'
    },
    {
      id: '2',
      clientName: 'Maria Garcia',
      type: 'call',
      message: 'Voicemail: Calling about available slots for box braids',
      time: '5 hours ago',
      status: 'read'
    },
    {
      id: '3',
      clientName: 'Ashley Williams',
      type: 'email',
      message: 'Question about pricing for knotless braids',
      time: '1 day ago',
      status: 'replied'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages & Communications</h1>
            
            {/* Communication Channels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SMS Messages</p>
                    <p className="text-xl font-semibold">12 unread</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Voicemails</p>
                    <p className="text-xl font-semibold">3 new</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Emails</p>
                    <p className="text-xl font-semibold">5 pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Recent Messages</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {mockMessages.map((message) => (
                  <div key={message.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {message.type === 'sms' && <MessageSquare className="h-5 w-5 text-gray-600" />}
                          {message.type === 'call' && <Phone className="h-5 w-5 text-gray-600" />}
                          {message.type === 'email' && <Mail className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{message.clientName}</p>
                            {message.status === 'unread' && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                New
                              </span>
                            )}
                            {message.status === 'replied' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{message.message}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {message.time}
                          </div>
                        </div>
                      </div>
                      <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Virtual Receptionist Active:</span> Your AI assistant is handling incoming calls and messages 24/7. 
                    Check the AI Reputation tab to configure automated responses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}