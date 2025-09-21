/**
 * Optimization Configuration for IIICI Application
 * Safe performance optimizations that don't affect existing functionality
 */

// Performance monitoring configuration
export const PERFORMANCE_CONFIG = {
  // API response time thresholds (in milliseconds)
  API_THRESHOLDS: {
    FAST: 100,
    SLOW: 500,
    VERY_SLOW: 1000
  },
  
  // Cache TTL settings (in milliseconds)
  CACHE_TTL: {
    SHORT: 30 * 1000,      // 30 seconds
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 60 * 60 * 1000   // 1 hour
  },
  
  // Debounce delays (in milliseconds)
  DEBOUNCE_DELAYS: {
    INPUT: 300,
    SAVE: 500,
    SEARCH: 200
  },
  
  // Bundle optimization settings
  BUNDLE_OPTIMIZATION: {
    CHUNK_SIZE_LIMIT: 250000, // 250KB
    VENDOR_CHUNK_SIZE: 500000 // 500KB
  }
}

// Safe optimization utilities
export class SafeOptimizer {
  // Memory-efficient array operations
  static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
  
  // Efficient object cloning
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as any
    if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as any
    if (typeof obj === 'object') {
      const clonedObj = {} as any
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key])
        }
      }
      return clonedObj
    }
    return obj
  }
  
  // Efficient string operations
  static truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str
    return str.substring(0, maxLength - 3) + '...'
  }
  
  // Safe number parsing
  static safeParseNumber(value: any, defaultValue: number = 0): number {
    if (typeof value === 'number' && !isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? defaultValue : parsed
    }
    return defaultValue
  }
}

// API optimization helpers
export class APIOptimizer {
  // Request batching
  static batchRequests<T>(
    requests: (() => Promise<T>)[],
    batchSize: number = 5
  ): Promise<T[]> {
    const batches = SafeOptimizer.chunkArray(requests, batchSize)
    
    return Promise.all(
      batches.map(batch =>
        Promise.all(batch.map(request => request()))
      )
    ).then(results => results.flat())
  }
  
  // Request deduplication
  private static pendingRequests = new Map<string, Promise<any>>()
  
  static deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
    })
    
    this.pendingRequests.set(key, promise)
    return promise
  }
  
  // Response compression simulation
  static compressResponse(data: any): string {
    return JSON.stringify(data)
  }
}

// Component optimization helpers
export class ComponentOptimizer {
  // Memoization helper
  static createMemoizedSelector<T, R>(
    selector: (state: T) => R,
    equalityFn?: (a: R, b: R) => boolean
  ) {
    let lastResult: R
    let lastState: T
    
    return (state: T): R => {
      if (state === lastState) {
        return lastResult
      }
      
      const result = selector(state)
      
      if (equalityFn ? equalityFn(result, lastResult) : result === lastResult) {
        return lastResult
      }
      
      lastState = state
      lastResult = result
      return result
    }
  }
  
  // Virtual scrolling helper
  static calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number
  ) {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + visibleCount + 1, totalItems)
    
    return {
      startIndex: Math.max(0, startIndex - 1),
      endIndex,
      visibleCount
    }
  }
}

// Database optimization helpers
export class DatabaseOptimizer {
  // Query optimization
  static optimizeSelectFields(fields: string[]): any {
    return fields.reduce((acc, field) => {
      acc[field] = true
      return acc
    }, {} as any)
  }
  
  // Pagination helper
  static createPaginationParams(page: number, limit: number) {
    return {
      skip: (page - 1) * limit,
      take: limit
    }
  }
  
  // Batch operations
  static createBatchOperations<T>(
    items: T[],
    batchSize: number = 100
  ): T[][] {
    return SafeOptimizer.chunkArray(items, batchSize)
  }
}

// Error handling optimization
export class ErrorOptimizer {
  // Safe error logging
  static logError(error: any, context?: string): void {
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString()
    }
    
    console.error('🚨 Error:', errorInfo)
  }
  
  // Error recovery
  static withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let attempts = 0
      
      const attempt = () => {
        fn()
          .then(resolve)
          .catch((error) => {
            attempts++
            if (attempts < maxRetries) {
              setTimeout(attempt, delay * attempts)
            } else {
              reject(error)
            }
          })
      }
      
      attempt()
    })
  }
}

// Export all optimizations
export const OPTIMIZATIONS = {
  PERFORMANCE_CONFIG,
  SafeOptimizer,
  APIOptimizer,
  ComponentOptimizer,
  DatabaseOptimizer,
  ErrorOptimizer
}
