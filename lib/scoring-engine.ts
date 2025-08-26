// IIICI Scoring Engine - Handles all score calculations and normalization

export interface IndicatorScore {
  id: string
  rawValue: any
  normalizedScore: number // 0-1 scale
  measurementUnit: string
  maxScore?: number
  hasEvidence: boolean
}

export interface SubPillarScore {
  id: string
  name: string
  indicators: IndicatorScore[]
  averageScore: number // 0-1 scale
}

export interface PillarScore {
  id: number
  name: string
  subPillars: SubPillarScore[]
  averageScore: number // 0-100 percentage
}

export interface OverallScore {
  pillars: PillarScore[]
  overallScore: number // 0-100 percentage
  certificationLevel: "Gold" | "Certified" | "Not Certified"
  recommendations: string[]
}

export class ScoringEngine {
  /**
   * Normalize individual indicator score to 0-1 scale
   */
  static normalizeIndicatorScore(
    rawValue: any,
    measurementUnit: string,
    maxScore?: number,
    hasEvidence = false,
  ): number {
    // Missing data or no evidence when required = 0
    if (!rawValue && rawValue !== 0) return 0
    if (!hasEvidence && this.requiresEvidence(rawValue, measurementUnit, maxScore)) return 0

    switch (true) {
      case measurementUnit.includes("Binary"):
        return Number(rawValue) // Already 0 or 1

      case measurementUnit.includes("Score"):
        const max = maxScore || this.extractMaxFromUnit(measurementUnit)
        const min = measurementUnit.includes("(1-5)") ? 1 : 0
        return Math.max(0, Math.min(1, (Number(rawValue) - min) / (max - min)))

      case measurementUnit.includes("Percentage"):
        return Math.max(0, Math.min(1, Number(rawValue) / 100))

      case measurementUnit.includes("Number") || measurementUnit.includes("Hours"):
        // Normalize using benchmarks or caps
        return this.normalizeNumberValue(Number(rawValue), measurementUnit)

      default:
        return 0
    }
  }

  /**
   * Extract maximum score from measurement unit string
   */
  private static extractMaxFromUnit(measurementUnit: string): number {
    const match = measurementUnit.match(/$$(\d+)-(\d+)$$/)
    if (match) return Number(match[2])

    if (measurementUnit.includes("(0-2)")) return 2
    if (measurementUnit.includes("(0-3)")) return 3
    if (measurementUnit.includes("(1-5)")) return 5

    return 5 // Default
  }

  /**
   * Normalize number values using benchmarks
   */
  private static normalizeNumberValue(value: number, measurementUnit: string): number {
    // Define benchmarks for different number types
    const benchmarks: { [key: string]: number } = {
      ideas: 200, // 200 ideas per quarter = 100%
      hours: 40, // 40 hours training per year = 100%
      sources: 10, // 10+ sources = 100%
      audits: 2, // 2 audits per year = 100%
      updates: 4, // 4 updates per year = 100%
    }

    // Try to match measurement unit to benchmark
    for (const [key, benchmark] of Object.entries(benchmarks)) {
      if (measurementUnit.toLowerCase().includes(key)) {
        return Math.min(1, value / benchmark)
      }
    }

    // Default: cap at 1 for values >= 100
    return Math.min(1, value / 100)
  }

  /**
   * Check if evidence is required based on score
   */
  private static requiresEvidence(rawValue: any, measurementUnit: string, maxScore?: number): boolean {
    if (!rawValue) return false

    if (measurementUnit.includes("Score")) {
      const max = maxScore || this.extractMaxFromUnit(measurementUnit)
      return Number(rawValue) > max * 0.5
    }

    if (measurementUnit.includes("Percentage")) {
      return Number(rawValue) > 50
    }

    return Number(rawValue) > 0
  }

  /**
   * Calculate sub-pillar score (average of indicators)
   */
  static calculateSubPillarScore(indicators: IndicatorScore[]): number {
    if (indicators.length === 0) return 0

    const sum = indicators.reduce((total, indicator) => total + indicator.normalizedScore, 0)
    return sum / indicators.length
  }

  /**
   * Calculate pillar score (average of sub-pillars, converted to percentage)
   */
  static calculatePillarScore(subPillars: SubPillarScore[]): number {
    if (subPillars.length === 0) return 0

    const sum = subPillars.reduce((total, subPillar) => total + subPillar.averageScore, 0)
    return (sum / subPillars.length) * 100 // Convert to percentage
  }

  /**
   * Calculate overall score and determine certification level
   */
  static calculateOverallScore(pillars: PillarScore[]): OverallScore {
    if (pillars.length === 0) {
      return {
        pillars,
        overallScore: 0,
        certificationLevel: "Not Certified",
        recommendations: ["Complete all pillar assessments to receive certification."],
      }
    }

    const sum = pillars.reduce((total, pillar) => total + pillar.averageScore, 0)
    const overallScore = sum / pillars.length

    const certificationLevel = this.determineCertificationLevel(overallScore)
    const recommendations = this.generateRecommendations(pillars, overallScore)

    return {
      pillars,
      overallScore,
      certificationLevel,
      recommendations,
    }
  }

  /**
   * Determine certification level based on score
   */
  private static determineCertificationLevel(score: number): "Gold" | "Certified" | "Not Certified" {
    if (score >= 85) return "Gold"
    if (score >= 70) return "Certified"
    return "Not Certified"
  }

