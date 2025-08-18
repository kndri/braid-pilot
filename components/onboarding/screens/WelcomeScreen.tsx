"use client";

import { WizardData } from "../OnboardingWizard";

interface WelcomeScreenProps {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
}

const hairTypes = [
  { value: "Synthetic", label: "Synthetic Hair", description: "Most affordable option" },
  { value: "100% Human Hair", label: "100% Human Hair", description: "Natural look and feel" },
  { value: "Virgin Hair", label: "Virgin Hair", description: "Premium unprocessed hair" },
  { value: "Treated Hair", label: "Treated Hair", description: "Chemically processed hair" },
];

export default function WelcomeScreen({ data, onNext }: WelcomeScreenProps) {
  const handleContinue = () => {
    onNext({});
  };

  const handleHairTypeChange = (hairType: string) => {
    onNext({ standardHairType: hairType });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 lg:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Welcome to Your Pricing Setup
        </h2>
        <p className="text-sm sm:text-base text-gray-600 px-4 sm:px-0">
          Let&apos;s create your personalized pricing structure for {data.salonName}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            How This Works
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-orange-600 font-semibold text-sm">1</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-700 font-medium">Select Your Styles</p>
                <p className="text-gray-600 text-sm">Choose the braiding styles you offer</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-orange-600 font-semibold text-sm">2</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-700 font-medium">Set Base Prices</p>
                <p className="text-gray-600 text-sm">Define your starting price for each style (Jumbo/Shoulder-Length)</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-orange-600 font-semibold text-sm">3</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-700 font-medium">Configure Adjustments</p>
                <p className="text-gray-600 text-sm">Add price adjustments for different sizes and lengths</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-orange-600 font-semibold text-sm">4</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-700 font-medium">Get Your Quote Tool</p>
                <p className="text-gray-600 text-sm">Receive a unique URL for instant client quotes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            What&apos;s your standard hair type?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This will be your base pricing reference. You can add adjustments for other hair types later.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hairTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleHairTypeChange(type.value)}
                className={`p-3 rounded-md border transition-all text-left ${
                  data.standardHairType === type.value
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          className="px-5 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium text-sm"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}