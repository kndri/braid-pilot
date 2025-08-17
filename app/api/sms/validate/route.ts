import { NextRequest, NextResponse } from 'next/server';

// Validate phone number format
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    // Remove all non-numeric characters
    const cleaned = (phone || '').replace(/\D/g, '');
    
    // Check if it's a valid US phone number
    // Should be 10 digits (without country code) or 11 digits (with country code 1)
    const isValid = /^1?\d{10}$/.test(cleaned);
    
    // Format to E.164 if valid
    let formatted = '';
    if (isValid) {
      if (cleaned.length === 10) {
        formatted = `+1${cleaned}`;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        formatted = `+${cleaned}`;
      }
    }
    
    return NextResponse.json({
      valid: isValid,
      formatted: formatted || null,
      original: phone,
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}