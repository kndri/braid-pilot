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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Capacity Management
        </h2>
        <p className="text-gray-600 mt-1">Control concurrent bookings and prevent overbooking</p>
      </div>

      {/* Settings Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          Emergency Capacity Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Concurrent Bookings
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.maxConcurrentBookings}
              onChange={(e) => setSettings({ ...settings, maxConcurrentBookings: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum appointments that can overlap
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buffer Time (minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={settings.bufferMinutes}
              onChange={(e) => setSettings({ ...settings, bufferMinutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time between appointments
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Service Duration (minutes)
            </label>
            <input
              type="number"
              min="30"
              max="600"
              value={settings.defaultServiceDuration}
              onChange={(e) => setSettings({ ...settings, defaultServiceDuration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default appointment length
            </p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emergencyCapacityEnabled}
                onChange={(e) => setSettings({ ...settings, emergencyCapacityEnabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable Emergency Capacity Management
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={handleUpdateSettings}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Update Settings
        </button>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          View Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Capacity Status */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">
          Capacity Status for {new Date(date).toLocaleDateString()}
        </h3>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {capacityStatus.totalBookings}
              </p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {capacityStatus.settings.maxConcurrentBookings}
              </p>
              <p className="text-sm text-gray-600">Max Concurrent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {capacityStatus.settings.bufferMinutes} min
              </p>
              <p className="text-sm text-gray-600">Buffer Time</p>
            </div>
          </div>
        </div>

        {/* Hourly Capacity Grid */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Hourly Capacity
          </h4>
          
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(capacityStatus.hourlyCapacity).map(([time, slot]: [string, any]) => (
              <div
                key={time}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  slot.isBlocked ? 'bg-gray-100 border-gray-300' :
                  slot.status === 'full' ? 'bg-red-50 border-red-200' :
                  slot.status === 'busy' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{time}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    slot.isBlocked ? 'bg-gray-200 text-gray-700' :
                    slot.status === 'full' ? 'bg-red-200 text-red-700' :
                    slot.status === 'busy' ? 'bg-yellow-200 text-yellow-700' :
                    'bg-green-200 text-green-700'
                  }`}>
                    {slot.isBlocked ? 'Blocked' : slot.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    {slot.current}/{slot.max} bookings
                  </div>
                  
                  {!slot.isBlocked ? (
                    <button
                      onClick={() => handleBlockTimeSlot(time, `${(parseInt(time) + 1).toString().padStart(2, '0')}:00`, true)}
                      className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlockTimeSlot(time, `${(parseInt(time) + 1).toString().padStart(2, '0')}:00`, false)}
                      className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
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
            <h4 className="font-medium text-sm text-gray-700 mb-2">Blocked Time Slots</h4>
            <div className="space-y-1">
              {capacityStatus.blockedSlots.map((slot: any, index: number) => (
                <div key={index} className="text-sm bg-gray-100 p-2 rounded">
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