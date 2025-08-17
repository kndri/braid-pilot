'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: '#7c3aed' }}></div>
      <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: '#06b6d4' }}></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: '#7c3aed' }}></div>
      <div className="absolute bottom-40 right-1/3 w-12 h-12 rounded-full opacity-20" style={{ backgroundColor: '#06b6d4' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6" style={{ color: 'var(--text-dark)' }}>
            Master Your Metrics,
            <br />
            Maximize Your Revenue
          </h1>
          
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4" style={{ color: 'var(--foreground)' }}>
            Intuitive Tools To Measure, Analyze, And Drive Salon Performance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto inline-block text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{
                background: 'white',
                color: 'var(--text-dark)',
                border: '2px solid var(--text-dark)',
                borderRadius: '12px',
                textDecoration: 'none'
              }}
            >
              Log In
            </Link>
            <Link 
              href="/onboarding"
              className="w-full sm:w-auto inline-block text-base sm:text-lg font-semibold text-white px-6 sm:px-8 py-3 sm:py-4 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                textDecoration: 'none'
              }}
            >
              Get free demo
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left side - Analytics Dashboard */}
          <div className="relative">
            <div 
              className="bg-white shadow-xl p-6 relative"
              style={{
                borderRadius: '20px',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Small floating elements */}
              <div className="absolute -top-4 -left-4 bg-white shadow-lg p-3 rounded-lg" style={{ border: '1px solid var(--border-color)' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium">Revenue Up</span>
                </div>
                <div className="text-sm font-bold mt-1">+28%</div>
              </div>

              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>Salon Analytics</h3>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: '#7c3aed' }}>1,542</div>
                  <div className="text-sm text-gray-600">Monthly Clients</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: '#06b6d4' }}>$45.2K</div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>

              {/* Mini chart */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end space-x-2 h-24">
                  <div className="flex-1 bg-purple-300 rounded-t" style={{ height: '40%' }}></div>
                  <div className="flex-1 bg-purple-400 rounded-t" style={{ height: '60%' }}></div>
                  <div className="flex-1 bg-purple-500 rounded-t" style={{ height: '80%' }}></div>
                  <div className="flex-1 bg-purple-600 rounded-t" style={{ height: '100%' }}></div>
                  <div className="flex-1 bg-purple-500 rounded-t" style={{ height: '75%' }}></div>
                  <div className="flex-1 bg-purple-400 rounded-t" style={{ height: '85%' }}></div>
                  <div className="flex-1 bg-purple-500 rounded-t" style={{ height: '90%' }}></div>
                </div>
              </div>

              {/* Client list */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Recent Bookings</span>
                  <span className="text-xs text-gray-500">View all</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-200"></div>
                      <div>
                        <div className="text-sm font-medium">Aisha Williams</div>
                        <div className="text-xs text-gray-500">Knotless Braids</div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">$180</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-200"></div>
                      <div>
                        <div className="text-sm font-medium">Jasmine Chen</div>
                        <div className="text-xs text-gray-500">Box Braids</div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">$220</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Mobile App Preview */}
          <div className="relative flex items-center justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div 
                className="bg-gray-900 p-2 rounded-[2.5rem] shadow-2xl"
                style={{ width: '280px' }}
              >
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* Phone screen */}
                  <div className="bg-gradient-to-b from-purple-50 to-white p-6" style={{ minHeight: '500px' }}>
                    {/* App header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600"></div>
                        <span className="font-bold text-gray-900">Braid Pilot</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                    </div>

                    {/* Quick stats */}
                    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">Today&apos;s Revenue</div>
                      <div className="text-2xl font-bold text-gray-900">$1,840</div>
                      <div className="text-xs text-green-600">↑ 12% from yesterday</div>
                    </div>

                    {/* Appointment cards */}
                    <div className="space-y-3">
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-sm">Maria Johnson</div>
                            <div className="text-xs text-gray-500">2:00 PM - Goddess Locs</div>
                          </div>
                          <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Confirmed</div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-sm">Sarah Kim</div>
                            <div className="text-xs text-gray-500">4:30 PM - Passion Twists</div>
                          </div>
                          <div className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">Pending</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom nav */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3">
                      <div className="flex justify-around">
                        <div className="w-6 h-6 bg-purple-500 rounded"></div>
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -top-4 -right-4 bg-white shadow-lg p-3 rounded-lg" style={{ border: '1px solid var(--border-color)' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium">New Booking!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
