import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from session
    let userId = session.user.id
    
    // Fallback: if no user ID, try to find user by email
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
    } else if (!userId) {
      return NextResponse.json({ error: 'Invalid session - no user ID or email' }, { status: 400 })
    }

    // OPTIMIZED: Fetch only basic data for fast initial load
    const application = await prisma.application.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        updatedAt: true,
        institutionData: {
          select: {
            name: true,
            industry: true,
            organizationSize: true,
            country: true,
            contactEmail: true,
            logo: true,
            website: true,
            yearFounded: true
          }
        },
        scoreAudits: {
          select: {
            calculatedAt: true,
            scoreData: true
          },
          orderBy: { calculatedAt: 'desc' },
          take: 1
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'No application found' }, { status: 404 })
    }

    // Get basic scores from latest audit
    const latestScoreAudit = application.scoreAudits[0]
    let overallScore = 0
    let certificationLevel = "NOT_CERTIFIED"
    let pillarScores = [0, 0, 0, 0, 0, 0]

    if (latestScoreAudit?.scoreData) {
      const scoreData = latestScoreAudit.scoreData as any
      overallScore = scoreData?.overallScore || 0
      pillarScores = scoreData?.pillarScores || [0, 0, 0, 0, 0, 0]
      
      if (overallScore >= 80) certificationLevel = "CERTIFIED"
      else if (overallScore >= 60) certificationLevel = "CERTIFIED"
    }

    // Prepare basic dashboard data
    const basicDashboardData = {
      application: {
        id: application.id,
        status: application.status,
        submittedAt: application.submittedAt,
        updatedAt: application.updatedAt,
        lastSaved: application.updatedAt
      },
      institutionData: application.institutionData,
      scores: {
        overallScore,
        certificationLevel,
        pillarScores,
        lastCalculated: latestScoreAudit?.calculatedAt || application.updatedAt
      }
    }

    return NextResponse.json({
      success: true,
      data: basicDashboardData
    })

  } catch (error) {
    console.error('Error fetching basic dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
