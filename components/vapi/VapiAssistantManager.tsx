'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
import { 
  Phone, 
  RefreshCw, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Edit,
  Eye,
  Copy,
  Send,
  Bot,
  Calendar,
  DollarSign
} from 'lucide-react';

interface VapiAssistantManagerProps {
  salonId: Id<"salons">;
}

export function VapiAssistantManager({ salonId }: VapiAssistantManagerProps) {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  // Fetch Vapi configuration
  const vapiConfig = useQuery(api.vapiConfiguration.getVapiConfiguration, { salonId });
  
  // Fetch generated system prompt
  const systemPrompt = useQuery(api.vapiPromptGenerator.generateSystemPrompt, { salonId });
  
  // Fetch recent calls
  const recentCalls = useQuery(api.vapiWebhook.getRecentCalls, { salonId, limit: 5 });
  
  // Fetch call analytics
  const analytics = useQuery(api.vapiConfiguration.getCallAnalytics, { 
    salonId,
    dateRange: {
      start: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
      end: Date.now()
    }
  });
  
  // Actions and mutations
  const provisionPhoneNumber = useAction(api.vapiConfiguration.provisionVapiPhoneNumber);
  const updateAssistant = useAction(api.vapiPromptGenerator.updateVapiAssistant);
  const testConfiguration = useAction(api.vapiConfiguration.testVapiConfiguration);
  const deactivateService = useAction(api.vapiConfiguration.deactivateVapiService);
  const updateBusinessContext = useMutation(api.vapiConfiguration.updateBusinessContext);

  // Handle provisioning
  const handleProvision = async () => {
    setIsProvisioning(true);
    try {
      const result = await provisionPhoneNumber({ salonId });
      console.log('Provisioned:', result);
    } catch (error) {
      console.error('Provisioning failed:', error);
    } finally {
      setIsProvisioning(false);
    }
  };

  // Handle assistant update
  const handleUpdateAssistant = async () => {
    setIsUpdating(true);
    try {
      await updateAssistant({ salonId, forceUpdate: true });
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle test call
  const handleTestCall = async () => {
    setIsTesting(true);
    try {
      const result = await testConfiguration({ salonId });
      console.log('Test result:', result);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  // Copy phone number to clipboard
  const copyPhoneNumber = () => {
    if (vapiConfig?.phoneNumber) {
      navigator.clipboard.writeText(vapiConfig.phoneNumber);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  // Copy prompt to clipboard
  const copyPrompt = () => {
    if (systemPrompt) {
      navigator.clipboard.writeText(systemPrompt);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Virtual Receptionist Status
            </span>
            {vapiConfig?.isActive ? (
              <Badge className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage your AI-powered phone assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vapiConfig?.isActive ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Virtual Receptionist Not Activated</AlertTitle>
                <AlertDescription>
                  Activate your virtual receptionist to start handling calls automatically 24/7.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleProvision} 
                disabled={isProvisioning}
                className="w-full"
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Provisioning Phone Number...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Activate Virtual Receptionist
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Phone Number Display */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Your Assistant's Phone Number</p>
                  <p className="text-2xl font-bold">{vapiConfig.phoneNumber}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPhoneNumber}
                >
                  {copiedToClipboard ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestCall}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  <span className="ml-2">Test Call</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdateAssistant}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Update</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPromptPreview(!showPromptPreview)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="ml-2">Preview</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Configuration and Analytics */}
      {vapiConfig?.isActive && (
        <div className="w-full">
          <div className="grid w-full grid-cols-3 mb-4 border-b">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-4 font-medium ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('calls')}
              className={`py-2 px-4 font-medium ${activeTab === 'calls' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Recent Calls
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-4 font-medium ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Settings
            </button>
          </div>

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
            <Card>
              <CardHeader>
                <CardTitle>Call Analytics (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Total Calls</p>
                    <p className="text-2xl font-bold">{analytics?.totalCalls || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{analytics?.completedCalls || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Bookings</p>
                    <p className="text-2xl font-bold">{analytics?.bookingOutcomes || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Conversion</p>
                    <p className="text-2xl font-bold">
                      {analytics?.conversionRate?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>

                {analytics?.averageDuration && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      Average Call Duration: {Math.round(analytics.averageDuration / 1000)} seconds
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          )}

          {/* Recent Calls Tab */}
          {activeTab === 'calls' && (
            <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>View your latest customer interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentCalls && recentCalls.length > 0 ? (
                  <div className="space-y-3">
                    {recentCalls.map((call) => (
                      <div
                        key={call._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{call.phoneNumber}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(call.startTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {call.outcome === 'booking' && (
                            <Badge className="bg-green-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Booked
                            </Badge>
                          )}
                          {call.outcome === 'transfer' && (
                            <Badge variant="secondary">
                              <Phone className="h-3 w-3 mr-1" />
                              Transferred
                            </Badge>
                          )}
                          {call.duration && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.round(call.duration / 1000)}s
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No calls recorded yet
                  </p>
                )}
              </CardContent>
            </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
            <Card>
              <CardHeader>
                <CardTitle>Assistant Settings</CardTitle>
                <CardDescription>
                  Configure your virtual receptionist's behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auto-update Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Auto-Update Assistant</label>
                    <p className="text-sm text-gray-600">
                      Automatically update when business info changes
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                {/* System Prompt Preview */}
                {showPromptPreview && systemPrompt && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">System Prompt Preview</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyPrompt}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <textarea
                      value={systemPrompt}
                      readOnly
                      className="w-full font-mono text-xs h-64 p-2 border rounded"
                    />
                  </div>
                )}

                {/* Danger Zone */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-red-600 mb-2">
                    Danger Zone
                  </h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deactivateService({ salonId })}
                  >
                    Deactivate Virtual Receptionist
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}