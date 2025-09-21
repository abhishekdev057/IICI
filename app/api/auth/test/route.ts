import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID;
    const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;
    
    // Check database connection
    let dbStatus = 'unknown';
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
      console.error('Database connection test failed:', error);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasGoogleClientId,
        hasGoogleClientSecret,
        hasNextAuthSecret,
        hasNextAuthUrl,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      },
      database: {
        status: dbStatus,
      },
      message: 'NextAuth configuration test completed'
    });
  } catch (error) {
    console.error('NextAuth test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
