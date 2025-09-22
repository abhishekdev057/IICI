import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; step: string }> }
) {
  const startTime = Date.now()
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: applicationId, step: stepParam } = await params
    const step = parseInt(stepParam)

    if (isNaN(step) || step < 0 || step > 6) {
      return NextResponse.json({ error: 'Invalid step number' }, { status: 400 })
    }

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

    // Get basic application data first
    const application = await prisma.application.findUnique({
      where: { 
        id: applicationId,
        userId // Ensure user owns this application
      },
      include: {
        institutionData: true,
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    let stepData = {}

    if (step === 0) {
      // Step 0: Institution data only
      stepData = {
        institutionData: application.institutionData
      }
    } else {
      // Steps 1-6: Get pillar-specific data
      const pillarId = step
      
      // Get indicator responses for this pillar only
      const indicatorResponses = await prisma.indicatorResponse.findMany({
        where: {
          applicationId: applicationId,
          pillarId: pillarId
        },
        include: {
          evidence: true
        }
      })

      // Transform to pillar data format
      const pillarKey = `pillar_${pillarId}`
      const indicators: any = {}
      
      indicatorResponses.forEach(response => {
        indicators[response.indicatorId] = {
          id: response.indicatorId,
          value: response.rawValue,
          evidence: response.evidence.reduce((acc: any, evidence) => {
            acc[evidence.type.toLowerCase()] = {
              id: evidence.id,
              url: evidence.url,
              fileName: evidence.fileName,
              fileSize: evidence.fileSize,
              fileType: evidence.fileType,
              description: evidence.description,
              uploadedAt: evidence.uploadedAt,
              _persisted: true
            }
            return acc
          }, {}),
          lastModified: response.updatedAt
        }
      })

      stepData = {
        pillarData: {
          [pillarKey]: {
            indicators,
            lastModified: new Date(),
            completion: 0, // Will be calculated on frontend
            score: 0 // Will be calculated on frontend
          }
        }
      }
    }

    const responseData = {
      success: true,
      data: {
        id: application.id,
        status: application.status,
        submittedAt: application.submittedAt,
        lastSaved: application.lastSaved,
        lastModified: application.lastModified,
        currentStep: step,
        ...stepData
      },
      step,
      loadTime: Date.now() - startTime
    }

    console.log(`✅ Progressive load completed for step ${step} in ${Date.now() - startTime}ms`)
    
    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error('❌ Error in progressive load:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load step data',
        details: error.message,
        loadTime: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}
