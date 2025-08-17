import React from 'react'
import { render, screen } from '@testing-library/react'
import { useQuery } from 'convex/react'
import { QuoteTool } from '../quote/QuoteTool'

// Mock useQuery hook
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>

// Mock data
const mockPricingData = {
  salonId: 'salon123',
  salonName: 'Test Salon',
  salonPhone: '+1234567890',
  isActive: true,
  styles: [
    {
      name: 'Box Braids',
      basePrice: 150,
      lengthAdjustments: { 'Bra-Length': 25, 'Mid-Back': 50 },
      sizeAdjustments: { Small: -20, Medium: 0, Large: 20 },
      hairTypeAdjustments: { '100% Human Hair': 50 },
    },
    {
      name: 'Knotless Braids',
      basePrice: 180,
      lengthAdjustments: { 'Bra-Length': 25, 'Mid-Back': 50 },
      sizeAdjustments: { Small: -20, Medium: 0, Large: 20 },
      hairTypeAdjustments: { '100% Human Hair': 50 },
    },
  ],
  availableSizes: ['Small', 'Medium', 'Large', 'Jumbo'],
  availableLengths: ['Shoulder-Length', 'Bra-Length', 'Mid-Back', 'Waist-Length'],
  availableHairTypes: ['Synthetic', '100% Human Hair'],
  standardHairType: 'Synthetic',
}

describe('QuoteTool', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockUseQuery.mockReturnValue(undefined)

    render(<QuoteTool token="test-token" />)

    expect(screen.getByText('Loading price tool...')).toBeInTheDocument()
  })

  it('shows salon not found when pricing data is null', () => {
    mockUseQuery.mockReturnValue(null)

    render(<QuoteTool token="test-token" />)

    expect(screen.getByText('Salon Not Found')).toBeInTheDocument()
    expect(
      screen.getByText('This pricing tool link is invalid or has expired.')
    ).toBeInTheDocument()
  })

  it('shows salon unavailable when not active', () => {
    mockUseQuery.mockReturnValue({
      ...mockPricingData,
      isActive: false,
      message: 'Price tool temporarily unavailable',
    })

    render(<QuoteTool token="test-token" />)

    expect(screen.getByText('Test Salon')).toBeInTheDocument()
    expect(screen.getByText('Price tool temporarily unavailable')).toBeInTheDocument()
  })

  it('renders quote form when pricing data is available', () => {
    mockUseQuery.mockReturnValue(mockPricingData)

    render(<QuoteTool token="test-token" />)

    expect(screen.getByText('Test Salon')).toBeInTheDocument()
    expect(screen.getByText('Get an instant quote for your braiding style')).toBeInTheDocument()
    expect(screen.getByText('Select Your Style')).toBeInTheDocument()
  })

  it('shows style options when data is loaded', () => {
    mockUseQuery.mockReturnValue(mockPricingData)

    render(<QuoteTool token="test-token" />)

    expect(screen.getByText('Box Braids')).toBeInTheDocument()
    expect(screen.getByText('Knotless Braids')).toBeInTheDocument()
  })

  it('shows Braid Pilot branding in footer', () => {
    mockUseQuery.mockReturnValue(mockPricingData)

    render(<QuoteTool token="test-token" />)

    expect(screen.getByText('Powered by')).toBeInTheDocument()
    expect(screen.getByText('BraidPilot')).toBeInTheDocument()
  })

  it('handles missing phone number gracefully', () => {
    const dataWithoutPhone = {
      ...mockPricingData,
      salonPhone: undefined,
    }
    
    mockUseQuery.mockReturnValue(dataWithoutPhone)

    render(<QuoteTool token="test-token" />)

    expect(screen.getByText('Test Salon')).toBeInTheDocument()
    // Should not crash when phone is missing
  })

  it('renders with empty styles array', () => {
    const dataWithNoStyles = {
      ...mockPricingData,
      styles: [],
    }
    
    mockUseQuery.mockReturnValue(dataWithNoStyles)

    render(<QuoteTool token="test-token" />)

    expect(screen.getByText('Test Salon')).toBeInTheDocument()
    expect(screen.getByText('Select Your Style')).toBeInTheDocument()
  })
})