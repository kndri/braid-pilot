"use client";

import { useState } from "react";
import { WizardData } from "../OnboardingWizard";

interface StyleSelectionScreenProps {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

const popularStyles = [
  "Box Braids",
  "Knotless Braids",
  "Boho Knotless",
  "Goddess Braids",
  "Fulani Braids",
  "Micro Braids",
  "Senegalese Twists",
  "Marley Twists",
  "Havana Twists",
  "Faux Locs",
  "Soft Locs",
  "Butterfly Locs",
  "Passion Twists",
  "Spring Twists",
  "Cornrows",
  "Feed-in Braids",
  "Lemonade Braids",
  "Tribal Braids",
  "Ghana Braids",
  "Tree Braids",
];

export default function StyleSelectionScreen({ data, onNext, onBack }: StyleSelectionScreenProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    data.selectedStyles.map(s => s.name)
  );
  const [customStyle, setCustomStyle] = useState("");
  const [customStyles, setCustomStyles] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const addCustomStyle = () => {
    if (customStyle.trim() && !customStyles.includes(customStyle.trim())) {
      const trimmedStyle = customStyle.trim();
      setCustomStyles([...customStyles, trimmedStyle]);
      setSelectedStyles([...selectedStyles, trimmedStyle]);
      setCustomStyle("");
    }
  };

  const removeCustomStyle = (style: string) => {
    setCustomStyles(customStyles.filter(s => s !== style));
    setSelectedStyles(selectedStyles.filter(s => s !== style));
  };

  const handleContinue = () => {
    const allStyles = [
      ...selectedStyles.filter(s => popularStyles.includes(s)).map(name => ({ name, isCustom: false })),
      ...selectedStyles.filter(s => customStyles.includes(s)).map(name => ({ name, isCustom: true })),
    ];

    // Initialize pricing structure for each style
    interface StylePricing {
      basePrice: number;
      lengthAdjustments: Record<string, number>;
      sizeAdjustments: Record<string, number>;
      curlyHairAdjustment?: {
        included: boolean;
        costPerPack: number;
      };
    }
    const stylePricing: Record<string, StylePricing> = {};
    allStyles.forEach(style => {
      stylePricing[style.name] = {
        basePrice: 0,
        lengthAdjustments: {
          "Bra-Length": 0,
          "Mid-Back": 0,
          "Waist-Length": 0,
        },
        sizeAdjustments: {
          "Small": 0,
          "Medium": 0,
          "Large": 0,
          "XL": 0,
        },
      };
      
      // Add curly hair adjustment for Boho Knotless
      if (style.name === "Boho Knotless") {
        stylePricing[style.name].curlyHairAdjustment = {
          included: false,
          costPerPack: 0,
        };
      }
    });

    onNext({
      selectedStyles: allStyles,
      stylePricing,
    });
  };

  const totalSelected = selectedStyles.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Select Your Braiding Styles
        </h2>
        <p className="text-gray-600">
          Choose all the styles you offer. You&apos;ll set individual prices for each style.
        </p>
        {totalSelected > 0 && (
          <div className="mt-2 text-sm text-orange-600 font-medium">
            {totalSelected} style{totalSelected !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Popular Styles */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Styles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularStyles.map((style) => (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedStyles.includes(style)
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{style}</span>
                  {selectedStyles.includes(style) && (
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {style === "Boho Knotless" && (
                  <div className="text-xs text-gray-500 mt-1">Includes curly hair options</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Styles */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Styles</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomStyle()}
              placeholder="Enter custom style name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={addCustomStyle}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Add
            </button>
          </div>
          
          {customStyles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customStyles.map((style) => (
                <div
                  key={style}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700"
                >
                  <span>{style}</span>
                  <button
                    onClick={() => removeCustomStyle(style)}
                    className="ml-2 text-orange-500 hover:text-orange-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={totalSelected === 0}
          className={`px-6 py-3 rounded-lg transition-colors font-medium ${
            totalSelected > 0
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue ({totalSelected} selected)
        </button>
      </div>
    </div>
  );
}