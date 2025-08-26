import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's notifications, ordered by most recent first
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to last 20 notifications
    })

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: { 
        userId: user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { notificationIds } = await request.json()

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 })
    }

    // Mark notifications as read
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.id
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    })

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
