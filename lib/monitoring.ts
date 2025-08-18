/**
 * Error monitoring and logging utilities
 * Integrates with Sentry for production error tracking
 */

interface ErrorContext {
  userId?: string;
  salonId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class ErrorMonitor {
  private isInitialized = false;
  private queue: Array<{ error: Error; context?: ErrorContext }> = [];

  /**
   * Initialize Sentry (call this in app initialization)
   */
  async initialize() {
    if (this.isInitialized) return;
    
    // Only initialize in production
    if (process.env.NODE_ENV !== 'production') {
      this.isInitialized = true;
      return;
    }

    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      console.warn('Sentry DSN not configured');
      return;
    }

    try {
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1, // 10% of transactions
        debug: false,
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        integrations: [
          new Sentry.BrowserTracing({
            tracePropagationTargets: [
              'localhost',
              /^https:\/\/yourapp\.com\/api/,
            ],
          }),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
      });

      this.isInitialized = true;

      // Process queued errors
      while (this.queue.length > 0) {
        const { error, context } = this.queue.shift()!;
        this.captureError(error, context);
      }
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Capture an error with context
   */
  captureError(error: Error, context?: ErrorContext) {
    // Queue errors if not initialized
    if (!this.isInitialized) {
      this.queue.push({ error, context });
      return;
    }

    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', error, context);
      return;
    }

    // Send to Sentry in production
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      
      Sentry.withScope((scope: any) => {
        if (context?.userId) {
          scope.setUser({ id: context.userId });
        }
        
        if (context?.component) {
          scope.setTag('component', context.component);
        }
        
        if (context?.action) {
          scope.setTag('action', context.action);
        }
        
        if (context?.salonId) {
          scope.setContext('salon', { id: context.salonId });
        }
        
        if (context?.metadata) {
          scope.setContext('metadata', context.metadata);
        }
        
        Sentry.captureException(error);
      });
    }
  }

  /**
   * Log a message with severity
   */
  logMessage(
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    context?: ErrorContext
  ) {
    if (process.env.NODE_ENV === 'development') {
      const logFn = level === 'error' ? console.error : 
                    level === 'warning' ? console.warn : 
                    console.log;
      logFn(message, context);
      return;
    }

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      Sentry.captureMessage(message, level);
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    name: string,
    value: number,
    unit: 'milliseconds' | 'seconds' | 'bytes' | 'percent' = 'milliseconds'
  ) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      const transaction = Sentry.getCurrentHub().getScope().getTransaction();
      
      if (transaction) {
        transaction.setMeasurement(name, value, unit);
      }
    }
  }

  /**
   * Create a transaction for monitoring
   */
  startTransaction(name: string, op: string = 'navigation') {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const Sentry = (window as any).Sentry;
      return Sentry.startTransaction({ name, op });
    }
    return null;
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitor();

/**
 * Convenience functions
 */
export function captureError(error: Error, context?: ErrorContext) {
  errorMonitor.captureError(error, context);
}

export function logMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
) {
  errorMonitor.logMessage(message, level, context);
}

export function trackPerformance(
  name: string,
  value: number,
  unit: 'milliseconds' | 'seconds' | 'bytes' | 'percent' = 'milliseconds'
) {
  errorMonitor.trackPerformance(name, value, unit);
}

/**
 * React Error Boundary integration
 */
export function logErrorToService(error: Error, errorInfo: any) {
  captureError(error, {
    component: errorInfo?.componentStack || 'Unknown',
    metadata: {
      errorBoundary: true,
      errorInfo,
    },
  });
}