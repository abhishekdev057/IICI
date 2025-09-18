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

    // OPTIMIZED: Fetch only essential data for faster loading
    const application = await prisma.application.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        institutionData: true,
        indicatorResponses: {
          include: {
            evidence: {
              select: {
                id: true,
                type: true,
                fileName: true,
                url: true,
                description: true
              }
            }
          }
        },
        scoreAudits: {
          orderBy: { calculatedAt: 'desc' },
          take: 1 // Only get the latest score audit
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
    "1.1.1": {
      shortName: "Formal Innovation Intent",
      description: "Assesses whether the organization has a formal, written statement defining its innovation intent",
      measurementUnit: "Score (0-2)"
    },
    "1.1.2": {
      shortName: "Strategy Alignment",
      description: "Evaluates if the innovation strategy directly supports broader business goals",
      measurementUnit: "Percentage (%)"
    },
    "1.1.3": {
      shortName: "Innovation Priorities",
      description: "Checks for explicit listing of innovation focus areas",
      measurementUnit: "Score (0-2)"
    },
    "1.1.4": {
      shortName: "Intent Communication",
      description: "Assesses dissemination of innovation intent to employees, partners, and investors",
      measurementUnit: "Percentage (%)"
    },
    
    // Pillar 1 additional indicators
    "1.2.1": { shortName: "IMS Champion", measurementUnit: "Binary (0-1)" },
    "1.2.2": { shortName: "Leadership Engagement", measurementUnit: "Percentage (%)" },
    "1.2.3": { shortName: "Budget Allocation", measurementUnit: "Percentage (%)" },
    "1.2.4": { shortName: "Innovation Mindset Promotion", measurementUnit: "Score (1-5)" },
    "1.3.1": { shortName: "Innovation Policy", measurementUnit: "Score (0-3)" },
    "1.3.2": { shortName: "Policy Communication", measurementUnit: "Percentage (%)" },
    "1.3.3": { shortName: "IP Strategy Presence", measurementUnit: "Score (0-2)" },
    "1.3.4": { shortName: "IP Alignment", measurementUnit: "Percentage (%)" },
    "1.4.1": { shortName: "Internal Feedback Process", measurementUnit: "Score (0-3)" },
    "1.4.2": { shortName: "External Intelligence Gathering", measurementUnit: "Percentage (%)" },
    "1.4.3": { shortName: "Strategy Adjustment Mechanism", measurementUnit: "Binary (0-1)" },
    "1.4.4": { shortName: "Strategic Pivot Example", measurementUnit: "Score (0-2)" },

    // Pillar 2 additional indicators
    "2.1.3": { shortName: "Funding Accessibility", measurementUnit: "Score (1-5)" },
    "2.2.3": { shortName: "Training Programs", measurementUnit: "Hours per employee" },
    "2.2.4": { shortName: "Competency Assessment", measurementUnit: "Score (0-3)" },
    "2.2.5": { shortName: "Skill Gap Strategy", measurementUnit: "Percentage (%)" },
    "2.3.1": { shortName: "IMS Tools Adoption", measurementUnit: "Percentage (%)" },
    "2.3.2": { shortName: "Idea Tracking Effectiveness", measurementUnit: "Score (1-5)" },
    "2.3.3": { shortName: "Physical Infrastructure", measurementUnit: "Percentage (%)" },
    "2.3.4": { shortName: "Management Resource Support", measurementUnit: "Score (1-5)" },

    // Pillar 3 additional indicators
    "3.1.2": { shortName: "Role Clarity", measurementUnit: "Percentage (%)" },
    "3.1.3": { shortName: "Progress Tracking", measurementUnit: "Percentage (%)" },
    "3.1.4": { shortName: "Output Efficiency", measurementUnit: "Score (1-5)" },
    "3.2.2": { shortName: "Evaluation Criteria", measurementUnit: "Percentage (%)" },
    "3.2.3": { shortName: "Idea Pathway", measurementUnit: "Binary (0-1)" },
    "3.3.1": { shortName: "Hypothesis Testing", measurementUnit: "Percentage (%)" },
    "3.3.2": { shortName: "Concept Adaptation", measurementUnit: "Number" },
    "3.3.3": { shortName: "Continuous Iteration", measurementUnit: "Number" },
    "3.4.3": { shortName: "Culture Assessment", measurementUnit: "Score (0-3)" },
    "3.4.4": { shortName: "Process-Culture Synergy", measurementUnit: "Score (1-5)" },
    "3.5.1": { shortName: "Strategy Communication", measurementUnit: "Percentage (%)" },
    "3.5.2": { shortName: "Employee Alignment", measurementUnit: "Percentage (%)" },

    // Pillar 4 additional indicators
    "4.1.2": { shortName: "Proactive IP Value", measurementUnit: "Ratio" },
    "4.1.3": { shortName: "Environmental IP Integration", measurementUnit: "Percentage (%)" },
    "4.2.2": { shortName: "IP Protection Process", measurementUnit: "Score (1-5)" },
    "4.3.1": { shortName: "IP Risk Assessment", measurementUnit: "Score (0-3)" },
    "4.3.2": { shortName: "IP Risk Mitigation", measurementUnit: "Percentage (%)" },
    "4.4.1": { shortName: "Intelligence Management", measurementUnit: "Percentage (%)" },
    "4.4.3": { shortName: "Knowledge-IP Integration", measurementUnit: "Score (1-5)" },

    // Pillar 5 additional indicators
    "5.1.2": { shortName: "Analysis Synthesis", measurementUnit: "Percentage (%)" },
    "5.1.4": { shortName: "Proactive Foresight", measurementUnit: "Number" },
    "5.1.5": { shortName: "Monitoring Adaptation", measurementUnit: "Score (0-3)" },
    "5.2.1": { shortName: "Competency Analysis", measurementUnit: "Percentage (%)" },
    "5.2.3": { shortName: "Partnership Management", measurementUnit: "Percentage (%)" },

    // Pillar 6 additional indicators
    "6.1.3": { shortName: "Data Collection", measurementUnit: "Score (1-5)" },
    "6.2.2": { shortName: "Formal Audits", measurementUnit: "Number" },
    "6.2.3": { shortName: "Maturity Assessment", measurementUnit: "Score (1-5)" },
    "6.3.2": { shortName: "Corrective Actions", measurementUnit: "Percentage (%)" },
    "6.3.3": { shortName: "System Evolution", measurementUnit: "Number" }
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
