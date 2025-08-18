'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

interface BookingFormRedesignedProps {
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
  appointmentDate: string;
  appointmentTime: string;
  onSuccess: (bookingId: Id<"bookings">) => void;
  onCancel: () => void;
}

export function BookingFormRedesigned({ 
  salonId,
  salonName,
  serviceDetails, 
  appointmentDate, 
  appointmentTime, 
  onSuccess,
  onCancel 
}: BookingFormRedesignedProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createBooking = useMutation(api.booking.createBooking);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const bookingId = await createBooking({
        salonId,
        clientDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        serviceDetails,
        appointmentDate,
        appointmentTime,
        notes: formData.notes || undefined,
      });
      
      const id = typeof bookingId === 'object' && 'bookingId' in bookingId 
        ? bookingId.bookingId 
        : bookingId;
      onSuccess(id);
    } catch (error) {
      console.error('Failed to create booking:', error);
      setErrors({ submit: 'Failed to create booking. Please try again.' });
      setIsSubmitting(false);
    }
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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Booking</h2>
        <p className="text-gray-500">Please provide your contact information to confirm your appointment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                Full Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`
                  w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  transition-all duration-200 text-gray-900
                  ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-100 hover:border-gray-100'}
                `}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                Email Address
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`
                  w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  transition-all duration-200 text-gray-900
                  ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-100 hover:border-gray-100'}
                `}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
            
            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                Phone Number
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`
                  w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  transition-all duration-200 text-gray-900
                  ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-100 hover:border-gray-100'}
                `}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.phone}
                </p>
              )}
            </div>
            
            {/* Notes Field */}
            <div>
              <label htmlFor="notes" className="flex items-center text-sm font-medium text-gray-500 mb-2">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                Special Requests or Notes
                <span className="text-gray-400 text-xs ml-2">(Optional)</span>
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  transition-all duration-200 hover:border-gray-100 text-gray-900"
                rows={4}
                placeholder="Any special requests or information for your stylist..."
                disabled={isSubmitting}
              />
            </div>
            
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.submit}
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-100 text-gray-500 rounded-md 
                  hover:bg-gray-50 transition-all duration-200 font-medium
                  flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Calendar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md 
                  hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed  hover:
                  flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Booking...' : 'Proceed to Payment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Appointment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Appointment Summary</h3>
            
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(appointmentDate)}</p>
                  <p className="text-sm text-gray-500">{formatTime(appointmentTime)}</p>
                </div>
              </div>
              
              {/* Service Details */}
              <div className="pt-4 border-t border-purple-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Service Details</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Style:</span>
                    <span className="font-medium text-gray-900">{serviceDetails.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium text-gray-900">{serviceDetails.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Length:</span>
                    <span className="font-medium text-gray-900">{serviceDetails.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hair Type:</span>
                    <span className="font-medium text-gray-900">{serviceDetails.hairType}</span>
                  </div>
                  {serviceDetails.includeCurlyHair && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Add-on:</span>
                      <span className="font-medium text-purple-600">Curly Hair Ends</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="pt-4 border-t border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Service Total:</span>
                  <span className="text-2xl font-bold text-gray-900">${serviceDetails.finalPrice}</span>
                </div>
                <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> You'll pay a $5 booking fee next to secure your appointment. 
                    The remaining ${serviceDetails.finalPrice} is paid at the salon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}