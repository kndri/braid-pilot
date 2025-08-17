'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { X, User, Mail, Phone, Clock, Percent } from 'lucide-react';

interface AddBraiderModalProps {
  salonId: Id<"salons">;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SPECIALTIES = [
  'Box Braids',
  'Knotless Braids',
  'Goddess Locs',
  'Passion Twists',
  'Fulani Braids',
  'Cornrows',
  'Micro Braids',
  'Senegalese Twists',
  'Marley Twists',
  'Crochet Braids',
  'Feed-in Braids',
  'Tribal Braids'
];

const WORKING_DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

export const AddBraiderModal = ({ salonId, isOpen, onClose, onSuccess }: AddBraiderModalProps) => {
  const createBraider = useMutation(api.braiders.createBraider);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    splitPercentage: 60, // Default 60% to braider
    maxDailyBookings: 4,
    defaultStartTime: '09:00',
    defaultEndTime: '18:00',
    workingDays: [1, 2, 3, 4, 5, 6] // Mon-Sat default
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a name');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBraider({
        salonId,
        ...formData,
        isActive: true
      });
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialties: [],
        splitPercentage: 60,
        maxDailyBookings: 4,
        defaultStartTime: '09:00',
        defaultEndTime: '18:00',
        workingDays: [1, 2, 3, 4, 5, 6]
      });
    } catch (error) {
      console.error('Failed to create braider:', error);
      alert('Failed to add braider. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const toggleWorkingDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort()
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Braider</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Basic Information</h3>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 mr-1" />
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter braider's name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="braider@example.com"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Commission & Specialties */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Commission & Specialties</h3>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Percent className="w-4 h-4 mr-1" />
                Commission Split
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.splitPercentage}
                    onChange={(e) => setFormData({ ...formData, splitPercentage: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-lg min-w-[100px] text-center">
                  <div className="text-2xl font-bold text-purple-700">{formData.splitPercentage}%</div>
                  <div className="text-xs text-purple-600">to braider</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The braider will receive {formData.splitPercentage}% of each service price, 
                salon keeps {100 - formData.splitPercentage}%
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SPECIALTIES.map(specialty => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => toggleSpecialty(specialty)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.specialties.includes(specialty)
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Schedule & Availability</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 mr-1" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.defaultStartTime}
                  onChange={(e) => setFormData({ ...formData, defaultStartTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 mr-1" />
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.defaultEndTime}
                  onChange={(e) => setFormData({ ...formData, defaultEndTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Daily Bookings
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxDailyBookings}
                  onChange={(e) => setFormData({ ...formData, maxDailyBookings: parseInt(e.target.value) || 4 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Days
              </label>
              <div className="flex gap-2">
                {WORKING_DAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWorkingDay(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.workingDays.includes(day.value)
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Braider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};