export default function Features() {
  const features = [
    {
      number: "01",
      title: "Braiding Management",
      description: "Manage client bookings, style preferences, and appointment scheduling.",
    },
    {
      number: "02",
      title: "Secure Data Storage",
      description: "Implement role-based permissions and two-factor authentication.",
    },
    {
      number: "03",
      title: "Customizable",
      description: "Access pricing tools securely with blockchain, ensuring authenticity.",
    }
  ]

  return (
    <section className="py-20" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Title and Features */}
          <div>
            <h2 className="text-5xl font-bold mb-16" style={{ color: 'var(--text-dark)' }}>
              Stay one step ahead
              <br />
              with Braid Pilot
            </h2>
            
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex space-x-6">
                  <div 
                    className="text-4xl font-bold flex-shrink-0" 
                    style={{ 
                      fontFamily: 'monospace',
                      color: 'var(--text-dark)',
                      width: '60px'
                    }}
                  >
                    {feature.number}
                  </div>
                  <div>
                    <h3 
                      className="text-xl font-bold mb-2" 
                      style={{ color: 'var(--text-dark)' }}
                    >
                      {feature.title}
                    </h3>
                    <p style={{ color: 'var(--foreground)' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Dashboard/Chart Preview */}
          <div className="flex justify-center">
            <div 
              className="bg-white p-8 shadow-lg w-full max-w-md"
              style={{
                borderRadius: '25px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>Booking Analytics</h3>
                <div className="text-sm" style={{ color: 'var(--foreground)' }}>📊</div>
              </div>
              
              {/* Chart visualization */}
              <div className="mb-6">
                <div className="flex items-end space-x-3 h-32">
                  <div className="w-8 bg-orange-200 h-1/4 rounded-t flex items-end justify-center pb-1">
                    <div className="text-xs">Jan</div>
                  </div>
                  <div className="w-8 bg-orange-300 h-2/4 rounded-t flex items-end justify-center pb-1">
                    <div className="text-xs">Feb</div>
                  </div>
                  <div className="w-8 bg-orange-400 h-3/4 rounded-t flex items-end justify-center pb-1">
                    <div className="text-xs">Mar</div>
                  </div>
                  <div className="w-8 bg-orange-500 h-full rounded-t flex items-end justify-center pb-1">
                    <div className="text-xs text-white">Apr</div>
                  </div>
                  <div className="w-8 bg-orange-400 h-4/5 rounded-t flex items-end justify-center pb-1">
                    <div className="text-xs">May</div>
                  </div>
                  <div className="w-8 bg-orange-300 h-3/5 rounded-t flex items-end justify-center pb-1">
                    <div className="text-xs">Jun</div>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>$45</div>
                  <div className="text-sm" style={{ color: 'var(--foreground)' }}>Income</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>$48</div>
                  <div className="text-sm" style={{ color: 'var(--foreground)' }}>Outcome</div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <div className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>Booking</div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* What They Say Section */}
        <div className="mt-32 text-center">
          <h3 
            className="text-4xl font-bold mb-8" 
            style={{ color: 'var(--text-dark)' }}
          >
            What They Say
          </h3>
          <p 
            className="text-lg max-w-4xl mx-auto leading-relaxed" 
            style={{ color: 'var(--foreground)' }}
          >
            This braiding management dashboard has been a game-changer for my business. Managing appointments is now effortless, with all the tools I need in one place. The analytics and reporting features have given me better insights, and the support team is always quick to help. I couldn&apos;t imagine running my salon without it.
          </p>
        </div>
      </div>
    </section>
  )
}
