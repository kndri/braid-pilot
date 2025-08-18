"use client";
import { WizardData } from "../OnboardingWizard";
import { useRouter } from "next/navigation";

interface Props {
  data: WizardData;
}

export default function SuccessScreen({ }: Props) {
  const router = useRouter();
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-semibold text-gray-900 mb-4">Setup Complete!</h2>
      <p className="text-gray-600 mb-8">Your pricing configuration has been saved successfully.</p>
      
      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <p className="text-sm text-gray-600 mb-2">Your unique quote tool URL:</p>
        <p className="font-mono text-lg text-gray-900">braidpilot.com/quote/abc123</p>
      </div>
      
      <button 
        onClick={() => router.push("/dashboard")}
        className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
