/**
 * Safe Optimizations for IIICI Application
 * Performance improvements that don't affect existing functionality
 */

// Safe performance utilities
export class SafeOptimizer {
  // Debounce with immediate execution for rapid calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): T {
    let timeoutId: NodeJS.Timeout
    let lastCallTime = 0
    
    return ((...args: any[]) => {
      const now = Date.now()
      
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      // If enough time has passed since last call, execute immediately
      if (now - lastCallTime >= delay) {
        lastCallTime = now
        return func(...args)
      }
      
      // Otherwise, schedule for later
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now()
        func(...args)
      }, delay)
    }) as T
  }
  
  // Throttle function for high-frequency events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean
    
    return ((...args: any[]) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }) as T
  }
  
  // Safe array chunking for large datasets
  static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
  
  // Safe object deep clone
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
  
  // Safe performance measurement
  static measurePerformance<T>(
    name: string,
    fn: () => T
  ): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    if (end - start > 100) {
      console.log(`⏱️ Slow operation '${name}': ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }
  
  // Safe async performance measurement
  static async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    
    if (end - start > 100) {
      console.log(`⏱️ Slow async operation '${name}': ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }
}

// Safe memory management utilities
export class MemoryOptimizer {
  private static cache = new Map<string, any>()
  private static maxCacheSize = 100
  
  // Safe cache with size limit
  static setCache(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }
  
  static getCache(key: string): any {
    return this.cache.get(key)
  }
  
  static clearCache(): void {
    this.cache.clear()
  }
  
  // Safe array operations
  static removeDuplicates<T>(array: T[], key?: keyof T): T[] {
    if (!key) {
      return [...new Set(array)]
    }
    
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }
  
  // Safe object operations
  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    return result
  }
  
  static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj }
    keys.forEach(key => {
      delete result[key]
    })
    return result
  }
}

// Safe validation utilities
export class ValidationOptimizer {
  // Safe email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Safe URL validation
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  // Safe number validation
  static isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value)
  }
  
  // Safe string validation
  static isValidString(value: any): boolean {
    return typeof value === 'string' && value.trim().length > 0
  }
}

// Export all optimizers
export const SafeOptimizations = {
  SafeOptimizer,
  MemoryOptimizer,
  ValidationOptimizer
}
