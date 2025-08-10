'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    setIsAnimated(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
            <span className="block">Stop Answering DMs.</span>
            <span className="block text-orange-500 mt-2">Start Booking.</span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Our tools handle pricing, booking, and payments, so you can focus on braiding. 
            Join hundreds of braiders who&apos;ve streamlined their business.
          </p>
          
          <div className={`mt-10 mb-10 flex justify-center transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  99+
                </div>
              </div>
              
              <div className="flex items-center">
                <svg className="w-8 h-8 text-gray-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-block bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started for Free
            </Link>
            <Link 
              href="#features"
              className="inline-block bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
            >
              See How It Works
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            No credit card required • Setup in 5 minutes • Cancel anytime
          </p>
        </div>
      </div>
      
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </section>
  )
}