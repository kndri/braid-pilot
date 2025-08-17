'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CallToActionProps {
  salonName: string;
  salonPhone?: string;
  price: number | null;
  isVisible: boolean;
  quoteDetails: {
    style: string;
    size: string;
    length: string;
    hairType: string;
  } | null;
  onBookNow?: () => void;
}

export function CallToAction({ 
  salonName, 
  salonPhone, 
  price, 
  isVisible, 
  quoteDetails,
  onBookNow
}: CallToActionProps) {
  const [copied, setCopied] = useState(false);
  
  if (!isVisible || !price || !quoteDetails) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const quoteMessage = `Hi ${salonName}! I got a quote from your price tool:
Style: ${quoteDetails.style}
Size: ${quoteDetails.size}
Length: ${quoteDetails.length}
Hair Type: ${quoteDetails.hairType}
Price: ${formatCurrency(price)}

I'd like to book an appointment.`;
  
  const whatsappUrl = salonPhone 
    ? `https://wa.me/${salonPhone.replace(/\D/g, '')}?text=${encodeURIComponent(quoteMessage)}`
    : null;
  
  const handleCopyQuote = async () => {
    try {
      await navigator.clipboard.writeText(quoteMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy quote:', err);
    }
  };
  
  return (
    <div className="animate-fadeIn mt-6 space-y-3">
      {onBookNow && (
        <button
          onClick={onBookNow}
          className="w-full flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Book Appointment
        </button>
      )}
      
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Message on WhatsApp
        </a>
      )}
      
      <button
        onClick={handleCopyQuote}
        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        {copied ? 'Quote Copied!' : 'Copy Quote Details'}
      </button>
    </div>
  );
}