describe('Capacity and Braider Management E2E Tests', () => {
  beforeEach(() => {
    // Setup test environment
    cy.task('seedDatabase');
    cy.visit('/');
    
    // Login as salon owner
    cy.loginAsSalonOwner();
    cy.wait(2000);
  });

  describe('Emergency Capacity Management', () => {
    it('should prevent overbooking when capacity limit is reached', () => {
      // Navigate to capacity management
      cy.visit('/dashboard/capacity');
      cy.wait(1000);

      // Set max concurrent bookings to 2
      cy.get('[aria-label="Max Concurrent Bookings"]').clear().type('2');
      cy.get('[aria-label="Buffer Time (minutes)"]').clear().type('30');
      cy.contains('button', 'Update Settings').click();
      cy.wait(1000);

      // Create first booking
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Box Braids',
        size: 'Medium',
        length: 'Shoulder',
        hairType: 'Natural',
      });
      cy.selectAppointmentTime('09:00');
      cy.fillBookingDetails({
        name: 'Client One',
        email: 'client1@example.com',
        phone: '555-0001',
      });
      cy.contains('button', 'Confirm Booking').click();
      cy.wait(2000);

      // Create second booking (overlapping)
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Knotless Braids',
        size: 'Small',
        length: 'Mid-Back',
      });
      cy.selectAppointmentTime('09:30'); // Overlapping with first
      cy.fillBookingDetails({
        name: 'Client Two',
        email: 'client2@example.com',
        phone: '555-0002',
      });
      cy.contains('button', 'Confirm Booking').click();
      cy.wait(2000);

      // Try to create third booking (should fail)
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Cornrows',
        size: 'Large',
        length: 'Shoulder',
      });
      cy.selectAppointmentTime('10:00'); // Still overlapping due to service duration
      cy.fillBookingDetails({
        name: 'Client Three',
        email: 'client3@example.com',
        phone: '555-0003',
      });
      cy.contains('button', 'Confirm Booking').click();
      
      // Should see capacity error
      cy.contains('Cannot book: Maximum capacity').should('be.visible');
    });

    it('should respect buffer time between appointments', () => {
      // Navigate to capacity management
      cy.visit('/dashboard/capacity');
      cy.wait(1000);

      // Set buffer time to 60 minutes
      cy.get('[aria-label="Buffer Time (minutes)"]').clear().type('60');
      cy.contains('button', 'Update Settings').click();
      cy.wait(1000);

      // Create first booking ending at ~1PM (4 hour service)
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Box Braids',
        size: 'Medium',
        length: 'Shoulder',
        hairType: 'Natural',
      });
      cy.selectAppointmentTime('09:00');
      cy.fillBookingDetails({
        name: 'Morning Client',
        email: 'morning@example.com',
        phone: '555-1000',
      });
      cy.contains('button', 'Confirm Booking').click();
      cy.wait(2000);

      // Try to book immediately after (should fail due to buffer)
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Cornrows',
        size: 'Large',
        length: 'Shoulder',
      });
      cy.selectAppointmentTime('13:00'); // Right after first appointment
      
      // Time slot should be unavailable due to buffer
      cy.get('[data-time="13:00"]').should('have.class', 'unavailable');
    });

    it('should allow blocking time slots administratively', () => {
      // Navigate to capacity management
      cy.visit('/dashboard/capacity');
      cy.wait(1000);

      // Block lunch hour (12:00)
      cy.contains('12:00')
        .parent()
        .find('button:contains("Block")')
        .click();
      cy.wait(1000);

      // Verify slot is blocked
      cy.contains('12:00')
        .parent()
        .should('contain', 'Blocked');

      // Try to book during blocked time
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Box Braids',
        size: 'Medium',
        length: 'Shoulder',
        hairType: 'Natural',
      });
      
      // 12:00 slot should not be selectable
      cy.get('[data-time="12:00"]').should('not.exist');
    });

    it('should display real-time capacity status', () => {
      // Navigate to capacity management
      cy.visit('/dashboard/capacity');
      cy.wait(1000);

      // Check capacity indicators
      cy.contains('Total Bookings').should('be.visible');
      cy.contains('Max Concurrent').should('be.visible');
      cy.contains('Buffer Time').should('be.visible');

      // Check hourly capacity grid
      cy.contains('Hourly Capacity').should('be.visible');
      cy.contains('09:00').should('be.visible');
      cy.contains('available').should('be.visible');
      cy.contains('busy').should('be.visible');
      cy.contains('full').should('be.visible');
    });
  });

  describe('Braider Assignment System', () => {
    beforeEach(() => {
      // Create test braiders
      cy.task('createTestBraiders');
    });

    it('should auto-assign qualified braider based on service requirements', () => {
      // Create booking for complex style
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Micro Braids', // Complex style requiring expert
        size: 'Small',
        length: 'Waist',
      });
      cy.selectAppointmentTime('09:00');
      cy.fillBookingDetails({
        name: 'Complex Style Client',
        email: 'complex@example.com',
        phone: '555-2000',
      });
      cy.contains('button', 'Confirm Booking').click();
      cy.wait(2000);

      // Check booking was assigned to expert braider
      cy.contains('Assigned to').should('be.visible');
      cy.contains(/Sarah|Expert/).should('be.visible');
    });

    it('should not assign junior braider to complex styles', () => {
      // Mark all senior/expert braiders as unavailable
      cy.visit('/dashboard/capacity');
      cy.contains('button', 'Braiders').click();
      cy.wait(1000);

      // Mark expert braider unavailable
      cy.contains('Sarah Johnson')
        .parent()
        .find('button:contains("Mark Unavailable")')
        .click();
      cy.wait(500);

      // Try to book complex style
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Goddess Braids', // Complex style
        size: 'Large',
        length: 'Mid-Back',
      });
      cy.selectAppointmentTime('10:00');
      cy.fillBookingDetails({
        name: 'Goddess Braids Client',
        email: 'goddess@example.com',
        phone: '555-3000',
      });
      cy.contains('button', 'Confirm Booking').click();
      
      // Should show no qualified braiders available
      cy.contains('No qualified braiders available').should('be.visible');
    });

    it('should allow manual braider reassignment', () => {
      // Create a booking first
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Box Braids',
        size: 'Medium',
        length: 'Shoulder',
        hairType: 'Natural',
      });
      cy.selectAppointmentTime('14:00');
      cy.fillBookingDetails({
        name: 'Reassign Client',
        email: 'reassign@example.com',
        phone: '555-4000',
      });
      cy.contains('button', 'Confirm Booking').click();
      cy.wait(2000);

      // Navigate to bookings management
      cy.visit('/dashboard');
      cy.contains('Manage Bookings').click();
      cy.wait(1000);

      // Find the booking and open reassignment
      cy.contains('Reassign Client')
        .parent()
        .find('button:contains("Reassign")')
        .click();

      // Select different braider
      cy.get('select[aria-label="Reassign To"]').select('Maria Garcia');
      cy.contains('button', 'Reassign Braider').click();
      cy.wait(1000);

      // Verify reassignment
      cy.contains('Maria Garcia').should('be.visible');
    });

    it('should track individual braider availability', () => {
      // Navigate to braider management
      cy.visit('/dashboard/capacity');
      cy.contains('button', 'Braiders').click();
      cy.wait(1000);

      // Check braider cards display
      cy.contains('Sarah Johnson').should('be.visible');
      cy.contains('expert').should('be.visible');
      cy.contains('Active').should('be.visible');
      cy.contains('$50/hr').should('be.visible');

      // Mark braider unavailable for specific time
      cy.contains('Sarah Johnson')
        .parent()
        .find('button:contains("Mark Unavailable")')
        .click();
      cy.wait(500);

      // Verify status updated
      cy.contains('Sarah Johnson')
        .parent()
        .should('contain', 'Unavailable');
    });

    it('should show braider schedule and workload', () => {
      // Create some bookings first
      cy.createTestBookings(3);

      // Navigate to braider management
      cy.visit('/dashboard/capacity');
      cy.contains('button', 'Braiders').click();
      cy.wait(1000);

      // Click on a braider to view schedule
      cy.contains('Sarah Johnson').click();
      cy.wait(500);

      // Check schedule modal
      cy.contains('Braider Schedule').should('be.visible');
      cy.contains('Working Hours:').should('be.visible');
      cy.contains('09:00 - 18:00').should('be.visible');
      cy.contains('Total Bookings:').should('be.visible');
      cy.contains('Total Hours:').should('be.visible');

      // Check appointments list
      cy.contains('Appointments for').should('be.visible');
      cy.get('[data-cy="braider-appointment"]').should('have.length.at.least', 1);

      // Close modal
      cy.contains('button', '✕').click();
      cy.contains('Braider Schedule').should('not.exist');
    });

    it('should balance workload across braiders', () => {
      // Navigate to braider management
      cy.visit('/dashboard/capacity');
      cy.contains('button', 'Braiders').click();
      cy.wait(1000);

      // Check workload indicators
      cy.contains('Workload:').should('be.visible');
      
      // Low workload should be green
      cy.contains('2 hours').should('have.class', 'text-green-600');
      
      // High workload should be red
      cy.contains('8 hours').should('have.class', 'text-red-600');
      
      // Medium workload should be yellow
      cy.contains('6 hours').should('have.class', 'text-yellow-600');
    });

    it('should track braider specializations', () => {
      // Navigate to braider management
      cy.visit('/dashboard/capacity');
      cy.contains('button', 'Braiders').click();
      cy.wait(1000);

      // Check specialties are displayed
      cy.contains('Specialties:').should('be.visible');
      cy.contains('Micro Braids').should('be.visible');
      cy.contains('Box Braids').should('be.visible');
      cy.contains('Cornrows').should('be.visible');
      cy.contains('Goddess Braids').should('be.visible');
    });
  });

  describe('Integration Tests', () => {
    it('should enforce both capacity and braider constraints', () => {
      // Set strict capacity limits
      cy.visit('/dashboard/capacity');
      cy.get('[aria-label="Max Concurrent Bookings"]').clear().type('1');
      cy.contains('button', 'Update Settings').click();
      cy.wait(1000);

      // Create first booking with expert braider
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Micro Braids',
        size: 'Small',
        length: 'Waist',
      });
      cy.selectAppointmentTime('10:00');
      cy.fillBookingDetails({
        name: 'First Client',
        email: 'first@example.com',
        phone: '555-5000',
      });
      cy.contains('button', 'Confirm Booking').click();
      cy.wait(2000);

      // Try overlapping booking (should fail on capacity)
      cy.visit('/quote/test-token');
      cy.fillQuoteForm({
        style: 'Box Braids',
        size: 'Medium',
        length: 'Shoulder',
        hairType: 'Natural',
      });
      cy.selectAppointmentTime('11:00'); // Overlapping
      
      // Should show capacity error before even checking braider
      cy.get('[data-time="11:00"]').should('have.class', 'unavailable');
    });

    it('should update capacity status in real-time', () => {
      // Open capacity management in one tab
      cy.visit('/dashboard/capacity');
      cy.wait(1000);
      
      // Note initial available slots
      cy.contains('09:00')
        .parent()
        .should('contain', 'available');

      // Create booking in new window
      cy.window().then((win) => {
        const newWindow = win.open('/quote/test-token', '_blank');
        // Simulate booking creation
      });

      // Return to capacity view and check updates
      cy.wait(3000);
      cy.reload();
      cy.contains('09:00')
        .parent()
        .should('contain', 'busy');
    });
  });
});

