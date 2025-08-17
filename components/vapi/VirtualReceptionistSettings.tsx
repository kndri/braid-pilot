'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface VirtualReceptionistSettingsProps {
  salonId: Id<"salons">;
}

export function VirtualReceptionistSettings({ salonId }: VirtualReceptionistSettingsProps) {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showBusinessContext, setShowBusinessContext] = useState(false);
  
  // Voice settings state
  const [voiceProvider, setVoiceProvider] = useState<'elevenlabs' | 'playht' | 'azure'>('elevenlabs');
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM');
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 0,
    temperature: 0.7,
    stability: 0.5,
  });
  
  // Business context state
  const [businessHours, setBusinessHours] = useState({
    monday: { open: 900, close: 1800, isOpen: false },
    tuesday: { open: 900, close: 1800, isOpen: true },
    wednesday: { open: 900, close: 1800, isOpen: true },
    thursday: { open: 900, close: 1800, isOpen: true },
    friday: { open: 900, close: 1800, isOpen: true },
    saturday: { open: 900, close: 1800, isOpen: true },
    sunday: { open: 900, close: 1800, isOpen: false },
  });
  
  const [policies, setPolicies] = useState({
    cancellationPolicy: '24 hours notice required for cancellation',
    depositRequired: true,
    depositAmount: 50,
    latePolicy: '15 minutes grace period',
    refundPolicy: 'No refunds for no-shows',
  });
  
  // Queries and mutations
  const vapiConfig = useQuery(api.vapiConfiguration.getVapiConfiguration, { salonId });
  const callAnalytics = useQuery(api.vapiConfiguration.getCallAnalytics, { salonId });
  const recentCalls = useQuery(api.vapiWebhook.getRecentCalls, { salonId, limit: 5 });
  
  const provisionPhoneNumber = useAction(api.vapiConfiguration.provisionVapiPhoneNumber);
  const deactivateService = useAction(api.vapiConfiguration.deactivateVapiService);
  const testConfiguration = useAction(api.vapiConfiguration.testVapiConfiguration);
  
  const updateVoiceConfig = useMutation(api.vapiConfiguration.updateVoiceConfiguration);
  const updateBusinessContext = useMutation(api.vapiConfiguration.updateBusinessContext);
  
  // Load existing configuration
  useEffect(() => {
    if (vapiConfig) {
      if (vapiConfig.voiceProvider) setVoiceProvider(vapiConfig.voiceProvider);
      if (vapiConfig.voiceId) setVoiceId(vapiConfig.voiceId);
      if (vapiConfig.voiceSettings) setVoiceSettings(vapiConfig.voiceSettings);
      if (vapiConfig.businessContext) {
        setBusinessHours(vapiConfig.businessContext.businessHours);
        setPolicies(vapiConfig.businessContext.policies);
      }
    }
  }, [vapiConfig]);
  
  const handleProvision = async () => {
    setIsProvisioning(true);
    try {
      const result = await provisionPhoneNumber({ salonId });
      if (result.success) {
        alert(`Virtual Receptionist activated! Phone number: ${result.phoneNumber}`);
      }
    } catch (error) {
      console.error('Provisioning failed:', error);
      alert('Failed to provision phone number. Please try again.');
    } finally {
      setIsProvisioning(false);
    }
  };
  
  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate the Virtual Receptionist?')) {
      return;
    }
    
    try {
      await deactivateService({ salonId });
      alert('Virtual Receptionist deactivated successfully.');
    } catch (error) {
      console.error('Deactivation failed:', error);
      alert('Failed to deactivate service. Please try again.');
    }
  };
  
  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await testConfiguration({ salonId });
      if (result.success) {
        alert(`Test successful! Assistant: ${result.assistant?.name}\nPhone: ${result.phoneNumber}`);
      } else {
        alert(`Test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed. Please check your configuration.');
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleVoiceUpdate = async () => {
    try {
      await updateVoiceConfig({
        salonId,
        voiceProvider,
        voiceId,
        voiceSettings,
      });
      alert('Voice settings updated successfully!');
    } catch (error) {
      console.error('Voice update failed:', error);
      alert('Failed to update voice settings.');
    }
  };
  
  const handleBusinessContextUpdate = async () => {
    try {
      await updateBusinessContext({
        salonId,
        businessContext: {
          businessHours,
          policies,
        },
      });
      alert('Business context updated successfully!');
    } catch (error) {
      console.error('Business context update failed:', error);
      alert('Failed to update business context.');
    }
  };
  
  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Main Configuration Panel */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-xl font-bold mb-4">Virtual Receptionist Setup</h3>
        
        {/* Status Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Service Status</h4>
          {vapiConfig?.isActive ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-medium">✅ Virtual Receptionist is Active</p>
                  <p className="text-green-600 text-sm mt-1">
                    Phone: {vapiConfig.phoneNumber || 'Loading...'}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isTesting ? 'Testing...' : 'Test Configuration'}
                  </button>
                  <button
                    onClick={handleDeactivate}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 mb-3">
                Virtual Receptionist not yet configured
              </p>
              <button
                onClick={handleProvision}
                disabled={isProvisioning}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isProvisioning ? 'Provisioning...' : 'Activate Virtual Receptionist'}
              </button>
            </div>
          )}
        </div>
        
        {/* Voice Settings */}
        {vapiConfig?.isActive && (
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            >
              <h4 className="font-medium">Voice Settings</h4>
              <svg 
                className={`w-5 h-5 transition-transform ${showVoiceSettings ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {showVoiceSettings && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice Provider
                    </label>
                    <select
                      value={voiceProvider}
                      onChange={(e) => setVoiceProvider(e.target.value as any)}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="elevenlabs">ElevenLabs</option>
                      <option value="playht">PlayHT</option>
                      <option value="azure">Azure</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice ID
                    </label>
                    <input
                      type="text"
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      placeholder="Enter voice ID"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Speed: {voiceSettings.speed}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={voiceSettings.speed}
                      onChange={(e) => setVoiceSettings({
                        ...voiceSettings,
                        speed: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pitch: {voiceSettings.pitch}
                    </label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={voiceSettings.pitch}
                      onChange={(e) => setVoiceSettings({
                        ...voiceSettings,
                        pitch: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleVoiceUpdate}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Update Voice Settings
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Business Context */}
        {vapiConfig?.isActive && (
          <div className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowBusinessContext(!showBusinessContext)}
            >
              <h4 className="font-medium">Business Context</h4>
              <svg 
                className={`w-5 h-5 transition-transform ${showBusinessContext ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {showBusinessContext && (
              <div className="mt-4 space-y-4">
                {/* Business Hours */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Business Hours</h5>
                  <div className="space-y-2">
                    {Object.entries(businessHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={hours.isOpen}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, isOpen: e.target.checked }
                          })}
                          className="w-4 h-4"
                        />
                        <span className="w-24 capitalize">{day}</span>
                        {hours.isOpen && (
                          <span className="text-sm text-gray-600">
                            {formatTime(hours.open)} - {formatTime(hours.close)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Policies */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Policies</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600">Cancellation Policy</label>
                      <input
                        type="text"
                        value={policies.cancellationPolicy}
                        onChange={(e) => setPolicies({
                          ...policies,
                          cancellationPolicy: e.target.value
                        })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={policies.depositRequired}
                          onChange={(e) => setPolicies({
                            ...policies,
                            depositRequired: e.target.checked
                          })}
                          className="mr-2"
                        />
                        Deposit Required
                      </label>
                      
                      {policies.depositRequired && (
                        <div className="flex items-center">
                          <span className="mr-2">Amount: $</span>
                          <input
                            type="number"
                            value={policies.depositAmount}
                            onChange={(e) => setPolicies({
                              ...policies,
                              depositAmount: parseInt(e.target.value) || 0
                            })}
                            className="w-20 p-1 border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleBusinessContextUpdate}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Update Business Context
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Analytics Panel */}
      {vapiConfig?.isActive && callAnalytics && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-bold mb-4">Call Analytics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold">{callAnalytics.totalCalls}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{callAnalytics.completedCalls}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold">
                {Math.round(callAnalytics.averageDuration / 60000)}m
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold">
                {callAnalytics.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
          
          {/* Recent Calls */}
          {recentCalls && recentCalls.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Recent Calls</h4>
              <div className="space-y-2">
                {recentCalls.map((call) => (
                  <div key={call._id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{call.phoneNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(call.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm px-2 py-1 rounded ${
                          call.status === 'completed' ? 'bg-green-100 text-green-800' :
                          call.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {call.status}
                        </span>
                        {call.duration && (
                          <p className="text-sm text-gray-600 mt-1">
                            {Math.round(call.duration / 60000)}m {Math.round((call.duration % 60000) / 1000)}s
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}