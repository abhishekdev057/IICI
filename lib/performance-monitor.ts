/**
 * Performance Monitor for IIICI Application
 * Safe performance tracking without affecting existing functionality
 */

// Performance metrics collection
interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private activeTimers = new Map<string, number>()
  
  // Start timing an operation
  start(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now()
    this.activeTimers.set(name, startTime)
    
    this.metrics.push({
      name,
      startTime,
      metadata
    })
  }
  
  // End timing an operation
  end(name: string): number {
    const startTime = this.activeTimers.get(name)
    if (!startTime) {
      console.warn(`Performance timer '${name}' was not started`)
      return 0
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Update the metric
    const metric = this.metrics.find(m => m.name === name && !m.endTime)
    if (metric) {
      metric.endTime = endTime
      metric.duration = duration
    }
    
    this.activeTimers.delete(name)
    
    // Log slow operations
    if (duration > 100) {
      console.log(`⏱️ Slow operation '${name}': ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  // Measure async function execution
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata)
    try {
      const result = await fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }
  
  // Get performance summary
  getSummary(): {
    totalOperations: number
    averageDuration: number
    slowOperations: PerformanceMetric[]
    recentOperations: PerformanceMetric[]
  } {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined)
    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    const averageDuration = completedMetrics.length > 0 ? totalDuration / completedMetrics.length : 0
    
    const slowOperations = completedMetrics.filter(m => (m.duration || 0) > 100)
    const recentOperations = completedMetrics.slice(-10) // Last 10 operations
    
    return {
      totalOperations: completedMetrics.length,
      averageDuration,
      slowOperations,
      recentOperations
    }
  }
  
  // Clear old metrics (keep last 100)
  cleanup(): void {
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    start: performanceMonitor.start.bind(performanceMonitor),
    end: performanceMonitor.end.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor)
  }
}

// API response time decorator
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    return performanceMonitor.measureAsync(operationName, () => fn(...args))
  }) as T
}

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    performanceMonitor.cleanup()
  }, 300000) // 5 minutes
}
