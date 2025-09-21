import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, withTiming } from '@/lib/api-optimization'

export const GET = withTiming(async (request: NextRequest) => {
  try {
    const startTime = Date.now()
    
    // Check database connectivity
    let dbStatus = 'healthy'
    let dbLatency = 0
    
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbLatency = Date.now() - dbStart
    } catch (error) {
      dbStatus = 'unhealthy'
      console.error('Database health check failed:', error)
    }
    
    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    }
    
    // Check uptime
    const uptime = process.uptime()
    
    // Overall health status
    const isHealthy = dbStatus === 'healthy' && memoryUsageMB.heapUsed < 500 // Less than 500MB heap usage
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          latency: dbLatency
        },
        memory: {
          ...memoryUsageMB,
          status: memoryUsageMB.heapUsed < 500 ? 'healthy' : 'warning'
        }
      },
      responseTime: Date.now() - startTime
    }
    
    return createSuccessResponse(healthData, 'Health check completed', 0) // No caching for health checks
  } catch (error) {
    console.error('Health check failed:', error)
    return createErrorResponse('Health check failed', 500, error)
  }
})

// HEAD method for simple connectivity checks
export const HEAD = async () => {
  try {
    // Quick database ping
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
