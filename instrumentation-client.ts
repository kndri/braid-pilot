import posthog from "posthog-js"
import * as Sentry from "@sentry/nextjs"

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: '2025-05-24',
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking
  debug: process.env.NODE_ENV === "development",
});

// Client-side Sentry initialization (env-driven; no hardcoded keys)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: process.env.NODE_ENV === "development",
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
