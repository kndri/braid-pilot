/**
 * Performance monitoring utilities
 * Tracks web vitals and custom metrics
 */

import { trackPerformance } from './monitoring';

/**
 * Web Vitals metrics
 */
export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint
}

/**
 * Track web vitals using the web-vitals library
 */
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Dynamically import web-vitals to avoid SSR issues
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS((metric) => {
      trackPerformance('CLS', metric.value, 'percent');
    });
    
    onFID((metric) => {
      trackPerformance('FID', metric.value, 'milliseconds');
    });
    
    onFCP((metric) => {
      trackPerformance('FCP', metric.value, 'milliseconds');
    });
    
    onLCP((metric) => {
      trackPerformance('LCP', metric.value, 'milliseconds');
    });
    
    onTTFB((metric) => {
      trackPerformance('TTFB', metric.value, 'milliseconds');
    });
    
    onINP((metric) => {
      trackPerformance('INP', metric.value, 'milliseconds');
    });
  });
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    trackPerformance(`${componentName}_render`, renderTime, 'milliseconds');
  };
}

/**
 * Measure API call duration
 */
export async function measureApiCall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    trackPerformance(`api_${name}`, duration, 'milliseconds');
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackPerformance(`api_${name}_error`, duration, 'milliseconds');
    throw error;
  }
}

/**
 * Track memory usage (if available)
 */
export function trackMemoryUsage() {
  if (typeof window === 'undefined') return;
  
  // Check if memory API is available
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    trackPerformance('memory_used', memory.usedJSHeapSize, 'bytes');
    trackPerformance('memory_total', memory.totalJSHeapSize, 'bytes');
    trackPerformance('memory_limit', memory.jsHeapSizeLimit, 'bytes');
    
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    trackPerformance('memory_usage_percent', usagePercent, 'percent');
  }
}

/**
 * Create a performance observer
 */
export function observePerformance() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // Observe long tasks
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          trackPerformance('long_task', entry.duration, 'milliseconds');
        }
      }
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Long task observer not supported
  }

  // Observe navigation timing
  try {
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        
        trackPerformance('nav_dns', navEntry.domainLookupEnd - navEntry.domainLookupStart, 'milliseconds');
        trackPerformance('nav_tcp', navEntry.connectEnd - navEntry.connectStart, 'milliseconds');
        trackPerformance('nav_request', navEntry.responseStart - navEntry.requestStart, 'milliseconds');
        trackPerformance('nav_response', navEntry.responseEnd - navEntry.responseStart, 'milliseconds');
        trackPerformance('nav_dom', navEntry.domComplete - navEntry.domInteractive, 'milliseconds');
        trackPerformance('nav_load', navEntry.loadEventEnd - navEntry.loadEventStart, 'milliseconds');
      }
    });
    
    navObserver.observe({ entryTypes: ['navigation'] });
  } catch (e) {
    // Navigation observer not supported
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Track web vitals
  trackWebVitals();
  
  // Set up performance observer
  observePerformance();
  
  // Track memory usage periodically (every 30 seconds)
  setInterval(trackMemoryUsage, 30000);
  
  // Track initial page load
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    trackPerformance('page_load', loadTime, 'milliseconds');
  });
}