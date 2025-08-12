"use client";
import { WizardData } from "../OnboardingWizard";

interface Props {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export default function GlobalAdjustmentsScreen({ data, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-4">Global Hair Type Adjustments</h2>
      <p className="text-gray-600 mb-8">Set price adjustments for different hair types (applies to all styles)</p>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Synthetic (Base)</span>
          <span className="text-gray-500">$0</span>
        </div>
        <div className="flex justify-between items-center">
          <span>100% Human Hair</span>
          <input type="number" placeholder="+$50" className="border rounded px-3 py-2" />
        </div>
        <div className="flex justify-between items-center">
          <span>Virgin Hair</span>
          <input type="number" placeholder="+$100" className="border rounded px-3 py-2" />
        </div>
        <div className="flex justify-between items-center">
          <span>Treated Hair</span>
          <input type="number" placeholder="+$30" className="border rounded px-3 py-2" />
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="px-6 py-3 bg-gray-200 rounded-lg">Back</button>
        <button onClick={() => onNext({})} className="px-6 py-3 bg-orange-500 text-white rounded-lg">Continue</button>
      </div>
    </div>
  );
}
EOF < /dev/null