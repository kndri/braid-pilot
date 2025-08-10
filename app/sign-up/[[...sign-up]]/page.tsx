import { SignUp } from "@clerk/nextjs"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-orange-500 rounded"></div>
          <span className="text-2xl font-semibold text-gray-900">braidpilot</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Your Free Trial</h1>
        <p className="text-gray-600">Join hundreds of braiders who are working smarter</p>
      </div>
      
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border-0",
          }
        }}
        afterSignUpUrl="/onboarding"
        signInUrl="/sign-in"
      />
      
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 max-w-sm">
          By signing up, you&apos;ll get access to all features for 30 days.
          No credit card required. Cancel anytime.
        </p>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-orange-500 hover:text-orange-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}