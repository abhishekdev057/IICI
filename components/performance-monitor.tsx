"use client"

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, Zap, Clock, Wifi, Database, Cpu } from 'lucide-react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkLatency: number
  cacheHitRate: number
  errorRate: number
  lastUpdate: Date
}

interface PerformanceMonitorProps {
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function PerformanceMonitor({ 
  showDetails = false, 
  autoRefresh = true, 
  refreshInterval = 5000 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    errorRate: 0,
    lastUpdate: new Date()
  })

  const [isVisible, setIsVisible] = useState(false)

  // Measure performance metrics
  const measurePerformance = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      // Measure memory usage
      const memoryInfo = (performance as any).memory
      const memoryUsage = memoryInfo ? 
        Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100) : 0

      // Measure network latency (simple ping to a fast endpoint)
      const networkStart = performance.now()
      try {
        await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
      } catch {
        // Ignore network errors for latency measurement
      }
      const networkLatency = Math.round(performance.now() - networkStart)

      // Calculate render time
      const renderTime = Math.round(performance.now() - startTime)

      // Simulate cache hit rate (in real app, this would come from your cache system)
      const cacheHitRate = Math.random() * 100

      // Simulate error rate (in real app, this would come from your error tracking)
      const errorRate = Math.random() * 5

      setMetrics({
        loadTime: Math.round(performance.now() - window.performance.timing.navigationStart),
        renderTime,
        memoryUsage,
        networkLatency,
        cacheHitRate,
        errorRate,
        lastUpdate: new Date()
      })
    } catch (error) {
      console.error('Error measuring performance:', error)
    }
  }, [])

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(measurePerformance, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, measurePerformance])

  // Initial measurement
  useEffect(() => {
    measurePerformance()
  }, [measurePerformance])

  // Keyboard shortcut to toggle visibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault()
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isVisible && !showDetails) {
    return null
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'default'
    if (value <= thresholds.warning) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
            <Badge variant="outline" className="text-xs">
              Ctrl+Shift+P
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Load Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Load Time
              </span>
              <span className={getPerformanceColor(metrics.loadTime, { good: 2000, warning: 5000 })}>
                {metrics.loadTime}ms
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.loadTime / 10000) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Memory Usage */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                Memory
              </span>
              <span className={getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 80 })}>
                {metrics.memoryUsage}%
              </span>
            </div>
            <Progress 
              value={metrics.memoryUsage} 
              className="h-1"
            />
          </div>

          {/* Network Latency */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Network
              </span>
              <span className={getPerformanceColor(metrics.networkLatency, { good: 100, warning: 500 })}>
                {metrics.networkLatency}ms
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.networkLatency / 1000) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Render Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                Render
              </span>
              <span className={getPerformanceColor(metrics.renderTime, { good: 16, warning: 33 })}>
                {metrics.renderTime}ms
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.renderTime / 100) * 100, 100)} 
              className="h-1"
            />
          </div>

          {/* Cache Hit Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Cache Hit
              </span>
              <span className={getPerformanceColor(100 - metrics.cacheHitRate, { good: 20, warning: 50 })}>
                {Math.round(metrics.cacheHitRate)}%
              </span>
            </div>
            <Progress 
              value={metrics.cacheHitRate} 
              className="h-1"
            />
          </div>

          {/* Error Rate */}
          {metrics.errorRate > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-red-600">
                  ⚠️ Errors
                </span>
                <span className="text-red-600">
                  {metrics.errorRate.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={metrics.errorRate * 20} 
                className="h-1"
              />
            </div>
          )}

          {/* Last Update */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last updated: {metrics.lastUpdate.toLocaleTimeString()}
          </div>

          {/* Performance Summary */}
          <div className="flex gap-1 justify-center">
            <Badge 
              variant={getPerformanceBadge(metrics.loadTime, { good: 2000, warning: 5000 })}
              className="text-xs"
            >
              Load
            </Badge>
            <Badge 
              variant={getPerformanceBadge(metrics.memoryUsage, { good: 50, warning: 80 })}
              className="text-xs"
            >
              Memory
            </Badge>
            <Badge 
              variant={getPerformanceBadge(metrics.networkLatency, { good: 100, warning: 500 })}
              className="text-xs"
            >
              Network
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  const measurePerformance = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      const memoryInfo = (performance as any).memory
      const memoryUsage = memoryInfo ? 
        Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100) : 0

      const networkStart = performance.now()
      try {
        await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' })
      } catch {
        // Ignore network errors
      }
      const networkLatency = Math.round(performance.now() - networkStart)

      const renderTime = Math.round(performance.now() - startTime)

      setMetrics({
        loadTime: Math.round(performance.now() - window.performance.timing.navigationStart),
        renderTime,
        memoryUsage,
        networkLatency,
        cacheHitRate: Math.random() * 100,
        errorRate: Math.random() * 5,
        lastUpdate: new Date()
      })
    } catch (error) {
      console.error('Error measuring performance:', error)
    }
  }, [])

  useEffect(() => {
    measurePerformance()
    const interval = setInterval(measurePerformance, 10000) // Every 10 seconds
    return () => clearInterval(interval)
  }, [measurePerformance])

  return { metrics, measurePerformance }
}
