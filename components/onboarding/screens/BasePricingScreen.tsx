"use client";

import { useState } from "react";
import { WizardData } from "../OnboardingWizard";

interface BasePricingScreenProps {
  data: WizardData;
  styleName: string;
  styleIndex: number;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export default function BasePricingScreen({ 
  data, 
  styleName, 
  styleIndex, 
  onNext, 
  onBack 
}: BasePricingScreenProps) {
  const [basePrice, setBasePrice] = useState<number | "">(
    data.stylePricing[styleName]?.basePrice || ""
  );

  const handleContinue = () => {
    const updatedPricing = {
      ...data.stylePricing,
      [styleName]: {
        ...data.stylePricing[styleName],
        basePrice: basePrice === "" ? 0 : basePrice,
      },
    };

    onNext({
      stylePricing: updatedPricing,
    });
  };

  const suggestedPrices = {
    "Box Braids": 150,
    "Knotless Braids": 180,
    "Boho Knotless": 200,
    "Goddess Braids": 160,
    "Fulani Braids": 170,
    "Micro Braids": 250,
    "Senegalese Twists": 140,
    "Marley Twists": 130,
    "Havana Twists": 150,
    "Faux Locs": 180,
    "Soft Locs": 200,
    "Butterfly Locs": 220,
    "Passion Twists": 160,
    "Spring Twists": 140,
    "Cornrows": 80,
    "Feed-in Braids": 100,
    "Lemonade Braids": 120,
    "Tribal Braids": 180,
    "Ghana Braids": 150,
    "Tree Braids": 200,
  };

  const suggested = suggestedPrices[styleName as keyof typeof suggestedPrices];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 font-semibold">{styleIndex + 1}</span>
          </div>
          <h2 className="text-3xl font-semibold text-gray-900">{styleName}</h2>
        </div>
        <p className="text-gray-600">
          Set your base price for <strong>Jumbo size at Shoulder-Length</strong>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          This is your starting price. All other sizes and lengths will be calculated as additions to this base.
        </p>
      </div>

      <div className="space-y-6">
        {/* Visual Guide */}
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Base Configuration:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="text-sm text-gray-600">Size</div>
              <div className="font-semibold text-gray-900">Jumbo</div>
              <div className="text-xs text-gray-500">Largest braid size</div>
            </div>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="text-sm text-gray-600">Length</div>
              <div className="font-semibold text-gray-900">Shoulder-Length</div>
              <div className="text-xs text-gray-500">Shortest option</div>
            </div>
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Base Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">
              $
            </span>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full pl-10 pr-4 py-4 text-2xl text-black font-semibold border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
              placeholder="0"
            />
          </div>
          {suggested && (
            <button
              onClick={() => setBasePrice(suggested)}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Use suggested price: ${suggested}
            </button>
          )}
        </div>

        {/* Hair Type Reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="text-blue-900 font-medium">Remember:</p>
              <p className="text-blue-700">
                This price is for {data.standardHairType} hair. You&apos;ll add adjustments for other hair types later.
              </p>
            </div>
          </div>
        </div>

        {/* Price Preview */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Preview Pricing Structure:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Jumbo + Shoulder (Base):</span>
              <span className="font-semibold">${basePrice === "" ? 0 : basePrice}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Medium + Shoulder:</span>
              <span>${basePrice === "" ? 0 : basePrice} + adjustment</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Small + Waist:</span>
              <span>${basePrice === "" ? 0 : basePrice} + adjustments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors font-medium"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={basePrice === "" || basePrice <= 0}
          className={`px-6 py-3 rounded-md transition-colors font-medium ${
            basePrice !== "" && basePrice > 0
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}