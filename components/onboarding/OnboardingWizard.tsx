"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import WelcomeScreen from "./screens/WelcomeScreen";
import StyleSelectionScreen from "./screens/StyleSelectionScreen";
import BasePricingScreen from "./screens/BasePricingScreen";
import LengthAdjustmentScreen from "./screens/LengthAdjustmentScreen";
import SizeAdjustmentScreen from "./screens/SizeAdjustmentScreen";
import CurlyHairScreen from "./screens/CurlyHairScreen";
import GlobalAdjustmentsScreen from "./screens/GlobalAdjustmentsScreen";
import ConfirmationScreen from "./screens/ConfirmationScreen";
import SuccessScreen from "./screens/SuccessScreen";

export interface WizardData {
  salonId: Id<"salons">;
  salonName: string;
  standardHairType: string;
  selectedStyles: Array<{ name: string; isCustom: boolean }>;
  stylePricing: Record<string, StylePricing>;
  globalHairTypeAdjustments: HairTypeAdjustments;
  currentStyleIndex: number;
}

export interface StylePricing {
  basePrice: number;
  lengthAdjustments: Record<string, number>;
  sizeAdjustments: Record<string, number>;
  curlyHairAdjustment?: {
    included: boolean;
    costPerPack?: number;
  };
}

export interface HairTypeAdjustments {
  "Synthetic": number;
  "100% Human Hair": number;
  "Virgin Hair": number;
  "Treated Hair": number;
}

interface OnboardingWizardProps {
  salonId: Id<"salons">;
  salonName: string;
  isEditMode?: boolean;
}

export default function OnboardingWizard({ salonId, salonName, isEditMode = false }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    salonId,
    salonName,
    standardHairType: "Synthetic",
    selectedStyles: [],
    stylePricing: {},
    globalHairTypeAdjustments: {
      "Synthetic": 0,
      "100% Human Hair": 50,
      "Virgin Hair": 100,
      "Treated Hair": 30,
    },
    currentStyleIndex: 0,
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
      setWizardData((prev) => ({
        ...prev,
        standardHairType: existingPricingData.standardHairType,
        selectedStyles: existingPricingData.selectedStyles,
        stylePricing: existingPricingData.stylePricing,
        globalHairTypeAdjustments: {
          "Synthetic": existingPricingData.globalHairTypeAdjustments["Synthetic"] || 0,
          "100% Human Hair": existingPricingData.globalHairTypeAdjustments["100% Human Hair"] || 50,
          "Virgin Hair": existingPricingData.globalHairTypeAdjustments["Virgin Hair"] || 100,
          "Treated Hair": existingPricingData.globalHairTypeAdjustments["Treated Hair"] || 30,
        } as HairTypeAdjustments,
      }));
      setIsLoadingExistingData(false);
      // Skip welcome screen in edit mode
      if (currentStep === 0) {
        setCurrentStep(1);
      }
    }
  }, [isEditMode, existingPricingData, currentStep]);

  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = (data?: Partial<WizardData>) => {
    if (data) {
      updateWizardData(data);
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const getStepComponent = () => {
    // Static screens
    if (currentStep === 0 && !isEditMode) {
      return <WelcomeScreen data={wizardData} onNext={handleNext} />;
    }
    
    // Start at style selection for edit mode or step 1 for new setup
    if ((currentStep === 0 && isEditMode) || currentStep === 1) {
      return <StyleSelectionScreen data={wizardData} onNext={handleNext} onBack={handleBack} />;
    }

    // Calculate dynamic step ranges
    const stylesCount = wizardData.selectedStyles.length;
    let stepOffset = 2;

    // Per-style configuration screens
    for (let i = 0; i < stylesCount; i++) {
      const style = wizardData.selectedStyles[i];
      const styleName = style.name;

      // Base pricing screen for this style
      if (currentStep === stepOffset) {
        return (
          <BasePricingScreen
            data={wizardData}
            styleName={styleName}
            styleIndex={i}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      stepOffset++;

      // Length adjustment screen for this style
      if (currentStep === stepOffset) {
        return (
          <LengthAdjustmentScreen
            data={wizardData}
            styleName={styleName}
            styleIndex={i}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      stepOffset++;

      // Size adjustment screen for this style
      if (currentStep === stepOffset) {
        return (
          <SizeAdjustmentScreen
            data={wizardData}
            styleName={styleName}
            styleIndex={i}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      }
      stepOffset++;

      // Curly hair screen for Boho Knotless only
      if (styleName === "Boho Knotless") {
        if (currentStep === stepOffset) {
          return (
            <CurlyHairScreen
              data={wizardData}
              styleName={styleName}
              styleIndex={i}
              onNext={handleNext}
              onBack={handleBack}
            />
          );
        }
        stepOffset++;
      }
    }

    // Global adjustments screen
    if (currentStep === stepOffset) {
      return <GlobalAdjustmentsScreen data={wizardData} onNext={handleNext} onBack={handleBack} />;
    }
    stepOffset++;

    // Confirmation screen
    if (currentStep === stepOffset) {
      return <ConfirmationScreen data={wizardData} onNext={handleNext} onBack={handleBack} />;
    }
    stepOffset++;

    // Success screen
    if (currentStep === stepOffset) {
      return <SuccessScreen data={wizardData} />;
    }

    // Fallback
    return <div>Step not found</div>;
  };

  // Calculate total steps
  const calculateTotalSteps = () => {
    let total = isEditMode ? 1 : 2; // Skip welcome in edit mode
    wizardData.selectedStyles.forEach((style) => {
      total += 3; // Base + Length + Size
      if (style.name === "Boho Knotless") {
        total += 1; // Curly hair screen
      }
    });
    total += 3; // Global adjustments + Confirmation + Success
    return total;
  };

  const totalSteps = calculateTotalSteps();
  const adjustedStep = isEditMode && currentStep > 0 ? currentStep : currentStep + 1;
  const progress = (adjustedStep / totalSteps) * 100;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {isEditMode ? 'Edit Pricing - ' : ''}Step {adjustedStep} of {totalSteps}
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {getStepComponent()}
      </main>
    </div>
  );
}