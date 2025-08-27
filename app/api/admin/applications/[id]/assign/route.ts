import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json().catch(() => ({}))
    const reviewerId = body.reviewerId || session.user.id

    // Ensure application exists
    const app = await prisma.application.findUnique({ where: { id }, select: { id: true } })
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        reviewedBy: reviewerId,
        status: 'UNDER_REVIEW',
      },
    })

    // Optional: log admin review assignment
    await prisma.adminReview.create({
      data: {
        applicationId: id,
        reviewerId: session.user.id,
        action: 'REQUEST_EVIDENCE', // using as generic assignment log
        comments: `Assigned to reviewer ${reviewerId}`,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error assigning application:', error)
    return NextResponse.json({ error: 'Failed to assign application' }, { status: 500 })
  }
}


