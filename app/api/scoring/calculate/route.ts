import { type NextRequest, NextResponse } from "next/server"
import { ScoringEngine } from "@/lib/scoring-engine"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Calculate scores using the scoring engine
    const result = ScoringEngine.processFormData(formData)

    // In a real application, you would save this to a database
    // await saveScoreToDatabase(result, userId)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Scoring calculation error:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate scores" }, { status: 500 })
  }
}
