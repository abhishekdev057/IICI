import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ScoringEngine } from '@/lib/scoring-engine'
import { notificationService } from '@/lib/notification-service'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = session.user.id

    console.log('🚀 SUBMIT /api/applications/enhanced/[id]/submit called')
    console.log('✅ Session found for user:', session.user.email)

    // Get existing application with user data
    const existingApp = await prisma.application.findUnique({
      where: { id },
      include: {
        institutionData: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        indicatorResponses: {
          include: {
            evidence: true
          }
        }
      }
    })

    if (!existingApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (existingApp.userId !== userId && session.user.role === 'USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // OPTIMIZED: Simple transaction for status update only
    const result = await prisma.$transaction(async (tx) => {
      console.log('Starting optimized submission transaction for application:', id)
      
      // Update application status
      const updatedApplication = await tx.application.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          institutionData: true
        }
      })

      // Calculate scores from existing data
      const formData = {
        pillar_1: {},
        pillar_2: {},
        pillar_3: {},
        pillar_4: {},
        pillar_5: {},
        pillar_6: {},
      }

      // Build form data from existing indicator responses
      existingApp.indicatorResponses.forEach(response => {
        const pillarKey = `pillar_${response.pillarId}` as keyof typeof formData
        if (formData[pillarKey]) {
          formData[pillarKey][response.indicatorId] = {
            value: response.rawValue,
            normalizedScore: response.normalizedScore,
            measurementUnit: response.measurementUnit,
            evidence: response.evidence.reduce((acc: any, evidence) => {
              if (evidence.type === 'TEXT') {
                acc.text = { description: evidence.description }
              } else if (evidence.type === 'LINK') {
                acc.link = { url: evidence.url, description: evidence.description }
              } else if (evidence.type === 'FILE') {
                acc.file = {
                  fileName: evidence.fileName,
                  fileSize: evidence.fileSize,
                  fileType: evidence.fileType,
                  url: evidence.url,
                  description: evidence.description
                }
              }
              return acc
            }, {})
          }
        }
      })

      const calculatedScores = ScoringEngine.processFormData(formData)
      
      console.log('Calculated scores for submission:', {
        overallScore: calculatedScores.overallScore,
        pillarsCount: calculatedScores.pillars.length,
        certificationLevel: calculatedScores.certificationLevel
      })
      
      // Create score audit records
      if (!isNaN(calculatedScores.overallScore) && calculatedScores.pillars.length > 0) {
        for (const pillarScore of calculatedScores.pillars) {
          await tx.scoreAudit.create({
            data: {
              applicationId: id,
              userId: userId,
              pillarId: pillarScore.id,
              pillarScore: pillarScore.averageScore,
              overallScore: calculatedScores.overallScore,
              certificationLevel: calculatedScores.certificationLevel,
              calculatedBy: userId,
              scoreData: {
                pillarScores: calculatedScores.pillars,
                recommendations: calculatedScores.recommendations
              } as any
            }
          })
        }
      }

      console.log('Optimized submission transaction completed successfully')
      return updatedApplication
    }, {
      timeout: 30000, // 30 seconds should be enough for simple submission
      maxWait: 10000,
      isolationLevel: 'ReadCommitted',
    })
    
    console.log('Application submission completed successfully')

    // Send notifications after successful submission
    try {
      // Notify user that application is under review
      await notificationService.handleApplicationStatusChange({
        applicationId: id,
        userId: existingApp.userId,
        userName: existingApp.user?.name || 'User',
        userEmail: existingApp.user?.email || '',
        institutionName: existingApp.institutionData?.name || 'Institution',
        newStatus: 'UNDER_REVIEW'
      })

      // Notify admins about new application
      await notificationService.notifyAdminsOfNewApplication(
        id,
        existingApp.institutionData?.name || 'Institution'
      )

      console.log('✅ Notifications sent successfully')
    } catch (notificationError) {
      console.error('⚠️ Notification sending failed:', notificationError)
      // Don't fail the submission if notifications fail
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('Error submitting application:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    // Handle specific Prisma errors
    if (error.code === 'P2028') {
      return NextResponse.json(
        { 
          error: 'Transaction timeout',
          message: 'The submission took too long. Please try again.',
          code: error.code
        },
        { status: 408 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Duplicate entry',
          message: 'This application has already been submitted.',
          code: error.code
        },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          error: 'Record not found',
          message: 'Application not found. Please refresh and try again.',
          code: error.code
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
        code: error.code || 'UNKNOWN'
      },
      { status: 500 }
    )
  }
}
