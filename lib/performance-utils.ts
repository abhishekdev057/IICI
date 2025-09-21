/**
 * Performance Utilities for IIICI Application
 * Safe performance monitoring and optimization helpers
 */

// Performance timing utilities
export class PerformanceMonitor {
  private static timers = new Map<string, number>()
  
  static startTimer(label: string): void {
    this.timers.set(label, performance.now())
  }
  
  static endTimer(label: string): number {
    const startTime = this.timers.get(label)
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`)
      return 0
    }
    
    const duration = performance.now() - startTime
    this.timers.delete(label)
    
    // Log slow operations (>100ms)
    if (duration > 100) {
      console.log(`⏱️ Slow operation '${label}': ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  
  static measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label)
    return fn().finally(() => {
      this.endTimer(label)
    })
  }
}

// Debounce utility with performance optimization
export function optimizedDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  let timeoutId: NodeJS.Timeout | null = null
  let lastCallTime = 0
  
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    const isInvoking = !timeoutId && options.leading && now - lastCallTime >= delay
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    if (isInvoking) {
      lastCallTime = now
      return func(...args)
    }
    
    timeoutId = setTimeout(() => {
      timeoutId = null
      if (options.trailing !== false) {
        lastCallTime = Date.now()
        func(...args)
      }
    }, delay)
  }) as T
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number
  total: number
  percentage: number
} {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
    }
  }
  
  return { used: 0, total: 0, percentage: 0 }
}

// API response caching utility
export class ResponseCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  static set(key: string, data: any, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    })
  }
  
  static get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  static clear(): void {
    this.cache.clear()
  }
  
  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Bundle size optimization helper
export function lazyImport<T>(importFn: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null
  
  return () => {
    if (!promise) {
      promise = importFn()
    }
    return promise
  }
}

// Network performance monitoring
export class NetworkMonitor {
  static async measureRequest<T>(
    url: string,
    options: RequestInit = {},
    timeout: number = 10000
  ): Promise<{ data: T; duration: number; size: number }> {
    const startTime = performance.now()
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const data = await response.json()
      const duration = performance.now() - startTime
      const size = JSON.stringify(data).length
      
      // Log slow requests (>500ms)
      if (duration > 500) {
        console.log(`🐌 Slow request to ${url}: ${duration.toFixed(2)}ms (${size} bytes)`)
      }
      
      return { data, duration, size }
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}

// Component performance wrapper
export function withPerformanceMonitoring<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string
): T {
  return React.memo((props: any) => {
    const renderStart = performance.now()
    
    useEffect(() => {
      const renderTime = performance.now() - renderStart
      if (renderTime > 16) { // More than one frame (60fps)
        console.log(`🎨 Slow render for ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    })
    
    return React.createElement(Component, props)
  }) as unknown as T
}

// Import React for the component wrapper
import React, { useEffect } from 'react'
