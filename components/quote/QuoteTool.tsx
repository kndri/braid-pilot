'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SequentialDropdown } from './SequentialDropdown';
import { PriceDisplay } from './PriceDisplay';
import { CallToAction } from './CallToAction';
import { BookingFlow } from '../booking/BookingFlow';

interface QuoteToolProps {
  token: string;
}

export function QuoteTool({ token }: QuoteToolProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<string | null>(null);
  const [selectedHairType, setSelectedHairType] = useState<string | null>(null);
  const [includeCurlyHair, setIncludeCurlyHair] = useState(false);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  
  // Fetch pricing data
  const pricingData = useQuery(api.quote.getSalonPricingByToken, { token });
  
  // Calculate price when all selections are made
  const priceCalculation = useQuery(
    api.quote.calculateQuotePrice,
    selectedStyle && selectedSize && selectedLength && selectedHairType
      ? {
          token,
          styleName: selectedStyle,
          size: selectedSize,
          length: selectedLength,
          hairType: selectedHairType,
          includeCurlyHair,
        }
      : 'skip'
  );
  
  // Reset dependent selections when parent selection changes
  useEffect(() => {
    setSelectedSize(null);
    setSelectedLength(null);
    setSelectedHairType(null);
    setIncludeCurlyHair(false);
  }, [selectedStyle]);
  
  useEffect(() => {
    setSelectedLength(null);
    setSelectedHairType(null);
  }, [selectedSize]);
  
  useEffect(() => {
    setSelectedHairType(null);
  }, [selectedLength]);
  
  // Loading state
  if (pricingData === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">Loading price tool...</p>
        </div>
      </div>
    );
  }
  
  // Salon not found
  if (!pricingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Salon Not Found</h2>
          <p className="text-gray-600">This pricing tool link is invalid or has expired.</p>
        </div>
      </div>
    );
  }
  
  // Pricing not available
  if (!pricingData.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{pricingData.salonName}</h2>
          <p className="text-gray-600">{pricingData.message}</p>
        </div>
      </div>
    );
  }
  
  const selectedStyleData = pricingData.styles?.find((s: any) => s.name === selectedStyle);
  const showCurlyHairOption = selectedStyle === "Boho Knotless" && selectedStyleData?.curlyHairAdjustment;
  
  const handleBookNow = () => {
    setShowBookingFlow(true);
  };
  
  const handleBookingComplete = () => {
    setShowBookingFlow(false);
    // Reset selections
    setSelectedStyle(null);
    setSelectedSize(null);
    setSelectedLength(null);
    setSelectedHairType(null);
    setIncludeCurlyHair(false);
  };
  
  if (showBookingFlow && priceCalculation && pricingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-8 px-4">
        <BookingFlow
          salonId={pricingData.salonId}
          salonName={pricingData.salonName}
          serviceDetails={{
            style: selectedStyle!,
            size: selectedSize!,
            length: selectedLength!,
            hairType: selectedHairType!,
            includeCurlyHair,
            finalPrice: priceCalculation.totalPrice,
          }}
          onComplete={handleBookingComplete}
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {pricingData.salonName}
          </h1>
          <p className="text-gray-600">Get an instant quote for your braiding style</p>
        </div>
        
        {/* Quote Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
          {/* Style Selection */}
          <SequentialDropdown
            label="Select Your Style"
            options={pricingData.styles?.map((s: any) => s.name) || []}
            value={selectedStyle}
            onChange={setSelectedStyle}
            placeholder="Choose a braiding style"
            isVisible={true}
          />
          
          {/* Size Selection */}
          <SequentialDropdown
            label="Select Braid Size"
            options={pricingData.availableSizes || []}
            value={selectedSize}
            onChange={setSelectedSize}
            placeholder="Choose braid size"
            isVisible={!!selectedStyle}
          />
          
          {/* Length Selection */}
          <SequentialDropdown
            label="Select Braid Length"
            options={pricingData.availableLengths || []}
            value={selectedLength}
            onChange={setSelectedLength}
            placeholder="Choose braid length"
            isVisible={!!selectedSize}
          />
          
          {/* Hair Type Selection */}
          <SequentialDropdown
            label="Select Hair Type"
            options={pricingData.availableHairTypes || []}
            value={selectedHairType}
            onChange={setSelectedHairType}
            placeholder="Choose hair type"
            isVisible={!!selectedLength}
          />
          
          {/* Curly Hair Option for Boho Knotless */}
          {showCurlyHairOption && selectedHairType && (
            <div className="animate-fadeIn">
              <label className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCurlyHair}
                  onChange={(e) => setIncludeCurlyHair(e.target.checked)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Include Curly Hair</p>
                  <p className="text-sm text-gray-600">Add curly hair to your Boho Knotless braids</p>
                </div>
              </label>
            </div>
          )}
          
          {/* Price Display */}
          <PriceDisplay
            price={priceCalculation?.totalPrice || null}
            isVisible={!!selectedHairType}
            isCalculating={priceCalculation === undefined && !!selectedHairType}
          />
          
          {/* Call to Action */}
          <CallToAction
            salonName={pricingData.salonName}
            salonPhone={pricingData.salonPhone}
            price={priceCalculation?.totalPrice || null}
            isVisible={!!priceCalculation?.totalPrice}
            quoteDetails={
              priceCalculation
                ? {
                    style: selectedStyle!,
                    size: selectedSize!,
                    length: selectedLength!,
                    hairType: selectedHairType!,
                  }
                : null
            }
            onBookNow={handleBookNow}
          />
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <a href="https://braidpilot.com" className="text-orange-500 hover:text-orange-600">
              BraidPilot
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}