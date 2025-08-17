"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ReputationSettingsProps {
  salonId: Id<"salons">;
}

export function ReputationSettings({ salonId }: ReputationSettingsProps) {
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [yelpReviewUrl, setYelpReviewUrl] = useState("");
  const [reviewDelay, setReviewDelay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState("");
  
  const salon = useQuery(api.salons.getSalonById, { salonId });
  const updateReputationSettings = useMutation(api.reputation.updateReputationSettings);
  const testReviewRequest = useAction(api.reputation.testReviewRequest);
  const reviewRequests = useQuery(api.reputation.getReviewRequests, { salonId, limit: 10 });
  const reviewAnalytics = useQuery(api.reputation.getReviewAnalytics, { salonId });

  useEffect(() => {
    if (salon) {
      setGoogleReviewUrl(salon.googleReviewUrl || "");
      setYelpReviewUrl(salon.yelpReviewUrl || "");
      setReviewDelay(salon.reviewRequestDelay || 0);
    }
  }, [salon]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateReputationSettings({
        salonId,
        googleReviewUrl: googleReviewUrl || undefined,
        yelpReviewUrl: yelpReviewUrl || undefined,
        reviewRequestDelay: reviewDelay,
      });
      setTestResult("Settings saved successfully! ✅");
      setTimeout(() => setTestResult(""), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setTestResult("Failed to save settings ❌");
      setTimeout(() => setTestResult(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail && !testPhone) {
      setTestResult("Please enter a test email or phone number");
      setTimeout(() => setTestResult(""), 3000);
      return;
    }

    setIsTesting(true);
    try {
      const result = await testReviewRequest({
        salonId,
        testEmail: testEmail || undefined,
        testPhone: testPhone || undefined,
      });
      
      if (result.success) {
        setTestResult(`Test sent! ✅ Email: ${result.emailSent ? '✓' : '✗'} SMS: ${result.smsSent ? '✓' : '✗'}`);
      } else {
        setTestResult(`Test failed: ${result.error || 'Unknown error'} ❌`);
      }
    } catch (error) {
      console.error("Test error:", error);
      setTestResult("Test failed ❌");
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(""), 5000);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty URLs are valid (optional)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isConfigured = googleReviewUrl || yelpReviewUrl;
  const canSave = validateUrl(googleReviewUrl) && validateUrl(yelpReviewUrl);

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Reputation Management</h3>
          <p className="text-sm text-gray-600 mt-1">
            Automatically collect reviews after completed appointments
          </p>
        </div>
        {isConfigured && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1 bg-green-400 rounded-full"></span>
            Configured
          </span>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Review URLs Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Review URL
            </label>
            <input
              type="url"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/your-google-review-link"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                googleReviewUrl && !validateUrl(googleReviewUrl) ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {googleReviewUrl && !validateUrl(googleReviewUrl) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid URL</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Find this in your Google Business Profile under &quot;Get more reviews&quot;
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yelp Review URL
            </label>
            <input
              type="url"
              value={yelpReviewUrl}
              onChange={(e) => setYelpReviewUrl(e.target.value)}
              placeholder="https://www.yelp.com/biz/your-business-name"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                yelpReviewUrl && !validateUrl(yelpReviewUrl) ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {yelpReviewUrl && !validateUrl(yelpReviewUrl) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid URL</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Your Yelp business page URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Request Delay
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={reviewDelay}
                onChange={(e) => setReviewDelay(parseInt(e.target.value) || 0)}
                min="0"
                max="1440"
                className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-600">minutes after completion</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              How long to wait after marking an appointment complete before requesting a review (0 = immediate)
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || !canSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>

        {/* Test Section */}
        {isConfigured && (
          <div className="pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-4">Test Review Request</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Email (optional)
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Phone (optional)
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleTest}
                disabled={isTesting || (!testEmail && !testPhone)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isTesting ? 'Sending Test...' : 'Send Test Review Request'}
              </button>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${
            testResult.includes('✅') || testResult.includes('success')
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult}
          </div>
        )}

        {/* Analytics Section */}
        {reviewAnalytics && (
          <div className="pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-4">Review Request Analytics (Last 30 Days)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{reviewAnalytics.totalRequests}</p>
                <p className="text-xs text-blue-600">Total Requests</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{reviewAnalytics.sentRequests}</p>
                <p className="text-xs text-green-600">Successfully Sent</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">{Math.round(reviewAnalytics.successRate)}%</p>
                <p className="text-xs text-purple-600">Success Rate</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">{reviewAnalytics.failedRequests}</p>
                <p className="text-xs text-orange-600">Failed</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Requests */}
        {reviewRequests && reviewRequests.length > 0 && (
          <div className="pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-4">Recent Review Requests</h4>
            <div className="space-y-3">
              {reviewRequests.slice(0, 5).map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'sent' ? 'bg-green-100 text-green-800' :
                        request.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {request.client?.name || 'Unknown Client'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {request.channels.includes('email') && (
                      <span className="flex items-center">
                        📧 Email
                      </span>
                    )}
                    {request.channels.includes('sms') && (
                      <span className="flex items-center">
                        💬 SMS
                      </span>
                    )}
                    {request.booking && (
                      <span>
                        {request.booking.serviceDetails.style}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Preview */}
        {isConfigured && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Review Request Preview</h4>
            <p className="text-sm text-gray-600 mb-3">
              Clients will receive this message after completing appointments:
            </p>
            <div className="bg-white p-3 rounded border text-sm">
              <p className="font-medium mb-2">Hi [Client Name]! ✨</p>
              <p className="mb-2">Thank you for choosing {salon?.name}. We&apos;d love your feedback!</p>
              <div className="space-y-1">
                {googleReviewUrl && <p>⭐ Google: {googleReviewUrl}</p>}
                {yelpReviewUrl && <p>🌟 Yelp: {yelpReviewUrl}</p>}
              </div>
              <p className="mt-2 text-gray-600">Your review helps other clients find great stylists! 💜</p>
            </div>
          </div>
        )}

        {/* Setup Guide */}
        {!isConfigured && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Why Set Up Review Collection? ⭐</h4>
            <ul className="space-y-2 text-sm text-blue-800 mb-4">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Automatic review requests after appointments
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Build online reputation and credibility
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Attract more clients through positive reviews
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sent via email and SMS automatically
              </li>
            </ul>
            <p className="text-xs text-blue-600">
              💡 Tip: Add both Google and Yelp URLs to maximize your online presence
            </p>
          </div>
        )}
      </div>
    </div>
  );
}