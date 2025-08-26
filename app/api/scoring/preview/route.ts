import { type NextRequest, NextResponse } from "next/server"
import { ScoringEngine } from "@/lib/scoring-engine"

export async function POST(request: NextRequest) {
  try {
    const { pillarId, pillarData } = await request.json()

    // Calculate preview score for a single pillar
    const pillar = ScoringEngine["processPillarData"](pillarId, pillarData)

    return NextResponse.json({
      success: true,
      data: {
        pillarScore: pillar.averageScore,
        indicators: pillar.subPillars[0].indicators.map((ind) => ({
          id: ind.id,
          normalizedScore: ind.normalizedScore,
          hasEvidence: ind.hasEvidence,
        })),
      },
    })
  } catch (error) {
    console.error("Score preview error:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate preview" }, { status: 500 })
  }
}
