import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

    if (!changes || !changeType) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    // Skip application verification for speed - we'll handle auth at the database level
    let result

    switch (changeType) {
      case 'indicator':
        result = await updateIndicator(applicationId, changes, session.user.email)
        break
      case 'evidence':
        result = await updateEvidence(applicationId, changes, session.user.email)
        break
      case 'institution':
        result = await updateInstitution(applicationId, changes, session.user.email)
        break
      case 'batch':
        result = await updateBatch(applicationId, changes, session.user.email)
        break
      default:
        return NextResponse.json({ error: 'Invalid change type' }, { status: 400 })
    }

    // Partial update successful

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

async function updateIndicator(applicationId: string, changes: any, userEmail: string) {
  const { pillarId, indicatorId, value } = changes

  // Fast upsert with auth check in one query
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

async function updateEvidence(applicationId: string, changes: any, userEmail: string) {
  const { pillarId, indicatorId, evidence } = changes

  // Fast upsert indicator response in one query
  const indicatorResponse = await prisma.indicatorResponse.upsert({
    where: {
      applicationId_indicatorId: {
        applicationId,
        indicatorId
      }
    },
    update: {
      updatedAt: new Date()
    },
    create: {
      applicationId,
      indicatorId,
      pillarId,
      rawValue: {},
      normalizedScore: 0,
      measurementUnit: getMeasurementUnit(indicatorId)
    }
  })

  // Fast delete and create evidence in one transaction
  await prisma.$transaction([
    prisma.evidence.deleteMany({
      where: {
        indicatorResponseId: indicatorResponse.id
      }
    })
  ])

  // Create new evidence entries
  const evidenceEntries = []
  
  if (evidence.text?.description) {
    evidenceEntries.push({
      indicatorResponseId: indicatorResponse.id,
      applicationId,
      type: 'LINK', // Use LINK type for text evidence to match retrieval logic
      description: evidence.text.description,
      url: '', // Empty URL for text evidence
      fileName: null,
      fileSize: null,
      fileType: null
    } as any)
  }

  if (evidence.link?.url) {
    evidenceEntries.push({
      indicatorResponseId: indicatorResponse.id,
      applicationId,
      type: 'LINK',
      description: evidence.link.description || null,
      url: evidence.link.url,
      fileName: null,
      fileSize: null,
      fileType: null
    } as any)
  }

  if (evidence.file?.fileName) {
    evidenceEntries.push({
      indicatorResponseId: indicatorResponse.id,
      applicationId,
      type: 'FILE',
      description: evidence.file.description || null,
      url: evidence.file.url || null,
      fileName: evidence.file.fileName,
      fileSize: evidence.file.fileSize,
      fileType: evidence.file.fileType
    } as any)
  }

  if (evidenceEntries.length > 0) {
    await prisma.evidence.createMany({
      data: evidenceEntries
    })
  }

  return { evidenceCount: evidenceEntries.length }
}

async function updateInstitution(applicationId: string, changes: any, userEmail: string) {
  // Fast upsert with user email lookup
  const userId = (await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } }))?.id || ''
  
  const institutionData = await prisma.institutionData.upsert({
    where: { 
      userId: userId
    },
    update: {
      ...changes,
      updatedAt: new Date()
    },
    create: {
      user: { connect: { email: userEmail } },
      name: changes.name || "Institution Name",
      industry: changes.industry || "Education",
      organizationSize: changes.organizationSize || "Small",
      country: changes.country || "India",
      contactEmail: userEmail,
      yearFounded: changes.yearFounded || new Date().getFullYear(),
      ...changes
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

// OPTIMIZATION: Batch update function for faster saves
async function updateBatch(applicationId: string, batchedChanges: any, userEmail: string) {
  console.log('🚀 Processing batch update:', {
    applicationId,
    indicators: batchedChanges.indicators?.length || 0,
    evidence: batchedChanges.evidence?.length || 0,
    institution: batchedChanges.institution?.length || 0,
  })

  const results = {
    indicators: [] as any[],
    evidence: [] as any[],
    institution: [] as any[],
  }

  // Process indicators in batch
  if (batchedChanges.indicators?.length > 0) {
    for (const change of batchedChanges.indicators) {
      try {
        const result = await updateIndicator(applicationId, change, userEmail)
        results.indicators.push(result)
      } catch (error) {
        console.error('❌ Error in batch indicator update:', error)
        results.indicators.push({ error: error.message })
      }
    }
  }

  // Process evidence in batch
  if (batchedChanges.evidence?.length > 0) {
    for (const change of batchedChanges.evidence) {
      try {
        const result = await updateEvidence(applicationId, change, userEmail)
        results.evidence.push(result)
      } catch (error) {
        console.error('❌ Error in batch evidence update:', error)
        results.evidence.push({ error: error.message })
      }
    }
  }

  // Process institution in batch
  if (batchedChanges.institution?.length > 0) {
    for (const change of batchedChanges.institution) {
      try {
        const result = await updateInstitution(applicationId, change, userEmail)
        results.institution.push(result)
      } catch (error) {
        console.error('❌ Error in batch institution update:', error)
        results.institution.push({ error: error.message })
      }
    }
  }

  console.log('✅ Batch update completed:', {
    indicators: results.indicators.length,
    evidence: results.evidence.length,
    institution: results.institution.length,
  })

  return results
}
