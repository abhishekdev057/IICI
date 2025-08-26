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

    // Get user ID from session
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

    // Fetch the latest application with all related data
    const application = await prisma.application.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        institutionData: true,
        indicatorResponses: {
          include: {
            evidence: true
          }
        },
        scoreAudits: {
          orderBy: { calculatedAt: 'desc' }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'No application found' }, { status: 404 })
    }

    // Process indicator responses into pillar structure
    const pillarData = {}
    const indicatorDefinitions = getIndicatorDefinitions()

    application.indicatorResponses.forEach(response => {
      const pillarId = response.pillarId
      const pillarKey = `pillar_${pillarId}`
      
      if (!pillarData[pillarKey]) {
        pillarData[pillarKey] = {
          indicators: {},
          evidence: {},
          stats: {
            responses: 0,
            evidenceCount: 0,
            total: 0,
            averageScore: 0,
            completion: 0
          }
        }
      }

      // Get indicator definition
      const indicatorDef = indicatorDefinitions[response.indicatorId] || {
        shortName: response.indicatorId,
        description: 'Assessment indicator',
        measurementUnit: response.measurementUnit
      }

      // Add indicator data
      pillarData[pillarKey].indicators[response.indicatorId] = response.rawValue
      
      // Add evidence data
      if (response.evidence && response.evidence.length > 0) {
        pillarData[pillarKey].evidence[response.indicatorId] = {
          type: 'mixed',
          files: response.evidence.filter(e => e.type === 'FILE').map(e => e.fileName),
          links: response.evidence.filter(e => e.type === 'LINK').map(e => e.url),
          description: response.evidence[0]?.description || ''
        }
      }

      // Update stats
      pillarData[pillarKey].stats.responses++
      if (response.hasEvidence) {
        pillarData[pillarKey].stats.evidenceCount++
      }
    })

    // Calculate pillar scores
    Object.keys(pillarData).forEach(pillarKey => {
      const pillar = pillarData[pillarKey]
      const responses = Object.values(pillar.indicators).filter(v => v !== undefined && v !== null && v !== "")
      pillar.stats.total = Object.keys(indicatorDefinitions).filter(id => id.startsWith(pillarKey.replace('pillar_', ''))).length
      pillar.stats.completion = pillar.stats.total > 0 ? (responses.length / pillar.stats.total) * 100 : 0
      
      // Calculate average score
      const scores = application.indicatorResponses
        .filter(r => r.pillarId === parseInt(pillarKey.replace('pillar_', '')))
        .map(r => r.normalizedScore)
        .filter(s => s > 0)
      
      pillar.stats.averageScore = scores.length > 0 ? Math.min(scores.reduce((a, b) => a + b, 0) / scores.length, 100) : 0 // Cap at 100%
    })

    // Get latest score audit
    const latestScoreAudit = application.scoreAudits[0]

    // Calculate overall scores
    const pillarScores = []
    let totalScore = 0
    let pillarCount = 0

    for (let i = 1; i <= 6; i++) {
      const pillarKey = `pillar_${i}`
      const pillar = pillarData[pillarKey]
      const score = pillar?.stats?.averageScore || 0
      pillarScores.push(score)
      
      if (score > 0) {
        totalScore += score
        pillarCount++
      }
    }

    const overallScore = pillarCount > 0 ? Math.min(totalScore / pillarCount, 100) : 0 // Cap at 100%
          let certificationLevel = "NOT_CERTIFIED"
      if (overallScore >= 80) certificationLevel = "GOLD"
      else if (overallScore >= 60) certificationLevel = "CERTIFIED"

    // Prepare dashboard data
    const dashboardData = {
      application: {
        id: application.id,
        status: application.status,
        submittedAt: application.submittedAt,
        updatedAt: application.updatedAt,
        lastSaved: application.updatedAt
      },
      institutionData: application.institutionData,
      pillarData,
      scores: {
        overallScore,
        certificationLevel,
        pillarScores,
        lastCalculated: latestScoreAudit?.calculatedAt || application.updatedAt
      },
      indicators: application.indicatorResponses.map(response => ({
        id: response.indicatorId,
        pillarId: response.pillarId,
        shortName: indicatorDefinitions[response.indicatorId]?.shortName || response.indicatorId,
        description: indicatorDefinitions[response.indicatorId]?.description || 'Assessment indicator',
        rawValue: response.rawValue,
        normalizedScore: response.normalizedScore,
        measurementUnit: response.measurementUnit,
        hasEvidence: response.hasEvidence,
        evidence: response.evidence.map(e => ({
          type: e.type,
          fileName: e.fileName,
          url: e.url,
          description: e.description
        }))
      })),
      recommendations: generateRecommendations(pillarData, overallScore)
    }

    // Process historical data from score audits
    const historicalData = application.scoreAudits.map(audit => {
      const scoreData = audit.scoreData as any
      const pillarScores = scoreData?.pillarScores || [0, 0, 0, 0, 0, 0]
      const overallScore = scoreData?.overallScore || 0
      
      // Determine certification level based on score
      let certificationLevel = "NOT_CERTIFIED"
      if (overallScore >= 80) {
        certificationLevel = "GOLD"
      } else if (overallScore >= 60) {
        certificationLevel = "CERTIFIED"
      }

      return {
        year: new Date(audit.calculatedAt).getFullYear(),
        overallScore: overallScore,
        certificationLevel: certificationLevel,
        pillarScores: pillarScores,
        submittedDate: audit.calculatedAt,
        auditId: audit.id
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...dashboardData,
        historicalData: historicalData
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

// Helper function to get indicator definitions
function getIndicatorDefinitions() {
  return {
    // Pillar 1 indicators
    "1.1.a": {
      shortName: "Formal Innovation Intent",
      description: "Assesses whether the organization has a formal, written statement defining its innovation intent",
      measurementUnit: "Score (0-2)"
    },
    "1.1.b": {
      shortName: "Strategy Alignment",
      description: "Evaluates if the innovation strategy directly supports broader business goals",
      measurementUnit: "Percentage (%)"
    },
    "1.1.c": {
      shortName: "Innovation Priorities",
      description: "Checks for explicit listing of innovation focus areas",
      measurementUnit: "Score (0-2)"
    },
    "1.1.d": {
      shortName: "Intent Communication",
      description: "Assesses dissemination of innovation intent to employees, partners, and investors",
      measurementUnit: "Percentage (%)"
    },
    
    // Pillar 2 indicators
    "2.1.1": {
      shortName: "Innovation Budget",
      description: "Measures the sufficiency of budget allocated for developing new products, services, or internal processes",
      measurementUnit: "Percentage (%)"
    },
    "2.1.2": {
      shortName: "IP Investment",
      description: "Evaluates the allocation of financial resources dedicated to protecting and optimizing the value of intellectual property",
      measurementUnit: "Percentage (%)"
    },
    "2.2.1": {
      shortName: "Personnel Allocation",
      description: "Measures the extent to which adequate personnel are assigned to support innovation efforts",
      measurementUnit: "Percentage (%)"
    },
    "2.2.2": {
      shortName: "Dedicated Innovation Time",
      description: "Evaluates the provision of dedicated time for employees to conduct experiments, test ideas, and engage in creative development",
      measurementUnit: "Percentage (%)"
    },

    // Pillar 3 indicators
    "3.1.1": {
      shortName: "Innovation Processes",
      description: "Assesses the systematic approach to managing innovation activities",
      measurementUnit: "Score (1-5)"
    },
    "3.2.1": {
      shortName: "Idea Capture",
      description: "A systematic process is used for the capture, documentation, and tracking of ideas",
      measurementUnit: "Number"
    },
    "3.4.1": {
      shortName: "Creative Encouragement",
      description: "The culture actively encourages and rewards creativity, calculated risk-taking, and cross-functional collaboration",
      measurementUnit: "Score (1-5)"
    },
    "3.4.2": {
      shortName: "Psychological Safety",
      description: "The organization fosters open communication, values diversity of thought, and provides safe spaces for experimentation",
      measurementUnit: "Percentage (%)"
    },

    // Pillar 4 indicators
    "4.1.1": {
      shortName: "IP Strategy",
      description: "Assesses the alignment of intellectual property strategy with overall business and innovation objectives",
      measurementUnit: "Score (1-5)"
    },
    "4.2.1": {
      shortName: "IP Identification",
      description: "How systematic and integrated are the processes for identifying and capturing potential intellectual assets",
      measurementUnit: "Percentage (%)"
    },
    "4.2.3": {
      shortName: "IP Exploitation",
      description: "To what extent does the organization actively explore and execute strategies to monetize its portfolio of intellectual assets",
      measurementUnit: "Percentage (%)"
    },
    "4.4.2": {
      shortName: "Knowledge Sharing",
      description: "How effective and accessible are the internal systems and cultural norms for sharing knowledge, resources, and ideas",
      measurementUnit: "Score (1-5)"
    },

    // Pillar 5 indicators
    "5.1.1": {
      shortName: "Intelligence Sources",
      description: "How diverse and comprehensive are the sources of strategic intelligence used to inform innovation decisions",
      measurementUnit: "Score (1-5)"
    },
    "5.1.3": {
      shortName: "Informed Decisions",
      description: "How effectively is strategic intelligence integrated into decision-making processes",
      measurementUnit: "Percentage (%)"
    },
    "5.2.2": {
      shortName: "Partner Selection",
      description: "How well-defined and strategic is the process for identifying, evaluating, and selecting external partners",
      measurementUnit: "Score (1-5)"
    },
    "5.2.4": {
      shortName: "Partnership Value",
      description: "To what extent do external collaborations demonstrably contribute to the organization's innovation capacity",
      measurementUnit: "Percentage (%)"
    },

    // Pillar 6 indicators
    "6.1.1": {
      shortName: "Performance Metrics",
      description: "To what extent has the organization established and implemented specific metrics for evaluating innovation processes",
      measurementUnit: "Percentage (%)"
    },
    "6.1.2": {
      shortName: "Data-Driven Decisions",
      description: "How effectively is data from these metrics used to support and drive strategic and operational decision-making",
      measurementUnit: "Percentage (%)"
    },
    "6.2.1": {
      shortName: "IMS Assessment",
      description: "How frequently and rigorously does the organization evaluate its overall Innovation Management System",
      measurementUnit: "Score (0-3)"
    },
    "6.3.1": {
      shortName: "Feedback Loop",
      description: "How effectively are insights from performance measurement, evaluations, and audit findings channeled into a formal continuous improvement process",
      measurementUnit: "Percentage (%)"
    }
  }
}

// Helper function to generate recommendations
function generateRecommendations(pillarData: any, overallScore: number) {
  const recommendations = []

  // Overall score recommendations
  if (overallScore < 60) {
    recommendations.push("Focus on building foundational innovation capabilities across all pillars to achieve certification.")
  } else if (overallScore < 80) {
    recommendations.push("Strengthen innovation processes and culture to achieve Gold certification level.")
  } else {
    recommendations.push("Maintain excellence and continue building on your strong innovation foundation.")
  }

  // Pillar-specific recommendations
  Object.entries(pillarData).forEach(([pillarKey, pillar]: [string, any]) => {
    const pillarId = pillarKey.replace('pillar_', '')
    const score = pillar.stats?.averageScore || 0
    const completion = pillar.stats?.completion || 0

    if (completion < 50) {
      recommendations.push(`Complete more indicators in Pillar ${pillarId} to improve your assessment coverage.`)
    }

    if (score < 50) {
      const pillarNames = {
        "1": "Strategic Foundation & Leadership",
        "2": "Resource Allocation & Infrastructure", 
        "3": "Innovation Processes & Culture",
        "4": "Knowledge & IP Management",
        "5": "Strategic Intelligence & Collaboration",
        "6": "Performance Measurement & Improvement"
      }
      recommendations.push(`Strengthen ${pillarNames[pillarId]} to improve your overall innovation maturity.`)
    }
  })

  return recommendations
}
