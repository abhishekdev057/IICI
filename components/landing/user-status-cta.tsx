"use client"

import { useSession } from "next-auth/react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, FileText } from "lucide-react"
import Link from "next/link"

export function UserStatusCTA() {
  const { data: session } = useSession()
  const { state } = useData()
  const application = state.currentApplication

  if (!session?.user) {
    return (
      <div className="text-center">
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
          <Link href="/auth">
            Start Your Certification
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  // Check application status
  if (!application) {
    return (
      <div className="text-center">
        <Button size="lg" asChild>
          <Link href="/application">
            Start Your Application
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  // Check if application is complete
  const isComplete = application.status === "submitted" || application.status === "under_review" || application.status === "certified" || application.status === "approved"
  
  if (isComplete) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Application Complete!</span>
        </div>
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  // Check progress
  const hasInstitutionData = !!(
    application.institutionData?.name?.trim().length >= 2 &&
    application.institutionData?.industry?.trim() &&
    application.institutionData?.organizationSize?.trim() &&
    application.institutionData?.country?.trim() &&
    application.institutionData?.contactEmail &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(application.institutionData.contactEmail)
  )

  if (hasInstitutionData) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <FileText className="w-5 h-5" />
          <span className="font-medium">Continue Your Application</span>
        </div>
        <Button size="lg" asChild>
          <Link href="/application">
            Resume Application
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <Button size="lg" asChild>
        <Link href="/application">
          Start Your Application
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  )
}
