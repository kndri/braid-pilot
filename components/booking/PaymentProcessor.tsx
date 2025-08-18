'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface PaymentProcessorProps {
  bookingId: Id<"bookings">;
  amount: number; // The booking fee amount to be paid now
  serviceTotal?: number; // The total service price (for display)
  onSuccess: () => void;
  onFailure: () => void;
}

export function PaymentProcessor({ bookingId, amount, serviceTotal, onSuccess, onFailure }: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const confirmBooking = useMutation(api.booking.confirmBooking);
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
    }
    
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would integrate with Stripe
      // For now, we'll generate a mock payment ID
      const mockPaymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Confirm the booking with the payment ID
      await confirmBooking({
        bookingId,
        stripePaymentIntentId: mockPaymentId,
      });
      
      onSuccess();
    } catch (error) {
      setErrors({ submit: 'Payment failed. Please try again.' });
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bg-white rounded-md  border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-4">Complete Your Booking</h3>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Service Price:</span>
          <span className="font-medium">${(serviceTotal || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Due at Appointment:</span>
          <span className="text-sm text-gray-500">${(serviceTotal || 0).toFixed(2)}</span>
        </div>
        <div className="pt-2 mt-2 border-t border-blue-100">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-gray-900">Booking Fee (Due Now):</span>
            <span className="text-xl font-bold text-blue-600">${amount.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This booking fee secures your appointment and is non-refundable.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-500 mb-1">
            Cardholder Name
          </label>
          <input
            id="cardholderName"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className={`
              text-black w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent
              ${errors.cardholderName ? 'border-red-500' : 'border-gray-100'}
            `}
            placeholder="John Doe"
            disabled={isProcessing}
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-500 mb-1">
            Card Number
          </label>
          <input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className={`
              text-black w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent
              ${errors.cardNumber ? 'border-red-500' : 'border-gray-100'}
            `}
            placeholder="1234 5678 9012 3456"
            disabled={isProcessing}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-500 mb-1">
              Expiry Date
            </label>
            <input
              id="expiryDate"
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              maxLength={5}
              className={`
                text-black w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent
                ${errors.expiryDate ? 'border-red-500' : 'border-gray-100'}
              `}
              placeholder="MM/YY"
              disabled={isProcessing}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-500 mb-1">
              CVV
            </label>
            <input
              id="cvv"
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              maxLength={4}
              className={`
                text-black w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent
                ${errors.cvv ? 'border-red-500' : 'border-gray-100'}
              `}
              placeholder="123"
              disabled={isProcessing}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>
        
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
        
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
          
          <button
            type="button"
            onClick={onFailure}
            className="w-full px-4 py-3 border border-gray-100 text-gray-500 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure payment powered by Stripe</span>
        </div>
      </form>
    </div>
  );
}