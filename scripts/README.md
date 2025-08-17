# Development & Testing Scripts

This directory contains scripts for seeding and managing test data in your Braid Pilot application.

## 🌱 Seeding Development Data

### Quick Start

```bash
# Seed the database with comprehensive test data
npm run seed

# Clean up all test data
npm run seed:clean
```

### What Gets Seeded

When you run `npm run seed`, the following data is created:

- **1 Salon**: "Elite Braids & Beauty" with full configuration
- **6 Braiders**: Each with different commission splits (50-70%) and specialties
- **100 Clients**: With various tags (VIP, Regular, New) and preferences
- **150 Bookings**: Mix of past, present, and future bookings with different statuses
- **8 Hair Styles**: With complete pricing configurations
- **Notifications**: Sample notifications for the salon owner

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_CONVEX_URL=your-convex-url
SEED_USER_EMAIL=test@elitebraids.com  # Optional, defaults to test@elitebraids.com
SEED_CLERK_ID=clerk_user_id            # Optional, for linking to specific Clerk user
```

## 🧪 E2E Testing

### Running Full Experience Tests

```bash
# Run comprehensive salon experience test
npm run test:full

# Run all e2e tests
npm run test:e2e:all

# Run with Cypress UI
npm run cypress
```

### Test Coverage

The full salon experience test covers:

1. **Initial Setup & Onboarding**
   - Salon creation with commission configuration
   - Pricing setup for multiple styles
   - Length and size adjustments

2. **Braider Management**
   - Adding braiders with different commission splits
   - Managing availability
   - Tracking specialties

3. **Client & Booking Management**
   - Creating bookings with different statuses
   - Assigning braiders
   - Filtering and searching

4. **Analytics & Reporting**
   - Revenue metrics
   - Commission breakdown
   - Booking statistics

5. **Settings Management**
   - Updating salon information
   - Changing default commission splits
   - Business hours configuration

6. **Capacity Management**
   - Setting concurrent booking limits
   - Buffer time configuration
   - Time slot blocking

7. **Quote Tool**
   - Customer-facing pricing
   - Service selection
   - Booking requests

## 📊 Test Data Characteristics

### Braiders
- **Michelle Williams**: 65% split, specializes in Box Braids, Knotless, Goddess Locs
- **Jasmine Taylor**: 60% split, specializes in Passion Twists, Senegalese Twists
- **Aisha Johnson**: 55% split, specializes in Fulani Braids, Cornrows
- **Destiny Brown**: 70% split (expert), specializes in Micro Braids
- **Keisha Davis**: 60% split, various specialties
- **Tamara Wilson**: 50% split (junior), basic styles

### Booking Distribution
- 60% Completed bookings (past)
- 25% Confirmed bookings (future)
- 10% Pending bookings
- 5% Cancelled bookings

### Client Categories
- 10% VIP clients (every 10th client)
- 20% Regular clients (every 5th client)
- 70% New clients

## 🔧 Manual Testing Workflow

1. **Start fresh**:
   ```bash
   npm run seed:clean  # Clean any existing data
   npm run seed        # Seed fresh data
   ```

2. **Login to dashboard**:
   - Visit http://localhost:3000/dashboard
   - Use the seeded email: test@elitebraids.com

3. **Explore features**:
   - View 6 braiders with different splits
   - Check 150 bookings across different dates
   - Review 100 client profiles
   - Test capacity management
   - Try the quote tool

4. **Clean up when done**:
   ```bash
   npm run seed:clean
   ```

## 🚨 Important Notes

- **Development Only**: These scripts are for development/testing only
- **Data Persistence**: Seeded data persists until manually cleaned
- **Idempotent**: Running seed multiple times may create duplicate data
- **Clean First**: Always run `seed:clean` before `seed` for fresh data

## 🐛 Troubleshooting

### "Missing NEXT_PUBLIC_CONVEX_URL"
Make sure your `.env.local` file contains the Convex URL:
```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### "User or salon not found" during cleanup
The user might not exist. This is safe to ignore.

### Seed fails with "User already has salon"
Run `npm run seed:clean` first to remove existing data.

## 📝 Custom Seeding

To seed with specific parameters, modify the `seed-dev.ts` script:

```typescript
const result = await client.mutation(api.seed.seedDevelopmentData, {
  userEmail: "custom@email.com",
  // Add more parameters as needed
});
```