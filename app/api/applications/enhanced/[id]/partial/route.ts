import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: applicationId } = await params
    const body = await request.json()
    const { changes, changeType } = body

    console.log('🔄 Partial update request:', { applicationId, changeType, changes })

    // Verify application belongs to user
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        user: { email: session.user.email }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    let result

    switch (changeType) {
      case 'indicator':
        result = await updateIndicator(applicationId, changes)
        break
      case 'evidence':
        result = await updateEvidence(applicationId, changes)
        break
      case 'institution':
        result = await updateInstitution(applicationId, changes)
        break
      default:
        return NextResponse.json({ error: 'Invalid change type' }, { status: 400 })
    }

    console.log('✅ Partial update successful:', result)

    return NextResponse.json({
      success: true,
      data: result,
      changeType,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Error in partial update:', error)
    return NextResponse.json(
      { error: 'Failed to update application', details: error.message },
      { status: 500 }
    )
  }
}

async function updateIndicator(applicationId: string, changes: any) {
  const { pillarId, indicatorId, value } = changes

  // Upsert indicator response
  const indicatorResponse = await prisma.indicatorResponse.upsert({
    where: {
      applicationId_indicatorId: {
        applicationId,
        indicatorId
      }
    },
    update: {
      rawValue: value,
      normalizedScore: calculateNormalizedScore(indicatorId, value),
      updatedAt: new Date()
    },
    create: {
      applicationId,
      indicatorId,
      pillarId,
      rawValue: value,
      normalizedScore: calculateNormalizedScore(indicatorId, value),
      measurementUnit: getMeasurementUnit(indicatorId)
    }
  })

  return { indicatorResponse }
}

async function updateEvidence(applicationId: string, changes: any) {
  const { pillarId, indicatorId, evidence } = changes

  console.log('🔍 Evidence update data:', { pillarId, indicatorId, evidence })

  // First get the indicator response
  const indicatorResponse = await prisma.indicatorResponse.findUnique({
    where: {
      applicationId_indicatorId: {
        applicationId,
        indicatorId
      }
    }
  })

  if (!indicatorResponse) {
    throw new Error('Indicator response not found')
  }

  // Delete existing evidence for this indicator
  await prisma.evidence.deleteMany({
    where: {
      indicatorResponseId: indicatorResponse.id
    }
  })

  // Create new evidence entries
  const evidenceEntries = []
  
  // Handle TEXT evidence
  if (evidence.text?.description && evidence.text.description.trim() !== '') {
    evidenceEntries.push({
      indicatorResponseId: indicatorResponse.id,
      applicationId,
      type: 'TEXT',
      description: evidence.text.description.trim(),
      url: null,
      fileName: null,
      fileSize: null,
      fileType: null
    })
  }

  // Handle LINK evidence
  if (evidence.link?.url && evidence.link.url.trim() !== '') {
    evidenceEntries.push({
      indicatorResponseId: indicatorResponse.id,
      applicationId,
      type: 'LINK',
      description: evidence.link.description?.trim() || null,
      url: evidence.link.url.trim(),
      fileName: null,
      fileSize: null,
      fileType: null
    })
  }

  // Handle FILE evidence
  if (evidence.file?.fileName && evidence.file.fileName.trim() !== '') {
    evidenceEntries.push({
      indicatorResponseId: indicatorResponse.id,
      applicationId,
      type: 'FILE',
      description: evidence.file.description?.trim() || null,
      url: evidence.file.url || null,
      fileName: evidence.file.fileName.trim(),
      fileSize: evidence.file.fileSize || null,
      fileType: evidence.file.fileType || null
    })
  }

  console.log('🔍 Evidence entries to create:', evidenceEntries)

  if (evidenceEntries.length > 0) {
    await prisma.evidence.createMany({
      data: evidenceEntries
    })
  }

  return { evidenceCount: evidenceEntries.length }
}

async function updateInstitution(applicationId: string, changes: any) {
  const institutionData = await prisma.institutionData.update({
    where: { applicationId },
    data: {
      ...changes,
      updatedAt: new Date()
    }
  })

  return { institutionData }
}

function calculateNormalizedScore(indicatorId: string, value: any): number {
  if (value === null || value === undefined || value === '') return 0
  
  const numericValue = Number(value)
  if (isNaN(numericValue)) return 0

  // Get measurement unit and max score
  const measurementUnit = getMeasurementUnit(indicatorId)
  const maxScore = getMaxScore(indicatorId)

  if (measurementUnit.includes('Score')) {
    return Math.min((numericValue / maxScore) * 100, 100)
  } else if (measurementUnit.includes('Percentage')) {
    return Math.min(numericValue, 100)
  } else if (measurementUnit.includes('Binary')) {
    return numericValue ? 100 : 0
  } else if (measurementUnit.includes('Hours')) {
    return Math.min((numericValue / 40) * 100, 100)
  } else if (measurementUnit === 'Number') {
    return Math.min((numericValue / 100) * 100, 100)
  } else if (measurementUnit === 'Ratio') {
    return Math.min(numericValue * 100, 100)
  }

  return 0
}

function getMeasurementUnit(indicatorId: string): string {
  // Import from centralized utils
  const { getIndicatorMeasurementUnit } = require('@/lib/application-utils')
  return getIndicatorMeasurementUnit(indicatorId)
}

function getMaxScore(indicatorId: string): number {
  // Import from centralized utils
  const { getIndicatorMaxScore } = require('@/lib/application-utils')
  return getIndicatorMaxScore(indicatorId)
}
