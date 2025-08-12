"use client";
import { WizardData } from "../OnboardingWizard";

interface Props {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export default function ConfirmationScreen({ data, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-4">Review Your Pricing Configuration</h2>
      <p className="text-gray-600 mb-8">Please review your pricing setup before finalizing</p>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Selected Styles:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {data.selectedStyles.map(style => (
              <li key={style.name}>{style.name}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Standard Hair Type:</h3>
          <p className="text-gray-600">{data.standardHairType}</p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="px-6 py-3 bg-gray-200 rounded-lg">Back</button>
        <button onClick={() => onNext({})} className="px-6 py-3 bg-orange-500 text-white rounded-lg">Finalize Setup</button>
      </div>
    </div>
  );
}
EOF < /dev/null