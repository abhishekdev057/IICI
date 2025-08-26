"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Award, Calendar, Building2 } from "lucide-react"

interface CertificateViewerProps {
  institutionName: string
  certificationLevel: string
  overallScore: number
  issuedDate: Date
  expiryDate: Date
}

export function CertificateViewer({
  institutionName,
  certificationLevel,
  overallScore,
  issuedDate,
  expiryDate,
}: CertificateViewerProps) {
  const handleDownload = () => {
    // In a real app, this would generate and download the certificate
    console.log("Downloading certificate...")
  }

  const handleShare = () => {
    // In a real app, this would share the certificate
    console.log("Sharing certificate...")
  }

  const getCertificateColor = (level: string) => {
    switch (level) {
      case "Gold":
        return "from-yellow-400 to-yellow-600"
      case "Certified":
        return "from-green-400 to-green-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Official Certificate</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div
            className={`bg-gradient-to-br ${getCertificateColor(certificationLevel)} p-8 rounded-lg text-white relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-32 h-32 border-2 border-white rounded-full" />
              <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white rounded-full" />
            </div>

            <div className="relative z-10 text-center space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl font-bold">IIICI</h1>
                    <p className="text-sm opacity-90">Investor in Institutional Innovation Certification</p>
                  </div>
                </div>
                <h2 className="text-3xl font-bold">Certificate of {certificationLevel}</h2>
              </div>

              {/* Institution Name */}
              <div className="space-y-2">
                <p className="text-lg opacity-90">This certifies that</p>
                <h3 className="text-4xl font-bold">{institutionName}</h3>
                <p className="text-lg opacity-90">has successfully completed the IIICI assessment</p>
              </div>

              {/* Score */}
              <div className="space-y-2">
                <p className="text-lg opacity-90">with an overall score of</p>
                <div className="text-6xl font-bold">{Math.round(overallScore)}%</div>
                <Badge className="bg-white/20 text-white text-lg px-4 py-2">{certificationLevel} Level</Badge>
              </div>

              {/* Dates */}
              <div className="flex justify-between items-center pt-8 border-t border-white/20">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm opacity-90">Issued</span>
                  </div>
                  <p className="font-semibold">{issuedDate.toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <p className="text-xs opacity-75">IIICI Certified</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm opacity-90">Expires</span>
                  </div>
                  <p className="font-semibold">{expiryDate.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Certificate ID</h4>
              <p className="text-sm text-muted-foreground font-mono">
                IIICI-{new Date().getFullYear()}-{institutionName.replace(/\s+/g, "").substring(0, 4).toUpperCase()}-
                {Math.random().toString(36).substring(2, 8).toUpperCase()}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Verification</h4>
              <p className="text-sm text-muted-foreground">This certificate can be verified at verify.iiici.org</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Renewal</h4>
              <p className="text-sm text-muted-foreground">Annual renewal required to maintain certification status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
