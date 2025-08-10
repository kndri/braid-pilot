import { SignIn } from "@clerk/nextjs"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-orange-500 rounded"></div>
          <span className="text-2xl font-semibold text-gray-900">braidpilot</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to manage your salon</p>
      </div>
      
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border-0",
          }
        }}
        afterSignInUrl="/dashboard"
        signUpUrl="/sign-up"
      />
      
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-orange-500 hover:text-orange-600 font-medium">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}