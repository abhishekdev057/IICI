import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { status, message } = await request.json()
    const valid = ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PENDING_EVIDENCE']
    if (!valid.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
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
        action: status === 'APPROVED' ? 'APPROVE' : status === 'REJECTED' ? 'REJECT' : 'REQUEST_EVIDENCE',
        comments: message || '',
      },
    }).catch(() => {})

    // Optional: notify user via Notification
    try {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: `Application ${status.replace('_', ' ')}`,
          message: message || `Your application status has been updated to ${status}`,
          type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'ASSESSMENT',
        },
      })
    } catch {}

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}


