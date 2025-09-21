import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  getIndicatorMeasurementUnit, 
  getIndicatorMaxScore, 
  isEvidenceRequired,
  validateEvidence,
  validateInstitutionData
} from '@/lib/application-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: applicationId } = await params
    const { searchParams } = new URL(request.url)
    const step = parseInt(searchParams.get('step') || '0')

    console.log('🔍 Database validation request:', { applicationId, step })

    // Verify application belongs to user
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        user: { email: session.user.email }
      },
      include: {
        institutionData: true,
        indicatorResponses: {
          include: {
            evidence: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    console.log('🔍 Application data from database:', {
      applicationId,
      indicatorResponsesCount: application.indicatorResponses.length,
      indicatorResponses: application.indicatorResponses.map(ir => ({
        indicatorId: ir.indicatorId,
        pillarId: ir.pillarId,
        rawValue: ir.rawValue,
        evidenceCount: ir.evidence.length,
        evidence: ir.evidence
      }))
    })

    const missingItems: string[] = []
    let isValid = true

    // Validate based on step
    if (step === 0) {
      // Institution setup validation
      const institutionValid = validateInstitutionData(application.institutionData)
      if (!institutionValid) {
        missingItems.push('Institution information is incomplete')
        isValid = false
      }
    } else if (step >= 1 && step <= 6) {
      // Pillar validation
      const pillarId = step
      const pillarKey = `pillar_${pillarId}`
      
      // Get all indicators for this pillar
      const pillarIndicators = application.indicatorResponses.filter(
        response => response.pillarId === pillarId
      )

      if (pillarIndicators.length === 0) {
        missingItems.push(`No indicators found for Pillar ${pillarId}`)
        isValid = false
      } else {
        // Check each indicator
        for (const response of pillarIndicators) {
          const indicatorId = response.indicatorId
          
          // Check if indicator has a value
          if (response.rawValue === null || response.rawValue === undefined || response.rawValue === '') {
            missingItems.push(`Indicator ${indicatorId} - No value provided`)
            isValid = false
            continue
          }

          // Check if evidence is required
          const evidenceRequired = isEvidenceRequired(indicatorId, response.rawValue)
          
          if (evidenceRequired) {
            // Check if evidence is provided
            const hasEvidence = response.evidence && response.evidence.length > 0
            
            if (!hasEvidence) {
              missingItems.push(`Indicator ${indicatorId} - Evidence required`)
              isValid = false
            } else {
              // Validate evidence content
              const textEvidence = response.evidence.find(e => e.type === 'TEXT')
              const linkEvidence = response.evidence.find(e => e.type === 'LINK')
              const fileEvidence = response.evidence.find(e => e.type === 'FILE')
              
              const evidenceData = {
                text: textEvidence ? {
                  description: textEvidence.description || ''
                } : null,
                link: linkEvidence ? {
                  url: linkEvidence.url || '',
                  description: linkEvidence.description || ''
                } : null,
                file: fileEvidence ? {
                  fileName: fileEvidence.fileName || '',
                  fileSize: fileEvidence.fileSize || null,
                  fileType: fileEvidence.fileType || null,
                  url: fileEvidence.url || ''
                } : null
              }

              console.log(`🔍 Evidence validation for ${indicatorId}:`, {
                evidenceData,
                textEvidence,
                linkEvidence,
                fileEvidence,
                allEvidence: response.evidence
              })
              
              const evidenceValid = validateEvidence(evidenceData)
              console.log(`🔍 Evidence validation result for ${indicatorId}:`, evidenceValid)
              
              if (!evidenceValid) {
                missingItems.push(`Indicator ${indicatorId} - Evidence content is invalid`)
                isValid = false
              }
            }
          }
        }
      }
    }

    console.log('✅ Database validation result:', { isValid, missingItems })

    return NextResponse.json({
      isValid,
      missingItems,
      step,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Error in database validation:', error)
    return NextResponse.json(
      { error: 'Failed to validate from database', details: error.message },
      { status: 500 }
    )
  }
}