  /**
   * Generate improvement recommendations
   */
  private static generateRecommendations(pillars: PillarScore[], overallScore: number): string[] {
    const recommendations: string[] = []

    if (overallScore < 70) {
      recommendations.push("Overall score below certification threshold. Focus on improving lowest-scoring pillars.")
    }

    // Identify lowest scoring pillars
    const sortedPillars = [...pillars].sort((a, b) => a.averageScore - b.averageScore)
    const lowestPillars = sortedPillars.filter((p) => p.averageScore < 60)

    lowestPillars.forEach((pillar) => {
      switch (pillar.id) {
        case 1:
          recommendations.push(
            "Strengthen strategic foundation by formalizing innovation intent and improving leadership engagement.",
          )
          break
        case 2:
          recommendations.push(
            "Increase resource allocation for innovation activities and improve infrastructure support.",
          )
          break
        case 3:
          recommendations.push("Enhance innovation processes and foster a more supportive innovation culture.")
          break
        case 4:
          recommendations.push("Improve IP management strategy and knowledge sharing systems.")
          break
        case 5:
          recommendations.push("Strengthen external intelligence gathering and partnership management.")
          break
        case 6:
          recommendations.push("Implement better performance measurement and continuous improvement processes.")
          break
      }
    })

    if (recommendations.length === 0) {
      recommendations.push("Excellent performance! Continue maintaining high standards across all pillars.")
    }

    return recommendations
  }

  /**
   * Process complete form data and calculate all scores
   */
  static processFormData(formData: any): OverallScore {
    const pillars: PillarScore[] = []

    // Process each pillar
    for (let pillarId = 1; pillarId <= 6; pillarId++) {
      const pillarData = formData[`pillar_${pillarId}`]
      if (!pillarData) continue

      const pillar = this.processPillarData(pillarId, pillarData)
      pillars.push(pillar)
    }

    return this.calculateOverallScore(pillars)
  }

  /**
   * Process individual pillar data
   */
  private static processPillarData(pillarId: number, pillarData: any): PillarScore {
    const pillarNames = [
      "Strategic Foundation & Leadership",
      "Resource Allocation & Infrastructure",
      "Innovation Processes & Culture",
      "Knowledge & IP Management",
      "Strategic Intelligence & Collaboration",
      "Performance Measurement & Improvement",
    ]

    // Get indicator definitions for this pillar
    const indicators = this.getPillarIndicators(pillarId)

    // Process each indicator
    const indicatorScores: IndicatorScore[] = indicators.map((indicator) => {
      const rawValue = pillarData[indicator.id]
      const hasEvidence =
        pillarData.evidence?.[indicator.id]?.files?.length > 0 || pillarData.evidence?.[indicator.id]?.links?.length > 0

      return {
        id: indicator.id,
        rawValue,
        normalizedScore: this.normalizeIndicatorScore(
          rawValue,
          indicator.measurementUnit,
          indicator.maxScore,
          hasEvidence,
        ),
        measurementUnit: indicator.measurementUnit,
        maxScore: indicator.maxScore,
        hasEvidence,
      }
    })

    // For simplicity, treat each pillar as one sub-pillar
    const subPillar: SubPillarScore = {
      id: `${pillarId}.1`,
      name: pillarNames[pillarId - 1],
      indicators: indicatorScores,
      averageScore: this.calculateSubPillarScore(indicatorScores),
    }

    return {
      id: pillarId,
      name: pillarNames[pillarId - 1],
      subPillars: [subPillar],
      averageScore: this.calculatePillarScore([subPillar]),
    }
  }

  /**
   * Get indicator definitions for a pillar
   */
  private static getPillarIndicators(pillarId: number): any[] {
    // This would typically come from a database or configuration
    // For now, return basic structure based on pillar ID
    const indicatorsByPillar: { [key: number]: any[] } = {
      1: [
        { id: "1.1.a", measurementUnit: "Score (0-2)", maxScore: 2 },
        { id: "1.1.b", measurementUnit: "Percentage (%)" },
        { id: "1.1.c", measurementUnit: "Score (0-2)", maxScore: 2 },
        { id: "1.1.d", measurementUnit: "Percentage (%)" },
      ],
      2: [
        { id: "2.1.1", measurementUnit: "Percentage (%)" },
        { id: "2.1.2", measurementUnit: "Percentage (%)" },
        { id: "2.2.1", measurementUnit: "Percentage (%)" },
        { id: "2.2.2", measurementUnit: "Percentage (%)" },
      ],
      3: [
        { id: "3.1.1", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "3.2.1", measurementUnit: "Number" },
        { id: "3.4.1", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "3.4.2", measurementUnit: "Percentage (%)" },
      ],
      4: [
        { id: "4.1.1", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "4.2.1", measurementUnit: "Percentage (%)" },
        { id: "4.2.3", measurementUnit: "Percentage (%)" },
        { id: "4.4.2", measurementUnit: "Score (1-5)", maxScore: 5 },
      ],
      5: [
        { id: "5.1.1", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "5.1.3", measurementUnit: "Percentage (%)" },
        { id: "5.2.2", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "5.2.4", measurementUnit: "Percentage (%)" },
      ],
      6: [
        { id: "6.1.1", measurementUnit: "Percentage (%)" },
        { id: "6.1.2", measurementUnit: "Percentage (%)" },
        { id: "6.2.1", measurementUnit: "Score (0-3)", maxScore: 3 },
        { id: "6.3.1", measurementUnit: "Percentage (%)" },
      ],
    }

    return indicatorsByPillar[pillarId] || []
  }
}
