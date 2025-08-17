// lib/messaging/centralizedMessaging.ts
// Centralized messaging service for multi-tenant SaaS platform

interface EmailData {
  salonId: string;
  salonName: string;
  recipientEmail: string;
  recipientName: string;
  templateType: 'review_request' | 'follow_up' | 'thank_you';
  reviewUrls: {
    google?: string;
    yelp?: string;
    facebook?: string;
  };
  customData?: Record<string, any>;
  salonSettings?: any;
}

interface SMSData {
  salonId: string;
  salonName: string;
  recipientPhone: string;
  recipientName: string;
  reviewUrl: string;
}

export class PlatformMessagingService {
  /**
   * Send email on behalf of a salon
   * Uses platform's SendGrid but appears from salon
   */
  static async sendEmail(data: EmailData) {
    try {
      // Build email with salon branding but platform sender
      const msg = {
        to: data.recipientEmail,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'reviews@braidpilot.com', // Platform email
          name: `${data.salonName} (via BraidPilot)`, // Shows salon name
        },
        replyTo: data.salonSettings?.replyToEmail || process.env.PLATFORM_SUPPORT_EMAIL,
        subject: this.buildSubject(data.templateType, data.salonName, data.recipientName),
        html: this.buildEmailHtml(data),
        text: this.buildEmailText(data),
        // Track opens and clicks
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
        // Custom args for webhook processing
        customArgs: {
          salonId: data.salonId,
          type: 'review_request',
          platform: 'braidpilot',
        },
      };
      
      // Send via SendGrid API
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msg)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendGrid API error: ${response.statusText} - ${errorText}`);
      }
      
      return {
        success: true,
        messageId: response.headers.get('x-message-id'),
      };
    } catch (error) {
      console.error('Email send failed:', error);
      throw error;
    }
  }
  
  /**
   * Send SMS on behalf of salon
   * Uses platform's Twilio but identifies salon
   */
  static async sendSMS(data: SMSData) {
    try {
      const message = `Hi ${data.recipientName}! Thanks for visiting ${data.salonName}. ` +
        `We'd love your feedback: ${data.reviewUrl}\n\n` +
        `Reply STOP to opt-out.\n` +
        `- BraidPilot`;
      
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
            To: data.recipientPhone,
            From: process.env.TWILIO_PHONE_NUMBER || "",
            Body: message,
            MessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || "",
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
      };
    } catch (error) {
      console.error('SMS send failed:', error);
      throw error;
    }
  }
  
  /**
   * Build email subject based on template type
   */
  private static buildSubject(templateType: string, salonName: string, recipientName: string): string {
    switch (templateType) {
      case 'review_request':
        return `${recipientName}, how was your experience at ${salonName}?`;
      case 'follow_up':
        return `We miss you at ${salonName}!`;
      case 'thank_you':
        return `Thank you for your review, ${recipientName}!`;
      default:
        return `Message from ${salonName}`;
    }
  }
  
  /**
   * Build email HTML with platform + salon branding
   */
  private static buildEmailHtml(data: EmailData): string {
    const { salonName, recipientName, reviewUrls, salonSettings } = data;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Professional email styles */
          .container { max-width: 600px; margin: 0 auto; font-family: -apple-system, sans-serif; }
          .header { background: ${salonSettings?.brandColor || '#6B46C1'}; color: white; padding: 30px; text-align: center; }
          .logo { max-width: 150px; margin-bottom: 20px; }
          .content { padding: 30px; background: white; }
          .button { display: inline-block; padding: 14px 28px; margin: 10px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .button-google { background: #4285F4; color: white; }
          .button-yelp { background: #D32323; color: white; }
          .button-facebook { background: #1877F2; color: white; }
          .footer { padding: 20px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; }
          .platform-badge { margin-top: 20px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${salonSettings?.customLogo ? 
              `<img src="${salonSettings.customLogo}" alt="${salonName}" class="logo" />` :
              `<h1>${salonName}</h1>`
            }
            <p style="margin: 0; opacity: 0.9;">Thank you for your visit!</p>
          </div>
          
          <div class="content">
            <p>Hi ${recipientName},</p>
            
            <p>We hope you loved your new look! Your experience matters to us, and we'd be grateful if you could share your feedback.</p>
            
            <p><strong>It only takes 30 seconds, and your review helps other clients discover our services.</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              ${reviewUrls.google ? 
                `<a href="${reviewUrls.google}" class="button button-google">Review on Google</a>` : ''
              }
              ${reviewUrls.yelp ? 
                `<a href="${reviewUrls.yelp}" class="button button-yelp">Review on Yelp</a>` : ''
              }
              ${reviewUrls.facebook ? 
                `<a href="${reviewUrls.facebook}" class="button button-facebook">Review on Facebook</a>` : ''
              }
            </div>
            
            ${salonSettings?.includeIncentive ? 
              `<div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
                <strong>🎁 Special Thank You:</strong> ${salonSettings.incentiveText || 'Leave a review and get 10% off your next visit!'}
              </div>` : ''
            }
            
            <p>Thank you for choosing ${salonName}!</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The ${salonName} Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>
              ${salonSettings?.replyToEmail ? 
                `Questions? Reply to this email or contact us at ${salonSettings.replyToEmail}` :
                `Questions? Contact ${salonName} through BraidPilot`
              }
            </p>
            
            <div class="platform-badge">
              <p style="margin: 5px 0;">Powered by <a href="https://braidpilot.com" style="color: #6B46C1; text-decoration: none; font-weight: 600;">BraidPilot</a></p>
              <p style="margin: 5px 0; color: #9CA3AF;">
                Professional salon management platform<br>
                <a href="{{{unsubscribe}}}" style="color: #9CA3AF;">Unsubscribe</a> | 
                <a href="https://braidpilot.com/privacy" style="color: #9CA3AF;">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Build plain text email content
   */
  private static buildEmailText(data: EmailData): string {
    const { salonName, recipientName, reviewUrls } = data;
    
    return `
Hi ${recipientName},

Thank you for choosing ${salonName}! We hope you loved your new look.

Would you mind taking 30 seconds to share your experience? Your feedback helps us improve and helps others discover our services.

Review us on:
${reviewUrls.google ? `Google: ${reviewUrls.google}` : ''}
${reviewUrls.yelp ? `Yelp: ${reviewUrls.yelp}` : ''}
${reviewUrls.facebook ? `Facebook: ${reviewUrls.facebook}` : ''}

Your review makes a huge difference to our small business. Thank you for your support!

Best regards,
The ${salonName} Team

---
Powered by BraidPilot
Professional salon management platform
To unsubscribe, reply STOP to this email.
    `;
  }
}