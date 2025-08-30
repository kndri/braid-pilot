"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import StyleAndBasePricingScreen from "./screens/simplified/StyleAndBasePricingScreen";
import UniversalAdjustmentsScreen from "./screens/simplified/UniversalAdjustmentsScreen";
import ReviewAndCustomizeScreen from "./screens/simplified/ReviewAndCustomizeScreen";
import SuccessScreen from "./screens/SuccessScreen";

export interface SimplifiedWizardData {
  salonId: Id<"salons">;
  salonName: string;
  selectedStyles: Array<{
    name: string;
    isCustom: boolean;
    basePrice: number;
  }>;
  universalAdjustments: {
    lengths: Record<string, number>; // e.g., {"Bra-Length": 0, "Mid-Back": 20, "Waist-Length": 40}
    sizes: Record<string, number>; // e.g., {"Small": -10, "Medium": 0, "Large": 20, "XL": 40}
    hairTypes: Record<string, number>; // e.g., {"Synthetic": 0, "100% Human Hair": 50}
  };
  customAdjustments: Record<string, {
    lengths?: Record<string, number>;
    sizes?: Record<string, number>;
    curlyHair?: { included: boolean; costPerPack?: number };
  }>;
  pricingTemplate?: "budget" | "standard" | "premium" | "custom";
}

interface SimplifiedOnboardingWizardProps {
  salonId: Id<"salons">;
  salonName: string;
  isEditMode?: boolean;
}

// Pricing templates - Note: Larger sizes are cheaper (less hair/time needed)
const PRICING_TEMPLATES = {
  budget: {
    name: "Budget Friendly",
    description: "Competitive prices for cost-conscious clients",
    multiplier: 0.85,
    adjustments: {
      lengths: { "Bra-Length": 0, "Mid-Back": 15, "Waist-Length": 30 },
      sizes: { "Small": 30, "Medium": 15, "Large": 0, "XL": -10 },
      hairTypes: { "Synthetic": 0, "100% Human Hair": 30, "Virgin Hair": 60, "Treated Hair": 20 }
    }
  },
  standard: {
    name: "Standard Pricing",
    description: "Industry-standard pricing for most salons",
    multiplier: 1.0,
    adjustments: {
      lengths: { "Bra-Length": 0, "Mid-Back": 20, "Waist-Length": 40 },
      sizes: { "Small": 40, "Medium": 20, "Large": 0, "XL": -10 },
      hairTypes: { "Synthetic": 0, "100% Human Hair": 50, "Virgin Hair": 100, "Treated Hair": 30 }
    }
  },
  premium: {
    name: "Premium Service",
    description: "Higher prices for luxury service and expertise",
    multiplier: 1.25,
    adjustments: {
      lengths: { "Bra-Length": 0, "Mid-Back": 30, "Waist-Length": 60 },
      sizes: { "Small": 60, "Medium": 30, "Large": 0, "XL": -15 },
      hairTypes: { "Synthetic": 0, "100% Human Hair": 75, "Virgin Hair": 150, "Treated Hair": 45 }
    }
  }
};

// Default base prices for common styles
const DEFAULT_BASE_PRICES: Record<string, number> = {
  "Box Braids": 180,
  "Knotless Braids": 200,
  "Boho Knotless": 220,
  "Goddess Braids": 150,
  "Micro Braids": 250,
  "Senegalese Twists": 160,
  "Marley Twists": 140,
  "Faux Locs": 180,
  "Butterfly Locs": 200,
  "Cornrows": 80,
  "Feed-in Braids": 100,
  "Lemonade Braids": 120,
  "Fulani Braids": 130,
  "Triangle Braids": 190,
  "Passion Twists": 170,
  "Spring Twists": 150,
  "Crochet Braids": 120,
  "Tree Braids": 200,
  "Bantu Knots": 60,
  "Flat Twists": 70,
  "Havana Twists": 160
};

export default function SimplifiedOnboardingWizard({ 
  salonId, 
  salonName, 
  isEditMode = false 
}: SimplifiedOnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<SimplifiedWizardData>({
    salonId,
    salonName,
    selectedStyles: [],
    universalAdjustments: {
      lengths: { "Bra-Length": 0, "Mid-Back": 20, "Waist-Length": 40 },
      sizes: { "Small": 40, "Medium": 20, "Large": 0, "XL": -10 },
      hairTypes: { "Synthetic": 0, "100% Human Hair": 50, "Virgin Hair": 100, "Treated Hair": 30 }
    },
    customAdjustments: {},
    pricingTemplate: "standard"
  });
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(isEditMode);

  // Fetch existing pricing data if in edit mode
  const existingPricingData = useQuery(
    api.pricing.getFormattedPricingData,
    isEditMode ? { salonId } : "skip"
  );

  // Load existing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingPricingData) {
      // Convert existing data to simplified format
      const selectedStyles = existingPricingData.selectedStyles.map(style => ({
        name: style.name,
        isCustom: style.isCustom,
        basePrice: existingPricingData.stylePricing[style.name]?.basePrice || DEFAULT_BASE_PRICES[style.name] || 150
      }));

      // Extract universal adjustments (use first style's adjustments as baseline)
      const firstStyleName = selectedStyles[0]?.name;
      const firstStylePricing = existingPricingData.stylePricing[firstStyleName];
      
      setWizardData({
        salonId,
        salonName,
        selectedStyles,
        universalAdjustments: {
          lengths: firstStylePricing?.lengthAdjustments || { "Bra-Length": 0, "Mid-Back": 20, "Waist-Length": 40 },
          sizes: firstStylePricing?.sizeAdjustments || { "Small": 40, "Medium": 20, "Large": 0, "XL": -10 },
          hairTypes: existingPricingData.globalHairTypeAdjustments
        },
        customAdjustments: {},
        pricingTemplate: "custom"
      });
      
      setIsLoadingExistingData(false);
    }
  }, [isEditMode, existingPricingData, salonId, salonName]);

  const updateWizardData = (data: Partial<SimplifiedWizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = (data?: Partial<SimplifiedWizardData>) => {
    if (data) {
      updateWizardData(data);
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const applyPricingTemplate = (template: keyof typeof PRICING_TEMPLATES) => {
    const templateData = PRICING_TEMPLATES[template];
    
    // Apply template multiplier to base prices
    const updatedStyles = wizardData.selectedStyles.map(style => ({
      ...style,
      basePrice: Math.round((DEFAULT_BASE_PRICES[style.name] || 150) * templateData.multiplier)
    }));

    setWizardData(prev => ({
      ...prev,
      selectedStyles: updatedStyles,
      universalAdjustments: templateData.adjustments,
      pricingTemplate: template
    }));
  };

  const getStepComponent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StyleAndBasePricingScreen
            data={wizardData}
            onNext={handleNext}
            onBack={isEditMode ? () => router.push("/dashboard/settings") : undefined}
            applyTemplate={applyPricingTemplate}
            defaultPrices={DEFAULT_BASE_PRICES}
          />
        );
      case 1:
        return (
          <UniversalAdjustmentsScreen
            data={wizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <ReviewAndCustomizeScreen
            data={wizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return <SuccessScreen data={wizardData as any} />;
      default:
        return <div>Step not found</div>;
    }
  };

  // Show loading state while fetching existing data
  if (isLoadingExistingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-900">Loading your pricing configuration...</p>
        </div>
      </div>
    );
  }

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {isEditMode ? 'Edit Pricing - ' : ''}Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {isEditMode ? 'Cancel' : 'Save & Exit'}
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {getStepComponent()}
      </main>
    </div>
  );
}