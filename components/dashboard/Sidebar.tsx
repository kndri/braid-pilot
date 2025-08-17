'use client'

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
  Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/dashboard/bookings', icon: ShoppingCart },
  { name: 'Braiders', href: '/dashboard/braiders', icon: Scissors },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Capacity', href: '/dashboard/capacity', icon: UserCheck },
  { name: 'Virtual Receptionist', href: '/dashboard/virtual-receptionist', icon: Phone },
  { name: 'Reputation', href: '/dashboard/reputation', icon: Star },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
]

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help Center', href: '/dashboard/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center justify-start px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/braidpilot-logo.svg" alt="Braid Pilot" width={140} height={32} />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon 
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 px-3 py-4">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon 
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}