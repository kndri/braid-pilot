'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AlertCircle, Calendar, Clock, Users } from 'lucide-react';

interface CapacityManagementPanelProps {
  salonId: Id<"salons">;
  selectedDate?: string;
}

export const CapacityManagementPanel = ({ salonId, selectedDate }: CapacityManagementPanelProps) => {
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [settings, setSettings] = useState({
    maxConcurrentBookings: 3,
    bufferMinutes: 30,
    emergencyCapacityEnabled: true,
    defaultServiceDuration: 240,
  });

  // Get salon info with capacity settings
  const salon = useQuery(api.salons.getSalonById, { salonId });
  const capacityStatus = useQuery(api.emergencyCapacity.getCapacityStatus, { 
    salonId, 
    date 
  });
  const updateSettings = useMutation(api.emergencyCapacity.updateCapacitySettings);
  const manageTimeSlot = useMutation(api.emergencyCapacity.manageTimeSlot);

  useEffect(() => {
    if (salon) {
      setSettings({
        maxConcurrentBookings: salon.maxConcurrentBookings || 3,
        bufferMinutes: salon.bufferMinutes || 30,
        emergencyCapacityEnabled: salon.emergencyCapacityEnabled ?? true,
        defaultServiceDuration: salon.defaultServiceDuration || 240,
      });
    }
  }, [salon]);

  const handleUpdateSettings = async () => {
    try {
      await updateSettings({
        salonId,
        ...settings,
      });
      alert('Capacity settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings');
    }
  };

  const handleBlockTimeSlot = async (startTime: string, endTime: string, block: boolean) => {
    try {
      await manageTimeSlot({
        salonId,
        date,
        startTime,
        endTime,
        block,
        reason: block ? 'Administrative block' : undefined,
      });
      alert(`Time slot ${block ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      console.error('Failed to manage time slot:', error);
      alert('Failed to manage time slot');
    }
  };

  if (!capacityStatus) {
    return <div className="p-4">Loading capacity information...</div>;
  }

  return (
    <div className="bg-white p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Capacity Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your salon's booking capacity</p>
      </div>

      {/* Settings Section */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700">Basic Settings</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 border border-gray-100 rounded-md p-3">
            <label className="block text-xs text-gray-500 mb-1.5">
              Max Concurrent
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxConcurrentBookings}
                onChange={(e) => setSettings({ ...settings, maxConcurrentBookings: parseInt(e.target.value) })}
                className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-purple-500"
              />
              <span className="text-xs text-gray-500">bookings</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-md p-3">
            <label className="block text-xs text-gray-500 mb-1.5">
              Buffer Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="120"
                value={settings.bufferMinutes}
                onChange={(e) => setSettings({ ...settings, bufferMinutes: parseInt(e.target.value) })}
                className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-purple-500"
              />
              <span className="text-xs text-gray-500">minutes</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-md p-3">
            <label className="block text-xs text-gray-500 mb-1.5">
              Service Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="30"
                max="600"
                value={settings.defaultServiceDuration}
                onChange={(e) => setSettings({ ...settings, defaultServiceDuration: parseInt(e.target.value) })}
                className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-purple-500"
              />
              <span className="text-xs text-gray-500">minutes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emergencyCapacityEnabled}
              onChange={(e) => setSettings({ ...settings, emergencyCapacityEnabled: e.target.checked })}
              className="mr-2 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Enable capacity management
            </span>
          </label>

          <button
            onClick={handleUpdateSettings}
            className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Daily Capacity View</h3>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-2.5 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Capacity Status */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-center">
            <p className="text-xl font-semibold text-gray-900">
              {capacityStatus.totalBookings}
            </p>
            <p className="text-xs text-gray-500">Bookings</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-center">
            <p className="text-xl font-semibold text-gray-900">
              {capacityStatus.settings.maxConcurrentBookings}
            </p>
            <p className="text-xs text-gray-500">Max Capacity</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-md p-3 text-center">
            <p className="text-xl font-semibold text-gray-900">
              {capacityStatus.settings.bufferMinutes}m
            </p>
            <p className="text-xs text-gray-500">Buffer</p>
          </div>
        </div>

        {/* Hourly Capacity Grid */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Time Slots</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(capacityStatus.hourlyCapacity).map(([time, slot]: [string, any]) => (
              <div
                key={time}
                className={`flex items-center justify-between p-2.5 rounded-md border ${
                  slot.isBlocked ? 'bg-gray-50 border-gray-200' :
                  slot.status === 'full' ? 'bg-red-50 border-red-200' :
                  slot.status === 'busy' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">{time}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    slot.isBlocked ? 'bg-gray-100 text-gray-600' :
                    slot.status === 'full' ? 'bg-red-50 text-red-700' :
                    slot.status === 'busy' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    {slot.isBlocked ? 'Blocked' : slot.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-500">
                    {slot.current}/{slot.max}
                  </div>
                  
                  {!slot.isBlocked ? (
                    <button
                      onClick={() => handleBlockTimeSlot(time, `${(parseInt(time) + 1).toString().padStart(2, '0')}:00`, true)}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlockTimeSlot(time, `${(parseInt(time) + 1).toString().padStart(2, '0')}:00`, false)}
                      className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                    >
                      Unblock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Slots */}
        {capacityStatus.blockedSlots.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-sm text-gray-500 mb-2">Blocked Time Slots</h4>
            <div className="space-y-1">
              {capacityStatus.blockedSlots.map((slot: any, index: number) => (
                <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                  {slot.startTime} - {slot.endTime}: {slot.reason || 'No reason provided'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};