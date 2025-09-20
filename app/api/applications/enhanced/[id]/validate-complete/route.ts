import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { isEvidenceRequired, validateEvidence } from '@/lib/application-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: applicationId } = await params

    // Get application with all related data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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

    // Check if user has access to this application
    if (application.userId !== session.user.id && session.user.role === 'USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('🔍 Complete validation for application:', applicationId)

    const validationResults = {
      isValid: true,
      institutionData: { isValid: true, missingFields: [] as string[] },
      pillars: {} as any,
      overallCompletion: 0,
      totalIndicators: 0,
      completedIndicators: 0,
      missingItems: [] as string[]
    }

    // Validate institution data
    const requiredInstitutionFields = ['name', 'industry', 'organizationSize', 'country', 'contactEmail']
    requiredInstitutionFields.forEach(field => {
      if (!application.institutionData[field as keyof typeof application.institutionData] || 
          application.institutionData[field as keyof typeof application.institutionData] === '') {
        validationResults.institutionData.missingFields.push(field)
        validationResults.institutionData.isValid = false
        validationResults.isValid = false
        validationResults.missingItems.push(`Institution ${field} is required`)
      }
    })

    // Validate all pillars (1-6)
    for (let pillarId = 1; pillarId <= 6; pillarId++) {
      const pillarKey = `pillar_${pillarId}`
      const pillarIndicators = application.indicatorResponses.filter(r => r.pillarId === pillarId)
      
      validationResults.pillars[pillarKey] = {
        isValid: true,
        completion: 0,
        totalIndicators: 0,
        completedIndicators: 0,
        missingItems: [] as string[]
      }

      if (pillarIndicators.length === 0) {
        validationResults.pillars[pillarKey].isValid = false
        validationResults.pillars[pillarKey].missingItems.push('No indicators found')
        validationResults.isValid = false
        validationResults.missingItems.push(`Pillar ${pillarId} - No indicators found`)
        continue
      }

      // Check each indicator in this pillar
      for (const response of pillarIndicators) {
        const indicatorId = response.indicatorId
        validationResults.pillars[pillarKey].totalIndicators++
        validationResults.totalIndicators++

        // Check if indicator has a value
        if (response.rawValue === null || response.rawValue === undefined || response.rawValue === '') {
          validationResults.pillars[pillarKey].missingItems.push(`Indicator ${indicatorId} - No value provided`)
          validationResults.pillars[pillarKey].isValid = false
          validationResults.isValid = false
          validationResults.missingItems.push(`Indicator ${indicatorId} - No value provided`)
          continue
        }

        // Check if evidence is required
        const evidenceRequired = isEvidenceRequired(indicatorId, response.rawValue)
        
        if (evidenceRequired) {
          // Check if evidence is provided
          const hasEvidence = response.evidence && response.evidence.length > 0
          
          if (!hasEvidence) {
            validationResults.pillars[pillarKey].missingItems.push(`Indicator ${indicatorId} - Evidence required`)
            validationResults.pillars[pillarKey].isValid = false
            validationResults.isValid = false
            validationResults.missingItems.push(`Indicator ${indicatorId} - Evidence required`)
            continue
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

            const evidenceValid = validateEvidence(evidenceData)
            if (!evidenceValid) {
              validationResults.pillars[pillarKey].missingItems.push(`Indicator ${indicatorId} - Evidence content invalid`)
              validationResults.pillars[pillarKey].isValid = false
              validationResults.isValid = false
              validationResults.missingItems.push(`Indicator ${indicatorId} - Evidence content invalid`)
              continue
            }
          }
        }

        // If we reach here, the indicator is complete
        validationResults.pillars[pillarKey].completedIndicators++
        validationResults.completedIndicators++
      }

      // Calculate pillar completion
      if (validationResults.pillars[pillarKey].totalIndicators > 0) {
        validationResults.pillars[pillarKey].completion = 
          (validationResults.pillars[pillarKey].completedIndicators / validationResults.pillars[pillarKey].totalIndicators) * 100
      }
    }

    // Calculate overall completion
    if (validationResults.totalIndicators > 0) {
      validationResults.overallCompletion = (validationResults.completedIndicators / validationResults.totalIndicators) * 100
    }

    console.log('✅ Complete validation result:', {
      isValid: validationResults.isValid,
      overallCompletion: validationResults.overallCompletion,
      institutionValid: validationResults.institutionData.isValid,
      missingItemsCount: validationResults.missingItems.length
    })

    return NextResponse.json({
      success: true,
      data: validationResults
    })

  } catch (error: any) {
    console.error('❌ Error in complete validation:', error)
    return NextResponse.json(
      { error: 'Failed to validate application', details: error.message },
      { status: 500 }
    )
  }
}
