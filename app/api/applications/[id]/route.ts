import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const application = await DatabaseService.getApplicationById(id)
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user has access to this application
    if (application.userId !== session.user.id && session.user.role === 'USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: application
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { status, institutionData, pillarData, indicatorResponses, scores } = body

    // Check if user owns this application (security check)
    const existingApp = await prisma.application.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (existingApp.userId !== userId && session.user.role === 'USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    // Update status if provided
    if (status) {
      updateData.status = status.toUpperCase()
      if (status.toUpperCase() === 'SUBMITTED') {
        updateData.submittedAt = new Date()
      }
    }

    // Add pillar data if provided
    if (pillarData) {
      updateData.pillarData = pillarData
    }

    // Single database operation for better performance
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        institutionData: true
      }
    })

    // Handle institution data separately if provided
    if (institutionData) {
      await prisma.institutionData.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          ...institutionData
        },
        update: institutionData
      })
    }

    // Save individual indicator responses and evidence if provided
    if (indicatorResponses && Array.isArray(indicatorResponses)) {
      for (const response of indicatorResponses) {
        const { indicatorId, pillarId, rawValue, normalizedScore, measurementUnit, hasEvidence, evidence } = response
        
        // Save or update indicator response
        const indicatorResponse = await prisma.indicatorResponse.upsert({
          where: {
            applicationId_indicatorId: {
              applicationId: id,
              indicatorId: indicatorId
            }
          },
          create: {
            applicationId: id,
            indicatorId: indicatorId,
            pillarId: pillarId,
            rawValue: rawValue,
            normalizedScore: normalizedScore,
            measurementUnit: measurementUnit,
            hasEvidence: hasEvidence || false
          },
          update: {
            rawValue: rawValue,
            normalizedScore: normalizedScore,
            hasEvidence: hasEvidence || false
          }
        })

        // Save evidence if provided
        if (evidence && (evidence.description || evidence.url || evidence.fileName)) {
          console.log(`Saving evidence for indicator ${indicatorId}:`, evidence);
          
          // Delete existing evidence for this indicator response
          await prisma.evidence.deleteMany({
            where: {
              indicatorResponseId: indicatorResponse.id
            }
          })

          // Determine evidence type
          let evidenceType = 'LINK';
          if (evidence.type === 'file' || evidence.fileName) {
            evidenceType = 'FILE';
          } else if (evidence.type === 'text' || evidence.description) {
            evidenceType = 'LINK'; // Use LINK for text evidence since TEXT is not in enum
          }

          console.log(`Evidence type determined: ${evidenceType}`);

          // Create new evidence record
          const createdEvidence = await prisma.evidence.create({
            data: {
              indicatorResponseId: indicatorResponse.id,
              applicationId: id,
              type: evidenceType,
              fileName: evidence.fileName || null,
              fileSize: evidence.fileSize || null,
              fileType: evidence.fileType || null,
              url: evidence.url || '',
              description: evidence.description || null
            }
          })
          
          console.log(`Evidence saved successfully:`, createdEvidence);
        } else {
          console.log(`No evidence to save for indicator ${indicatorId}`);
        }
      }
    }

    // Save score audit if provided
    if (scores && scores.overallScore !== undefined) {
      // Convert certification level to enum format
      let certificationLevel = 'NOT_CERTIFIED'
      if (scores.certificationLevel) {
        switch (scores.certificationLevel) {
          case 'Gold':
            certificationLevel = 'GOLD'
            break
          case 'Certified':
            certificationLevel = 'CERTIFIED'
            break
          case 'Not Certified':
          default:
            certificationLevel = 'NOT_CERTIFIED'
            break
        }
      }

      await prisma.scoreAudit.create({
        data: {
          applicationId: id,
          userId: userId,
          pillarId: scores.pillarId || 0,
          pillarScore: scores.pillarScore || 0,
          overallScore: scores.overallScore,
          certificationLevel: certificationLevel as any,
          calculatedBy: userId,
          scoreData: scores
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication
    })
  } catch (error) {
    console.error('Error updating application:', error)
    
    // More specific error handling
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate entry conflict' }, { status: 409 })
    }
    
    return NextResponse.json(
      { error: 'Failed to update application', details: error.message },
      { status: 500 }
    )
  }
}
