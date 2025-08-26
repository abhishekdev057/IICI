import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from session (should be set by session callback now)
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

    // Get applications for the current user with minimal data for performance
    const applications = await prisma.application.findMany({
      where: { 
        userId: userId 
      },
      include: {
        institutionData: true,
        scoreAudits: {
          take: 1,
          orderBy: { calculatedAt: 'desc' }
        }
      },
      orderBy: { 
        updatedAt: 'desc' 
      }
    })

    return NextResponse.json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error('❌ Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from session (should be set by session callback now)
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

    // Ensure user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!userExists) {
      console.error('❌ User not found in database:', userId)
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Check if user already has an application
    const existingApp = await prisma.application.findFirst({
      where: { userId: userId },
      include: { institutionData: true }
    })

    if (existingApp) {
      return NextResponse.json({
        success: true,
        data: existingApp
      })
    }

    // Create institution data with minimal requirements
    let institution
    try {
      institution = await prisma.institutionData.create({
        data: {
          userId: userId,
          name: "",
          industry: "",
          organizationSize: "",
          country: "",
          contactEmail: session.user.email || "",
        }
      })
    } catch (institutionError) {
      console.error('❌ Error creating institution data:', institutionError)
      
      // Check if institution already exists
      const existingInstitution = await prisma.institutionData.findUnique({
        where: { userId: userId }
      })
      
      if (existingInstitution) {
        institution = existingInstitution
      } else {
        throw institutionError
      }
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: userId,
        institutionId: institution.id,
        status: 'DRAFT',
        pillarData: {}
      },
      include: {
        institutionData: true
      }
    })

    return NextResponse.json({
      success: true,
      data: application
    })
  } catch (error) {
    console.error('❌ Error creating application:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Application already exists for this user' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Foreign key constraint violation - user may not exist' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create application', details: error.message },
      { status: 500 }
    )
  }
}