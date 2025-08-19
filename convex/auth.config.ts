// Use process.env.CLERK_ISSUER_URL if available, otherwise use defaults
// Set CLERK_ISSUER_URL in Convex dashboard environment variables:
// - Production: https://clerk.braidpilot.com
// - Development: https://worthy-grackle-1.clerk.accounts.dev

const clerkDomain = process.env.CLERK_ISSUER_URL || "https://worthy-grackle-1.clerk.accounts.dev";

export default {
  providers: [
    {
      domain: clerkDomain,
      applicationID: "convex",
    },
  ],
};