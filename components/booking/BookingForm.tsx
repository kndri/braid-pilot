'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface BookingFormProps {
  salonId: Id<"salons">;
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

export function BookingForm({ 
  salonId, 
  serviceDetails, 
  appointmentDate, 
  appointmentTime, 
  onSuccess,
  onCancel 
}: BookingFormProps) {
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
      
      // Extract just the bookingId from the response
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Complete Your Booking</h3>
      
      <div className="mb-6 p-4 bg-orange-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">Style:</span> {serviceDetails.style}</p>
          <p><span className="font-medium">Size:</span> {serviceDetails.size}</p>
          <p><span className="font-medium">Length:</span> {serviceDetails.length}</p>
          <p><span className="font-medium">Hair Type:</span> {serviceDetails.hairType}</p>
          {serviceDetails.includeCurlyHair && (
            <p><span className="font-medium">Includes:</span> Curly Hair</p>
          )}
          <p className="pt-2 border-t border-orange-100">
            <span className="font-medium">Date:</span> {formatDate(appointmentDate)}
          </p>
          <p><span className="font-medium">Time:</span> {formatTime(appointmentTime)}</p>
          <p className="pt-2 border-t border-orange-100">
            <span className="font-medium text-lg">Total Price:</span>{' '}
            <span className="text-lg font-bold text-orange-600">${serviceDetails.finalPrice}</span>
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`
              text-black w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent
              ${errors.name ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`
              text-black w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent
              ${errors.email ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="your@email.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`
              text-black w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent
              ${errors.phone ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="(555) 123-4567"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests or Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            placeholder="Any special requests or information for your stylist..."
            disabled={isSubmitting}
          />
        </div>
        
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
        
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Booking...' : 'Proceed to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}