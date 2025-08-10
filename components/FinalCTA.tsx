import Link from 'next/link'

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Take Your Braid Business to the Next Level?
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Join hundreds of braiders who are working smarter, not harder. 
            Get started in minutes, no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/signup"
              className="inline-block bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl"
            >
              Start Your Free Trial
            </Link>
            <Link 
              href="/demo"
              className="inline-block bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors border-2 border-white"
            >
              Watch Demo (2 min)
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free for 30 days
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}