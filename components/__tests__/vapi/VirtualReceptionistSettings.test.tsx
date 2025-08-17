import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VirtualReceptionistSettings } from '@/components/vapi/VirtualReceptionistSettings';
import { useQuery, useMutation, useAction } from 'convex/react';

// Mock Convex hooks
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useAction: jest.fn(),
}));

// Mock data
const mockSalonId = 'salon123' as any;
const mockVapiConfig = {
  isActive: true,
  phoneNumber: '+14155551234',
  phoneNumberId: 'phone123',
  assistantId: 'assistant123',
  voiceProvider: 'elevenlabs',
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  voiceSettings: {
    speed: 1.0,
    pitch: 0,
    temperature: 0.7,
    stability: 0.5,
  },
  businessContext: {
    businessHours: {
      monday: { open: 900, close: 1800, isOpen: false },
      tuesday: { open: 900, close: 1800, isOpen: true },
      wednesday: { open: 900, close: 1800, isOpen: true },
      thursday: { open: 900, close: 1800, isOpen: true },
      friday: { open: 900, close: 1800, isOpen: true },
      saturday: { open: 900, close: 1800, isOpen: true },
      sunday: { open: 900, close: 1800, isOpen: false },
    },
    policies: {
      cancellationPolicy: '24 hours notice required',
      depositRequired: true,
      depositAmount: 50,
      latePolicy: '15 minutes grace period',
      refundPolicy: 'No refunds for no-shows',
    },
  },
};

const mockCallAnalytics = {
  totalCalls: 45,
  completedCalls: 42,
  averageDuration: 180000, // 3 minutes
  bookingOutcomes: 12,
  transferOutcomes: 3,
  conversionRate: 26.7,
};

const mockRecentCalls = [
  {
    _id: 'call1',
    phoneNumber: '+14155559999',
    startTime: Date.now() - 3600000,
    status: 'completed',
    duration: 120000,
  },
  {
    _id: 'call2',
    phoneNumber: '+14155558888',
    startTime: Date.now() - 7200000,
    status: 'completed',
    duration: 240000,
  },
];

