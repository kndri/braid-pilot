"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SimplifiedWizardData } from "../../SimplifiedOnboardingWizard";
import { ChevronDown, ChevronRight, Edit2, Check, X, DollarSign, Pencil } from "lucide-react";

interface Props {
  data: SimplifiedWizardData;
  onNext: (data: Partial<SimplifiedWizardData>) => void;
  onBack: () => void;
}

export default function ReviewAndCustomizeScreen({ data, onNext, onBack }: Props) {
  const [expandedStyles, setExpandedStyles] = useState<Set<string>>(new Set());
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const [customAdjustments, setCustomAdjustments] = useState(data.customAdjustments);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPrice, setEditingPrice] = useState<{style: string, length: string, size: string, hairType: string} | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const saveBulkPricingConfigs = useMutation(api.pricing.saveBulkPricingConfigs);
  const saveSelectedStyles = useMutation(api.pricing.saveSelectedStyles);
  const updateSalonStandardHairType = useMutation(api.pricing.updateSalonStandardHairType);

  const toggleExpanded = (styleName: string) => {
    setExpandedStyles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(styleName)) {
        newSet.delete(styleName);
      } else {
        newSet.add(styleName);
      }
      return newSet;
    });
  };

  const startEditing = (styleName: string) => {
    setEditingStyle(styleName);
    if (!customAdjustments[styleName]) {
      // Initialize with universal adjustments
      setCustomAdjustments(prev => ({
        ...prev,
        [styleName]: {
          lengths: { ...data.universalAdjustments.lengths },
          sizes: { ...data.universalAdjustments.sizes }
        }
      }));
    }
  };

  const saveCustomization = (styleName: string) => {
    setEditingStyle(null);
  };

  const cancelCustomization = (styleName: string) => {
    setEditingStyle(null);
    // Remove customization if it wasn't previously saved
    if (!data.customAdjustments[styleName]) {
      setCustomAdjustments(prev => {
        const newAdjustments = { ...prev };
        delete newAdjustments[styleName];
        return newAdjustments;
      });
    }
  };

  const updateCustomAdjustment = (
    styleName: string,
    type: "lengths" | "sizes",
    key: string,
    value: number
  ) => {
    setCustomAdjustments(prev => ({
      ...prev,
      [styleName]: {
        ...prev[styleName],
        [type]: {
          ...prev[styleName]?.[type],
          [key]: value
        }
      }
    }));
  };

  const calculatePrice = (
    basePrice: number,
    length: string,
    size: string,
    hairType: string,
    styleName: string
  ) => {
    // Check if there's a manual override for this exact combination
    const overrideKey = `${styleName}-${length}-${size}-${hairType}`;
    if (customAdjustments[overrideKey]?.manualPrice !== undefined) {
      return customAdjustments[overrideKey].manualPrice;
    }
    
    const styleCustom = customAdjustments[styleName];
    const lengthAdj = styleCustom?.lengths?.[length] ?? data.universalAdjustments.lengths[length] ?? 0;
    const sizeAdj = styleCustom?.sizes?.[size] ?? data.universalAdjustments.sizes[size] ?? 0;
    const hairTypeAdj = data.universalAdjustments.hairTypes[hairType] ?? 0;
    
    return basePrice + lengthAdj + sizeAdj + hairTypeAdj;
  };

  const startEditingPrice = (style: string, length: string, size: string, hairType: string, currentPrice: number) => {
    setEditingPrice({ style, length, size, hairType });
    setTempPrice(currentPrice);
  };

  const saveManualPrice = () => {
    if (editingPrice) {
      const overrideKey = `${editingPrice.style}-${editingPrice.length}-${editingPrice.size}-${editingPrice.hairType}`;
      setCustomAdjustments(prev => ({
        ...prev,
        [overrideKey]: { manualPrice: tempPrice }
      }));
      setEditingPrice(null);
    }
  };

  const cancelEditingPrice = () => {
    setEditingPrice(null);
    setTempPrice(0);
  };

  const handleSaveAndComplete = async () => {
    setIsSaving(true);
    try {
      // Save selected styles
      await saveSelectedStyles({
        salonId: data.salonId,
        styles: data.selectedStyles.map(style => ({
          styleName: style.name,
          isCustom: style.isCustom
        }))
      });

      // Update standard hair type
      await updateSalonStandardHairType({
        salonId: data.salonId,
        standardHairType: "Synthetic"
      });

      // Prepare pricing configs
      const configs = [];
      
      for (const style of data.selectedStyles) {
        // Base price
        configs.push({
          styleName: style.name,
          adjustmentType: "base_price" as const,
          adjustmentLabel: "Base",
          adjustmentValue: style.basePrice
        });

        // Length adjustments
        const lengthAdjustments = customAdjustments[style.name]?.lengths || data.universalAdjustments.lengths;
        for (const [length, value] of Object.entries(lengthAdjustments)) {
          configs.push({
            styleName: style.name,
            adjustmentType: "length_adj" as const,
            adjustmentLabel: length,
            adjustmentValue: value
          });
        }

        // Size adjustments
        const sizeAdjustments = customAdjustments[style.name]?.sizes || data.universalAdjustments.sizes;
        for (const [size, value] of Object.entries(sizeAdjustments)) {
          configs.push({
            styleName: style.name,
            adjustmentType: "size_adj" as const,
            adjustmentLabel: size,
            adjustmentValue: value
          });
        }

        // Boho Knotless curly hair adjustment
        if (style.name === "Boho Knotless" && customAdjustments[style.name]?.curlyHair?.included) {
          configs.push({
            styleName: style.name,
            adjustmentType: "curly_hair_adj" as const,
            adjustmentLabel: "Curly Hair Pack",
            adjustmentValue: customAdjustments[style.name].curlyHair.costPerPack || 15
          });
        }
      }

      // Hair type adjustments (global)
      for (const [hairType, value] of Object.entries(data.universalAdjustments.hairTypes)) {
        if (hairType !== "Synthetic") {
          configs.push({
            styleName: "Global",
            adjustmentType: "hair_type_adj" as const,
            adjustmentLabel: hairType,
            adjustmentValue: value
          });
        }
      }

      // Save all configs
      await saveBulkPricingConfigs({
        salonId: data.salonId,
        configs
      });

      onNext({ customAdjustments });
    } catch (error) {
      console.error("Error saving pricing configuration:", error);
      alert("Failed to save pricing configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Step 3: Review & Customize
      </h2>
      <p className="text-gray-600 mb-6">
        Review your pricing structure. Hover over any price to edit it manually, or click the edit icon to customize style-specific adjustments.
      </p>

      {/* Pricing Summary */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-sm font-medium text-green-900 mb-2">Pricing Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-green-700">Total Styles:</span>
            <span className="ml-2 font-semibold text-green-900">{data.selectedStyles.length}</span>
          </div>
          <div>
            <span className="text-green-700">Price Range:</span>
            <span className="ml-2 font-semibold text-green-900">
              ${Math.min(...data.selectedStyles.map(s => s.basePrice))} - 
              ${Math.max(...data.selectedStyles.map(s => 
                calculatePrice(s.basePrice, "Waist-Length", "XL", "Virgin Hair", s.name)
              ))}
            </span>
          </div>
          <div>
            <span className="text-green-700">Avg Base Price:</span>
            <span className="ml-2 font-semibold text-green-900">
              ${Math.round(data.selectedStyles.reduce((acc, s) => acc + s.basePrice, 0) / data.selectedStyles.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Style Price Matrices */}
      <div className="space-y-4 mb-6">
        {data.selectedStyles.map((style) => {
          const isExpanded = expandedStyles.has(style.name);
          const isEditing = editingStyle === style.name;
          const hasCustomization = !!customAdjustments[style.name];
          
          return (
            <div key={style.name} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Style Header */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <button
                  onClick={() => toggleExpanded(style.name)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">{style.name}</span>
                  {hasCustomization && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Customized
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Base: <span className="font-semibold">${style.basePrice}</span>
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => startEditing(style.name)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4">
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Length Adjustments</h4>
                        <div className="space-y-2">
                          {Object.entries(data.universalAdjustments.lengths).map(([length, defaultValue]) => (
                            <div key={length} className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 w-24">{length}:</span>
                              <input
                                type="number"
                                value={customAdjustments[style.name]?.lengths?.[length] ?? defaultValue}
                                onChange={(e) => updateCustomAdjustment(
                                  style.name,
                                  "lengths",
                                  length,
                                  parseInt(e.target.value) || 0
                                )}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Size Adjustments</h4>
                        <div className="space-y-2">
                          {Object.entries(data.universalAdjustments.sizes).map(([size, defaultValue]) => (
                            <div key={size} className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 w-24">{size}:</span>
                              <input
                                type="number"
                                value={customAdjustments[style.name]?.sizes?.[size] ?? defaultValue}
                                onChange={(e) => updateCustomAdjustment(
                                  style.name,
                                  "sizes",
                                  size,
                                  parseInt(e.target.value) || 0
                                )}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveCustomization(style.name)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => cancelCustomization(style.name)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode - Price Matrix
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4 font-medium text-gray-700">Hair Type / Length</th>
                            {Object.keys(data.universalAdjustments.sizes).map(size => (
                              <th key={size} className="px-3 py-2 text-center font-medium text-gray-700">
                                {size}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(data.universalAdjustments.hairTypes).map(hairType => 
                            Object.keys(data.universalAdjustments.lengths).map(length => (
                              <tr key={`${hairType}-${length}`} className="border-b">
                                <td className="py-2 pr-4 text-left">
                                  <div className="font-medium text-gray-700">{hairType}</div>
                                  <div className="text-xs text-gray-500">{length}</div>
                                </td>
                                {Object.keys(data.universalAdjustments.sizes).map(size => {
                                  const price = calculatePrice(
                                    style.basePrice,
                                    length,
                                    size,
                                    hairType,
                                    style.name
                                  );
                                  const isEditingThis = editingPrice?.style === style.name && 
                                    editingPrice?.length === length && 
                                    editingPrice?.size === size && 
                                    editingPrice?.hairType === hairType;
                                  const hasOverride = customAdjustments[`${style.name}-${length}-${size}-${hairType}`]?.manualPrice !== undefined;
                                  
                                  return (
                                    <td key={size} className="px-3 py-2 text-center relative group">
                                      {isEditingThis ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <span className="text-gray-500">$</span>
                                          <input
                                            type="number"
                                            value={tempPrice}
                                            onChange={(e) => setTempPrice(parseInt(e.target.value) || 0)}
                                            className="w-16 px-1 py-0.5 border border-orange-500 rounded text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            autoFocus
                                          />
                                          <button
                                            onClick={saveManualPrice}
                                            className="p-0.5 text-green-600 hover:text-green-700"
                                          >
                                            <Check className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={cancelEditingPrice}
                                            className="p-0.5 text-red-600 hover:text-red-700"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <span className={`font-semibold ${hasOverride ? 'text-purple-700' : 'text-gray-900'}`}>
                                            ${price}
                                          </span>
                                          <button
                                            onClick={() => startEditingPrice(style.name, length, size, hairType, price)}
                                            className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                                          >
                                            <Pencil className="w-3 h-3 text-gray-500" />
                                          </button>
                                          {hasOverride && (
                                            <div className="absolute -top-1 -right-1">
                                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Note */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg flex items-start gap-2">
        <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium mb-1">Pricing Flexibility</p>
          <p>You can always adjust individual prices later from your dashboard settings.</p>
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
          onClick={handleSaveAndComplete}
          disabled={isSaving}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isSaving
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          {isSaving ? "Saving..." : "Save & Complete"}
        </button>
      </div>
    </div>
  );
}

// Add React import for Fragment
import React from "react";