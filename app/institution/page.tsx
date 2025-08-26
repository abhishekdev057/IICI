"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { InstitutionProfile } from "@/components/institution/institution-profile"
import { InstitutionSettings } from "@/components/institution/institution-settings"
import { InstitutionHistory } from "@/components/institution/institution-history"
import { InstitutionTeam } from "@/components/institution/institution-team"
import { Building2, Settings, History, Users, Home, ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"

export default function InstitutionPage() {
  const { state } = useData()
  const [activeTab, setActiveTab] = useState("profile")

  const application = state.currentApplication
  const institutionData = application?.institutionData

  if (!application || !institutionData) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </a>
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">II</span>
                  </div>
                  <span className="font-bold text-xl">Institution Management</span>
                </div>
                <Badge variant="outline">{institutionData?.name || "Loading..."}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/">
                    <Home className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>No Institution Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please complete the institution setup in your application first.
              </p>
              <Button asChild>
                <a href="/application">Go to Application</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer variant="minimal" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </a>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">II</span>
                </div>
                <span className="font-bold text-xl">Institution Management</span>
              </div>
              <Badge variant="outline">{institutionData.name}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="/">
                  <Home className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {institutionData.logo ? (
              <img
                src={institutionData.logo || "/placeholder.svg"}
                alt="Institution Logo"
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
                {institutionData.name}
              </h1>
              <p className="text-muted-foreground">
                {institutionData.industry} • {institutionData.country}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{institutionData.organizationSize}</Badge>
                <Badge variant={application.status === "submitted" ? "default" : "secondary"}>
                  {application.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <InstitutionProfile />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <InstitutionSettings />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <InstitutionHistory />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <InstitutionTeam />
          </TabsContent>
        </Tabs>
      </div>
      <Footer variant="minimal" />
    </div>
  )
}
