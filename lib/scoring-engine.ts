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
  certificationLevel: "GOLD" | "CERTIFIED" | "NOT_CERTIFIED"
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
        const binaryResult = Number(rawValue)
        return isNaN(binaryResult) ? 0 : binaryResult

      case measurementUnit.includes("Score"):
        const max = maxScore || this.extractMaxFromUnit(measurementUnit)
        const min = measurementUnit.includes("(1-5)") ? 1 : 0
        const scoreResult = Math.max(0, Math.min(1, (Number(rawValue) - min) / (max - min)))
        return isNaN(scoreResult) ? 0 : scoreResult

      case measurementUnit.includes("Percentage"):
        const percentageResult = Math.max(0, Math.min(1, Number(rawValue) / 100))
        return isNaN(percentageResult) ? 0 : percentageResult

      case measurementUnit.includes("Number") || measurementUnit.includes("Hours"):
        // Normalize using benchmarks or caps
        const numberResult = this.normalizeNumberValue(Number(rawValue), measurementUnit)
        return isNaN(numberResult) ? 0 : numberResult

      case measurementUnit === "Ratio":
        // For ratio indicators, convert to percentage (assuming higher ratio is better)
        if (typeof rawValue === 'string' && rawValue.includes(':')) {
          const [proactive, reactive] = rawValue.split(':').map(Number)
          const total = proactive + reactive
          const ratioResult = total > 0 ? (proactive / total) : 0
          return isNaN(ratioResult) ? 0 : ratioResult
        }
        const ratioResult2 = Math.min(Number(rawValue), 1)
        return isNaN(ratioResult2) ? 0 : ratioResult2

      case measurementUnit.includes("Hours per employee"):
        // Convert hours to percentage (assuming 40 hours is 100%)
        const hoursResult = Math.min(Number(rawValue) / 40, 1)
        return isNaN(hoursResult) ? 0 : hoursResult

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
    // Check for NaN or invalid values
    if (isNaN(value) || !isFinite(value)) return 0
    
    // Define benchmarks for different number types based on new indicators
    const benchmarks: { [key: string]: number } = {
      ideas: 200, // 200 ideas per quarter = 100% (3.2.1)
      hours: 40, // 40 hours training per year = 100% (2.2.3)
      sources: 10, // 10+ sources = 100% (5.1.1)
      audits: 2, // 2 audits per year = 100% (6.2.2)
      updates: 4, // 4 updates per year = 100% (6.3.3)
      adaptations: 5, // 5 adaptations per project = 100% (3.3.2)
      iterations: 5, // 5 iteration cycles = 100% (3.3.3)
      events: 5, // 5 foreseen events = 100% (5.1.4)
    }

    // Try to match measurement unit to benchmark
    for (const [key, benchmark] of Object.entries(benchmarks)) {
      if (measurementUnit.toLowerCase().includes(key)) {
        const result = Math.min(1, value / benchmark)
        return isNaN(result) ? 0 : result
      }
    }

    // Default: cap at 1 for values >= 100
    const result = Math.min(1, value / 100)
    return isNaN(result) ? 0 : result
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

    const sum = indicators.reduce((total, indicator) => {
      const score = isNaN(indicator.normalizedScore) ? 0 : indicator.normalizedScore
      return total + score
    }, 0)
    
    const average = indicators.length > 0 ? sum / indicators.length : 0
    return isNaN(average) ? 0 : average
  }

  /**
   * Calculate pillar score (average of sub-pillars, converted to percentage)
   */
  static calculatePillarScore(subPillars: SubPillarScore[]): number {
    if (subPillars.length === 0) return 0

    const sum = subPillars.reduce((total, subPillar) => {
      const score = isNaN(subPillar.averageScore) ? 0 : subPillar.averageScore
      return total + score
    }, 0)
    
    const average = subPillars.length > 0 ? sum / subPillars.length : 0
    const percentage = average * 100 // Convert to percentage
    
    return isNaN(percentage) ? 0 : percentage
  }

  /**
   * Calculate overall score and determine certification level
   */
  static calculateOverallScore(pillars: PillarScore[]): OverallScore {
    if (pillars.length === 0) {
      return {
        pillars,
        overallScore: 0,
        certificationLevel: "NOT_CERTIFIED",
        recommendations: ["Complete all pillar assessments to receive certification."],
      }
    }

    const sum = pillars.reduce((total, pillar) => {
      const score = isNaN(pillar.averageScore) ? 0 : pillar.averageScore
      return total + score
    }, 0)
    
    const overallScore = pillars.length > 0 ? sum / pillars.length : 0
    
    // Ensure we don't return NaN
    const validOverallScore = isNaN(overallScore) ? 0 : overallScore

    const certificationLevel = this.determineCertificationLevel(validOverallScore)
    const recommendations = this.generateRecommendations(pillars, validOverallScore)

    return {
      pillars,
      overallScore: validOverallScore,
      certificationLevel,
      recommendations,
    }
  }

  /**
   * Determine certification level based on score
   */
  private static determineCertificationLevel(score: number): "GOLD" | "CERTIFIED" | "NOT_CERTIFIED" {
    if (score >= 85) return "GOLD"
    if (score >= 70) return "CERTIFIED"
    return "NOT_CERTIFIED"
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
    // Updated to match the new expanded pillar structure
    const indicatorsByPillar: { [key: number]: any[] } = {
      1: [
        { id: "1.1.1", measurementUnit: "Score (0-2)", maxScore: 2 },
        { id: "1.1.2", measurementUnit: "Percentage (%)" },
        { id: "1.1.3", measurementUnit: "Score (0-2)", maxScore: 2 },
        { id: "1.1.4", measurementUnit: "Percentage (%)" },
        { id: "1.2.1", measurementUnit: "Binary (0-1)", maxScore: 1 },
        { id: "1.2.2", measurementUnit: "Percentage (%)" },
        { id: "1.2.3", measurementUnit: "Percentage (%)" },
        { id: "1.2.4", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "1.3.1", measurementUnit: "Score (0-3)", maxScore: 3 },
        { id: "1.3.2", measurementUnit: "Percentage (%)" },
        { id: "1.3.3", measurementUnit: "Score (0-2)", maxScore: 2 },
        { id: "1.3.4", measurementUnit: "Percentage (%)" },
        { id: "1.4.1", measurementUnit: "Score (0-3)", maxScore: 3 },
        { id: "1.4.2", measurementUnit: "Percentage (%)" },
        { id: "1.4.3", measurementUnit: "Binary (0-1)", maxScore: 1 },
        { id: "1.4.4", measurementUnit: "Score (0-2)", maxScore: 2 },
      ],
      2: [
        { id: "2.1.1", measurementUnit: "Percentage (%)" },
        { id: "2.1.2", measurementUnit: "Percentage (%)" },
        { id: "2.1.3", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "2.2.1", measurementUnit: "Percentage (%)" },
        { id: "2.2.2", measurementUnit: "Percentage (%)" },
        { id: "2.2.3", measurementUnit: "Hours per employee" },
        { id: "2.2.4", measurementUnit: "Score (0-3)", maxScore: 3 },
        { id: "2.2.5", measurementUnit: "Percentage (%)" },
        { id: "2.3.1", measurementUnit: "Percentage (%)" },
        { id: "2.3.2", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "2.3.3", measurementUnit: "Percentage (%)" },
        { id: "2.3.4", measurementUnit: "Score (1-5)", maxScore: 5 },
      ],
      3: [
        { id: "3.1.1", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "3.1.2", measurementUnit: "Percentage (%)" },
        { id: "3.1.3", measurementUnit: "Percentage (%)" },
        { id: "3.1.4", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "3.2.1", measurementUnit: "Number" },
        { id: "3.2.2", measurementUnit: "Percentage (%)" },
        { id: "3.2.3", measurementUnit: "Binary (0-1)", maxScore: 1 },
        { id: "3.3.1", measurementUnit: "Percentage (%)" },
        { id: "3.3.2", measurementUnit: "Number" },
        { id: "3.3.3", measurementUnit: "Number" },
        { id: "3.4.1", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "3.4.2", measurementUnit: "Percentage (%)" },
        { id: "3.4.3", measurementUnit: "Score (0-3)", maxScore: 3 },
        { id: "3.4.4", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "3.5.1", measurementUnit: "Percentage (%)" },
        { id: "3.5.2", measurementUnit: "Percentage (%)" },
      ],
      4: [
        { id: "4.1.1", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "4.1.2", measurementUnit: "Ratio" },
        { id: "4.1.3", measurementUnit: "Percentage (%)" },
        { id: "4.2.1", measurementUnit: "Percentage (%)" },
        { id: "4.2.2", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "4.2.3", measurementUnit: "Percentage (%)" },
        { id: "4.3.1", measurementUnit: "Score (0-3)", maxScore: 3 },
        { id: "4.3.2", measurementUnit: "Percentage (%)" },
        { id: "4.4.1", measurementUnit: "Percentage (%)" },
        { id: "4.4.2", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "4.4.3", measurementUnit: "Score (1-5)", maxScore: 5 },
      ],
      5: [
        { id: "5.1.1", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "5.1.2", measurementUnit: "Percentage (%)" },
        { id: "5.1.3", measurementUnit: "Percentage (%)" },
        { id: "5.1.4", measurementUnit: "Number" },
        { id: "5.1.5", measurementUnit: "Score (0-3)", maxScore: 3 },
        { id: "5.2.1", measurementUnit: "Percentage (%)" },
        { id: "5.2.2", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "5.2.3", measurementUnit: "Percentage (%)" },
        { id: "5.2.4", measurementUnit: "Percentage (%)" },
      ],
      6: [
        { id: "6.1.1", measurementUnit: "Percentage (%)" },
        { id: "6.1.2", measurementUnit: "Percentage (%)" },
        { id: "6.1.3", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "6.2.1", measurementUnit: "Score (0-3)", maxScore: 3 },
        { id: "6.2.2", measurementUnit: "Number" },
        { id: "6.2.3", measurementUnit: "Score (1-5)", maxScore: 5 },
        { id: "6.3.1", measurementUnit: "Percentage (%)" },
        { id: "6.3.2", measurementUnit: "Percentage (%)" },
        { id: "6.3.3", measurementUnit: "Number" },
      ],
    }

    return indicatorsByPillar[pillarId] || []
  }
}
