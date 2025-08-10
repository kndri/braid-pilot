'use client'

import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || '')

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#f97316',
          colorBackground: '#ffffff',
          colorText: '#171717',
          colorTextSecondary: '#6b7280',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 
            'bg-orange-500 hover:bg-orange-600 text-white transition-colors',
          card: 'shadow-xl',
          headerTitle: 'text-2xl font-bold',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 
            'border-gray-200 hover:bg-gray-50 transition-colors',
          formFieldInput:
            'border-gray-300 focus:border-orange-500 focus:ring-orange-500',
          footerActionLink: 'text-orange-500 hover:text-orange-600',
        }
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}