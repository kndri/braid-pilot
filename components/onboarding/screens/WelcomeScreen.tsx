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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Your Pricing Setup
        </h2>
        <p className="text-gray-600">
          Let's create your personalized pricing structure for {data.salonName}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            How This Works
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-orange-600 font-semibold text-sm">1</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-700 font-medium">Select Your Styles</p>
                <p className="text-gray-600 text-sm">Choose the braiding styles you offer</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-orange-600 font-semibold text-sm">2</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-700 font-medium">Set Base Prices</p>
                <p className="text-gray-600 text-sm">Define your starting price for each style (Jumbo/Shoulder-Length)</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-orange-600 font-semibold text-sm">3</span>
              </div>
              <div className="ml-3">
                <p className="text-gray-700 font-medium">Configure Adjustments</p>
                <p className="text-gray-600 text-sm">Add price adjustments for different sizes and lengths</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
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
            What's your standard hair type?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This will be your base pricing reference. You can add adjustments for other hair types later.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hairTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleHairTypeChange(type.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  data.standardHairType === type.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
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
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}