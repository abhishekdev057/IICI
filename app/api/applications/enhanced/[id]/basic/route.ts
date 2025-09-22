import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: applicationId } = await params

    // Get user ID from session
    let userId = session.user.id
    if (!userId && session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      if (dbUser) {
        userId = dbUser.id
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    // Get only basic application data - NO heavy relations
    const application = await prisma.application.findUnique({
      where: { 
        id: applicationId,
        userId // Ensure user owns this application
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        lastSaved: true,
        lastModified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const responseData = {
      success: true,
      data: {
        id: application.id,
        status: application.status,
        submittedAt: application.submittedAt,
        lastSaved: application.lastSaved,
        lastModified: application.lastModified,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt
      },
      loadTime: Date.now() - startTime
    }

    console.log(`✅ Basic application data loaded in ${Date.now() - startTime}ms`)
    
    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error('❌ Error loading basic application data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load basic application data',
        details: error.message,
        loadTime: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}
