'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calendar, DollarSign, Users, Zap, CheckCircle } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">braidpilot</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Pricing
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                About
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <Link 
                  href="/dashboard"
                  className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/sign-in"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/sign-up"
                    className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-2">
              Braider's Business in a Box.
            </h1>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-8">
              Everything you need, in one app.
            </h2>
          </div>

          {/* Dashboard Screenshot */}
          <div className="relative rounded-lg border border-gray-200 bg-gray-50 overflow-hidden" style={{ aspectRatio: '16/10' }}>
            <Image
              src="/dashboard-preview.png"
              alt="Braid Pilot dashboard overview"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover md:object-contain"
            />
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8 leading-tight">
            In a world of endless DMs and interrupted appointments, the answer isn't more tools—it's the right one.
          </h3>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Braid Pilot unifies communication, client insights, and booking automation into a single, powerful platform designed specifically for braiders. Automate what slows you down, focus on what moves you forward, and braid without limits.
          </p>
          <p className="text-2xl font-medium text-gray-900">
            Welcome to <span className="text-gray-500">business reimagined.</span>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-2xl font-semibold text-gray-900 mb-12">Core Features</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Price My Style */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Price My Style</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Get a custom, shareable link that generates an exact price quote for your clients, instantly. No more back-and-forth about pricing.
              </p>
            </div>

            {/* Booking Pro */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Booking Pro</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Manage your entire calendar in one place. Clients can book and pay for appointments directly, and you get notified instantly.
              </p>
            </div>

            {/* Braider Management */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Braider Management</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Easily manage your team. See what your braiders have completed, track their earnings, and handle payouts all from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Features */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-blue-600 flex items-center justify-center text-xs font-bold">F</span>
                Features
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Price My Style</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Booking Pro</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Team Management</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Analytics</Link></li>
              </ul>
            </div>

            {/* Grow */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded text-green-600 flex items-center justify-center text-xs font-bold">G</span>
                Grow
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Marketing</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Sales</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Reviews</Link></li>
              </ul>
            </div>

            {/* Manage */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 rounded text-purple-600 flex items-center justify-center text-xs font-bold">M</span>
                Manage
              </h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Support</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Payments</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Reports</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">About</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Blog</Link></li>
                <li><Link href="#" className="text-gray-500 hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Braid Pilot</p>
                  <p className="text-xs text-gray-500">The all-in-one platform for your braiding business.</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                © 2025 Braid Pilot. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}