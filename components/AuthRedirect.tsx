"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AuthRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const onboardingStatus = useQuery(api.users.checkOnboardingStatus);

  useEffect(() => {
    if (isLoaded && user && onboardingStatus !== undefined) {
      // User is authenticated, check where to redirect
      if (onboardingStatus?.onboardingComplete) {
        // Onboarding complete, go to dashboard
        router.replace("/dashboard");
      } else {
        // Onboarding not complete, go to onboarding
        router.replace("/onboarding");
      }
    }
  }, [isLoaded, user, onboardingStatus, router]);

  // Show loading while checking auth status
  if (!isLoaded || (user && onboardingStatus === undefined)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null (parent will show the auth form)
  return null;
}