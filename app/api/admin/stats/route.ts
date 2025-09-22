import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin or super admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Access denied. Admin access required." }, { status: 403 })
    }

    // Get dashboard statistics
    const [
      totalUsers,
      totalApplications,
      pendingReviews,
      approvedApplications,
      rejectedApplications,
      averageScoreResult,
      certificationBreakdown
    ] = await Promise.all([
      // Total users
      prisma.user.count({
        where: { isActive: true }
      }),

      // Total applications
      prisma.application.count(),

      // Pending reviews (submitted but not reviewed)
      prisma.application.count({
        where: {
          status: {
            in: ['SUBMITTED', 'UNDER_REVIEW']
          }
        }
      }),

      // Approved applications
      prisma.application.count({
        where: { status: 'APPROVED' }
      }),

      // Rejected applications
      prisma.application.count({
        where: { status: 'REJECTED' }
      }),

      // Average score from latest score audits
      prisma.scoreAudit.aggregate({
        _avg: {
          overallScore: true
        },
        where: {
          calculatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),

      // Certification breakdown
      prisma.scoreAudit.groupBy({
        by: ['certificationLevel'],
        _count: {
          certificationLevel: true
        },
        where: {
          calculatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ])

    // Process certification breakdown
    const certificationStats = {
      CERTIFIED: 0,
      NOT_CERTIFIED: 0
    }

    certificationBreakdown.forEach(item => {
      if (item.certificationLevel in certificationStats) {
        certificationStats[item.certificationLevel as keyof typeof certificationStats] = item._count.certificationLevel
      }
    })

    const stats = {
      totalUsers,
      totalApplications,
      pendingReviews,
      approvedApplications,
      rejectedApplications,
      averageScore: averageScoreResult._avg.overallScore || 0,
      certificationBreakdown: certificationStats
    }

    return NextResponse.json({ 
      success: true,
      stats 
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}