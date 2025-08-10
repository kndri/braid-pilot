export default function Testimonials() {
  const testimonials = [
    {
      quote: "I went from spending 3 hours a day on DMs to just 30 minutes. Braid Pilot literally gave me my life back!",
      author: "Keisha M.",
      role: "Owner, Kei's Braids",
      location: "Atlanta, GA",
      initials: "KM",
      color: "bg-purple-500"
    },
    {
      quote: "My clients love being able to see prices upfront and book instantly. No more awkward price negotiations!",
      author: "Jasmine T.",
      role: "Braider",
      location: "Houston, TX",
      initials: "JT",
      color: "bg-pink-500"
    },
    {
      quote: "The deposit feature alone saved me from so many no-shows. This platform pays for itself!",
      author: "Destiny W.",
      role: "Owner, Braids by Dee",
      location: "Chicago, IL",
      initials: "DW",
      color: "bg-blue-500"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Don&apos;t Just Take Our Word For It
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from braiders who&apos;ve transformed their business with Braid Pilot
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-2xl p-8 relative"
            >
              <div className="absolute -top-2 left-8">
                <svg className="w-8 h-8 text-orange-400 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              
              <blockquote className="relative">
                <p className="text-gray-700 mb-6 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {testimonial.initials}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </blockquote>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="mt-2 text-gray-600">
            4.9 out of 5 stars from 500+ braiders
          </p>
        </div>
      </div>
    </section>
  )
}