// Helper commands
Cypress.Commands.add('loginAsSalonOwner', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('clerk-user', JSON.stringify({
      id: 'owner-123',
      email: 'owner@salon.com',
      role: 'salon_owner',
    }));
  });
});

Cypress.Commands.add('fillQuoteForm', (details: any) => {
  cy.get('select[name="style"]').select(details.style);
  cy.get('select[name="size"]').select(details.size);
  cy.get('select[name="length"]').select(details.length);
  cy.contains('button', 'Get Quote').click();
});

Cypress.Commands.add('selectAppointmentTime', (time: string) => {
  cy.get(`[data-time="${time}"]`).click();
  cy.contains('button', 'Continue').click();
});

Cypress.Commands.add('fillBookingDetails', (details: any) => {
  cy.get('input[name="name"]').type(details.name);
  cy.get('input[name="email"]').type(details.email);
  cy.get('input[name="phone"]').type(details.phone);
});

Cypress.Commands.add('createTestBookings', () => {
  // Create multiple test bookings for workload testing
  const bookings = [
    { time: '09:00', braider: 'Sarah Johnson', duration: 480 },
    { time: '10:00', braider: 'Maria Garcia', duration: 240 },
    { time: '14:00', braider: 'Jessica Smith', duration: 180 },
  ];
  
  bookings.forEach(booking => {
    cy.task('createBooking', booking);
  });
});

