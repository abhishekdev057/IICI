"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, FileText } from "lucide-react"
import Link from "next/link"

export function UserStatusCTA() {
  const { data: session } = useSession()
  const applicationStatus = (session?.user as any)?.applicationStatus as string | undefined
  const isSubmitted = (applicationStatus || '').toLowerCase() === 'submitted'
  const role = (session?.user as any)?.role as string | undefined
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

  if (!session?.user) {
    return (
      <div className="text-center">
        <Button 
          size="lg" 
          asChild 
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Link href="/auth">
            Start Your Certification
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    )
  }

  // For logged-in users, show CTA based on role/submission
  return (
    <div className="text-center">
      <Button 
        size="lg" 
        asChild 
        className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <Link href={isAdmin ? "/admin" : (isSubmitted ? "/dashboard" : "/application") }>
          {isAdmin ? 'Go to Admin Dashboard' : (isSubmitted ? 'Go to Dashboard' : 'Continue to Application')}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  )
}
