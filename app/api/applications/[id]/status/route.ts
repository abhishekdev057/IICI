import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get application with review comments
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        institutionData: {
          select: {
            name: true,
            industry: true,
            country: true
          }
        },
        scoreAudits: {
          select: {
            overallScore: true,
            certificationLevel: true,
            calculatedAt: true
          },
          orderBy: {
            calculatedAt: 'desc'
          },
          take: 1
        },
        adminReviews: {
          select: {
            comments: true,
            action: true,
            createdAt: true,
            reviewer: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user owns this application or is admin
    if (application.userId !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the latest review comments
    const latestReview = application.adminReviews[0]
    const reviewComments = latestReview?.comments || ''

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          status: application.status,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt,
          institutionData: application.institutionData,
          scoreAudits: application.scoreAudits
        },
        reviewComments
      }
    })
  } catch (error: any) {
    console.error('Error fetching application status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application status', details: error.message },
      { status: 500 }
    )
  }
}
