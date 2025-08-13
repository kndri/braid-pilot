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

type AdjustmentsState = {
  [key: string]: number | "";
};

// Default length options
const defaultLengths = [
  { name: "Bra-Length", description: "Mid-chest level" },
  { name: "Mid-Back", description: "Middle of back" },
  { name: "Waist-Length", description: "Waist level" },
];

export default function LengthAdjustmentScreen({ data, styleName, styleIndex, onNext, onBack }: Props) {
  // Initialize with existing adjustments or defaults
  const existingAdjustments = data.stylePricing[styleName]?.lengthAdjustments || {};
  
  // Combine default lengths with any custom ones from existing data
  const customLengthNames = Object.keys(existingAdjustments).filter(
    name => !defaultLengths.find(dl => dl.name === name)
  );
  
  const [lengthAdjustments, setLengthAdjustments] = useState<AdjustmentsState>({
    "Bra-Length": existingAdjustments["Bra-Length"] ?? "",
    "Mid-Back": existingAdjustments["Mid-Back"] ?? "",
    "Waist-Length": existingAdjustments["Waist-Length"] ?? "",
    ...Object.fromEntries(customLengthNames.map(name => [name, existingAdjustments[name] || ""]))
  });
  
  const [customLengths, setCustomLengths] = useState<Array<{name: string, description: string}>>(
    customLengthNames.map(name => ({ name, description: "" }))
  );
  
  const [newLengthName, setNewLengthName] = useState("");
  const [newLengthDescription, setNewLengthDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCustomLength = () => {
    if (newLengthName.trim()) {
      const trimmedName = newLengthName.trim();
      
      // Check if it already exists
      if (lengthAdjustments.hasOwnProperty(trimmedName)) {
        alert("This length already exists!");
        return;
      }
      
      setCustomLengths([...customLengths, { 
        name: trimmedName, 
        description: newLengthDescription.trim() 
      }]);
      
      setLengthAdjustments({
        ...lengthAdjustments,
        [trimmedName]: ""
      });
      
      setNewLengthName("");
      setNewLengthDescription("");
      setShowAddForm(false);
    }
  };

  const handleRemoveCustomLength = (name: string) => {
    setCustomLengths(customLengths.filter(l => l.name !== name));
    const newAdjustments = { ...lengthAdjustments };
    delete newAdjustments[name];
    setLengthAdjustments(newAdjustments);
  };

  const handleContinue = () => {
    // Convert empty strings to 0 before saving
    const cleanedAdjustments = Object.fromEntries(
      Object.entries(lengthAdjustments).map(([key, value]) => 
        [key, value === "" ? 0 : value]
      )
    );
    
    const updatedPricing = {
      ...data.stylePricing,
      [styleName]: {
        ...data.stylePricing[styleName],
        lengthAdjustments: cleanedAdjustments,
      },
    };
    onNext({ stylePricing: updatedPricing });
  };

  const allLengths = [...defaultLengths, ...customLengths];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-orange-600 font-semibold">{styleIndex + 1}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{styleName}</h2>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Length Adjustments</h3>
        <p className="text-gray-600">Set price additions for longer lengths (base is Shoulder-Length)</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Enter how much MORE to charge for each length compared to Shoulder-Length
          </p>
        </div>

        <div className="space-y-4">
          {allLengths.map((length) => (
            <div key={length.name} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1">
                <span className="text-gray-900 font-medium">{length.name}</span>
                {length.description && (
                  <p className="text-sm text-gray-500">{length.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">+$</span>
                  <input 
                    type="number" 
                    value={lengthAdjustments[length.name] ?? ""}
                    onChange={(e) => setLengthAdjustments({
                      ...lengthAdjustments,
                      [length.name]: e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value))
                    })}
                    placeholder="0"
                    className="w-24 px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  />
                </div>
                {customLengths.some(cl => cl.name === length.name) && (
                  <button
                    onClick={() => handleRemoveCustomLength(length.name)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remove custom length"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Length Form */}
        {showAddForm ? (
          <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
            <h4 className="font-medium text-gray-900 mb-3">Add Custom Length</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newLengthName}
                  onChange={(e) => setNewLengthName(e.target.value)}
                  placeholder="e.g., Under-Butt, Hip-Length"
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newLengthDescription}
                  onChange={(e) => setNewLengthDescription(e.target.value)}
                  placeholder="e.g., Below the buttocks"
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustomLength}
                  disabled={!newLengthName.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Length
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewLengthName("");
                    setNewLengthDescription("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Custom Length
          </button>
        )}
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