// lib/messaging/smsMessaging.ts
// Centralized SMS messaging service for multi-tenant SaaS platform

interface SMSData {
  salonId: string;
  salonName: string;
  recipientPhone: string;
  recipientName: string;
  reviewUrl: string;
  includeIncentive?: boolean;
  incentiveText?: string;
}

export class PlatformSMSService {
  /**
   * Send SMS on behalf of salon using platform's Twilio account
   */
  static async sendReviewSMS(data: SMSData) {
    try {
      // Build SMS message
      const message = this.buildSMSMessage(data);
      
      // Validate phone number format
      const formattedPhone = this.formatPhoneNumber(data.recipientPhone);
      
      // Send via Twilio API
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: formattedPhone,
            From: process.env.TWILIO_PHONE_NUMBER || "",
            Body: message,
            // Use messaging service for better deliverability
            MessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || "",
            // Webhook for delivery status
            StatusCallback: `${process.env.API_URL}/webhooks/twilio/status`,
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio SMS error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        messageId: result.sid,
        to: result.to,
        status: result.status,
      };
    } catch (error) {
      console.error('SMS send failed:', error);
      throw error;
    }
  }
  
  /**
   * Build SMS message content
   */
  private static buildSMSMessage(data: SMSData): string {
    let message = `Hi ${data.recipientName}! Thanks for visiting ${data.salonName}. `;
    message += `We'd love your feedback! `;
    
    // Add incentive if configured
    if (data.includeIncentive && data.incentiveText) {
      message += `${data.incentiveText} when you leave a review. `;
    }
    
    // Add review link
    message += `Review us here: ${data.reviewUrl}\n\n`;
    
    // Add opt-out notice (required for compliance)
    message += `Reply STOP to opt-out.`;
    
    // Check message length (SMS limit is 160 characters for single segment)
    if (message.length > 160) {
      console.warn(`SMS message is ${message.length} characters (will be sent as multi-part)`);
    }
    
    return message;
  }
  
  /**
   * Format phone number to E.164 format
   */
  private static formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming US)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    // Add + prefix for E.164 format
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    // Validate format
    if (!/^\+1\d{10}$/.test(cleaned)) {
      throw new Error(`Invalid phone number format: ${phone}`);
    }
    
    return cleaned;
  }
  
  /**
   * Send test SMS for setup verification
   */
  static async sendTestSMS(phone: string, salonName: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const testData: SMSData = {
        salonId: 'test',
        salonName,
        recipientPhone: phone,
        recipientName: 'Test Customer',
        reviewUrl: 'https://g.page/test-review',
        includeIncentive: true,
        incentiveText: '10% off your next visit',
      };
      
      const result = await this.sendReviewSMS(testData);
      
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Test SMS failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Handle SMS opt-out webhook from Twilio
   */
  static async handleOptOut(phone: string): Promise<void> {
    // This would be called by Twilio webhook when someone replies STOP
    // The actual implementation would update the database
    console.log(`Opt-out request received for: ${phone}`);
  }
  
  /**
   * Check SMS delivery status
   */
  static async checkDeliveryStatus(messageId: string): Promise<{
    status: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages/${messageId}.json`,
        {
          method: "GET",
          headers: {
            "Authorization": `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get message status: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        status: data.status,
        errorCode: data.error_code,
        errorMessage: data.error_message,
      };
    } catch (error) {
      console.error('Failed to check delivery status:', error);
      throw error;
    }
  }
  
  /**
   * Calculate SMS cost for billing
   */
  static calculateSMSCost(messageCount: number): number {
    const SMS_COST = 0.0075; // $0.0075 per SMS in US
    return messageCount * SMS_COST;
  }
  
  /**
   * Validate review URL
   */
  static validateReviewUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      
      // Check for valid review platforms
      const validDomains = [
        'google.com',
        'g.page',
        'yelp.com',
        'facebook.com',
        'maps.google.com',
      ];
      
      return validDomains.some(domain => parsed.hostname.includes(domain));
    } catch {
      return false;
    }
  }
}

// SMS templates for different scenarios
export const SMS_TEMPLATES = {
  reviewRequest: {
    default: (data: { clientName: string; salonName: string; reviewUrl: string }) =>
      `Hi ${data.clientName}! Thanks for visiting ${data.salonName}. We'd love your feedback! Review us here: ${data.reviewUrl}\n\nReply STOP to opt-out.`,
    
    withIncentive: (data: { clientName: string; salonName: string; reviewUrl: string; incentive: string }) =>
      `Hi ${data.clientName}! Thanks for visiting ${data.salonName}. ${data.incentive} when you leave a review: ${data.reviewUrl}\n\nReply STOP to opt-out.`,
  },
  
  reminder: {
    default: (data: { clientName: string; salonName: string; reviewUrl: string }) =>
      `Hi ${data.clientName}, we hope you loved your visit to ${data.salonName}! Quick reminder to share your experience: ${data.reviewUrl}\n\nReply STOP to opt-out.`,
  },
  
  thankYou: {
    default: (data: { clientName: string; salonName: string }) =>
      `Thank you ${data.clientName} for reviewing ${data.salonName}! We appreciate your feedback and look forward to seeing you again soon.\n\nReply STOP to opt-out.`,
  },
};

// Cost analysis for platform
export const SMS_PRICING = {
  // Platform costs (what we pay)
  twilioPerSMS: 0.0075, // US rate
  twilioPhoneNumber: 1.00, // per month
  
  // What we could charge salons (examples)
  includedInPlans: {
    starter: 50, // SMS per month
    professional: 200,
    unlimited: Infinity,
  },
  
  // Overage charges (if implementing)
  overagePerSMS: 0.05, // $0.05 per SMS over limit
  
  // Margin calculation
  calculateMargin: (smsCount: number, planPrice: number) => {
    const cost = smsCount * SMS_PRICING.twilioPerSMS;
    const margin = ((planPrice - cost) / planPrice) * 100;
    return {
      cost,
      revenue: planPrice,
      margin: margin.toFixed(1),
    };
  },
};