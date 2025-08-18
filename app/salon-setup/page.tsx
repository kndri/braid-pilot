'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useDebounce } from '@/lib/hooks/useDebounce';

export default function SalonSetupPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const viewer = useQuery(api.users.viewer);
  const createInitialSalonRecord = useMutation(api.users.createInitialSalonRecord);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    salonName: '',
    username: '',
    address: '',
    phone: '',
    website: '',
    defaultSplitPercentage: 60, // Default 60% to braider
    hours: {
      monday: { open: '9:00 AM', close: '6:00 PM', closed: false },
      tuesday: { open: '9:00 AM', close: '6:00 PM', closed: false },
      wednesday: { open: '9:00 AM', close: '6:00 PM', closed: false },
      thursday: { open: '9:00 AM', close: '6:00 PM', closed: false },
      friday: { open: '9:00 AM', close: '6:00 PM', closed: false },
      saturday: { open: '10:00 AM', close: '4:00 PM', closed: false },
      sunday: { open: '', close: '', closed: true },
    }
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);
  
  // Skip setup if salon already exists
  useEffect(() => {
    if (viewer && viewer.salonId) {
      router.push('/dashboard');
    }
  }, [viewer, router]);

  // Debounce username for checking availability
  const debouncedUsername = useDebounce(formData.username, 500);
  const usernameAvailability = useQuery(
    api.salons.isUsernameAvailable,
    debouncedUsername.length >= 3 
      ? { username: debouncedUsername.toLowerCase() }
      : "skip"
  );

  // Update username availability status
  useEffect(() => {
    if (formData.username.length < 3) {
      setUsernameError('');
      setUsernameAvailable(null);
      return;
    }

    if (usernameAvailability === undefined) {
      setCheckingUsername(true);
    } else {
      setCheckingUsername(false);
      if (usernameAvailability) {
        setUsernameAvailable(usernameAvailability.available);
        setUsernameError(usernameAvailability.error || '');
      }
    }
  }, [usernameAvailability, formData.username]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.salonName.trim()) {
      alert('Please enter your salon name');
      return;
    }
    
    if (!formData.username.trim() || formData.username.length < 3) {
      alert('Please enter a valid username (at least 3 characters)');
      return;
    }

    if (!usernameAvailable) {
      alert('Please choose an available username');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createInitialSalonRecord({
        salonData: {
          name: formData.salonName.trim(),
          username: formData.username.toLowerCase().trim(),
          email: user?.emailAddresses[0]?.emailAddress || '',
          address: formData.address.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          website: formData.website.trim() || undefined,
          hours: JSON.stringify(formData.hours),
          defaultSplitPercentage: formData.defaultSplitPercentage,
          splitType: 'percentage' as const,
        }
      });
      
      router.push('/onboarding');
    } catch (error) {
      alert('Failed to create salon. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day as keyof typeof prev.hours],
          [field]: value
        }
      }
    }));
  };
  
  if (!isLoaded || viewer === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-6 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center space-x-2 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded"></div>
            <span className="text-xl sm:text-2xl font-semibold text-gray-900">braidpilot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Set Up Your Salon</h1>
          <p className="text-sm sm:text-base text-gray-800 px-4 sm:px-0">Let&apos;s get your business information to personalize your experience</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Salon Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salon Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.salonName}
              onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
              className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., Bella's Braids & Beauty"
              required
            />
          </div>
          
          {/* Username for Custom URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom URL Username <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              This will be your unique quote link: braidpilot.com/quote/{formData.username || 'yourusername'}
            </p>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                className={`w-full px-4 py-3 pr-10 text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  usernameError ? 'border-red-500' : 
                  usernameAvailable === true ? 'border-green-500' : 
                  'border-gray-300'
                }`}
                placeholder="e.g., 24braidingsalon"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-z0-9][a-z0-9-_]{2,29}"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {checkingUsername && (
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
            {usernameError && (
              <p className="mt-2 text-xs text-red-600">{usernameError}</p>
            )}
            {usernameAvailable === true && (
              <p className="mt-2 text-xs text-green-600">Username is available!</p>
            )}
          </div>
          
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="123 Main St, City, State ZIP"
            />
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="(555) 123-4567"
            />
          </div>
          
          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://www.yoursalon.com"
            />
          </div>
          
          {/* Commission Split Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Braider Commission
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Set the default percentage of each service price that goes to your braiders
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.defaultSplitPercentage}
                  onChange={(e) => setFormData({ ...formData, defaultSplitPercentage: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="bg-orange-50 px-4 py-3 rounded-lg min-w-[120px] text-center border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{formData.defaultSplitPercentage}%</div>
                <div className="text-xs text-orange-500">to braider</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Braiders get {formData.defaultSplitPercentage}%, salon keeps {100 - formData.defaultSplitPercentage}%. 
              You can customize this for individual braiders.
            </p>
          </div>
          
          {/* Business Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Business Hours
            </label>
            <div className="space-y-3">
              {Object.entries(formData.hours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="text-sm text-gray-700 capitalize">{day}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  {!hours.closed && (
                    <>
                      <input
                        type="text"
                        value={hours.open}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg"
                        placeholder="9:00 AM"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="text"
                        value={hours.close}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg"
                        placeholder="6:00 PM"
                      />
                    </>
                  )}
                  {hours.closed && (
                    <span className="text-gray-500 text-sm">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isSubmitting ? 'Setting up...' : 'Continue to Pricing Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}