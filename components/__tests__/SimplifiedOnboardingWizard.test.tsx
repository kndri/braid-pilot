import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimplifiedOnboardingWizard from '../onboarding/SimplifiedOnboardingWizard';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

// Mock Convex
jest.mock('convex/react', () => ({
  ConvexProvider: ({ children }: any) => <div>{children}</div>,
  ConvexReactClient: jest.fn(),
  useMutation: () => jest.fn(),
  useQuery: () => null,
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe('SimplifiedOnboardingWizard', () => {
  const mockSalonId = 'salon_123' as any;
  const mockSalonName = 'Test Salon';

  it('renders the wizard with initial step', () => {
    render(
      <SimplifiedOnboardingWizard 
        salonId={mockSalonId} 
        salonName={mockSalonName}
      />
    );

    // Should show Step 1
    expect(screen.getByText(/Step 1: Select Styles & Set Base Prices/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Start Templates/i)).toBeInTheDocument();
  });

  it('displays pricing templates', () => {
    render(
      <SimplifiedOnboardingWizard 
        salonId={mockSalonId} 
        salonName={mockSalonName}
      />
    );

    expect(screen.getByText('Budget Friendly')).toBeInTheDocument();
    expect(screen.getByText('Standard Pricing')).toBeInTheDocument();
    expect(screen.getByText('Premium Service')).toBeInTheDocument();
  });

  it('allows style selection', () => {
    render(
      <SimplifiedOnboardingWizard 
        salonId={mockSalonId} 
        salonName={mockSalonName}
      />
    );

    const boxBraidsButton = screen.getByText('Box Braids');
    fireEvent.click(boxBraidsButton);

    // The button should change appearance when selected
    expect(boxBraidsButton.closest('button')).toHaveClass('border-orange-500');
  });

  it('navigates to next step when styles are selected', async () => {
    render(
      <SimplifiedOnboardingWizard 
        salonId={mockSalonId} 
        salonName={mockSalonName}
      />
    );

    // Select a style
    const boxBraidsButton = screen.getByText('Box Braids');
    fireEvent.click(boxBraidsButton);

    // Click next
    const nextButton = screen.getByText('Next: Set Adjustments');
    fireEvent.click(nextButton);

    // Should move to Step 2
    await waitFor(() => {
      expect(screen.getByText(/Step 2: Set Universal Adjustments/i)).toBeInTheDocument();
    });
  });

  it('shows correct size pricing logic', () => {
    render(
      <SimplifiedOnboardingWizard 
        salonId={mockSalonId} 
        salonName={mockSalonName}
      />
    );

    // Select a style and go to step 2
    const boxBraidsButton = screen.getByText('Box Braids');
    fireEvent.click(boxBraidsButton);
    
    const nextButton = screen.getByText('Next: Set Adjustments');
    fireEvent.click(nextButton);

    // Check that the help text mentions smaller heads cost more
    waitFor(() => {
      expect(screen.getByText(/Smaller head sizes require more braids/i)).toBeInTheDocument();
    });
  });

  it('loads existing data in edit mode', () => {
    // Mock existing pricing data
    jest.mock('convex/react', () => ({
      ...jest.requireActual('convex/react'),
      useQuery: () => ({
        selectedStyles: [{ name: 'Box Braids', isCustom: false }],
        stylePricing: {
          'Box Braids': {
            basePrice: 180,
            lengthAdjustments: { 'Bra-Length': 0, 'Mid-Back': 20, 'Waist-Length': 40 },
            sizeAdjustments: { 'Small': 40, 'Medium': 20, 'Large': 0, 'XL': -10 }
          }
        },
        globalHairTypeAdjustments: {
          'Synthetic': 0,
          '100% Human Hair': 50,
          'Virgin Hair': 100,
          'Treated Hair': 30
        },
        standardHairType: 'Synthetic'
      })
    }));

    render(
      <SimplifiedOnboardingWizard 
        salonId={mockSalonId} 
        salonName={mockSalonName}
        isEditMode={true}
      />
    );

    // Should show edit mode indicator
    waitFor(() => {
      expect(screen.getByText(/Edit Pricing/i)).toBeInTheDocument();
    });
  });

  it('displays progress bar', () => {
    render(
      <SimplifiedOnboardingWizard 
        salonId={mockSalonId} 
        salonName={mockSalonName}
      />
    );

    expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
  });

  it('has cancel/exit functionality', () => {
    const mockRouter = { push: jest.fn() };
    jest.mock('next/navigation', () => ({
      useRouter: () => mockRouter,
    }));

    render(
      <SimplifiedOnboardingWizard 
        salonId={mockSalonId} 
        salonName={mockSalonName}
      />
    );

    const exitButton = screen.getByText('Save & Exit');
    fireEvent.click(exitButton);

    // Should navigate to dashboard
    waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });
});