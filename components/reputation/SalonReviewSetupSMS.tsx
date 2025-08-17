'use client';

import { useState } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface SalonReviewSetupProps {
  salonId: Id<"salons">;
}

export function SalonReviewSetupSMS({ salonId }: SalonReviewSetupProps) {
  const salon = useQuery(api.salons.getSalonById, { salonId });
  const messagingSettings = useQuery(api.reputationSMS.getSalonMessagingSettings, { salonId });
  const updateSalon = useMutation(api.reputationSMS.updateReputationSettings);
  const updateMessaging = useMutation(api.reputationSMS.updateSalonMessagingSettings);
  const sendTest = useAction(api.reputationSMS.sendTestReviewRequest);
  const quota = useQuery(api.reputationSMS.checkReviewQuota, { salonId });
  
  const [settings, setSettings] = useState({
    googleReviewUrl: salon?.googleReviewUrl || '',
    yelpReviewUrl: salon?.yelpReviewUrl || '',
    reviewRequestDelay: messagingSettings?.reviewRequestDelay || 120,
    enableAutoRequest: messagingSettings?.enableAutoRequest ?? true,
    includeIncentive: messagingSettings?.includeIncentive ?? false,
    incentiveText: messagingSettings?.incentiveText || '10% off your next visit',
    displayName: messagingSettings?.displayName || salon?.name || '',
  });
  
  const [testPhone, setTestPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update salon review URLs
      await updateSalon({
        salonId,
        googleReviewUrl: settings.googleReviewUrl,
        yelpReviewUrl: settings.yelpReviewUrl,
        reviewRequestDelay: settings.reviewRequestDelay,
      });
      
      // Update messaging settings
      await updateMessaging({
        salonId,
        settings: {
          displayName: settings.displayName,
          reviewRequestDelay: settings.reviewRequestDelay,
          enableAutoRequest: settings.enableAutoRequest,
          includeIncentive: settings.includeIncentive,
          incentiveText: settings.incentiveText,
        },
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSendTest = async () => {
    if (!testPhone) {
      setTestResult({ success: false, message: 'Please enter a phone number' });
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await sendTest({
        salonId,
        testPhone,
      });
      
      setTestResult({
        success: result.success,
        message: result.success ? 'Test SMS sent successfully!' : 'Failed to send test SMS',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error sending test SMS',
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Setup SMS Review Collection</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>📱 SMS-Only Review Requests!</strong> BraidPilot automatically sends text messages to clients after their appointment, 
            making it easy for them to leave reviews with just one click.
          </p>
        </div>
        
        {/* Step 1: Review URLs */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Step 1: Add Your Review Pages</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Google Business Profile URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={settings.googleReviewUrl}
                onChange={(e) => setSettings({...settings, googleReviewUrl: e.target.value})}
                placeholder="https://g.page/r/YOUR_BUSINESS_ID/review"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                <a href="https://support.google.com/business/answer/7035772" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  How to find your Google review URL →
                </a>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Yelp Business URL (Optional)
              </label>
              <input
                type="url"
                value={settings.yelpReviewUrl}
                onChange={(e) => setSettings({...settings, yelpReviewUrl: e.target.value})}
                placeholder="https://www.yelp.com/writeareview/biz/YOUR_BUSINESS_ID"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll use Google if available, otherwise Yelp
              </p>
            </div>
          </div>
        </div>
        
        {/* Step 2: Timing */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Step 2: Set Timing</h3>
          
          <label className="block text-sm font-medium mb-2">
            Send SMS review request after
          </label>
          <select
            value={settings.reviewRequestDelay}
            onChange={(e) => setSettings({...settings, reviewRequestDelay: Number(e.target.value)})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0}>Immediately after completion</option>
            <option value={60}>1 hour later</option>
            <option value={120}>2 hours later</option>
            <option value={240}>4 hours later</option>
            <option value={1440}>Next day</option>
            <option value={2880}>2 days later</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Best practice: Send 2-4 hours after service for highest response rates
          </p>
        </div>
        
        {/* Step 3: Business Name */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Step 3: Business Identity</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Business Name (as it appears in SMS)
              </label>
              <input
                type="text"
                value={settings.displayName}
                onChange={(e) => setSettings({...settings, displayName: e.target.value})}
                placeholder="Your Salon Name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will appear in the SMS message
              </p>
            </div>
          </div>
        </div>
        
        {/* Step 4: Incentive (Optional) */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Step 4: Add Incentive (Optional)</h3>
          
          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={settings.includeIncentive}
              onChange={(e) => setSettings({...settings, includeIncentive: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm">Offer incentive for leaving a review</span>
          </label>
          
          {settings.includeIncentive && (
            <input
              type="text"
              value={settings.incentiveText}
              onChange={(e) => setSettings({...settings, incentiveText: e.target.value})}
              placeholder="e.g., 10% off your next visit"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
        
        {/* Test SMS Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">📱 Test Your SMS</h3>
          <p className="text-sm text-gray-600 mb-4">
            Send a test review request SMS to see how it looks
          </p>
          <div className="flex gap-2">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSendTest}
              disabled={isTesting || !settings.googleReviewUrl}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? 'Sending...' : 'Send Test'}
            </button>
          </div>
          {testResult && (
            <div className={`mt-3 p-2 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="text-sm">{testResult.message}</p>
            </div>
          )}
        </div>
        
        {/* Pricing Notice */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium mb-2">📊 Your Current Plan Includes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ {quota?.limit || 'Unlimited'} SMS review requests per month</li>
            <li>✅ Automated sending after appointments</li>
            <li>✅ Real-time delivery tracking</li>
            <li>✅ Opt-out management</li>
            <li>✅ Analytics and reporting</li>
          </ul>
          {quota && quota.used > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>SMS usage this month</span>
                <span>{quota.used} / {quota.limit || '∞'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(quota.percentUsed || 0, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Auto-Request Toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enableAutoRequest}
              onChange={(e) => setSettings({...settings, enableAutoRequest: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium">Enable automatic SMS review requests</span>
              <p className="text-xs text-gray-500">Automatically send SMS after completed appointments</p>
            </div>
          </label>
        </div>
        
        {/* Save Button */}
        <button 
          onClick={handleSave}
          disabled={isSaving || !settings.googleReviewUrl}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save SMS Settings'}
        </button>
        
        {showSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved successfully!
            </p>
          </div>
        )}
        
        {/* SMS Preview */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📱 SMS Preview:</h4>
          <div className="bg-white p-3 rounded border border-gray-300 text-sm">
            <p className="whitespace-pre-wrap">
              {`Hi [Client Name]! Thanks for visiting ${settings.displayName || 'Your Salon'}. We'd love your feedback! ${
                settings.includeIncentive && settings.incentiveText ? 
                `${settings.incentiveText} when you leave a review. ` : ''
              }Review us here: ${settings.googleReviewUrl || '[Review URL]'}

Reply STOP to opt-out.`}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Character count: ~{160 + (settings.includeIncentive ? 40 : 0)} (within SMS limit)
          </p>
        </div>
      </div>
    </div>
  );
}