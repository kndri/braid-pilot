'use client'

import Link from 'next/link'

export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for individual braiders just starting out',
      features: [
        'Up to 50 bookings/month',
        'Basic analytics dashboard',
        'Client management',
        'SMS reminders',
        'Online booking page',
        'Payment processing'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'For established salons ready to scale',
      features: [
        'Unlimited bookings',
        'Advanced analytics & insights',
        'Team management (up to 5)',
        'Automated marketing',
        'Custom branding',
        'Priority support',
        'Inventory tracking'
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For multi-location salons with complex needs',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Multi-location support',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom training'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ]

  return (
    <section className="py-20 px-6 lg:px-12" style={{ backgroundColor: '#f9fafb' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
            Our affordable pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Forget complex project management tools. Start with a free trial, no credit card required.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl p-8 ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl transform scale-105' 
                  : 'bg-white shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-purple-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`ml-2 ${plan.highlighted ? 'text-purple-100' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg 
                      className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                        plan.highlighted ? 'text-purple-200' : 'text-green-500'
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link 
                href="/onboarding"
                className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-white text-purple-600 hover:bg-gray-100'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>30-day money-back guarantee</span>
            <span className="text-gray-400">•</span>
            <span>No setup fees</span>
            <span className="text-gray-400">•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}