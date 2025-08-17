'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { Settings, Building2, Clock, CreditCard, Bell, Shield, Palette } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('business')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (isLoaded && !user) {
    redirect('/sign-in')
  }

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'hours', label: 'Working Hours', icon: Clock },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your salon preferences and configuration</p>
            </div>

            <div className="flex gap-4 lg:p-6">
              {/* Sidebar Navigation */}
              <div className="w-64">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1">
                <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                  {activeTab === 'business' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Business Information</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salon Name
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Your Salon Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <textarea
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            rows={3}
                            placeholder="123 Main St, City, State 12345"
                          />
                        </div>
                        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'hours' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Working Hours</h2>
                      <div className="space-y-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <div key={day} className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium text-gray-700 w-24">{day}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                                defaultValue="09:00"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                                defaultValue="18:00"
                              />
                              <label className="flex items-center gap-2 ml-4">
                                <input type="checkbox" className="rounded" />
                                <span className="text-sm text-gray-600">Closed</span>
                              </label>
                            </div>
                          </div>
                        ))}
                        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 mt-4">
                          Update Hours
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'pricing' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Pricing Configuration</h2>
                      <div className="space-y-4">
                        <div className="rounded-lg bg-yellow-50 p-4">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Note:</span> To update your pricing, please use the onboarding tool or contact support for bulk pricing updates.
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Platform Fee
                          </label>
                          <div className="text-lg font-semibold">5% per transaction</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deposit Amount
                          </label>
                          <input
                            type="number"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="50"
                          />
                        </div>
                        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                          Update Pricing
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                      <div className="space-y-4">
                        {[
                          { label: 'New booking notifications', description: 'Get notified when a new booking is made' },
                          { label: 'Cancellation alerts', description: 'Receive alerts for cancelled appointments' },
                          { label: 'Daily summary', description: 'Get a daily summary of your bookings' },
                          { label: 'Payment notifications', description: 'Notifications for successful payments' },
                          { label: 'Marketing emails', description: 'Tips and updates from Braid Pilot' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-start justify-between py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.label}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                      <div className="space-y-4">
                        <div className="rounded-lg bg-green-50 p-4">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Two-factor authentication:</span> Enabled
                          </p>
                        </div>
                        <button className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                          Change Password
                        </button>
                        <button className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                          Manage API Keys
                        </button>
                        <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                          Sign Out All Devices
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Appearance</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                          </label>
                          <div className="flex gap-2">
                            <button className="rounded-lg border-2 border-indigo-600 bg-white px-4 py-2 text-sm font-medium text-indigo-600">
                              Light
                            </button>
                            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                              Dark
                            </button>
                            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                              System
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}