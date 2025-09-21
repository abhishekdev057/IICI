/**
 * Safe Cache Utilities for IIICI Application
 * Performance optimizations without affecting existing functionality
 */

// Simple in-memory cache for API responses
class SafeCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const apiCache = new SafeCache()

// Cache key generators
export const CacheKeys = {
  userApplications: (userId: string) => `user_apps_${userId}`,
  applicationDetails: (appId: string) => `app_details_${appId}`,
  userStats: (userId: string) => `user_stats_${userId}`,
  adminStats: () => 'admin_stats',
}

// Safe cache wrapper for API functions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 300000
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    
    // Try to get from cache first
    const cached = apiCache.get(key)
    if (cached) {
      return cached
    }
    
    // Execute function and cache result
    const result = await fn(...args)
    apiCache.set(key, result, ttl)
    
    return result
  }) as T
}

// Performance monitoring for cache
export function getCacheStats() {
  return {
    size: apiCache['cache'].size,
    keys: Array.from(apiCache['cache'].keys())
  }
}

// Auto cleanup every 10 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    apiCache.cleanup()
  }, 600000) // 10 minutes
}
