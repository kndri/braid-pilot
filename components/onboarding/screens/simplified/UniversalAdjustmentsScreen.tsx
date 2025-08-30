"use client";

import { useState } from "react";
import { SimplifiedWizardData } from "../../SimplifiedOnboardingWizard";
import { Info, Copy, RotateCcw } from "lucide-react";

interface Props {
  data: SimplifiedWizardData;
  onNext: (data: Partial<SimplifiedWizardData>) => void;
  onBack: () => void;
}

const DEFAULT_ADJUSTMENTS = {
  lengths: {
    "Bra-Length": 0,
    "Mid-Back": 20,
    "Waist-Length": 40
  },
  sizes: {
    "Small": 40,    // Smaller heads need more braids/time
    "Medium": 20,   // Standard head size
    "Large": 0,     // Baseline
    "XL": -10       // Larger heads need fewer braids
  },
  hairTypes: {
    "Synthetic": 0,
    "100% Human Hair": 50,
    "Virgin Hair": 100,
    "Treated Hair": 30
  }
};

export default function UniversalAdjustmentsScreen({ data, onNext, onBack }: Props) {
  const [adjustments, setAdjustments] = useState(data.universalAdjustments);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateAdjustment = (
    category: "lengths" | "sizes" | "hairTypes",
    key: string,
    value: number
  ) => {
    setAdjustments(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const resetToDefaults = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
  };

  const applyPattern = (pattern: "linear" | "exponential" | "custom") => {
    if (pattern === "linear") {
      setAdjustments({
        lengths: {
          "Bra-Length": 0,
          "Mid-Back": 25,
          "Waist-Length": 50
        },
        sizes: {
          "Small": 50,   // Linear increase for smaller heads
          "Medium": 25,
          "Large": 0,
          "XL": -25     // Linear decrease for larger heads
        },
        hairTypes: adjustments.hairTypes
      });
    } else if (pattern === "exponential") {
      setAdjustments({
        lengths: {
          "Bra-Length": 0,
          "Mid-Back": 20,
          "Waist-Length": 50
        },
        sizes: {
          "Small": 60,   // Exponential increase for smaller heads
          "Medium": 30,
          "Large": 0,
          "XL": -10     // Smaller decrease for larger heads
        },
        hairTypes: adjustments.hairTypes
      });
    }
  };

  const handleNext = () => {
    onNext({ universalAdjustments: adjustments });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Step 2: Set Universal Adjustments
      </h2>
      <p className="text-gray-600 mb-6">
        Define pricing adjustments that apply to all selected styles. You can customize individual styles in the next step.
      </p>

      {/* Quick Actions */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => applyPattern("linear")}
          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <Copy className="w-4 h-4 inline mr-2" />
          Apply Linear Pattern
        </button>
        <button
          onClick={() => applyPattern("exponential")}
          className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
        >
          <Copy className="w-4 h-4 inline mr-2" />
          Apply Exponential Pattern
        </button>
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4 inline mr-2" />
          Reset to Defaults
        </button>
      </div>

      {/* Length Adjustments */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Length Adjustments</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-4">
            {Object.entries(adjustments.lengths).map(([length, adjustment]) => (
              <div key={length} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 w-32">
                  {length}
                </label>
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={adjustment}
                    onChange={(e) => updateAdjustment("lengths", length, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center w-24">
                    <span className="text-gray-500 mr-1">$</span>
                    <input
                      type="number"
                      value={adjustment}
                      onChange={(e) => updateAdjustment("lengths", length, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-gray-600">
              Set how much to add/subtract from base price for different hair lengths
            </p>
          </div>
        </div>
      </div>

      {/* Size Adjustments */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Size Adjustments</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-4">
            {Object.entries(adjustments.sizes).map(([size, adjustment]) => (
              <div key={size} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 w-32">
                  {size}
                </label>
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={adjustment}
                    onChange={(e) => updateAdjustment("sizes", size, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center w-24">
                    <span className="text-gray-500 mr-1">$</span>
                    <input
                      type="number"
                      value={adjustment}
                      onChange={(e) => updateAdjustment("sizes", size, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-gray-600">
              Smaller head sizes require more braids and time (higher price). Larger sizes need fewer braids (lower price).
            </p>
          </div>
        </div>
      </div>

      {/* Hair Type Adjustments */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hair Type Adjustments</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-4">
            {Object.entries(adjustments.hairTypes).map(([type, adjustment]) => (
              <div key={type} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 w-32">
                  {type}
                </label>
                <div className="flex items-center gap-4 flex-1 max-w-md">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={adjustment}
                    onChange={(e) => updateAdjustment("hairTypes", type, parseInt(e.target.value))}
                    className="flex-1"
                    disabled={type === "Synthetic"}
                  />
                  <div className="flex items-center w-24">
                    <span className="text-gray-500 mr-1">$</span>
                    <input
                      type="number"
                      value={adjustment}
                      onChange={(e) => updateAdjustment("hairTypes", type, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      disabled={type === "Synthetic"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-gray-600">
              Premium hair types add to the final price. Synthetic is your baseline (always $0).
            </p>
          </div>
        </div>
      </div>

      {/* Preview Box */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Example Price Calculation</h4>
        <div className="text-sm text-blue-700">
          <div>Base Price (Box Braids): $180</div>
          <div>+ Waist-Length: ${adjustments.lengths["Waist-Length"]}</div>
          <div>+ Large Size: ${adjustments.sizes["Large"]}</div>
          <div>+ 100% Human Hair: ${adjustments.hairTypes["100% Human Hair"]}</div>
          <div className="font-semibold mt-2 pt-2 border-t border-blue-200">
            Total: ${180 + adjustments.lengths["Waist-Length"] + adjustments.sizes["Large"] + adjustments.hairTypes["100% Human Hair"]}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          Next: Review & Customize
        </button>
      </div>
    </div>
  );
}