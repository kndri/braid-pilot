import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CapacityManagementPanel } from '@/components/capacity/CapacityManagementPanel';
import { ConvexProvider } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';

// Mock convex hooks
jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useQuery: jest.fn((query, args) => {
    if (query.name === 'getSalonById') {
      return {
        _id: 'salon123',
        name: 'Test Salon',
        maxConcurrentBookings: 3,
        bufferMinutes: 30,
        emergencyCapacityEnabled: true,
        defaultServiceDuration: 240,
      };
    }
    if (query.name === 'getCapacityStatus') {
      return {
        date: '2024-01-20',
        settings: {
          maxConcurrentBookings: 3,
          bufferMinutes: 30,
          emergencyCapacityEnabled: true,
        },
        totalBookings: 5,
        blockedSlots: [],
        hourlyCapacity: {
          '09:00': {
            time: '09:00',
            current: 2,
            max: 3,
            available: 1,
            isBlocked: false,
            blockReason: '',
            status: 'busy',
          },
          '10:00': {
            time: '10:00',
            current: 3,
            max: 3,
            available: 0,
            isBlocked: false,
            blockReason: '',
            status: 'full',
          },
          '11:00': {
            time: '11:00',
            current: 1,
            max: 3,
            available: 2,
            isBlocked: false,
            blockReason: '',
            status: 'available',
          },
          '12:00': {
            time: '12:00',
            current: 0,
            max: 3,
            available: 3,
            isBlocked: true,
            blockReason: 'Lunch break',
            status: 'blocked',
          },
        },
      };
    }
    return null;
  }),
  useMutation: jest.fn(() => jest.fn()),
}));

describe('CapacityManagementPanel', () => {
  const mockSalonId = 'salon123' as Id<'salons'>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders capacity management panel with settings', () => {
    render(
      <CapacityManagementPanel salonId={mockSalonId} />
    );

    expect(screen.getByText('Capacity Management')).toBeInTheDocument();
    expect(screen.getByText('Control concurrent bookings and prevent overbooking')).toBeInTheDocument();
    expect(screen.getByText('Emergency Capacity Settings')).toBeInTheDocument();
  });

  it('displays current capacity settings', () => {
    render(
      <CapacityManagementPanel salonId={mockSalonId} />
    );

    const maxBookingsInput = screen.getByLabelText('Max Concurrent Bookings') as HTMLInputElement;
    expect(maxBookingsInput.value).toBe('3');

    const bufferTimeInput = screen.getByLabelText('Buffer Time (minutes)') as HTMLInputElement;
    expect(bufferTimeInput.value).toBe('30');

    const defaultDurationInput = screen.getByLabelText('Default Service Duration (minutes)') as HTMLInputElement;
    expect(defaultDurationInput.value).toBe('240');
  });

  it('shows capacity status for selected date', () => {
    render(
      <CapacityManagementPanel salonId={mockSalonId} selectedDate="2024-01-20" />
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // Total bookings
    expect(screen.getByText('3')).toBeInTheDocument(); // Max concurrent
    expect(screen.getByText('30 min')).toBeInTheDocument(); // Buffer time
  });

  it('displays hourly capacity grid with proper status', () => {
    render(
      <CapacityManagementPanel salonId={mockSalonId} />
    );

    // Check different time slot statuses
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('busy')).toBeInTheDocument();
    
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('full')).toBeInTheDocument();
    
    expect(screen.getByText('11:00')).toBeInTheDocument();
    expect(screen.getByText('available')).toBeInTheDocument();
    
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('allows updating capacity settings', async () => {
    const mockUpdateSettings = jest.fn();
    jest.mocked(jest.requireMock('convex/react').useMutation).mockReturnValue(mockUpdateSettings);

    render(
      <CapacityManagementPanel salonId={mockSalonId} />
    );

    const maxBookingsInput = screen.getByLabelText('Max Concurrent Bookings') as HTMLInputElement;
    fireEvent.change(maxBookingsInput, { target: { value: '5' } });

    const updateButton = screen.getByText('Update Settings');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        salonId: mockSalonId,
        maxConcurrentBookings: 5,
        bufferMinutes: 30,
        emergencyCapacityEnabled: true,
        defaultServiceDuration: 240,
      });
    });
  });

  it('allows blocking and unblocking time slots', async () => {
    const mockManageTimeSlot = jest.fn();
    jest.mocked(jest.requireMock('convex/react').useMutation).mockReturnValue(mockManageTimeSlot);

    render(
      <CapacityManagementPanel salonId={mockSalonId} />
    );

    // Find block button for 11:00 slot (available)
    const blockButtons = screen.getAllByText('Block');
    fireEvent.click(blockButtons[0]);

    await waitFor(() => {
      expect(mockManageTimeSlot).toHaveBeenCalled();
    });
  });

  it('shows blocked slots with reasons', () => {
    render(
      <CapacityManagementPanel salonId={mockSalonId} />
    );

    expect(screen.getByText('Lunch break')).toBeInTheDocument();
  });

  it('allows toggling emergency capacity management', () => {
    render(
      <CapacityManagementPanel salonId={mockSalonId} />
    );

    const toggle = screen.getByLabelText('Enable Emergency Capacity Management') as HTMLInputElement;
    expect(toggle.checked).toBe(true);

    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
  });
});