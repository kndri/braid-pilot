import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-orange-500 rounded"></div>
              <span className="text-2xl font-semibold text-gray-900">braidpilot</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Start Your Free Trial
            </h1>
            <p className="text-gray-600">
              Join hundreds of braiders who are working smarter
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form className="space-y-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="e.g., Kei's Braids"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="e.g., Keisha Johnson"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Create Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  className="mt-1 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-orange-500 hover:text-orange-600">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-orange-500 hover:text-orange-600">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Your Free 30-Day Trial
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing up, you&apos;ll get access to all features for 30 days.
              <br />
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}