import { NextRequest, NextResponse } from 'next/server'

// Cache configuration
const CACHE_DURATION = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
}

// Response headers for caching
export function getCacheHeaders(duration: number = CACHE_DURATION.MEDIUM) {
  return {
    'Cache-Control': `public, max-age=${duration}, stale-while-revalidate=${duration * 2}`,
    'CDN-Cache-Control': `max-age=${duration}`,
    'Vercel-CDN-Cache-Control': `max-age=${duration}`,
  }
}

// Response headers for no caching
export function getNoCacheHeaders() {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}

// Optimized JSON response with compression
export function createOptimizedResponse(data: any, options: {
  status?: number
  cache?: number
  compress?: boolean
} = {}) {
  const { status = 200, cache = CACHE_DURATION.MEDIUM, compress = true } = options
  
  const headers = new Headers()
  
  // Set cache headers
  if (cache > 0) {
    Object.entries(getCacheHeaders(cache)).forEach(([key, value]) => {
      headers.set(key, value)
    })
  } else {
    Object.entries(getNoCacheHeaders()).forEach(([key, value]) => {
      headers.set(key, value)
    })
  }
  
  // Set content type
  headers.set('Content-Type', 'application/json')
  
  // Enable compression
  if (compress) {
    headers.set('Content-Encoding', 'gzip')
  }
  
  // Add performance headers
  headers.set('X-Response-Time', Date.now().toString())
  headers.set('X-Content-Size', JSON.stringify(data).length.toString())
  
  return new NextResponse(JSON.stringify(data), {
    status,
    headers,
  })
}

// Error response helper
export function createErrorResponse(
  message: string, 
  status: number = 500, 
  details?: any
) {
  const errorData = {
    error: message,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  }
  
  return createOptimizedResponse(errorData, {
    status,
    cache: 0, // Don't cache errors
    compress: false
  })
}

// Success response helper
export function createSuccessResponse(
  data: any, 
  message?: string,
  cache: number = CACHE_DURATION.MEDIUM
) {
  const responseData = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(message && { message })
  }
  
  return createOptimizedResponse(responseData, {
    status: 200,
    cache,
    compress: true
  })
}

// Request timing middleware
export function withTiming(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const start = Date.now()
    
    try {
      const response = await handler(request, ...args)
      
      // Add timing header
      if (response instanceof NextResponse) {
        response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
      }
      
      return response
    } catch (error) {
      console.error(`Request failed after ${Date.now() - start}ms:`, error)
      throw error
    }
  }
}

// Database query optimization
export function optimizeQuery(query: any, options: {
  select?: string[]
  include?: any
  take?: number
  skip?: number
  orderBy?: any
}) {
  const { select, include, take, skip, orderBy } = options
  
  let optimizedQuery = { ...query }
  
  // Add select for specific fields only
  if (select && select.length > 0) {
    optimizedQuery.select = select.reduce((acc, field) => {
      acc[field] = true
      return acc
    }, {} as any)
  }
  
  // Add include for relations
  if (include) {
    optimizedQuery.include = include
  }
  
  // Add pagination
  if (take) optimizedQuery.take = take
  if (skip) optimizedQuery.skip = skip
  
  // Add ordering
  if (orderBy) optimizedQuery.orderBy = orderBy
  
  return optimizedQuery
}

// Memory-efficient data processing
export async function processLargeDataset<T>(
  data: T[], 
  processor: (item: T) => any,
  batchSize: number = 100
): Promise<any[]> {
  const results: any[] = []
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    const processedBatch = batch.map(processor)
    results.push(...processedBatch)
    
    // Allow event loop to process other tasks
    if (i + batchSize < data.length) {
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  
  return results
}

// Request validation
export function validateRequest(request: NextRequest, requiredFields: string[] = []) {
  const errors: string[] = []
  
  // Check method
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    errors.push(`Invalid HTTP method: ${request.method}`)
  }
  
  // Check content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      errors.push('Content-Type must be application/json')
    }
  }
  
  // Check required fields in URL
  const url = new URL(request.url)
  requiredFields.forEach(field => {
    if (!url.searchParams.has(field)) {
      errors.push(`Missing required parameter: ${field}`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  limit: number = 100, 
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs
    }
  }
  
  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }
  
  // Increment count
  current.count++
  rateLimitMap.set(key, current)
  
  return {
    allowed: true,
    remaining: limit - current.count,
    resetTime: current.resetTime
  }
}
