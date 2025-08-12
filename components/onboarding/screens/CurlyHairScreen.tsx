"use client";
import { WizardData } from "../OnboardingWizard";

interface Props {
  data: WizardData;
  styleName: string;
  styleIndex: number;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export default function CurlyHairScreen({ data, styleName, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-4">Curly Hair Options for {styleName}</h2>
      <p className="text-gray-600 mb-8">Does the curly hair come included in the base price?</p>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input type="radio" name="curly" className="mr-3" />
          <span>Yes, curly hair is included</span>
        </label>
        <label className="flex items-center">
          <input type="radio" name="curly" className="mr-3" />
          <span>No, curly hair costs extra</span>
        </label>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Cost per pack of curly hair</label>
        <input type="number" placeholder="$25" className="border rounded px-3 py-2 w-full" />
      </div>
      
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="px-6 py-3 bg-gray-200 rounded-lg">Back</button>
        <button onClick={() => onNext({})} className="px-6 py-3 bg-orange-500 text-white rounded-lg">Continue</button>
      </div>
    </div>
  );
}
