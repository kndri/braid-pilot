"use client";
import { useState } from "react";
import { WizardData } from "../OnboardingWizard";

interface Props {
  data: WizardData;
  styleName: string;
  styleIndex: number;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export default function CurlyHairScreen({ data, styleName, styleIndex, onNext, onBack }: Props) {
  const [curlyIncluded, setCurlyIncluded] = useState(
    data.stylePricing[styleName]?.curlyHairIncluded ?? false
  );
  const [curlyCost, setCurlyCost] = useState<number | "">(
    data.stylePricing[styleName]?.curlyHairCostPerPack || ""
  );

  const handleContinue = () => {
    const updatedPricing = {
      ...data.stylePricing,
      [styleName]: {
        ...data.stylePricing[styleName],
        curlyHairIncluded: curlyIncluded,
        curlyHairCostPerPack: curlyCost === "" ? 0 : curlyCost,
      },
    };
    onNext({ stylePricing: updatedPricing });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-orange-600 font-semibold">{styleIndex + 1}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{styleName}</h2>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Curly Hair Options</h3>
        <p className="text-gray-600">Configure pricing for curly hair additions</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Boho Knotless styles often include curly hair. Configure how this is priced.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
              type="radio" 
              name="curly" 
              checked={curlyIncluded}
              onChange={() => setCurlyIncluded(true)}
              className="mr-3 text-orange-500 focus:ring-orange-500" 
            />
            <div>
              <span className="text-gray-900 font-medium">Yes, curly hair is included</span>
              <p className="text-sm text-gray-500">The base price includes curly hair</p>
            </div>
          </label>
          <label className="flex items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input 
              type="radio" 
              name="curly" 
              checked={!curlyIncluded}
              onChange={() => setCurlyIncluded(false)}
              className="mr-3 text-orange-500 focus:ring-orange-500" 
            />
            <div>
              <span className="text-gray-900 font-medium">No, curly hair costs extra</span>
              <p className="text-sm text-gray-500">Curly hair is charged separately</p>
            </div>
          </label>
        </div>
        
        <div className="mt-6">
          <label className="block text-gray-900 font-medium mb-2">Cost per pack of curly hair</label>
          <p className="text-sm text-gray-500 mb-3">What does each pack of curly hair cost?</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input 
              type="number" 
              value={curlyCost}
              onChange={(e) => setCurlyCost(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
            />
          </div>
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
