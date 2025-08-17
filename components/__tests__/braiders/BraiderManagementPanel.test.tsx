import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BraiderManagementPanel } from '@/components/braiders/BraiderManagementPanel';
import { ConvexProvider } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';

// Mock convex hooks
jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useQuery: jest.fn((query, args) => {
    if (query.name === 'getBySalonId') {
      return [
        {
          _id: 'braider1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '555-0101',
          skillLevel: 'expert',
          isActive: true,
          specialties: ['Micro Braids', 'Goddess Braids', 'Box Braids'],
          hourlyRate: 50,
          maxDailyBookings: 4,
        },
        {
          _id: 'braider2',
          name: 'Maria Garcia',
          email: 'maria@example.com',
          phone: '555-0102',
          skillLevel: 'senior',
          isActive: true,
          specialties: ['Box Braids', 'Cornrows'],
          hourlyRate: 40,
          maxDailyBookings: 5,
        },
        {
          _id: 'braider3',
          name: 'Jessica Smith',
          email: 'jessica@example.com',
          phone: '555-0103',
          skillLevel: 'junior',
          isActive: false,
          specialties: ['Cornrows'],
          hourlyRate: 30,
          maxDailyBookings: 6,
        },
      ];
    }
    if (query.name === 'getAvailableBraiders') {
      return [
        {
          _id: 'braider1',
          name: 'Sarah Johnson',
          skillLevel: 'expert',
          hourlyRate: 50,
          specialties: ['Micro Braids', 'Goddess Braids', 'Box Braids'],
          isQualified: true,
          workloadMinutes: 480,
          workloadHours: 8.0,
        },
        {
          _id: 'braider2',
          name: 'Maria Garcia',
          skillLevel: 'senior',
          hourlyRate: 40,
          specialties: ['Box Braids', 'Cornrows'],
          isQualified: true,
          workloadMinutes: 240,
          workloadHours: 4.0,
        },
      ];
    }
    if (query.name === 'getBraiderSchedule') {
      return {
        braider: {
          _id: 'braider1',
          name: 'Sarah Johnson',
          skillLevel: 'expert',
          defaultStartTime: '09:00',
          defaultEndTime: '18:00',
          workingDays: [1, 2, 3, 4, 5, 6],
        },
        bookings: [
          {
            _id: 'booking1',
            clientName: 'Jane Doe',
            clientPhone: '555-1111',
            serviceDetails: {
              style: 'Micro Braids',
              size: 'Small',
              length: 'Waist',
            },
            appointmentTime: '09:00',
            serviceDurationMinutes: 480,
            status: 'confirmed',
          },
        ],
        exceptions: [],
        stats: {
          totalBookings: 1,
          totalHours: 8.0,
        },
      };
    }
    return null;
  }),
  useMutation: jest.fn(() => jest.fn()),
}));

describe('BraiderManagementPanel', () => {
  const mockSalonId = 'salon123' as Id<'salons'>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders braider management panel', () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    expect(screen.getByText('Braider Management')).toBeInTheDocument();
    expect(screen.getByText('Manage braider assignments and availability')).toBeInTheDocument();
  });

  it('displays all braiders with their details', () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    // Check braider names
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
    expect(screen.getByText('Jessica Smith')).toBeInTheDocument();

    // Check skill levels
    expect(screen.getByText('expert')).toBeInTheDocument();
    expect(screen.getByText('senior')).toBeInTheDocument();
    expect(screen.getByText('junior')).toBeInTheDocument();

    // Check status
    expect(screen.getAllByText('Active')).toHaveLength(2);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('shows braider specialties', () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    expect(screen.getByText('Micro Braids')).toBeInTheDocument();
    expect(screen.getByText('Goddess Braids')).toBeInTheDocument();
    expect(screen.getByText('Box Braids')).toBeInTheDocument();
    expect(screen.getByText('Cornrows')).toBeInTheDocument();
  });

  it('displays workload information for available braiders', () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    expect(screen.getByText('8 hours')).toBeInTheDocument();
    expect(screen.getByText('4 hours')).toBeInTheDocument();
  });

  it('shows hourly rates', () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    expect(screen.getByText('$50/hr')).toBeInTheDocument();
    expect(screen.getByText('$40/hr')).toBeInTheDocument();
    expect(screen.getByText('$30/hr')).toBeInTheDocument();
  });

  it('allows marking braider as unavailable', async () => {
    const mockUpdateAvailability = jest.fn();
    jest.mocked(jest.requireMock('convex/react').useMutation).mockReturnValue(mockUpdateAvailability);

    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    const unavailableButtons = screen.getAllByText('Mark Unavailable');
    fireEvent.click(unavailableButtons[0]);

    await waitFor(() => {
      expect(mockUpdateAvailability).toHaveBeenCalledWith(
        expect.objectContaining({
          braiderId: 'braider1',
          isAvailable: false,
        })
      );
    });
  });

  it('allows marking braider as available', async () => {
    const mockUpdateAvailability = jest.fn();
    jest.mocked(jest.requireMock('convex/react').useMutation).mockReturnValue(mockUpdateAvailability);

    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    const availableButtons = screen.getAllByText('Mark Available');
    fireEvent.click(availableButtons[0]);

    await waitFor(() => {
      expect(mockUpdateAvailability).toHaveBeenCalledWith(
        expect.objectContaining({
          braiderId: 'braider1',
          isAvailable: true,
        })
      );
    });
  });

  it('opens schedule modal when braider is clicked', async () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    const braiderCard = screen.getByText('Sarah Johnson').closest('div.border');
    fireEvent.click(braiderCard!);

    await waitFor(() => {
      expect(screen.getByText('Braider Schedule')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 18:00')).toBeInTheDocument();
      expect(screen.getByText('Total Bookings:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Total Hours:')).toBeInTheDocument();
      expect(screen.getByText('8.0 hrs')).toBeInTheDocument();
    });
  });

  it('displays braider appointments in schedule modal', async () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    const braiderCard = screen.getByText('Sarah Johnson').closest('div.border');
    fireEvent.click(braiderCard!);

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Micro Braids - Small')).toBeInTheDocument();
      expect(screen.getByText('09:00 - Duration: 480 min')).toBeInTheDocument();
      expect(screen.getByText('confirmed')).toBeInTheDocument();
    });
  });

  it('closes schedule modal when close button is clicked', async () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    const braiderCard = screen.getByText('Sarah Johnson').closest('div.border');
    fireEvent.click(braiderCard!);

    await waitFor(() => {
      expect(screen.getByText('Braider Schedule')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Braider Schedule')).not.toBeInTheDocument();
    });
  });

  it('highlights workload levels with appropriate colors', () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    const eightHours = screen.getByText('8 hours');
    const fourHours = screen.getByText('4 hours');

    // 8 hours should be red (high workload)
    expect(eightHours).toHaveClass('text-red-600');
    // 4 hours should be green (low workload)
    expect(fourHours).toHaveClass('text-green-600');
  });

  it('indicates qualification status for services', () => {
    render(
      <BraiderManagementPanel salonId={mockSalonId} />
    );

    const availableStatuses = screen.getAllByText('Available');
    expect(availableStatuses).toHaveLength(2);
  });
});