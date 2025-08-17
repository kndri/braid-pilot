import { NextRequest, NextResponse } from 'next/server';

// Test SMS endpoint for E2E testing
export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    // Validate phone number
    if (!phone || !phone.match(/^\+1\d{10}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Get Twilio credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !fromNumber) {
      console.error('Twilio credentials not configured');
      return NextResponse.json(
        { success: false, error: 'SMS service not configured' },
        { status: 500 }
      );
    }
    
    // Prepare the message
    const smsMessage = message || `Test SMS from BraidPilot at ${new Date().toLocaleString()}`;
    
    // Send SMS via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: smsMessage,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio API error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to send SMS', details: errorText },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      messageId: result.sid,
      to: result.to,
      status: result.status,
      message: 'Test SMS sent successfully',
    });
    
  } catch (error) {
    console.error('SMS test error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}