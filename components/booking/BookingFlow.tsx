'use client';

import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { BookingCalendar } from './BookingCalendar';
import { BookingForm } from './BookingForm';
import { PaymentProcessor } from './PaymentProcessor';

interface BookingFlowProps {
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

export function BookingFlow({ salonId, salonName, serviceDetails, onComplete }: BookingFlowProps) {
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
    setCurrentStep('payment');
  };
  
  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    if (onComplete) {
      setTimeout(onComplete, 3000);
    }
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
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Appointment</h2>
        <p className="text-gray-500">Complete your booking with {salonName}</p>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${currentStep === 'calendar' ? 'text-orange-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === 'calendar' ? 'bg-orange-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Select Time</span>
          </div>
          
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-full bg-orange-600 transition-all duration-300 ${
              currentStep === 'calendar' ? 'w-0' : currentStep === 'form' ? 'w-1/3' : currentStep === 'payment' ? 'w-2/3' : 'w-full'
            }`}></div>
          </div>
          
          <div className={`flex items-center ${
            ['form', 'payment', 'success'].includes(currentStep) ? 'text-orange-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['form', 'payment', 'success'].includes(currentStep) ? 'bg-orange-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Your Details</span>
          </div>
          
          <div className="flex-1 h-1 bg-gray-200 mx-4">
            <div className={`h-full bg-orange-600 transition-all duration-300 ${
              currentStep === 'payment' || currentStep === 'success' ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          
          <div className={`flex items-center ${
            ['payment', 'success'].includes(currentStep) ? 'text-orange-600' : 'text-gray-400'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              ['payment', 'success'].includes(currentStep) ? 'bg-orange-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>
      </div>
      
      {currentStep === 'calendar' && (
        <BookingCalendar
          salonId={salonId}
          onSlotSelect={handleSlotSelect}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      )}
      
      {currentStep === 'form' && (
        <BookingForm
          salonId={salonId}
          serviceDetails={serviceDetails}
          appointmentDate={selectedDate}
          appointmentTime={selectedTime}
          onSuccess={handleBookingCreated}
          onCancel={goBackToCalendar}
        />
      )}
      
      {currentStep === 'payment' && bookingId && (
        <PaymentProcessor
          bookingId={bookingId}
          amount={5} // Only $5 platform booking fee is charged at booking time
          serviceTotal={serviceDetails.finalPrice} // Show the full service price for clarity
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
      
      {currentStep === 'success' && (
        <div className="bg-white rounded-md  border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-500 mb-6">
            Your appointment has been successfully booked.
          </p>
          
          <div className="bg-gray-50 rounded-md p-6 text-left max-w-md mx-auto">
            <h4 className="font-semibold text-gray-900 mb-3">Appointment Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Style:</span>
                <span className="font-medium">{serviceDetails.style}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="font-medium">{formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500">Service Price:</span>
                <span className="font-medium">${serviceDetails.finalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Fee Paid:</span>
                <span className="font-bold text-green-600">$5.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due at Appointment:</span>
                <span className="font-bold text-orange-600">${serviceDetails.finalPrice}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            A confirmation email has been sent to your email address.
          </p>
        </div>
      )}
    </div>
  );
}