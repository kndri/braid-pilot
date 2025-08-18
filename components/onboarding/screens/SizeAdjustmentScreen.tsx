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

// Default size options
const defaultSizes = [
  { name: "Small", description: "Pencil-thin braids" },
  { name: "Medium", description: "Finger-width braids" },
  { name: "Large", description: "Thumb-width braids" },
  { name: "XL", description: "Two-finger-width braids" },
];

export default function SizeAdjustmentScreen({ data, styleName, styleIndex, onNext, onBack }: Props) {
  // Initialize with existing adjustments or defaults
  const existingAdjustments = data.stylePricing[styleName]?.sizeAdjustments || {};
  
  // Combine default sizes with any custom ones from existing data
  const customSizeNames = Object.keys(existingAdjustments).filter(
    name => !defaultSizes.find(ds => ds.name === name)
  );
  
  const [sizeAdjustments, setSizeAdjustments] = useState<AdjustmentsState>({
    "Small": existingAdjustments["Small"] ?? "",
    "Medium": existingAdjustments["Medium"] ?? "",
    "Large": existingAdjustments["Large"] ?? "",
    "XL": existingAdjustments["XL"] ?? "",
    ...Object.fromEntries(customSizeNames.map(name => [name, existingAdjustments[name] || ""]))
  });
  
  const [customSizes, setCustomSizes] = useState<Array<{name: string, description: string}>>(
    customSizeNames.map(name => ({ name, description: "" }))
  );
  
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeDescription, setNewSizeDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCustomSize = () => {
    if (newSizeName.trim()) {
      const trimmedName = newSizeName.trim();
      
      // Check if it already exists
      if (sizeAdjustments.hasOwnProperty(trimmedName)) {
        alert("This size already exists!");
        return;
      }
      
      setCustomSizes([...customSizes, { 
        name: trimmedName, 
        description: newSizeDescription.trim() 
      }]);
      
      setSizeAdjustments({
        ...sizeAdjustments,
        [trimmedName]: ""
      });
      
      setNewSizeName("");
      setNewSizeDescription("");
      setShowAddForm(false);
    }
  };

  const handleRemoveCustomSize = (name: string) => {
    setCustomSizes(customSizes.filter(s => s.name !== name));
    const newAdjustments = { ...sizeAdjustments };
    delete newAdjustments[name];
    setSizeAdjustments(newAdjustments);
  };

  const handleContinue = () => {
    // Convert empty strings to 0 before saving
    const cleanedAdjustments = Object.fromEntries(
      Object.entries(sizeAdjustments).map(([key, value]) => 
        [key, value === "" ? 0 : value]
      )
    );
    
    const updatedPricing = {
      ...data.stylePricing,
      [styleName]: {
        ...data.stylePricing[styleName],
        sizeAdjustments: cleanedAdjustments,
      },
    };
    onNext({ stylePricing: updatedPricing });
  };

  const allSizes = [...defaultSizes, ...customSizes];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 font-semibold">{styleIndex + 1}</span>
          </div>
          <h2 className="text-3xl font-semibold text-gray-900">{styleName}</h2>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Size Adjustments</h3>
        <p className="text-gray-600">Set price additions for smaller braid sizes (base is Jumbo)</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-sm text-gray-600 mb-3">
            Smaller braids take more time. Enter how much MORE to charge for each size.
          </p>
        </div>

        <div className="space-y-4">
          {allSizes.map((size) => (
            <div key={size.name} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-md">
              <div className="flex-1">
                <span className="text-gray-900 font-medium">{size.name}</span>
                {size.description && (
                  <p className="text-sm text-gray-500">{size.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">+$</span>
                  <input 
                    type="number" 
                    value={sizeAdjustments[size.name] ?? ""}
                    onChange={(e) => setSizeAdjustments({
                      ...sizeAdjustments, 
                      [size.name]: e.target.value === "" ? "" : parseInt(e.target.value)
                    })}
                    placeholder="0"
                    className="w-24 px-3 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-purple-600" 
                  />
                </div>
                {customSizes.some(cs => cs.name === size.name) && (
                  <button
                    onClick={() => handleRemoveCustomSize(size.name)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remove custom size"
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

        {/* Add Custom Size Form */}
        {showAddForm ? (
          <div className="border-2 border-dashed border-purple-300 rounded-md p-4 bg-purple-50">
            <h4 className="font-medium text-gray-900 mb-3">Add Custom Size</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSizeName}
                  onChange={(e) => setNewSizeName(e.target.value)}
                  placeholder="e.g., Micro, XXL, Tiny"
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newSizeDescription}
                  onChange={(e) => setNewSizeDescription(e.target.value)}
                  placeholder="e.g., Extra tiny braids"
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustomSize}
                  disabled={!newSizeName.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Size
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSizeName("");
                    setNewSizeDescription("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Custom Size
          </button>
        )}
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
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );
}