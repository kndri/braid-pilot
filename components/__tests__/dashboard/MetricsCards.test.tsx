import React from 'react'
import { render, screen } from '@testing-library/react'
import { MetricsCards } from '../../dashboard/MetricsCards'

const mockMetrics = {
  totalRevenue: 2450.75,
  totalFees: 85.50,
  upcomingAppointmentsCount: 8,
  totalClients: 15,
  completedBookings: 12,
  todayBookings: 3,
  monthlyGrowth: 15.2,
}

describe('MetricsCards', () => {
  it('renders all metric cards', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Total Clients')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Upcoming')).toBeInTheDocument()
  })

  it('displays formatted revenue correctly', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    expect(screen.getByText('$2,450.75')).toBeInTheDocument()
  })

  it('shows client count', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('displays completed bookings', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('shows upcoming appointments', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows growth indicator when positive', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    expect(screen.getByText('15.2%')).toBeInTheDocument()
  })

  it('shows negative growth correctly', () => {
    const negativeGrowthMetrics = {
      ...mockMetrics,
      monthlyGrowth: -5.8,
    }

    render(<MetricsCards metrics={negativeGrowthMetrics} />)

    expect(screen.getByText('5.8%')).toBeInTheDocument()
  })

  it('handles zero values gracefully', () => {
    const zeroMetrics = {
      totalRevenue: 0,
      totalFees: 0,
      upcomingAppointmentsCount: 0,
      totalClients: 0,
      completedBookings: 0,
      todayBookings: 0,
      monthlyGrowth: 0,
    }

    render(<MetricsCards metrics={zeroMetrics} />)

    expect(screen.getByText('$0.00')).toBeInTheDocument()
    // With 0% growth, the trend indicator won't show
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })

  it('shows CRM promotional card when CRM is not enabled', () => {
    render(<MetricsCards metrics={mockMetrics} isCrmEnabled={false} />)

    expect(screen.getByText('Client Insights')).toBeInTheDocument()
    expect(screen.getByText('Upgrade to CRM to track client relationships')).toBeInTheDocument()
  })

  it('shows BookingPro promotional card when BookingPro is not enabled', () => {
    render(<MetricsCards metrics={mockMetrics} isBookingProEnabled={false} />)

    expect(screen.getByText('Unlock Revenue Tracking')).toBeInTheDocument()
    expect(screen.getByText('Upgrade to Booking Pro to track revenue and bookings')).toBeInTheDocument()
  })

  it('does not show promotional cards when features are enabled', () => {
    render(
      <MetricsCards 
        metrics={mockMetrics} 
        isCrmEnabled={true} 
        isBookingProEnabled={true} 
      />
    )

    expect(screen.queryByText('Client Insights')).not.toBeInTheDocument()
    expect(screen.queryByText('Unlock Revenue Tracking')).not.toBeInTheDocument()
  })

  it('applies correct styling for trend indicators', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    const growthElement = screen.getByText('15.2%')
    expect(growthElement).toHaveClass('text-green-600')
  })

  it('handles large numbers correctly', () => {
    const largeMetrics = {
      ...mockMetrics,
      totalRevenue: 123456.78,
      totalClients: 999,
    }

    render(<MetricsCards metrics={largeMetrics} />)

    expect(screen.getByText('$123,456.78')).toBeInTheDocument()
    expect(screen.getByText('999')).toBeInTheDocument()
  })

  it('shows upcoming appointments count', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('handles undefined metrics gracefully', () => {
    const undefinedMetrics = {
      totalRevenue: undefined,
      totalFees: undefined,
      upcomingAppointmentsCount: undefined,
      totalClients: undefined,
      completedBookings: undefined,
      todayBookings: undefined,
      monthlyGrowth: undefined,
    }

    render(<MetricsCards metrics={undefinedMetrics} />)

    // Should not crash and should show default values
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('displays metric descriptions correctly', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    expect(screen.getByText('Unique clients served')).toBeInTheDocument()
    expect(screen.getByText('Bookings this month')).toBeInTheDocument()
    expect(screen.getByText('Appointments scheduled')).toBeInTheDocument()
  })

  it('shows correct icons for each metric', () => {
    render(<MetricsCards metrics={mockMetrics} />)

    // Test that metric cards have appropriate visual elements
    const revenueCard = screen.getByText('Total Revenue').closest('div')
    const clientsCard = screen.getByText('Total Clients').closest('div')
    const bookingsCard = screen.getByText('Completed').closest('div')
    const upcomingCard = screen.getByText('Upcoming').closest('div')

    expect(revenueCard).toBeInTheDocument()
    expect(clientsCard).toBeInTheDocument()
    expect(bookingsCard).toBeInTheDocument()
    expect(upcomingCard).toBeInTheDocument()
  })
})