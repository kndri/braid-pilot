"use client";
import { WizardData } from "../OnboardingWizard";

interface Props {
  data: WizardData;
  styleName: string;
  styleIndex: number;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export default function LengthAdjustmentScreen({ data, styleName, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-4">Length Adjustments for {styleName}</h2>
      <p className="text-gray-600 mb-8">Configure price adjustments for different lengths</p>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Bra-Length</span>
          <input type="number" placeholder="+$50" className="border rounded px-3 py-2" />
        </div>
        <div className="flex justify-between items-center">
          <span>Mid-Back</span>
          <input type="number" placeholder="+$75" className="border rounded px-3 py-2" />
        </div>
        <div className="flex justify-between items-center">
          <span>Waist-Length</span>
          <input type="number" placeholder="+$100" className="border rounded px-3 py-2" />
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