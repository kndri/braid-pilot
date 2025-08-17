'use client'

export default function MonitoringFeatures() {
  return (
    <section className="py-20 px-6 lg:px-12" style={{ backgroundColor: '#f9fafb' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
            Monitor your salon from everywhere
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access salon insights and activities from any device, at any time.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Feature Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                    All your salon activity from your phone
                  </h3>
                  <p className="text-gray-600">
                    Monitor your salon for critical updates. Track bookings, revenue, and staff performance in real-time.
                  </p>
                  <button className="mt-3 text-purple-600 font-medium text-sm hover:text-purple-700 transition-colors">
                    Learn More →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                    Blazing fast speed with hundreds of servers world-wide
                  </h3>
                  <p className="text-gray-600">
                    Manage your salon from anywhere with servers positioned strategically around the globe for optimal performance.
                  </p>
                  <button className="mt-3 text-cyan-600 font-medium text-sm hover:text-cyan-700 transition-colors">
                    Learn More →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Map Visualization */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 relative overflow-hidden">
              {/* World map representation */}
              <svg viewBox="0 0 800 400" className="w-full h-auto opacity-30">
                <g fill="#94a3b8">
                  {/* Simplified world map shapes */}
                  <ellipse cx="200" cy="150" rx="80" ry="60" />
                  <ellipse cx="400" cy="180" rx="120" ry="80" />
                  <ellipse cx="600" cy="160" rx="100" ry="70" />
                  <ellipse cx="250" cy="280" rx="70" ry="50" />
                  <ellipse cx="550" cy="290" rx="90" ry="60" />
                </g>
              </svg>
              
              {/* Location pins */}
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-1/3 right-1/3 transform translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>

              {/* Overlay text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-800 mb-2">24/7</div>
                  <div className="text-lg text-gray-600">Global Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}