describe('VirtualReceptionistSettings', () => {
  const mockProvisionPhoneNumber = jest.fn();
  const mockDeactivateService = jest.fn();
  const mockTestConfiguration = jest.fn();
  const mockUpdateVoiceConfig = jest.fn();
  const mockUpdateBusinessContext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useQuery as jest.Mock).mockImplementation((fn: any) => {
      if (fn.name === 'getVapiConfiguration') {
        return mockVapiConfig;
      }
      if (fn.name === 'getCallAnalytics') {
        return mockCallAnalytics;
      }
      if (fn.name === 'getRecentCalls') {
        return mockRecentCalls;
      }
      return null;
    });
    
    (useAction as jest.Mock).mockImplementation((fn: any) => {
      if (fn.name === 'provisionVapiPhoneNumber') {
        return mockProvisionPhoneNumber;
      }
      if (fn.name === 'deactivateVapiService') {
        return mockDeactivateService;
      }
      if (fn.name === 'testVapiConfiguration') {
        return mockTestConfiguration;
      }
      return jest.fn();
    });
    
    (useMutation as jest.Mock).mockImplementation((fn: any) => {
      if (fn.name === 'updateVoiceConfiguration') {
        return mockUpdateVoiceConfig;
      }
      if (fn.name === 'updateBusinessContext') {
        return mockUpdateBusinessContext;
      }
      return jest.fn();
    });
  });

  describe('Service Status', () => {
    it('shows active status when Vapi is configured', () => {
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      expect(screen.getByText('✅ Virtual Receptionist is Active')).toBeInTheDocument();
      expect(screen.getByText(`Phone: ${mockVapiConfig.phoneNumber}`)).toBeInTheDocument();
    });

    it('shows inactive status when Vapi is not configured', () => {
      (useQuery as jest.Mock).mockImplementation((fn: any) => {
        if (fn.name === 'getVapiConfiguration') {
          return { isActive: false };
        }
        return null;
      });
      
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      expect(screen.getByText('Virtual Receptionist not yet configured')).toBeInTheDocument();
      expect(screen.getByText('Activate Virtual Receptionist')).toBeInTheDocument();
    });

    it('handles phone number provisioning', async () => {
      mockProvisionPhoneNumber.mockResolvedValue({
        success: true,
        phoneNumber: '+14155551234',
      });
      
      (useQuery as jest.Mock).mockImplementation((fn: any) => {
        if (fn.name === 'getVapiConfiguration') {
          return { isActive: false };
        }
        return null;
      });
      
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      const activateButton = screen.getByText('Activate Virtual Receptionist');
      fireEvent.click(activateButton);
      
      await waitFor(() => {
        expect(mockProvisionPhoneNumber).toHaveBeenCalledWith({ salonId: mockSalonId });
      });
    });

    it('handles service deactivation', async () => {
      window.confirm = jest.fn(() => true);
      
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      const deactivateButton = screen.getByText('Deactivate');
      fireEvent.click(deactivateButton);
      
      await waitFor(() => {
        expect(mockDeactivateService).toHaveBeenCalledWith({ salonId: mockSalonId });
      });
    });
  });

  describe('Voice Settings', () => {
    it('displays voice configuration options', () => {
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      // Click to expand voice settings
      const voiceSettingsHeader = screen.getByText('Voice Settings');
      fireEvent.click(voiceSettingsHeader);
      
      expect(screen.getByLabelText('Voice Provider')).toBeInTheDocument();
      expect(screen.getByLabelText('Voice ID')).toBeInTheDocument();
      expect(screen.getByText(/Speed:/)).toBeInTheDocument();
      expect(screen.getByText(/Pitch:/)).toBeInTheDocument();
    });

    it('updates voice settings', async () => {
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      // Expand voice settings
      const voiceSettingsHeader = screen.getByText('Voice Settings');
      fireEvent.click(voiceSettingsHeader);
      
      // Update voice provider
      const voiceProviderSelect = screen.getByLabelText('Voice Provider');
      fireEvent.change(voiceProviderSelect, { target: { value: 'playht' } });
      
      // Click update button
      const updateButton = screen.getByText('Update Voice Settings');
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(mockUpdateVoiceConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            salonId: mockSalonId,
            voiceProvider: 'playht',
          })
        );
      });
    });
  });

  describe('Business Context', () => {
    it('displays business hours configuration', () => {
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      // Click to expand business context
      const businessContextHeader = screen.getByText('Business Context');
      fireEvent.click(businessContextHeader);
      
      expect(screen.getByText('Business Hours')).toBeInTheDocument();
      expect(screen.getByText('monday')).toBeInTheDocument();
      expect(screen.getByText('tuesday')).toBeInTheDocument();
    });

    it('updates business context', async () => {
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      // Expand business context
      const businessContextHeader = screen.getByText('Business Context');
      fireEvent.click(businessContextHeader);
      
      // Update cancellation policy
      const cancellationInput = screen.getByDisplayValue('24 hours notice required');
      fireEvent.change(cancellationInput, { 
        target: { value: '48 hours notice required' } 
      });
      
      // Click update button
      const updateButton = screen.getByText('Update Business Context');
      fireEvent.click(updateButton);
      
      await waitFor(() => {
        expect(mockUpdateBusinessContext).toHaveBeenCalledWith(
          expect.objectContaining({
            salonId: mockSalonId,
          })
        );
      });
    });
  });

  describe('Call Analytics', () => {
    it('displays call analytics when available', () => {
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      expect(screen.getByText('Call Analytics')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument(); // Total calls
      expect(screen.getByText('42')).toBeInTheDocument(); // Completed calls
      expect(screen.getByText('3m')).toBeInTheDocument(); // Avg duration
      expect(screen.getByText('26.7%')).toBeInTheDocument(); // Conversion rate
    });

    it('displays recent calls', () => {
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      expect(screen.getByText('Recent Calls')).toBeInTheDocument();
      expect(screen.getByText('+14155559999')).toBeInTheDocument();
      expect(screen.getByText('+14155558888')).toBeInTheDocument();
    });
  });

  describe('Configuration Testing', () => {
    it('allows testing the configuration', async () => {
      mockTestConfiguration.mockResolvedValue({
        success: true,
        assistant: { name: 'Test Assistant' },
        phoneNumber: '+14155551234',
      });
      
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      const testButton = screen.getByText('Test Configuration');
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(mockTestConfiguration).toHaveBeenCalledWith({ salonId: mockSalonId });
      });
    });

    it('handles test configuration errors', async () => {
      mockTestConfiguration.mockResolvedValue({
        success: false,
        error: 'Configuration error',
      });
      
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      const testButton = screen.getByText('Test Configuration');
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(mockTestConfiguration).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('handles provisioning loading state', async () => {
      mockProvisionPhoneNumber.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      (useQuery as jest.Mock).mockImplementation((fn: any) => {
        if (fn.name === 'getVapiConfiguration') {
          return { isActive: false };
        }
        return null;
      });
      
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      const activateButton = screen.getByText('Activate Virtual Receptionist');
      fireEvent.click(activateButton);
      
      expect(screen.getByText('Provisioning...')).toBeInTheDocument();
    });

    it('handles testing loading state', async () => {
      mockTestConfiguration.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<VirtualReceptionistSettings salonId={mockSalonId} />);
      
      const testButton = screen.getByText('Test Configuration');
      fireEvent.click(testButton);
      
      expect(screen.getByText('Testing...')).toBeInTheDocument();
    });
  });
});