"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { History, Calendar, Award, FileText, Clock } from "lucide-react"

interface HistoryEvent {
  id: string
  type: "assessment" | "certification" | "update" | "submission"
  title: string
  description: string
  date: string
  status?: string
  score?: number
}

export function InstitutionHistory() {
  const { state } = useData()
  const application = state.currentApplication

  // Generate history events based on application data
  const historyEvents: HistoryEvent[] = [
    {
      id: "1",
      type: "submission",
      title: "Application Created",
      description: "IIICI certification application was created and institution details were added",
      date: application?.lastSaved ? new Date(application.lastSaved).toISOString() : new Date().toISOString(),
      status: "completed",
    },
  ]

  if (application?.submittedAt) {
    historyEvents.push({
      id: "2",
      type: "assessment",
      title: "Assessment Submitted",
      description: "Complete IIICI assessment submitted for review",
      date: new Date(application.submittedAt).toISOString(),
      status: "completed",
      score: application.scores?.overallScore,
    })
  }

  if (application?.scores?.certificationLevel !== "Not Certified") {
    historyEvents.push({
      id: "3",
      type: "certification",
      title: "Certification Awarded",
      description: `${application?.scores?.certificationLevel} certification level achieved`,
      date: application?.submittedAt ? new Date(application.submittedAt).toISOString() : new Date().toISOString(),
      status: "completed",
    })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "assessment":
        return <FileText className="h-4 w-4" />
      case "certification":
        return <Award className="h-4 w-4" />
      case "update":
        return <Clock className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "assessment":
        return "bg-blue-500"
      case "certification":
        return "bg-green-500"
      case "update":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Institution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {historyEvents.length > 0 ? (
              historyEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white`}
                    >
                      {getEventIcon(event.type)}
                    </div>
                    {index < historyEvents.length - 1 && <div className="w-px h-12 bg-border mt-2" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center gap-2">
                        {event.score && (
                          <Badge variant="outline" className="text-xs">
                            Score: {Math.round(event.score)}%
                          </Badge>
                        )}
                        {event.status && (
                          <Badge variant={event.status === "completed" ? "default" : "secondary"} className="text-xs">
                            {event.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No history events yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{historyEvents.length}</div>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {application?.submittedAt
                ? new Date().getFullYear() - new Date(application.submittedAt).getFullYear() + 1
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Years Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {application?.scores?.certificationLevel !== "Not Certified" ? 1 : 0}
            </div>
            <p className="text-xs text-muted-foreground">Certifications</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
