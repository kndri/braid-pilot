# Vercel Deployment Guide for Braid Pilot

This guide walks you through deploying Braid Pilot to Vercel with automatic CI/CD deployments triggered by commits to the main branch.

## Prerequisites

- GitHub repository for your project
- Vercel account (free tier works)
- Node.js 20+ installed locally

## Step 1: Initial Vercel Setup

### 1.1 Connect Your GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js and configure build settings
5. Click "Deploy" for initial deployment

### 1.2 Retrieve Vercel Credentials

After initial deployment, get your credentials:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link your local project to Vercel project
vercel link

# Get your org and project IDs
vercel env pull .env.vercel
```

Find these values in `.env.vercel`:
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add the following secrets:

| Secret Name | How to Get It |
|------------|---------------|
| `VERCEL_TOKEN` | Generate at [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | From `.env.vercel` or Vercel dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | From `.env.vercel` or Vercel dashboard → Settings → General |

## Step 3: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add your production environment variables:

```bash
# Required for Stripe integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Required for Twilio SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
TWILIO_MESSAGING_SERVICE_SID=MG...

# App configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important**: Set environment variables for the appropriate environments:
- Production: Applied to main branch deployments
- Preview: Applied to PR deployments
- Development: Applied to local development

## Step 4: Test the CI/CD Pipeline

### 4.1 Production Deployment (Main Branch)

```bash
# Make a change to your code
git add .
git commit -m "feat: Test production deployment"
git push origin main
```

The GitHub Action will:
1. Trigger automatically on push to main
2. Build your project
3. Deploy to production at your-project.vercel.app

### 4.2 Preview Deployment (Pull Requests)

```bash
# Create a feature branch
git checkout -b feature/test-preview

# Make changes and push
git add .
git commit -m "feat: Test preview deployment"
git push origin feature/test-preview

# Create a PR on GitHub
```

The GitHub Action will:
1. Trigger on PR creation/update
2. Deploy a preview build
3. Comment the preview URL on your PR

## Step 5: Configure Custom Domain (Optional)

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Step 6: Configure Stripe Webhook for Production

Once deployed, update your Stripe webhook endpoint:

```bash
# Production webhook URL
https://your-domain.vercel.app/api/webhooks/stripe

# Add this endpoint in Stripe Dashboard
# Listen for events: checkout.session.completed, payment_intent.succeeded
```

## Monitoring and Debugging

### View Deployment Logs
- GitHub Actions: Check Actions tab in your repository
- Vercel: Check Functions tab in Vercel dashboard

### View Runtime Logs
```bash
# Using Vercel CLI
vercel logs

# Or in Vercel dashboard → Functions → Logs
```

### Rollback Deployments
1. Go to Vercel dashboard → Deployments
2. Find a previous successful deployment
3. Click "..." menu → "Promote to Production"

## Troubleshooting

### Build Failures

If builds fail, check:
1. Node version matches (specified in `.nvmrc` or `package.json`)
2. All environment variables are set
3. Dependencies install correctly
4. TypeScript/ESLint errors are resolved

### Environment Variable Issues

- Ensure variables are set for correct environment (Production/Preview)
- Rebuild after adding new environment variables
- Use `NEXT_PUBLIC_` prefix for client-side variables

### GitHub Actions Failures

Check:
- GitHub secrets are correctly set
- Vercel token hasn't expired
- Branch protection rules aren't blocking deployments

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use different API keys** for production vs development
3. **Enable Vercel's DDoS protection** in dashboard
4. **Set up domain allowlist** for API routes if needed
5. **Regular token rotation** - Rotate Vercel tokens quarterly

## Performance Optimization

The `vercel.json` configuration includes:
- Region selection (iad1 - US East)
- Function timeout limits (30 seconds for API routes)
- Security headers (XSS, clickjacking protection)

## Next Steps

1. Set up monitoring with Vercel Analytics
2. Configure error tracking (e.g., Sentry)
3. Set up database (Convex) for production
4. Configure CDN for static assets
5. Set up staging environment for QA testing

## Useful Commands

```bash
# Check deployment status
vercel ls

# View recent deployments
vercel list

# Inspect production deployment
vercel inspect [deployment-url]

# Pull environment variables
vercel env pull

# Add new environment variable
vercel env add [variable-name]
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [GitHub Actions + Vercel](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)