// Performance monitoring and optimization utilities
import React from 'react';

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start measuring performance
  startMeasure(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.performance.mark(`${name}-start`);
    }
  }

  // Alias for startMeasure for component mount tracking
  startMount(name: string): void {
    this.startMeasure(name);
  }

  // End measuring performance
  endMeasure(name: string): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        window.performance.mark(`${name}-end`);
        window.performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measure = window.performance.getEntriesByName(name, 'measure')[0];
        const duration = measure ? measure.duration : 0;
        
        // Store metric
        if (!this.metrics.has(name)) {
          this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(duration);
        
        // Clean up marks and measures
        window.performance.clearMarks(`${name}-start`);
        window.performance.clearMarks(`${name}-end`);
        window.performance.clearMeasures(name);
        
        return duration;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  }

  // Get average performance for a metric
  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Get all metrics
  getAllMetrics(): Record<string, { average: number; count: number; min: number; max: number }> {
    const result: Record<string, { average: number; count: number; min: number; max: number }> = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        result[name] = {
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values),
        };
      }
    });
    
    return result;
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Observe performance entries
  observePerformance(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Observe navigation timing
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              console.log('Navigation Performance:', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                firstPaint: navEntry.responseStart - navEntry.requestStart,
              });
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('Largest Contentful Paint:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe first input delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log('First Input Delay:', (entry as any).processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('Performance observation not supported:', error);
      }
    }
  }

  // Disconnect all observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoize utility for expensive computations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function executedFunction(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}

// RequestIdleCallback utility
export function runWhenIdle(
  callback: () => void,
  timeout?: number
): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, timeout || 1);
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    });
  }
  return null;
}

// Image optimization utilities
export const optimizeImage = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}
): string => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // This is a placeholder - in a real app, you'd use an image optimization service
  // like Next.js Image, Cloudinary, or Imgix
  let optimizedSrc = src;
  
  if (width || height) {
    const dimensions = width ? `w=${width}` : `h=${height}`;
    optimizedSrc += `?${dimensions}`;
  }
  
  if (quality !== 80) {
    optimizedSrc += `${optimizedSrc.includes('?') ? '&' : '?'}q=${quality}`;
  }
  
  if (format !== 'webp') {
    optimizedSrc += `&f=${format}`;
  }
  
  return optimizedSrc;
};

// Preload critical resources
export const preloadResource = (
  href: string,
  as: string,
  type?: string,
  crossorigin?: string
): void => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    if (crossorigin) link.crossOrigin = crossorigin;
    document.head.appendChild(link);
  }
};

// Preload critical images
export const preloadImages = (imageUrls: string[]): void => {
  imageUrls.forEach(src => {
    preloadResource(src, 'image');
  });
};

// Font optimization
export const preloadFont = (
  href: string,
  type: string = 'font/woff2',
  crossorigin: string = 'anonymous'
): void => {
  preloadResource(href, 'font', type, crossorigin);
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (css: string): void => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
};

// Performance hooks for React
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    monitor.startMount(`${componentName}-mount`);
    
    return () => {
      monitor.endMeasure(`${componentName}-mount`);
      monitor.startMount(`${componentName}-unmount`);
      monitor.endMeasure(`${componentName}-unmount`);
    };
  }, [componentName, monitor]);
};

// Custom hook for debounced values
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for throttled values
export const useThrottledValue = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = (): void => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.observePerformance();
  
  // Log performance metrics periodically
  setInterval(() => {
    const metrics = monitor.getAllMetrics();
    const slowMetrics = Object.entries(metrics).filter(([_, data]) => data.average > 100);
    
    if (slowMetrics.length > 0) {
      console.warn('Slow performance detected:', slowMetrics);
    }
  }, 30000); // Check every 30 seconds
};
