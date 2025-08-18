'use client';

import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { BookingCalendar } from './BookingCalendar';
import { BookingFormRedesigned } from './BookingFormRedesigned';
import { PaymentProcessor } from './PaymentProcessor';
import { PaymentProcessorStripe } from './PaymentProcessorStripe';
import { config } from '@/lib/config';
import { 
  Calendar, 
  User, 
  CreditCard, 
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Scissors,
  Ruler,
  Star,
  Info,
  Download,
  Plus
} from 'lucide-react';

interface BookingFlowRedesignedProps {
  salonId: Id<"salons">;
  salonName: string;
  serviceDetails: {
    style: string;
    size: string;
    length: string;
    hairType: string;
    includeCurlyHair?: boolean;
    finalPrice: number;
  };
  onComplete?: () => void;
}

type Step = 'calendar' | 'form' | 'payment' | 'success';

const STEP_DATA = [
  { id: 'calendar', label: 'Select Time', icon: Calendar },
  { id: 'form', label: 'Your Details', icon: User },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

export function BookingFlowRedesigned({ 
  salonId, 
  salonName, 
  serviceDetails, 
  onComplete 
}: BookingFlowRedesignedProps) {
  const [currentStep, setCurrentStep] = useState<Step>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingId, setBookingId] = useState<Id<"bookings"> | null>(null);
  
  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep('form');
  };
  
  const handleBookingCreated = (newBookingId: Id<"bookings">) => {
    setBookingId(newBookingId);
    
    // Skip payment if disabled
    if (!config.payment.enabled) {
      setCurrentStep('success');
      if (onComplete) {
        setTimeout(onComplete, 3000);
      }
    } else {
      setCurrentStep('payment');
    }
  };
  
  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    // Don't auto-redirect - let user stay on success screen
  };
  
  const handlePaymentFailure = () => {
    setCurrentStep('form');
  };
  
  const goBackToCalendar = () => {
    setCurrentStep('calendar');
    setSelectedDate('');
    setSelectedTime('');
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate calendar event details
  const generateCalendarEvent = () => {
    const startDate = new Date(`${selectedDate}T${selectedTime}`);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // Assume 3 hour appointment
    
    const eventDetails = {
      title: `Hair Appointment - ${serviceDetails.style}`,
      details: `Service: ${serviceDetails.style}\\nSize: ${serviceDetails.size}\\nLength: ${serviceDetails.length}\\nPrice: $${serviceDetails.finalPrice}\\n\\nSalon: ${salonName}`,
      location: salonName,
      startDate: startDate.toISOString().replace(/-|:|\.\d\d\d/g, ''),
      endDate: endDate.toISOString().replace(/-|:|\.\d\d\d/g, '')
    };
    
    return eventDetails;
  };

  const addToGoogleCalendar = () => {
    const event = generateCalendarEvent();
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.startDate}/${event.endDate}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;
    window.open(url, '_blank');
  };

  const addToOutlookCalendar = () => {
    const event = generateCalendarEvent();
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${event.startDate}&enddt=${event.endDate}&body=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`;
    window.open(url, '_blank');
  };

  const addToAppleCalendar = () => {
    const startDate = new Date(`${selectedDate}T${selectedTime}`);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BraidPilot//Appointment//EN
BEGIN:VEVENT
UID:${Date.now()}@braidpilot.com
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')}
DTSTART:${startDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}
DTEND:${endDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}
SUMMARY:Hair Appointment - ${serviceDetails.style}
DESCRIPTION:Service: ${serviceDetails.style}\\nSize: ${serviceDetails.size}\\nLength: ${serviceDetails.length}\\nPrice: $${serviceDetails.finalPrice}
LOCATION:${salonName}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'appointment.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentStepIndex = STEP_DATA.findIndex(s => s.id === currentStep);
  const progressPercentage = currentStep === 'success' 
    ? 100 
    : ((currentStepIndex + 1) / STEP_DATA.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-2xl  border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Book Your Appointment</h1>
              <p className="text-gray-500 mt-1">Complete your booking with {salonName}</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-purple-50 rounded-md p-4">
                <Scissors className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Service Summary Card */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-md p-6 border border-purple-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Selected Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Style</p>
                    <p className="font-medium text-gray-900">{serviceDetails.style}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Size</p>
                    <p className="font-medium text-gray-900">{serviceDetails.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Length</p>
                    <p className="font-medium text-gray-900">{serviceDetails.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hair Type</p>
                    <p className="font-medium text-gray-900">{serviceDetails.hairType}</p>
                  </div>
                </div>
                {serviceDetails.includeCurlyHair && (
                  <div className="mt-3 inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                    <Star className="w-3 h-3 mr-1" />
                    Includes Curly Hair Ends
                  </div>
                )}
              </div>
              <div className="ml-6 text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Price</p>
                <p className="text-3xl font-bold text-gray-900">${serviceDetails.finalPrice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl  border border-gray-100 p-6 mb-6">
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
            {/* Progress Bar Fill */}
            <div 
              className="absolute top-5 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {STEP_DATA.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStepIndex > index || currentStep === 'success';
                const isCurrent = step.id === currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 
                        isCurrent ? 'bg-purple-50 text-purple-600 ring-4 ring-purple-100' : 
                        'bg-gray-50 text-gray-400'}
                    `}>
                      {isCompleted && currentStep === 'success' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`
                      mt-2 text-sm font-medium
                      ${isCurrent ? 'text-purple-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}
                    `}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
              {/* Success Step */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${currentStep === 'success' ? 
                    'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-4 ring-green-100' : 
                    'bg-gray-50 text-gray-400'}
                `}>
                  <Check className="w-5 h-5" />
                </div>
                <span className={`
                  mt-2 text-sm font-medium
                  ${currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}
                `}>
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl  border border-gray-100 overflow-hidden">
          {currentStep === 'calendar' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Appointment Time</h2>
                <p className="text-gray-500">Select an available date and time slot that works best for you</p>
              </div>
              <BookingCalendar
                salonId={salonId}
                onSlotSelect={handleSlotSelect}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            </div>
          )}
          
          {currentStep === 'form' && (
            <BookingFormRedesigned
              salonId={salonId}
              salonName={salonName}
              serviceDetails={serviceDetails}
              appointmentDate={selectedDate}
              appointmentTime={selectedTime}
              onSuccess={handleBookingCreated}
              onCancel={goBackToCalendar}
            />
          )}
          
          {currentStep === 'payment' && bookingId && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h2>
                <p className="text-gray-500">Complete your booking with a small deposit</p>
              </div>
              
              {/* Payment Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Booking Deposit Information</p>
                    <p>You're only paying a $5 booking fee now to secure your appointment. The remaining service amount of ${serviceDetails.finalPrice} will be paid directly to your stylist at the salon.</p>
                  </div>
                </div>
              </div>
              
              <PaymentProcessor
                bookingId={bookingId}
                amount={5}
                serviceTotal={serviceDetails.finalPrice}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
            </div>
          )}
          
          {currentStep === 'success' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500">Your appointment has been successfully booked</p>
              </div>
              
              {/* Appointment Summary Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Appointment Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(selectedDate)} at {formatTime(selectedTime)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Scissors className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Service</p>
                        <p className="font-medium text-gray-900">{serviceDetails.style}</p>
                        <p className="text-sm text-gray-500">
                          {serviceDetails.size} • {serviceDetails.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-md p-4">
                      <p className="text-xs text-gray-500 mb-2">Payment Summary</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Service Price:</span>
                          <span className="font-medium">${serviceDetails.finalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Deposit Paid:</span>
                          <span className="font-medium text-green-600">$5.00</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex justify-between">
                          <span className="font-medium text-gray-900">Due at Salon:</span>
                          <span className="font-bold text-lg text-purple-600">${serviceDetails.finalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add to Calendar Section */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-md p-6 border border-purple-200 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Add to Your Calendar
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Don't forget your appointment! Add it to your calendar now.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={addToGoogleCalendar}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-500 rounded-md border border-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  
                  <button
                    onClick={addToOutlookCalendar}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-500 rounded-md border border-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#0078D4" d="M24 7.5v9.75c0 .83-.67 1.5-1.5 1.5H13.5v-6h4.5v-1.5h-4.5v-6h9c.83 0 1.5.67 1.5 1.5zm-12 0v4.5H7.5v-6h9v1.5H12zm0 6v6H1.5c-.83 0-1.5-.67-1.5-1.5V7.5c0-.83.67-1.5 1.5-1.5h9v7.5H12z"/>
                    </svg>
                    <span className="text-sm font-medium">Outlook</span>
                  </button>
                  
                  <button
                    onClick={addToAppleCalendar}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-500 rounded-md border border-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#000000" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span className="text-sm font-medium">Apple</span>
                  </button>
                </div>
              </div>

              {/* What's Next Section */}
              <div className="bg-purple-50 rounded-md p-6 border border-purple-100">
                <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>A confirmation email has been sent to your email address</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>You'll receive a reminder 24 hours before your appointment</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Please arrive 10 minutes early for your appointment</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Bring the remaining payment of ${serviceDetails.finalPrice} to pay at the salon</span>
                  </li>
                </ul>
              </div>
              
              {/* Success Message */}
              <div className="text-center mt-8 py-6 border-t border-gray-100">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  🎉 You're all set!
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  We're looking forward to seeing you at your appointment.
                </p>
                <p className="text-sm text-gray-500">
                  Need to make changes? Contact the salon at {' '}
                  <a href={`tel:${salonName}`} className="text-purple-600 hover:text-purple-700 font-medium">
                    (555) 123-4567
                  </a>
                </p>
                <p className="text-xs text-gray-400 mt-6">
                  You can safely close this window now
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}