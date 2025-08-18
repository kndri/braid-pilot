"use client";
import { useState } from "react";
import { WizardData } from "../OnboardingWizard";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Props {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export default function ConfirmationScreen({ data, onNext, onBack }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convex mutations
  const saveSelectedStyles = useMutation(api.pricing.saveSelectedStyles);
  const saveBulkPricingConfigs = useMutation(api.pricing.saveBulkPricingConfigs);
  const updateSalonStandardHairType = useMutation(api.pricing.updateSalonStandardHairType);
  const generateQuoteToolUrl = useMutation(api.pricing.generateQuoteToolUrl);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const calculateFinalPrice = (styleName: string, size: string, length: string) => {
    const pricing = data.stylePricing[styleName];
    if (!pricing) return 0;
    
    let total = pricing.basePrice || 0;
    
    // Add size adjustment
    if (size !== "Jumbo" && pricing.sizeAdjustments?.[size]) {
      total += pricing.sizeAdjustments[size];
    }
    
    // Add length adjustment
    if (length !== "Shoulder-Length" && pricing.lengthAdjustments?.[length]) {
      total += pricing.lengthAdjustments[length];
    }
    
    return total;
  };

  const handleFinalize = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      // 1. Save selected styles
      await saveSelectedStyles({
        salonId: data.salonId,
        styles: data.selectedStyles.map(style => ({
          styleName: style.name,
          isCustom: style.isCustom,
        })),
      });
      
      // 2. Update salon standard hair type
      await updateSalonStandardHairType({
        salonId: data.salonId,
        standardHairType: data.standardHairType,
      });
      
      // 3. Prepare and save all pricing configs
      const configs: any[] = [];
      
      // For each selected style
      data.selectedStyles.forEach(style => {
        const stylePricing = data.stylePricing[style.name];
        if (!stylePricing) return;
        
        // Base price
        configs.push({
          styleName: style.name,
          adjustmentType: "base_price",
          adjustmentLabel: "Base Price (Jumbo + Shoulder)",
          adjustmentValue: stylePricing.basePrice || 0,
        });
        
        // Length adjustments
        Object.entries(stylePricing.lengthAdjustments || {}).forEach(([length, value]) => {
          configs.push({
            styleName: style.name,
            adjustmentType: "length_adj",
            adjustmentLabel: length,
            adjustmentValue: value as number,
          });
        });
        
        // Size adjustments
        Object.entries(stylePricing.sizeAdjustments || {}).forEach(([size, value]) => {
          configs.push({
            styleName: style.name,
            adjustmentType: "size_adj",
            adjustmentLabel: size,
            adjustmentValue: value as number,
          });
        });
        
        // Curly hair adjustment for Boho Knotless
        if (style.name === "Boho Knotless" && stylePricing.curlyHairAdjustment) {
          configs.push({
            styleName: style.name,
            adjustmentType: "curly_hair_adj",
            adjustmentLabel: "Curly Hair",
            adjustmentValue: stylePricing.curlyHairAdjustment.costPerPack || 0,
            metadata: {
              included: stylePricing.curlyHairAdjustment.included,
            },
          });
        }
      });
      
      // Global hair type adjustments
      Object.entries(data.globalHairTypeAdjustments || {}).forEach(([hairType, value]) => {
        // Apply to all styles
        data.selectedStyles.forEach(style => {
          configs.push({
            styleName: style.name,
            adjustmentType: "hair_type_adj",
            adjustmentLabel: hairType,
            adjustmentValue: value as number,
          });
        });
      });
      
      // Save all configs
      await saveBulkPricingConfigs({
        salonId: data.salonId,
        configs,
      });
      
      // 4. Generate quote tool URL
      await generateQuoteToolUrl({
        salonId: data.salonId,
      });
      
      // 5. Mark onboarding as complete
      await completeOnboarding();
      
      // Move to success screen
      onNext({});
      
    } catch (err) {
      console.error("Error saving pricing configuration:", err);
      setError("Failed to save pricing configuration. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Review Your Pricing Configuration</h2>
        <p className="text-gray-600">Please review your pricing setup before finalizing</p>
      </div>
      
      <div className="space-y-6">
        {/* Selected Styles */}
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Selected Styles ({data.selectedStyles.length}):</h3>
          <div className="grid grid-cols-2 gap-3">
            {data.selectedStyles.map(style => (
              <div key={style.name} className="bg-white rounded-md p-3 border border-gray-200">
                <span className="text-gray-900 font-medium">{style.name}</span>
                <p className="text-sm text-gray-500 mt-1">
                  Base: ${data.stylePricing[style.name]?.basePrice || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Standard Hair Type */}
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Standard Hair Type:</h3>
          <p className="text-gray-700">{data.standardHairType}</p>
          <p className="text-sm text-gray-500 mt-1">All base prices are calculated with this hair type</p>
        </div>
        
        {/* Sample Price Calculations */}
        {data.selectedStyles.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Sample Price Calculations:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">{data.selectedStyles[0].name} - Small + Waist:</span>
                <span className="font-semibold text-blue-900">
                  ${calculateFinalPrice(data.selectedStyles[0].name, "Small", "Waist-Length")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">{data.selectedStyles[0].name} - Medium + Mid-Back:</span>
                <span className="font-semibold text-blue-900">
                  ${calculateFinalPrice(data.selectedStyles[0].name, "Medium", "Mid-Back")}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Global Adjustments */}
        {data.globalHairTypeAdjustments && (
          <div className="bg-gray-50 rounded-md p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Hair Type Adjustments:</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(data.globalHairTypeAdjustments).map(([type, adjustment]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-700">{type}:</span>
                  <span className="text-gray-900 font-medium">+${adjustment}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-between">
        <button 
          onClick={onBack}
          disabled={isSaving}
          className="px-6 py-3 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button 
          onClick={handleFinalize}
          disabled={isSaving}
          className={`px-6 py-3 rounded-md transition-colors font-medium ${
            isSaving 
              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {isSaving ? "Saving..." : "Finalize Setup"}
        </button>
      </div>
    </div>
  );
}