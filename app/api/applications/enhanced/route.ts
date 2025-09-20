import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ScoringEngine } from '@/lib/scoring-engine'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Get applications with enhanced data structure
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        institutionData: true,
        indicatorResponses: {
          include: {
            evidence: true
          }
        },
        scoreAudits: {
          take: 1,
          orderBy: { calculatedAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Transform data for frontend
    const transformedApplications = applications.map(app => {
      // Reconstruct pillar data from indicator responses
      const pillarData: any = {}
      
      app.indicatorResponses.forEach(response => {
        const pillarKey = `pillar_${response.pillarId}`
        if (!pillarData[pillarKey]) {
          pillarData[pillarKey] = {
            indicators: {},
            evidence: {},
            lastModified: response.updatedAt,
            completion: 0,
            score: 0
          }
        }
        
        // Add indicator data with evidence properly merged
        const evidence: any = {}
        if (response.evidence && response.evidence.length > 0) {
          response.evidence.forEach(ev => {
            if (ev.type === 'FILE' && ev.fileName) {
              evidence.file = {
                fileName: ev.fileName,
                fileSize: ev.fileSize,
                fileType: ev.fileType,
                url: ev.url || '',
                description: ev.description || '',
                _persisted: true
              }
            } else if (ev.type === 'LINK' && ev.url) {
              evidence.link = {
                url: ev.url,
                description: ev.description || '',
                _persisted: true
              }
            } else if (ev.type === 'LINK' && ev.description && !ev.url) {
              evidence.text = {
                description: ev.description,
                _persisted: true
              }
            }
          })
        }
        
        // Create indicator with evidence properly attached
        pillarData[pillarKey].indicators[response.indicatorId] = {
          id: response.indicatorId,
          value: response.rawValue,
          evidence: evidence, // Evidence is now properly attached to the indicator
          lastModified: response.updatedAt
        }
        
        // Also store evidence separately for backward compatibility
        if (Object.keys(evidence).length > 0) {
          pillarData[pillarKey].evidence[response.indicatorId] = evidence
        }
      })
      
      // Calculate pillar progress with proper evidence consideration
      Object.keys(pillarData).forEach(pillarKey => {
        const pillarId = parseInt(pillarKey.replace('pillar_', ''))
        const indicators = pillarData[pillarKey].indicators
        const totalIndicators = Object.keys(indicators).length
        
        // Count completed indicators (those with values OR evidence)
        const completedIndicators = Object.values(indicators).filter((ind: any) => {
          const hasValue = ind.value !== null && ind.value !== undefined && ind.value !== ""
          const hasEvidence = ind.evidence && (
            ind.evidence.text?.description ||
            ind.evidence.link?.url ||
            ind.evidence.file?.fileName
          )
          return hasValue || hasEvidence
        }).length
        
        pillarData[pillarKey].completion = totalIndicators > 0 ? (completedIndicators / totalIndicators) * 100 : 0
        
        // Calculate average score (only for indicators with values)
        const indicatorsWithValues = Object.values(indicators).filter((ind: any) => 
          ind.value !== null && ind.value !== undefined && ind.value !== ""
        )
        
        const totalScore = indicatorsWithValues.reduce((sum: number, ind: any) => {
          return sum + (ind.value ? (ind.value / 100) * 100 : 0) // Simplified scoring
        }, 0)
        
        pillarData[pillarKey].score = indicatorsWithValues.length > 0 ? totalScore / indicatorsWithValues.length : 0
      })
      
      return {
        id: app.id,
        institutionData: app.institutionData,
        pillarData,
        scores: app.scoreAudits[0] || null,
        status: app.status?.toLowerCase() || 'draft',
        submittedAt: app.submittedAt,
        lastSaved: app.updatedAt,
        lastModified: app.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedApplications
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

    // Check if user already has an application - ENHANCED duplicate prevention
    const existingApp = await prisma.application.findUnique({
      where: { userId } as any, // Now uses unique constraint for better performance
      include: { institutionData: true }
    })

    if (existingApp) {
      console.log('✅ Found existing application for user:', userId)
      return NextResponse.json({
        success: true,
        data: existingApp
      })
    }

    // Create institution data
    let institution
    try {
      institution = await prisma.institutionData.create({
        data: {
          userId,
          name: "",
          industry: "",
          organizationSize: "",
          country: "",
          contactEmail: session.user.email || "",
        }
      })
    } catch (institutionError) {
      // Check if institution already exists
      const existingInstitution = await prisma.institutionData.findUnique({
        where: { userId }
      })
      
      if (existingInstitution) {
        institution = existingInstitution
      } else {
        throw institutionError
      }
    }

    // Create application with enhanced error handling
    let application
    try {
      application = await prisma.application.create({
        data: {
          userId,
          institutionId: institution.id,
          status: 'DRAFT',
          pillarData: {}
        },
        include: {
          institutionData: true
        }
      })
      console.log('✅ Application created successfully:', application.id)
    } catch (createError: any) {
      // Handle race condition - another request might have created the application
      if (createError.code === 'P2002') {
        console.log('⚠️ Application already exists (race condition), fetching existing one...')
        const existingApp = await prisma.application.findUnique({
          where: { userId } as any,
          include: { institutionData: true }
        })
        
        if (existingApp) {
          return NextResponse.json({
            success: true,
            data: existingApp
          })
        }
      }
      throw createError
    }

    return NextResponse.json({
      success: true,
      data: application
    })
  } catch (error: any) {
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
