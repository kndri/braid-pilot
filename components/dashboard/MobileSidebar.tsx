'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCheck,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  Settings,
  HelpCircle,
  Scissors,
  Star,
  Phone,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEATURE_FLAGS } from '@/lib/featureFlags'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
  { name: 'Bookings', href: '/dashboard/bookings', icon: ShoppingCart, enabled: true },
  { name: 'Braiders', href: '/dashboard/braiders', icon: Scissors, enabled: true },
  { name: 'Clients', href: '/dashboard/clients', icon: Users, enabled: true },
  { name: 'Virtual Receptionist', href: '/dashboard/virtual-receptionist', icon: Phone, enabled: FEATURE_FLAGS.VIRTUAL_RECEPTIONIST },
  { name: 'Reputation', href: '/dashboard/reputation', icon: Star, enabled: FEATURE_FLAGS.REPUTATION_MANAGEMENT },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard, enabled: true },
]

const navigation = navigationItems.filter(item => item.enabled)

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help Center', href: '/dashboard/help', icon: HelpCircle },
]

interface MobileSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function MobileSidebar({ isOpen, setIsOpen }: MobileSidebarProps) {
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center justify-start px-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-gray-900">braidpilot</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 mb-1 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    isActive ? 'bg-purple-100' : 'bg-transparent'
                  )}>
                    <item.icon 
                      className={cn(
                        'h-5 w-5',
                        isActive ? 'text-purple-700' : 'text-gray-400'
                      )}
                    />
                  </div>
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 px-2 py-4">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 mb-1 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    isActive ? 'bg-purple-100' : 'bg-transparent'
                  )}>
                    <item.icon 
                      className={cn(
                        'h-5 w-5',
                        isActive ? 'text-purple-700' : 'text-gray-400'
                      )}
                    />
                  </div>
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}