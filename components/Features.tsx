export default function Features() {
  const features = [
    {
      title: "Price My Style",
      description: "Get an instant, shareable price list. Set your prices once, share everywhere.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-yellow-100 text-yellow-600",
      features: [
        "Custom pricing for each style",
        "Instant quote calculator",
        "Shareable price links"
      ]
    },
    {
      title: "Booking Pro",
      description: "Accept bookings and payments, effortlessly. No more back-and-forth messages.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-blue-100 text-blue-600",
      features: [
        "24/7 online booking",
        "Automatic confirmations",
        "Deposit collection"
      ]
    },
    {
      title: "Client CRM & Marketing",
      description: "Grow your business with smart client tools. Keep clients coming back.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "bg-green-100 text-green-600",
      features: [
        "Client history tracking",
        "Automated reminders",
        "Loyalty rewards"
      ]
    }
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Braid Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From pricing to payments, we&apos;ve got you covered with tools designed specifically for braiders.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {feature.description}
              </p>
              
              <ul className="space-y-3">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of braiders who are saving 10+ hours per week
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">500+</div>
              <div className="text-gray-600 mt-1">Active Braiders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">10K+</div>
              <div className="text-gray-600 mt-1">Bookings Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">$2M+</div>
              <div className="text-gray-600 mt-1">Payments Handled</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}