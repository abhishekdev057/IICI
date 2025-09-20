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
    console.log('🔍 GET /api/applications/enhanced/[id] called')
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ Session found for user:', session.user.email)

    const { id } = await params
    console.log('🔍 Application ID:', id)
    
    // Get application with optimized related data (exclude heavy fields for faster loading)
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
        // Temporarily exclude heavy fields that slow down loading
        // evidence: true, // Will be loaded via indicatorResponses
        // scoreAudits: true,
        // certifications: true,
        // adminReviews: {
        //   include: {
        //     user: true
        //   }
        // }
      }
    })

    console.log('🔍 Application data from database:', {
      id: application?.id,
      indicatorResponsesCount: application?.indicatorResponses?.length,
      evidenceCount: application?.evidence?.length,
      sampleIndicatorResponse: application?.indicatorResponses?.[0]
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
      
      // Add indicator data with evidence properly merged
      const evidence: any = {}
      if (response.evidence && response.evidence.length > 0) {
        console.log(`🔍 Processing evidence for indicator ${response.indicatorId}:`, response.evidence);
        response.evidence.forEach(ev => {
          console.log(`🔍 Evidence item:`, { type: ev.type, fileName: ev.fileName, url: ev.url, description: ev.description });

          try {
            if (ev.type === 'TEXT' && ev.description && ev.description.trim()) {
              evidence.text = {
                description: ev.description.trim(),
                _persisted: true
              }
              console.log(`✅ Created text evidence:`, evidence.text);
            } else if (ev.type === 'FILE' && ev.fileName && ev.fileName.trim()) {
              evidence.file = {
                fileName: ev.fileName.trim(),
                fileSize: ev.fileSize,
                fileType: ev.fileType,
                url: ev.url || '',
                description: ev.description || '',
                _persisted: true
              }
              console.log(`✅ Created file evidence:`, evidence.file);
            } else if (ev.type === 'LINK' && ev.url && ev.url.trim()) {
              evidence.link = {
                url: ev.url.trim(),
                description: ev.description || '',
                _persisted: true
              }
              console.log(`✅ Created link evidence:`, evidence.link);
            }
          } catch (error) {
            console.error(`❌ Error processing evidence item:`, ev, error);
          }
        })
      }
      
      // Special debugging for indicator 6.1.3
      if (response.indicatorId === '6.1.3') {
        console.log(`🔍 SPECIAL DEBUG for 6.1.3:`, {
          indicatorId: response.indicatorId,
          rawValue: response.rawValue,
          evidenceCount: response.evidence?.length,
          evidence: response.evidence,
          finalEvidence: evidence
        });
      }
      
      console.log(`🔍 Final evidence for ${response.indicatorId}:`, evidence);
      
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

    console.log('🔍 API returning transformed application:', {
      id: transformedApplication.id,
      pillarDataKeys: Object.keys(pillarData),
      pillar1Indicators: pillarData.pillar_1 ? Object.keys(pillarData.pillar_1.indicators || {}) : [],
      pillar2Indicators: pillarData.pillar_2 ? Object.keys(pillarData.pillar_2.indicators || {}) : [],
      pillar1Completion: pillarData.pillar_1?.completion,
      pillar2Completion: pillarData.pillar_2?.completion
    });

    console.log('✅ Returning transformed application data')
    return NextResponse.json({
      success: true,
      data: transformedApplication
    })
  } catch (error) {
    console.error('❌ Error fetching application:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Failed to fetch application', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 PUT /api/applications/enhanced/[id] called')
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('✅ Session found for user:', session.user.email)

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
    
    console.log('📥 Received data:', {
      id,
      status,
      hasInstitutionData: !!institutionData,
      hasPillarData: !!pillarData,
      indicatorResponsesCount: indicatorResponses?.length || 0,
      sampleIndicatorResponse: indicatorResponses?.[0]
    })

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

    // Start transaction for atomic updates with increased timeout
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
        
        // Filter valid responses with better validation
        const validResponses = indicatorResponses.filter(response => {
          const { indicatorId, pillarId, rawValue } = response;
          // Include responses that have either a value or evidence
          const hasValue = rawValue !== null && rawValue !== undefined && rawValue !== "";
          const hasEvidence = response.evidence && (
            response.evidence.text?.description ||
            response.evidence.link?.url ||
            response.evidence.file?.fileName
          );
          return indicatorId && indicatorId !== 'undefined' && pillarId && (hasValue || hasEvidence);
        });
        
        console.log('Valid responses:', validResponses.length)

        if (validResponses.length > 0) {
          console.log('Processing indicator responses:', validResponses.length)
          
          // OPTIMIZED: Use upsert operations in parallel for better performance
          const upsertPromises = validResponses.map(response => {
            const { indicatorId, pillarId, rawValue, normalizedScore, measurementUnit, hasEvidence } = response;
            return tx.indicatorResponse.upsert({
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
                pillarId: pillarId,
                rawValue: rawValue,
                normalizedScore: normalizedScore,
                measurementUnit: measurementUnit,
                hasEvidence: hasEvidence || false
              }
            });
          });

          console.log('Upserting indicator responses in parallel')
          await Promise.all(upsertPromises);
          console.log('Indicator responses processed successfully')

          // OPTIMIZED: Process evidence in parallel to reduce transaction time
          console.log('Processing evidence for', validResponses.length, 'responses')
          
          // Get all indicator responses AFTER upsert operations complete
          const indicatorResponses = await tx.indicatorResponse.findMany({
            where: { applicationId: id },
            select: { id: true, indicatorId: true }
          })
          
          console.log('Found indicator responses:', indicatorResponses.length)
          
          // Process evidence in parallel
          const evidencePromises = validResponses
            .filter(response => response.evidence && (
              response.evidence.text?.description ||
              response.evidence.link?.url ||
              response.evidence.file?.fileName
            ))
            .map(async (response) => {
              const { indicatorId, evidence } = response;
              console.log(`🔍 Processing evidence for indicator ${indicatorId}:`, evidence);
              
              const indicatorResponse = indicatorResponses.find(ir => ir.indicatorId === indicatorId);
              if (!indicatorResponse) {
                console.log('❌ Indicator response not found for:', indicatorId)
                console.log('Available indicator responses:', indicatorResponses.map(ir => ir.indicatorId))
                return;
              }
              
              console.log(`✅ Evidence found for indicator ${indicatorId}, processing...`);
              
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
            })
          
          // Execute all evidence operations in parallel
          if (evidencePromises.length > 0) {
            console.log('Processing evidence in parallel for', evidencePromises.length, 'indicators')
            await Promise.all(evidencePromises)
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
                } as any
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
      timeout: 60000, // 60 seconds timeout for large datasets
      maxWait: 15000, // 15 seconds max wait
    })
    
    console.log('Application update completed successfully')

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: any) {
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
