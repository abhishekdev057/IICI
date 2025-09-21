import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { DatabaseService } from '@/lib/database-service'

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
          name: institutionData.name || "Institution Name",
          industry: institutionData.industry || "Education",
          organizationSize: institutionData.organizationSize || "Small",
          country: institutionData.country || "India",
          contactEmail: institutionData.contactEmail || "",
          ...institutionData
        },
        update: institutionData
      })
    }

    // Save individual indicator responses and evidence if provided
    if (indicatorResponses && Array.isArray(indicatorResponses)) {
      console.log('Total indicator responses to process:', indicatorResponses.length);
      for (const response of indicatorResponses) {
        const { indicatorId, pillarId, rawValue, normalizedScore, measurementUnit, hasEvidence, evidence } = response
        
        // Skip invalid responses
        if (!indicatorId || indicatorId === 'undefined' || !pillarId) {
          console.log(`Skipping invalid response:`, { indicatorId, pillarId });
          continue;
        }
        
        console.log(`Processing indicator ${indicatorId} (pillar ${pillarId}):`, { hasEvidence, evidence });
        
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
        if (evidence && (
          evidence.text?.description ||
          evidence.link?.url ||
          evidence.file?.fileName ||
          // Fallback for old format
          evidence.description || 
          evidence.url || 
          evidence.fileName || 
          evidence.type
        )) {
          console.log(`Saving evidence for indicator ${indicatorId}:`, evidence);
        } else if (evidence) {
          console.log(`Evidence object exists but no content for indicator ${indicatorId}:`, evidence);
        } else {
          console.log(`No evidence object for indicator ${indicatorId}`);
        }
        
        if (evidence && (
          evidence.text?.description ||
          evidence.link?.url ||
          evidence.file?.fileName ||
          // Fallback for old format
          evidence.description || 
          evidence.url || 
          evidence.fileName || 
          evidence.type
        )) {
          
          // Delete existing evidence for this indicator response
          await prisma.evidence.deleteMany({
            where: {
              indicatorResponseId: indicatorResponse.id
            }
          })

          // Build up to three evidence records (text, link, file)
          const recordsToCreate: Array<{
            type: 'FILE' | 'LINK'
            fileName: string | null
            fileSize: number | null
            fileType: string | null
            url: string
            description: string | null
          }> = []

          // Text evidence (stored as LINK type with description only)
          if (evidence.text?.description && evidence.text.description.trim() !== '') {
            recordsToCreate.push({
              type: 'LINK',
              fileName: null,
              fileSize: null,
              fileType: null,
              url: '',
              description: evidence.text.description.trim()
            })
          }

          // Link evidence
          if (evidence.link?.url && evidence.link.url.trim() !== '') {
            recordsToCreate.push({
              type: 'LINK',
              fileName: null,
              fileSize: null,
              fileType: null,
              url: evidence.link.url.trim(),
              description: (evidence.link.description || '').trim() || null
            })
          }

          // File evidence
          if (evidence.file?.fileName && evidence.file.fileName.trim() !== '') {
            recordsToCreate.push({
              type: 'FILE',
              fileName: evidence.file.fileName,
              fileSize: evidence.file.fileSize || null,
              fileType: evidence.file.fileType || null,
              url: evidence.file.url || '',
              description: (evidence.file.description || '').trim() || null
            })
          }

          // Fallback for old flat format
          if (recordsToCreate.length === 0) {
            // Old-style file
            if (evidence.fileName && evidence.fileName.trim() !== '') {
              recordsToCreate.push({
                type: 'FILE',
                fileName: evidence.fileName,
                fileSize: evidence.fileSize || null,
                fileType: evidence.fileType || null,
                url: evidence.url || '',
                description: (evidence.description || '').trim() || null
              })
            } else if (evidence.url && evidence.url.trim() !== '') {
              // Old-style link
              recordsToCreate.push({
                type: 'LINK',
                fileName: null,
                fileSize: null,
                fileType: null,
                url: evidence.url.trim(),
                description: (evidence.description || '').trim() || null
              })
            } else if (evidence.description && evidence.description.trim() !== '') {
              // Old-style text (as LINK with description)
              recordsToCreate.push({
                type: 'LINK',
                fileName: null,
                fileSize: null,
                fileType: null,
                url: '',
                description: evidence.description.trim()
              })
            }
          }

          if (recordsToCreate.length === 0) {
            console.log(`Evidence exists but has no content for indicator ${indicatorId} - skipping save`)
          } else {
            for (const rec of recordsToCreate) {
              const createdEvidence = await prisma.evidence.create({
                data: {
                  indicatorResponseId: indicatorResponse.id,
                  applicationId: id,
                  type: rec.type as any,
                  fileName: rec.fileName,
                  fileSize: rec.fileSize,
                  fileType: rec.fileType,
                  url: rec.url,
                  description: rec.description
                }
              })
              console.log(`Evidence saved successfully:`, createdEvidence)
            }
          }
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
      } catch (error: any) {
    console.error('Error updating application:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      })
      
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
