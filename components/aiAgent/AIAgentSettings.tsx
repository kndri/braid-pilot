"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface AIAgentSettingsProps {
  salonId: Id<"salons">;
}

export function AIAgentSettings({ salonId }: AIAgentSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personality, setPersonality] = useState("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  
  const salon = useQuery(api.salons.getSalonById, { salonId });
  const enableAIAgent = useMutation(api.aiAgent.enableAIAgent);
  const disableAIAgent = useMutation(api.aiAgent.disableAIAgent);
  const provisionPhoneNumber = useAction(api.aiAgent.provisionPhoneNumber);
  const updateAIAgentSettings = useMutation(api.aiAgent.updateAIAgentSettings);
  const communicationLogs = useQuery(api.aiAgent.getCommunicationLogs, { salonId, limit: 10 });

  useEffect(() => {
    if (salon) {
      setIsEnabled(salon.isAIagentEnabled || false);
      setPhoneNumber(salon.twilioPhoneNumber || "");
      setPersonality(salon.aiAgentPersonality || "professional");
      setCustomPrompt(salon.aiAgentPrompt || "");
    }
  }, [salon]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (!isEnabled) {
        // Enable AI Agent
        const result = await enableAIAgent({ salonId });
        if (result.success) {
          setIsEnabled(true);
          // Provision phone number if not already done
          if (!phoneNumber) {
            setIsProvisioning(true);
            const phoneResult = await provisionPhoneNumber({ salonId });
            if (phoneResult.success) {
              setPhoneNumber(phoneResult.phoneNumber);
            }
            setIsProvisioning(false);
          }
        }
      } else {
        // Disable AI Agent
        const result = await disableAIAgent({ salonId });
        if (result.success) {
          setIsEnabled(false);
        }
      }
    } catch (error) {
      console.error("AI Agent toggle error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setIsLoading(true);
    try {
      await updateAIAgentSettings({
        salonId,
        aiAgentPersonality: personality,
        aiAgentPrompt: customPrompt || undefined,
      });
      setTestMessage("Settings updated successfully!");
      setTimeout(() => setTestMessage(""), 3000);
    } catch (error) {
      console.error("Settings update error:", error);
      setTestMessage("Failed to update settings");
      setTimeout(() => setTestMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Communication Agent</h3>
          <p className="text-sm text-gray-600 mt-1">
            Automatically handle client calls and texts with AI-powered responses
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEnabled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-1 bg-green-400 rounded-full"></span>
              Active
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Enable AI Agent</h4>
            <p className="text-sm text-gray-600">
              Turn on automated client communication
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={isLoading || isProvisioning}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            } ${isLoading || isProvisioning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Phone Number Display */}
        {isEnabled && (
          <>
            {phoneNumber ? (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Your AI Agent Phone Number</h4>
                    <p className="text-2xl font-mono text-blue-700 mb-2">
                      {formatPhoneNumber(phoneNumber)}
                    </p>
                    <p className="text-sm text-blue-600">
                      Share this number with clients for AI-powered support 24/7
                    </p>
                  </div>
                  <div className="text-blue-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : isProvisioning ? (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
                  <p className="text-yellow-800">Provisioning your AI agent phone number...</p>
                </div>
              </div>
            ) : null}

            {/* Configuration Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Agent Personality
                </label>
                <select 
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="professional">Professional - Formal and courteous</option>
                  <option value="friendly">Friendly - Warm and enthusiastic</option>
                  <option value="casual">Casual - Relaxed and conversational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Add custom instructions for how the AI should respond to clients..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  These instructions will be added to the AI&apos;s knowledge when responding to clients
                </p>
              </div>

              <button
                onClick={handleSettingsUpdate}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Updating...' : 'Update Settings'}
              </button>

              {testMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  testMessage.includes('success') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {testMessage}
                </div>
              )}
            </div>

            {/* Recent Communications */}
            <div className="pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Recent Communications</h4>
                <a
                  href="/dashboard/communications"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All →
                </a>
              </div>
              
              {communicationLogs && communicationLogs.length > 0 ? (
                <div className="space-y-3">
                  {communicationLogs.slice(0, 3).map((log) => (
                    <div key={log._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            log.communicationType === 'call' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.communicationType === 'call' ? '📞' : '💬'} {log.communicationType}
                          </span>
                          <span className="text-sm text-gray-600">
                            {log.clientPhone}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Client:</strong> {log.content.substring(0, 100)}
                        {log.content.length > 100 ? '...' : ''}
                      </p>
                      {log.aiResponse && (
                        <p className="text-sm text-gray-600">
                          <strong>AI Response:</strong> {log.aiResponse.substring(0, 100)}
                          {log.aiResponse.length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.96 8.96 0 01-4.906-1.471L3 21l2.471-5.094A8.96 8.96 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No communications yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Once clients start calling or texting, you&apos;ll see activity here
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Feature Benefits */}
        {!isEnabled && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Why Enable AI Agent? 🤖</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                24/7 availability for client inquiries
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Instant responses to pricing and service questions
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Automatic follow-up with booking links
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Focus on your craft without interruptions
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}