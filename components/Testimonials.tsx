'use client'

export default function Testimonials() {
  const testimonials = [
    {
      name: "Vanessa T.",
      role: "Operations Manager",
      salon: "Crown Beauty Salon",
      content: "Braid Pilot transformed our business. We've reduced booking management time by 75% and our revenue has increased by 40%. The platform's ease of use means our team adopted it instantly.",
      avatar: "VT",
      rating: 5
    },
    {
      name: "John D.",
      role: "Marketing Lead", 
      salon: "Natural Hair Studio",
      content: "Our team loves how Braid Pilot simplifies everything. The booking system is flawless and client satisfaction is at an all-time high. It's like having an entire admin team in one platform.",
      avatar: "JD",
      rating: 5
    },
    {
      name: "Keisha M.",
      role: "Operations Manager",
      salon: "Braids & Beyond",
      content: "The analytics dashboard gave us insights we never had before. We can now predict busy periods, optimize pricing, and our stylists love the automated scheduling. Game changer!",
      avatar: "KM",
      rating: 5
    }
  ]

  return (
    <section className="py-20 px-6 lg:px-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
            Real feedback from salon owners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Forget complex project management tools. Braid Pilot is built specifically for hair salons.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Rating Stars */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-xs text-gray-400">{testimonial.salon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Testimonial Section */}
        <div className="mt-16 bg-gradient-to-br from-purple-50 to-cyan-50 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
                See what salon owners are saying
              </h3>
              <p className="text-gray-600 mb-6">
                Join hundreds of salon owners who&apos;ve transformed their business with Braid Pilot. Watch their success stories.
              </p>
              <button className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Watch Success Stories</span>
              </button>
            </div>
            
            {/* Video Preview */}
            <div className="relative">
              <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20"></div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                  <div>
                    <div className="text-xs font-semibold">2.5K+ Views</div>
                    <div className="text-xs text-gray-500">This month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}