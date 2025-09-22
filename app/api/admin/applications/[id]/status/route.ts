import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/notification-service'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status, message } = await request.json()
    const valid = ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED', 'PENDING_EVIDENCE']
    if (!valid.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get application with user and institution data for notifications
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        institutionData: {
          select: {
            name: true
          }
        },
        scoreAudits: {
          select: {
            certificationLevel: true
          },
          orderBy: {
            calculatedAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    })

    // Log review action
    await prisma.adminReview.create({
      data: {
        applicationId: id,
        reviewerId: session.user.id,
        action: status === 'APPROVED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : status === 'RESUBMISSION_REQUIRED' ? 'REQUEST_EVIDENCE' : 'REQUEST_EVIDENCE',
        comments: message || '',
      },
    }).catch(() => {})

    // Send comprehensive notifications (in-app + email)
    try {
      const certificationLevel = application.scoreAudits[0]?.certificationLevel || 'NOT_CERTIFIED'
      
      await notificationService.handleApplicationStatusChange({
        applicationId: id,
        userId: application.userId,
        userName: application.user?.name || 'User',
        userEmail: application.user?.email || '',
        institutionName: application.institutionData?.name || 'Institution',
        newStatus: status as 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUIRED',
        reason: message,
        certificationLevel: certificationLevel
      })

      console.log('✅ Status change notifications sent successfully')
    } catch (notificationError) {
      console.error('⚠️ Status change notification failed:', notificationError)
      // Don't fail the status update if notifications fail
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}


