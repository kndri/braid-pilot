"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
}

export default function OnboardingWizard({ salonId, salonName }: OnboardingWizardProps) {
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
    if (currentStep === 0) {
      return <WelcomeScreen data={wizardData} onNext={handleNext} />;
    }
    
    if (currentStep === 1) {
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
    let total = 2; // Welcome + Style Selection
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
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Save & Exit
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