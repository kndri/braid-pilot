"use client";

import { useState } from "react";
import { SimplifiedWizardData } from "../../SimplifiedOnboardingWizard";
import { Check, Plus, X, Sparkles } from "lucide-react";

interface Props {
  data: SimplifiedWizardData;
  onNext: (data: Partial<SimplifiedWizardData>) => void;
  onBack?: () => void;
  applyTemplate: (template: "budget" | "standard" | "premium") => void;
  defaultPrices: Record<string, number>;
}

const AVAILABLE_STYLES = [
  "Box Braids", "Knotless Braids", "Boho Knotless", "Goddess Braids",
  "Micro Braids", "Senegalese Twists", "Marley Twists", "Faux Locs",
  "Butterfly Locs", "Cornrows", "Feed-in Braids", "Lemonade Braids",
  "Fulani Braids", "Triangle Braids", "Passion Twists", "Spring Twists",
  "Crochet Braids", "Tree Braids", "Bantu Knots", "Flat Twists", "Havana Twists"
];

export default function StyleAndBasePricingScreen({ 
  data, 
  onNext, 
  onBack, 
  applyTemplate,
  defaultPrices 
}: Props) {
  const [selectedStyles, setSelectedStyles] = useState<Array<{
    name: string;
    isCustom: boolean;
    basePrice: number;
  }>>(data.selectedStyles.length > 0 ? data.selectedStyles : []);
  
  const [showCustomStyle, setShowCustomStyle] = useState(false);
  const [customStyleName, setCustomStyleName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<"budget" | "standard" | "premium" | "custom">(
    data.pricingTemplate || "standard"
  );

  const toggleStyle = (styleName: string) => {
    setSelectedStyles(prev => {
      const exists = prev.find(s => s.name === styleName);
      if (exists) {
        return prev.filter(s => s.name !== styleName);
      } else {
        return [...prev, {
          name: styleName,
          isCustom: false,
          basePrice: calculateTemplatePrice(styleName)
        }];
      }
    });
  };

  const calculateTemplatePrice = (styleName: string) => {
    const basePrice = defaultPrices[styleName] || 150;
    const multipliers = {
      budget: 0.85,
      standard: 1.0,
      premium: 1.25,
      custom: 1.0
    };
    return Math.round(basePrice * multipliers[selectedTemplate]);
  };

  const addCustomStyle = () => {
    if (customStyleName.trim() && !selectedStyles.find(s => s.name === customStyleName)) {
      setSelectedStyles(prev => [...prev, {
        name: customStyleName.trim(),
        isCustom: true,
        basePrice: 150
      }]);
      setCustomStyleName("");
      setShowCustomStyle(false);
    }
  };

  const updateStylePrice = (styleName: string, price: number) => {
    setSelectedStyles(prev => prev.map(style => 
      style.name === styleName ? { ...style, basePrice: price } : style
    ));
    setSelectedTemplate("custom");
  };

  const applyTemplateToAll = (template: "budget" | "standard" | "premium") => {
    setSelectedTemplate(template);
    applyTemplate(template);
    
    // Update prices for all selected styles
    const multipliers = {
      budget: 0.85,
      standard: 1.0,
      premium: 1.25
    };
    
    setSelectedStyles(prev => prev.map(style => ({
      ...style,
      basePrice: Math.round((defaultPrices[style.name] || 150) * multipliers[template])
    })));
  };

  const handleNext = () => {
    if (selectedStyles.length === 0) {
      alert("Please select at least one style");
      return;
    }
    onNext({ 
      selectedStyles,
      pricingTemplate: selectedTemplate as any
    });
  };

  const removeStyle = (styleName: string) => {
    setSelectedStyles(prev => prev.filter(s => s.name !== styleName));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Step 1: Select Styles & Set Base Prices
      </h2>
      <p className="text-gray-600 mb-6">
        Choose your services and set base prices. You can use our templates or customize each price.
      </p>

      {/* Pricing Templates */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Start Templates</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => applyTemplateToAll("budget")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTemplate === "budget"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900">Budget Friendly</div>
              <div className="text-sm text-gray-500 mt-1">15% below standard</div>
            </div>
          </button>
          
          <button
            onClick={() => applyTemplateToAll("standard")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTemplate === "standard"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900">Standard Pricing</div>
              <div className="text-sm text-gray-500 mt-1">Industry average</div>
            </div>
          </button>
          
          <button
            onClick={() => applyTemplateToAll("premium")}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTemplate === "premium"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900">Premium Service</div>
              <div className="text-sm text-gray-500 mt-1">25% above standard</div>
            </div>
          </button>
        </div>
        {selectedTemplate === "custom" && (
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            <Sparkles className="w-4 h-4 mr-1" />
            Custom pricing applied
          </div>
        )}
      </div>

      {/* Style Selection Grid */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Available Styles</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {AVAILABLE_STYLES.map((style) => {
            const isSelected = selectedStyles.find(s => s.name === style);
            return (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className={`p-3 rounded-lg border transition-all text-sm ${
                  isSelected
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{style}</span>
                  {isSelected && <Check className="w-4 h-4 ml-2" />}
                </div>
              </button>
            );
          })}
          
          {/* Add Custom Style Button */}
          <button
            onClick={() => setShowCustomStyle(true)}
            className="p-3 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700 transition-all text-sm"
          >
            <div className="flex items-center justify-center">
              <Plus className="w-4 h-4 mr-1" />
              <span>Custom Style</span>
            </div>
          </button>
        </div>

        {/* Custom Style Input */}
        {showCustomStyle && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={customStyleName}
              onChange={(e) => setCustomStyleName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomStyle()}
              placeholder="Enter custom style name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
            <button
              onClick={addCustomStyle}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomStyle(false);
                setCustomStyleName("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Selected Styles with Pricing */}
      {selectedStyles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Selected Styles ({selectedStyles.length})
          </h3>
          <div className="space-y-2">
            {selectedStyles.map((style) => (
              <div
                key={style.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center flex-1">
                  <span className="font-medium text-gray-900 mr-4">{style.name}</span>
                  {style.isCustom && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <input
                      type="number"
                      value={style.basePrice}
                      onChange={(e) => updateStylePrice(style.name, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      min="0"
                    />
                  </div>
                  <button
                    onClick={() => removeStyle(style.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total Selected Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                Average base price: ${Math.round(selectedStyles.reduce((acc, s) => acc + s.basePrice, 0) / selectedStyles.length)}
              </span>
              <span className="text-blue-700">
                Price range: ${Math.min(...selectedStyles.map(s => s.basePrice))} - ${Math.max(...selectedStyles.map(s => s.basePrice))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            onBack
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!onBack}
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          disabled={selectedStyles.length === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedStyles.length > 0
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next: Set Adjustments
        </button>
      </div>
    </div>
  );
}