export default function PowerfulFeatures() {
  return (
    <section className="py-16" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Features List */}
          <div>
            <h2 className="text-4xl font-bold mb-12" style={{ color: 'var(--text-dark)' }}>
              Powerful Features for
              <br />
              Smarter Management
            </h2>
            
            <div className="space-y-12">
              <div className="flex space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--blue-pastel)' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                    Client & Customer Profiles
                  </h3>
                  <p style={{ color: 'var(--foreground)' }}>
                    Maintain detailed client profiles with booking history, preferences, and contact information all in one place.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--green-pastel)' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                    API Integration
                  </h3>
                  <p style={{ color: 'var(--foreground)' }}>
                    Seamlessly connect with your existing tools and payment processors for a unified workflow.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--pink-pastel)' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
                    Custom Reports
                  </h3>
                  <p style={{ color: 'var(--foreground)' }}>
                    Generate detailed reports on bookings, revenue, and client trends to make informed business decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Dashboard Widgets */}
          <div className="space-y-6">
            
            {/* Secure payments system card */}
            <div 
              className="bg-white p-6 shadow-lg"
              style={{
                borderRadius: '25px',
                border: '1px solid var(--border-color)'
              }}
            >
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>
                Secure payments system
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-dark)' }}>250</div>
                  <div className="text-xs" style={{ color: 'var(--foreground)' }}>Total amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-dark)' }}>235</div>
                  <div className="text-xs" style={{ color: 'var(--foreground)' }}>Paid this Period</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-dark)' }}>135</div>
                  <div className="text-xs" style={{ color: 'var(--foreground)' }}>Outstanding fees</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>$15,235.9</div>
              </div>
            </div>
            
            {/* Bank transfers card */}
            <div 
              className="bg-white p-6 shadow-lg"
              style={{
                borderRadius: '25px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                  Bank transfers
                </h3>
                <div 
                  className="px-3 py-1 text-xs rounded-full"
                  style={{ 
                    backgroundColor: 'var(--green-pastel)',
                    color: 'white'
                  }}
                >
                  +$24k
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--foreground)' }}>
                Automate your payments and never worry about late fees or making money.
              </p>
            </div>
            
            {/* Transaction History card */}
            <div 
              className="bg-white p-6 shadow-lg"
              style={{
                borderRadius: '25px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                  Transaction History
                </h3>
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                  Invoice page
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--blue-pastel)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>Property</span>
                  </div>
                  <span className="text-sm font-semibold">$3,452</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--green-pastel)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>Owners</span>
                  </div>
                  <span className="text-sm font-semibold">$4,562</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--pink-pastel)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>Customer</span>
                  </div>
                  <span className="text-sm font-semibold">$754</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}
