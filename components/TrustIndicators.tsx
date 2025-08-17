'use client'

export default function TrustIndicators() {
  const companies = [
    { name: 'Natural Hair Studio', type: 'Premium' },
    { name: 'Afro Beauty Lounge', type: 'Enterprise' },
    { name: 'Braids & Beyond', type: 'Premium' },
    { name: 'Crown Hair Salon', type: 'Enterprise' },
    { name: 'Urban Roots', type: 'Premium' },
    { name: 'Knotless Beauty Bar', type: 'Enterprise' }
  ]

  return (
    <section className="py-16 px-6 lg:px-12 border-y" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Trusted by top salons</p>
          <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-dark)' }}>
            Join 500+ salons transforming their business
          </h3>
        </div>

        {/* Company logos grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {companies.map((company, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className="mb-2 transition-transform group-hover:scale-105">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {company.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">{company.name}</div>
              <div className="text-xs text-gray-500">{company.type}</div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-12 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">98%</div>
            <div className="text-sm text-gray-600">Client Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">500+</div>
            <div className="text-sm text-gray-600">Active Salons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600 mb-1">50K+</div>
            <div className="text-sm text-gray-600">Bookings Processed</div>
          </div>
        </div>
      </div>
    </section>
  )
}