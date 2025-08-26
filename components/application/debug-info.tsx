"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DebugInfoProps {
  currentStep: number
  pillarData: any
  scores: any
}

export function DebugInfo({ currentStep, pillarData, scores }: DebugInfoProps) {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-orange-800">Debug Info (Development Only)</CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <div className="space-y-2">
          <div>
            <strong>Current Step:</strong> {currentStep}
          </div>
          <div>
            <strong>Current Pillar Data:</strong>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(pillarData?.[`pillar_${currentStep}`], null, 2)}
            </pre>
          </div>
          <div>
            <strong>All Pillar Scores:</strong>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 6 }, (_, i) => {
                const pillarKey = `pillar_${i + 1}`
                const pillar = pillarData?.[pillarKey]
                const score = pillar?.stats?.averageScore || 0
                return (
                  <Badge key={i} variant="outline" className="text-xs">
                    P{i + 1}: {Math.round(score)}%
                  </Badge>
                )
              })}
            </div>
          </div>
          <div>
            <strong>Scores Object:</strong>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(scores, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
