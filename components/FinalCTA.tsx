import Link from 'next/link'

export default function FinalCTA() {
  return (
    <section className="py-32" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8" style={{ color: 'var(--text-dark)' }}>
            Pricing built to suit all
            <br />
            types of business
          </h2>
          
          <p className="text-xl max-w-3xl mx-auto mb-16" style={{ color: 'var(--foreground)' }}>
            Freelancers who are starting to use templates and need to scale
            their business in the next stages.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan */}
            <div 
              className="bg-white p-8 shadow-lg relative"
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '25px'
              }}
            >
              <div className="text-left">
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>Pro Plan</h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold" style={{ color: 'var(--text-dark)' }}>$79</span>
                  <span className="text-lg ml-2" style={{ color: 'var(--foreground)' }}>per month</span>
                </div>
                
                <Link 
                  href="/sign-up"
                  className="w-full inline-block text-center py-3 px-6 mb-8 font-bold transition-all"
                  style={{
                    backgroundColor: 'var(--text-dark)',
                    color: 'white',
                    borderRadius: '25px',
                    textDecoration: 'none'
                  }}
                >
                  Get started
                </Link>
                
                <ul className="space-y-3 text-left">
                  <li style={{ color: 'var(--foreground)' }}>✓ Everything you get in Starter</li>
                  <li style={{ color: 'var(--foreground)' }}>✓ Custom reports</li>
                  <li style={{ color: 'var(--foreground)' }}>✓ Priority email & chat support</li>
                </ul>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div 
              className="bg-white p-8 shadow-lg relative"
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '25px'
              }}
            >
              <div className="text-left">
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--foreground)' }}>Enterprise Plan</h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold" style={{ color: 'var(--text-dark)' }}>$199</span>
                  <span className="text-lg ml-2" style={{ color: 'var(--foreground)' }}>per month</span>
                </div>
                
                <Link 
                  href="/contact"
                  className="w-full inline-block text-center py-3 px-6 mb-8 font-bold transition-all"
                  style={{
                    backgroundColor: 'white',
                    color: 'var(--text-dark)',
                    borderRadius: '25px',
                    border: '1px solid var(--border-color)',
                    textDecoration: 'none'
                  }}
                >
                  Get started
                </Link>
                
                <ul className="space-y-3 text-left">
                  <li style={{ color: 'var(--foreground)' }}>• Features</li>
                  <li style={{ color: 'var(--foreground)' }}>• Access to All Content Guest</li>
                  <li style={{ color: 'var(--foreground)' }}>• Custom Service</li>
                  <li style={{ color: 'var(--foreground)' }}>• Integrated with OMRocks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
