"use client";
import { useState } from "react";
import { WizardData, HairTypeAdjustments } from "../OnboardingWizard";

interface Props {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

type HairTypeState = {
  [key: string]: number | "";
};

// All available hair types
const allHairTypes = [
  { name: "Synthetic", description: "Most affordable option" },
  { name: "100% Human Hair", description: "Premium quality hair" },
  { name: "Virgin Hair", description: "Unprocessed natural hair" },
  { name: "Treated Hair", description: "Chemically processed hair" },
];

export default function GlobalAdjustmentsScreen({ data, onNext, onBack }: Props) {
  // Filter out the selected standard hair type - it's always $0 as the base
  const adjustableHairTypes = allHairTypes.filter(
    type => type.name !== data.standardHairType
  );

  // Initialize state only for non-base hair types
  const initialState: HairTypeState = {};
  adjustableHairTypes.forEach(type => {
    initialState[type.name] = data.globalHairTypeAdjustments?.[type.name as keyof HairTypeAdjustments] || "";
  });

  const [hairTypeAdjustments, setHairTypeAdjustments] = useState<HairTypeState>(initialState);

  const handleContinue = () => {
    const cleanedAdjustments = Object.fromEntries(
      Object.entries(hairTypeAdjustments).map(([key, value]) => 
        [key, value === "" ? 0 : value]
      )
    );
    
    // Add the base type with 0 adjustment
    cleanedAdjustments[data.standardHairType] = 0;
    
    onNext({
      globalHairTypeAdjustments: cleanedAdjustments as HairTypeAdjustments,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Global Hair Type Adjustments</h2>
        <p className="text-gray-600">
          Set price adjustments for different hair types. These apply to all braiding styles.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Base price is calculated with {data.standardHairType}. Add adjustments for other hair types.
          </p>
        </div>

        <div className="space-y-4">
          {/* Base hair type - not editable */}
          <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
              <span className="text-gray-900 font-medium">{data.standardHairType} (Base)</span>
              <p className="text-sm text-gray-500">Standard pricing reference</p>
            </div>
            <span className="text-gray-600 font-medium">$0</span>
          </div>
          
          {/* Adjustable hair types */}
          {adjustableHairTypes.map((hairType) => (
            <div key={hairType.name} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg">
              <div>
                <span className="text-gray-900 font-medium">{hairType.name}</span>
                <p className="text-sm text-gray-500">{hairType.description}</p>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">+$</span>
                <input 
                  type="number" 
                  value={hairTypeAdjustments[hairType.name]}
                  onChange={(e) => setHairTypeAdjustments({
                    ...hairTypeAdjustments,
                    [hairType.name]: e.target.value === "" ? "" : parseInt(e.target.value) || 0
                  })}
                  placeholder="0"
                  className="w-24 px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                />
              </div>
            </div>
          ))}
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
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );
}