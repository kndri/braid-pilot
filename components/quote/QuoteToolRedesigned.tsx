'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BookingFlowRedesigned } from '../booking/BookingFlowRedesigned';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent, ANALYTICS_EVENTS, trackFunnelStep } from '@/lib/analytics';
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft,
  Star,
  ArrowRight,
  Check,
  X,
  Scissors,
  Ruler,
  Heart,
  Zap,
  TrendingUp,
  Calendar,
  Phone,
  MessageCircle
} from 'lucide-react';

interface QuoteToolRedesignedProps {
  token: string;
}

type Step = 'welcome' | 'style' | 'size' | 'length' | 'hairType' | 'extras' | 'summary';

const STEP_TITLES: Record<Step, string> = {
  welcome: 'Welcome',
  style: 'Choose Your Style',
  size: 'Select Braid Size',
  length: 'Pick Your Length',
  hairType: 'Hair Type',
  extras: 'Add-ons & Extras',
  summary: 'Your Custom Quote'
};

const STEP_ICONS: Record<Step, any> = {
  welcome: Sparkles,
  style: Scissors,
  size: TrendingUp,
  length: Ruler,
  hairType: Heart,
  extras: Zap,
  summary: Star
};

// Visual card component for selections
function SelectionCard({ 
  option, 
  selected, 
  onClick, 
  description, 
  popular = false,
  price = null,
  image = null 
}: { 
  option: string; 
  selected: boolean; 
  onClick: () => void; 
  description?: string;
  popular?: boolean;
  price?: number | null;
  image?: string | null;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-5 rounded-lg border transition-all text-left w-full ${
        selected 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {popular && (
        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-md">
          Popular
        </div>
      )}
      
      {image && (
        <div className="w-full h-28 mb-3 rounded-md bg-purple-50 flex items-center justify-center">
          <Scissors className="w-10 h-10 text-purple-500" />
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-base text-gray-900 mb-1">{option}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {price !== null && (
            <p className="text-sm font-medium text-purple-600 mt-2">
              Starting at ${price}
            </p>
          )}
        </div>
        
        <div className={`ml-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
          selected 
            ? 'border-purple-500 bg-purple-500' 
            : 'border-gray-300'
        }`}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
    </motion.button>
  );
}

export function QuoteToolRedesigned({ token }: QuoteToolRedesignedProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
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

  // Style descriptions for better UX
  const styleDescriptions: Record<string, string> = {
    'Knotless': 'Natural-looking braids without the knot at the root',
    'Box Braids': 'Classic square-parted braids, timeless and versatile',
    'Goddess Braids': 'Thick, raised braids perfect for elegant updos',
    'Boho Knotless': 'Free-spirited style with curly ends',
    'Spring Twist': 'Bouncy, textured twists with a natural curl pattern',
    'Passion Twist': 'Bohemian-inspired twists with a carefree vibe'
  };

  const sizeDescriptions: Record<string, string> = {
    'Small': 'Delicate and detailed, more braids for a fuller look',
    'Medium': 'Perfect balance of style and manageability',
    'Large': 'Bold statement braids, quicker to install',
    'Jumbo': 'Extra large braids for maximum impact'
  };

  const lengthDescriptions: Record<string, string> = {
    'Shoulder Length': 'Practical and easy to style daily',
    'Mid Back': 'Versatile length for various styles',
    'Waist': 'Dramatic length for a stunning look',
    'Butt Length': 'Extra long for maximum styling options'
  };

  const hairTypeDescriptions: Record<string, string> = {
    'Xpression': 'Premium synthetic hair, lightweight and affordable',
    'Human Hair': 'Natural hair for the most realistic look and feel'
  };

  // Navigation functions
  const goToNextStep = () => {
    const steps: Step[] = ['welcome', 'style', 'size', 'length', 'hairType', 'extras', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const steps: Step[] = ['welcome', 'style', 'size', 'length', 'hairType', 'extras', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome': return true;
      case 'style': return !!selectedStyle;
      case 'size': return !!selectedSize;
      case 'length': return !!selectedLength;
      case 'hairType': return !!selectedHairType;
      case 'extras': return true;
      case 'summary': return true;
      default: return false;
    }
  };

  const handleBookNow = () => {
    setShowBookingFlow(true);
  };

  const handleBookingComplete = () => {
    // Keep user on success screen - don't redirect back
    // User can close tab when ready
  };

  // Loading state
  if (pricingData === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg border border-gray-200 p-6 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-purple-50 rounded-full mx-auto mb-3 animate-pulse"></div>
          <p className="text-gray-700 font-medium">Loading your style journey...</p>
        </motion.div>
      </div>
    );
  }

  // Error states
  if (!pricingData || !pricingData.isActive) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg border border-gray-200 p-6 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full mx-auto mb-3 flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {pricingData?.salonName || 'Salon Not Found'}
          </h2>
          <p className="text-gray-600">
            {pricingData?.message || 'This pricing tool link is invalid or has expired.'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Booking flow
  if (showBookingFlow && priceCalculation && pricingData) {
    return (
      <BookingFlowRedesigned
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
    );
  }

  const StepIcon = STEP_ICONS[currentStep];
  const showCurlyHairOption = selectedStyle === "Boho Knotless";

  // Calculate progress
  const steps: Step[] = ['welcome', 'style', 'size', 'length', 'hairType', 'extras', 'summary'];
  const progress = ((steps.indexOf(currentStep) + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="h-1 bg-gray-100">
          <motion.div
            className="h-full bg-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 pt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-50 rounded-full mb-3">
            <StepIcon className="w-7 h-7 text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
            {pricingData.salonName}
          </h1>
          <p className="text-gray-500 text-base">
            {STEP_TITLES[currentStep]}
          </p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Welcome Step */}
              {currentStep === 'welcome' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6"
                >
                  <div className="w-24 h-24 mx-auto bg-purple-50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Welcome to Your Style Journey! ✨
                  </h2>
                  <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                    Let's create your perfect braided look. In just a few steps, you'll get an instant quote 
                    tailored to your style preferences. Ready to transform your hair?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-gray-50 border border-gray-100 rounded-md p-5">
                      <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900">Quick & Easy</h3>
                      <p className="text-sm text-gray-500 mt-1">Get your quote in under 2 minutes</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-md p-5">
                      <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900">Transparent Pricing</h3>
                      <p className="text-sm text-gray-500 mt-1">No hidden fees or surprises</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-md p-5">
                      <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900">Book Instantly</h3>
                      <p className="text-sm text-gray-500 mt-1">Secure your appointment today</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Style Selection */}
              {currentStep === 'style' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Which style speaks to you?
                    </h2>
                    <p className="text-gray-500">Choose the perfect braiding style for your personality</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pricingData.styles?.map((style: any) => (
                      <SelectionCard
                        key={style.name}
                        option={style.name}
                        description={styleDescriptions[style.name]}
                        selected={selectedStyle === style.name}
                        onClick={() => setSelectedStyle(style.name)}
                        popular={style.name === 'Knotless'}
                        price={style.basePrice}
                        image="style"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Size Selection */}
              {currentStep === 'size' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      How bold do you want to go?
                    </h2>
                    <p className="text-gray-500">Select your preferred braid size</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pricingData.availableSizes?.map((size: string) => (
                      <SelectionCard
                        key={size}
                        option={size}
                        description={sizeDescriptions[size]}
                        selected={selectedSize === size}
                        onClick={() => setSelectedSize(size)}
                        popular={size === 'Medium'}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Length Selection */}
              {currentStep === 'length' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      How long do you like it?
                    </h2>
                    <p className="text-gray-500">Choose your ideal braid length</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pricingData.availableLengths?.map((length: string) => (
                      <SelectionCard
                        key={length}
                        option={length}
                        description={lengthDescriptions[length]}
                        selected={selectedLength === length}
                        onClick={() => setSelectedLength(length)}
                        popular={length === 'Mid Back'}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Hair Type Selection */}
              {currentStep === 'hairType' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Select your hair type
                    </h2>
                    <p className="text-gray-500">Choose the hair material for your braids</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pricingData.availableHairTypes?.map((type: string) => (
                      <SelectionCard
                        key={type}
                        option={type}
                        description={hairTypeDescriptions[type]}
                        selected={selectedHairType === type}
                        onClick={() => setSelectedHairType(type)}
                        popular={type === 'Xpression'}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Extras Step */}
              {currentStep === 'extras' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      Any special touches?
                    </h2>
                    <p className="text-gray-500">Customize your style with these add-ons</p>
                  </div>
                  
                  {showCurlyHairOption && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-6"
                    >
                      <label className="flex items-start space-x-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeCurlyHair}
                          onChange={(e) => setIncludeCurlyHair(e.target.checked)}
                          className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">Add Curly Hair Ends</h3>
                          <p className="text-sm text-gray-500">
                            Give your Boho Knotless braids that signature wavy, carefree look with curly ends
                          </p>
                          <p className="text-sm font-semibold text-purple-600 mt-2">
                            +$40 to your total
                          </p>
                        </div>
                        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                          <Heart className="w-10 h-10 text-pink-500" />
                        </div>
                      </label>
                    </motion.div>
                  )}
                  
                  {!showCurlyHairOption && (
                    <div className="text-center py-8">
                      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="w-12 h-12 text-green-500" />
                      </div>
                      <p className="text-gray-500">No additional options available for your selected style</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Summary Step */}
              {currentStep === 'summary' && priceCalculation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-2">
                      Your Perfect Style is Ready! 🎉
                    </h2>
                    <p className="text-gray-500">Here's your personalized quote</p>
                  </div>
                  
                  {/* Quote Summary Card */}
                  <div className="bg-gray-800 border border-gray-200 rounded-lg p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-white/80 text-sm uppercase tracking-wider">Total Price</p>
                        <p className="text-5xl font-bold">${priceCalculation.totalPrice}</p>
                      </div>
                      <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                        <Star className="w-10 h-10 text-yellow-300" />
                      </div>
                    </div>
                    
                    <div className="space-y-3 border-t border-white/20 pt-6">
                      <div className="flex justify-between">
                        <span className="text-white/80">Style:</span>
                        <span className="font-medium">{selectedStyle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Size:</span>
                        <span className="font-medium">{selectedSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Length:</span>
                        <span className="font-medium">{selectedLength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Hair Type:</span>
                        <span className="font-medium">{selectedHairType}</span>
                      </div>
                      {includeCurlyHair && (
                        <div className="flex justify-between">
                          <span className="text-white/80">Curly Ends:</span>
                          <span className="font-medium">Yes (+$40)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBookNow}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg border border-gray-200 flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Book Now</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.location.href = `tel:${pricingData.salonPhone}`}
                      className="bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold py-4 px-8 rounded-lg border border-gray-200 flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call Salon</span>
                    </motion.button>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setCurrentStep('style');
                        setSelectedStyle(null);
                        setSelectedSize(null);
                        setSelectedLength(null);
                        setSelectedHairType(null);
                        setIncludeCurlyHair(false);
                      }}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      Start Over
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep !== 'summary' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200"
              >
                <button
                  onClick={goToPreviousStep}
                  disabled={currentStep === 'welcome'}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    currentStep === 'welcome'
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>

                <div className="flex space-x-2">
                  {steps.map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all ${
                        step === currentStep
                          ? 'w-8 bg-purple-600'
                          : steps.indexOf(step) < steps.indexOf(currentStep)
                          ? 'bg-purple-300'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: canProceed() ? 1.05 : 1 }}
                  whileTap={{ scale: canProceed() ? 0.95 : 1 }}
                  onClick={goToNextStep}
                  disabled={!canProceed()}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    canProceed()
                      ? 'bg-purple-600 hover:bg-purple-700 text-white border border-gray-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>{currentStep === 'extras' ? 'See Quote' : 'Next'}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Powered by{' '}
            <a href="https://braidpilot.com" className="text-purple-600 font-semibold hover:text-purple-700">
              BraidPilot
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}