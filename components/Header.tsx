'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/braidpilot-logo.svg"
              alt="Braid Pilot"
              width={140}
              height={32}
              priority
            />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/pricing" className="text-gray-800 hover:text-black transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/features" className="text-gray-800 hover:text-black transition-colors font-medium">
              Features
            </Link>
            <Link href="/contact" className="text-gray-800 hover:text-black transition-colors font-medium">
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="hidden md:inline-block btn"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-dark)',
                border: '2px solid var(--text-dark)',
                borderRadius: '25px',
                padding: '10px 24px',
                fontWeight: 'bold',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Log In
            </Link>
            <Link 
              href="/sign-up" 
              className="hidden md:inline-block btn"
              style={{
                backgroundColor: 'var(--text-dark)',
                color: 'white',
                borderRadius: '25px',
                padding: '12px 24px',
                fontWeight: 'bold',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Get Started for Free
            </Link>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-6 space-y-3 bg-white" style={{ borderTop: '1px solid var(--border-color)' }}>
            <Link
              href="/pricing"
              className="block px-4 py-3 rounded-3xl text-base font-medium text-gray-800 hover:text-black transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/features"
              className="block px-4 py-3 rounded-3xl text-base font-medium text-gray-800 hover:text-black transition-colors"
            >
              Features
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-3 rounded-3xl text-base font-medium text-gray-800 hover:text-black transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/dashboard"
              className="block px-4 py-3 rounded-3xl text-base font-bold transition-all"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-dark)',
                border: '2px solid var(--text-dark)',
                textAlign: 'center',
                marginTop: '1rem'
              }}
            >
              Log In
            </Link>
            <Link
              href="/sign-up"
              className="block px-4 py-3 rounded-3xl text-base font-bold text-white transition-all"
              style={{
                backgroundColor: 'var(--text-dark)',
                textAlign: 'center',
                marginTop: '0.5rem'
              }}
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}