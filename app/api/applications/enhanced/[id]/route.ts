import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ScoringEngine } from '@/lib/scoring-engine'

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
    
    // Get application with all related data
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        institutionData: true,
        indicatorResponses: {
          include: {
            evidence: true
          }
        },
        evidence: true,
        scoreAudits: {
          orderBy: { calculatedAt: 'desc' }
        },
        certifications: {
          orderBy: { issuedAt: 'desc' }
        },
        adminReviews: {
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check if user has access to this application
    if (application.userId !== session.user.id && session.user.role === 'USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Transform data for frontend
    const pillarData: any = {}
    
    application.indicatorResponses.forEach(response => {
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
      
      // Add indicator data
      pillarData[pillarKey].indicators[response.indicatorId] = {
        id: response.indicatorId,
        value: response.rawValue,
        evidence: {},
        lastModified: response.updatedAt
      }
      
      // Add evidence data
      if (response.evidence && response.evidence.length > 0) {
        const evidence: any = {}
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
        pillarData[pillarKey].evidence[response.indicatorId] = evidence
      }
    })
    
    // Calculate pillar progress
    Object.keys(pillarData).forEach(pillarKey => {
      const pillarId = parseInt(pillarKey.replace('pillar_', ''))
      const indicators = pillarData[pillarKey].indicators
      const totalIndicators = Object.keys(indicators).length
      const completedIndicators = Object.values(indicators).filter((ind: any) => 
        ind.value !== null && ind.value !== undefined && ind.value !== ""
      ).length
      
      pillarData[pillarKey].completion = totalIndicators > 0 ? (completedIndicators / totalIndicators) * 100 : 0
      
      // Calculate average score
      const totalScore = Object.values(indicators).reduce((sum: number, ind: any) => {
        return sum + (ind.value ? (ind.value / 100) * 100 : 0) // Simplified scoring
      }, 0)
      pillarData[pillarKey].score = totalIndicators > 0 ? totalScore / totalIndicators : 0
    })

    const transformedApplication = {
      id: application.id,
      institutionData: application.institutionData,
      pillarData,
      scores: application.scoreAudits[0] || null,
      status: application.status?.toLowerCase() || 'draft',
      submittedAt: application.submittedAt,
      lastSaved: application.updatedAt,
      lastModified: application.updatedAt,
      certifications: application.certifications,
      adminReviews: application.adminReviews
    }

    return NextResponse.json({
      success: true,
      data: transformedApplication
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

    // Start transaction for atomic updates with timeout
    const result = await prisma.$transaction(async (tx) => {
      console.log('Starting transaction for application:', id)
      
      // Update application
      const updateData: any = {
        updatedAt: new Date()
      }

      if (status) {
        updateData.status = status.toUpperCase()
        if (status.toUpperCase() === 'SUBMITTED') {
          updateData.submittedAt = new Date()
        }
      }

      if (pillarData) {
        updateData.pillarData = pillarData
      }

      const updatedApplication = await tx.application.update({
        where: { id },
        data: updateData,
        include: {
          institutionData: true
        }
      })

      // Update institution data if provided
      if (institutionData) {
        await tx.institutionData.upsert({
          where: { userId: userId },
          create: {
            userId: userId,
            ...institutionData
          },
          update: institutionData
        })
      }

      // Save indicator responses and evidence if provided
      if (indicatorResponses && Array.isArray(indicatorResponses)) {
        console.log('Processing indicator responses:', indicatorResponses.length)
        
        // Filter valid responses
        const validResponses = indicatorResponses.filter(response => {
          const { indicatorId, pillarId } = response;
          return indicatorId && indicatorId !== 'undefined' && pillarId;
        });
        
        console.log('Valid responses:', validResponses.length)

        if (validResponses.length > 0) {
          console.log('Creating batch operations for indicator responses')
          
          // Use batch operations for better performance
          const indicatorResponseData = validResponses.map(response => {
            const { indicatorId, pillarId, rawValue, normalizedScore, measurementUnit, hasEvidence } = response;
            return {
              applicationId: id,
              indicatorId: indicatorId,
              pillarId: pillarId,
              rawValue: rawValue,
              normalizedScore: normalizedScore,
              measurementUnit: measurementUnit,
              hasEvidence: hasEvidence || false
            };
          });

          console.log('Deleting existing indicator responses')
          // Delete existing responses for this application
          await tx.indicatorResponse.deleteMany({
            where: { applicationId: id }
          });

          console.log('Creating new indicator responses in batch')
          // Create new responses in batch
          await tx.indicatorResponse.createMany({
            data: indicatorResponseData,
            skipDuplicates: true
          });
          
          console.log('Indicator responses created successfully')

          // Process evidence separately for each response
          console.log('Processing evidence for', validResponses.length, 'responses')
          for (const response of validResponses) {
            const { indicatorId, evidence } = response;
            
            console.log('Processing evidence for indicator:', indicatorId)
            
            // Get the created indicator response
            const indicatorResponse = await tx.indicatorResponse.findUnique({
              where: {
                applicationId_indicatorId: {
                  applicationId: id,
                  indicatorId: indicatorId
                }
              }
            });

            if (!indicatorResponse) {
              console.log('Indicator response not found for:', indicatorId)
              continue
            }

            // Save evidence if provided
            if (evidence && (
              evidence.text?.description ||
              evidence.link?.url ||
              evidence.file?.fileName
            )) {
            
            // Delete existing evidence for this indicator response
            await tx.evidence.deleteMany({
              where: {
                indicatorResponseId: indicatorResponse.id
              }
            })

            // Build evidence records
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

            // Create evidence records
            if (recordsToCreate.length > 0) {
              console.log('Creating evidence records:', recordsToCreate.length)
              await tx.evidence.createMany({
                data: recordsToCreate.map(record => ({
                  indicatorResponseId: indicatorResponse.id,
                  applicationId: id, // Add the missing applicationId
                  ...record
                }))
              })
              console.log('Evidence records created successfully')
            } else {
              console.log('No evidence records to create for indicator:', indicatorId)
            }
            }
          }
        }
      }

      // Calculate and save scores if provided
      if (scores || status?.toUpperCase() === 'SUBMITTED') {
        const formData = {
          pillar_1: pillarData?.pillar_1?.indicators || {},
          pillar_2: pillarData?.pillar_2?.indicators || {},
          pillar_3: pillarData?.pillar_3?.indicators || {},
          pillar_4: pillarData?.pillar_4?.indicators || {},
          pillar_5: pillarData?.pillar_5?.indicators || {},
          pillar_6: pillarData?.pillar_6?.indicators || {},
        }

        const calculatedScores = ScoringEngine.processFormData(formData)
        
        console.log('Calculated scores:', {
          overallScore: calculatedScores.overallScore,
          pillarsCount: calculatedScores.pillars.length,
          certificationLevel: calculatedScores.certificationLevel
        })
        
        // Only create score audit if we have valid scores
        if (!isNaN(calculatedScores.overallScore) && calculatedScores.pillars.length > 0) {
          // Create score audit records for each pillar
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
                }
              }
            })
          }
        } else {
          console.log('Skipping score audit creation - invalid scores or no pillars')
        }
      }

      console.log('Transaction completed successfully')
      return updatedApplication
    }, {
      timeout: 30000, // 30 seconds timeout
      maxWait: 10000, // 10 seconds max wait
    })
    
    console.log('Application update completed successfully')

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error updating application:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate entry - data already exists' },
        { status: 409 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Foreign key constraint violation' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update application',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
