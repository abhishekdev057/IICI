"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Award, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
// Dynamic import for client-side only
import { useToast } from "@/components/ui/use-toast"

interface OverviewChartsProps {
  overallScore: number
  pillarScores: number[]
  certificationLevel: "Gold" | "Certified" | "Not Certified"
  issuedDate?: string
  expiryDate?: string
}

export function OverviewCharts({
  overallScore,
  pillarScores,
  certificationLevel,
  issuedDate,
  expiryDate,
}: OverviewChartsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateQuickPDF = async () => {
    setIsGenerating(true)
    
    try {
      // Dynamic import for client-side only
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      
      let yPosition = margin

      // Company Header with Logo Area
      pdf.setFillColor(15, 23, 42) // Dark blue background
      pdf.rect(0, 0, pageWidth, 40, 'F')
      
      // Company Logo Text
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.setFont("helvetica", "bold")
      pdf.text("IIICI", 20, 15)
      
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
      pdf.text("Indian Institute of Innovation & Certification", 20, 25)
      pdf.text("Innovation Excellence Assessment", 20, 32)
      
      // Report Title
      pdf.setTextColor(0, 0, 0)
      yPosition = 50
      pdf.setFontSize(24)
      pdf.setFont("helvetica", "bold")
      pdf.text("INNOVATION MATURITY ASSESSMENT REPORT", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 15

      // Certificate Badge
      pdf.setFillColor(34, 197, 94) // Green
      pdf.roundedRect(pageWidth / 2 - 30, yPosition - 5, 60, 20, 3, 3, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("CERTIFIED", pageWidth / 2, yPosition + 2, { align: "center" })
      pdf.setFontSize(10)
      pdf.text(certificationLevel.toUpperCase(), pageWidth / 2, yPosition + 8, { align: "center" })
      
      yPosition += 25
      pdf.setTextColor(0, 0, 0)

      // Organization Details Box
      pdf.setFillColor(248, 250, 252) // Light gray
      pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F')
      
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text("Assessment Information", margin + 5, yPosition + 8)
      
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.text(`Assessment Date: ${issuedDate ? new Date(issuedDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin + 5, yPosition + 16)
      pdf.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin + 5, yPosition + 22)
      
      yPosition += 35

      // Overall Score Section
      pdf.setFillColor(59, 130, 246) // Blue
      pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.text("OVERALL INNOVATION MATURITY SCORE", pageWidth / 2, yPosition + 8, { align: "center" })
      
      pdf.setFontSize(32)
      pdf.setFont("helvetica", "bold")
      pdf.text(`${overallScore.toFixed(1)}%`, pageWidth / 2, yPosition + 20, { align: "center" })
      
      yPosition += 35
      pdf.setTextColor(0, 0, 0)

      // Performance Level Indicator
      const performanceLevel = overallScore >= 85 ? "LEADING" : 
                              overallScore >= 70 ? "OPTIMIZING" : 
                              overallScore >= 60 ? "STRUCTURED" : 
                              overallScore >= 50 ? "DEVELOPING" : "INITIATING"
      
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(`Performance Level: ${performanceLevel}`, pageWidth / 2, yPosition, { align: "center" })
      yPosition += 15

      // Pillar Performance Table
      pdf.setFontSize(16)
      pdf.setFont("helvetica", "bold")
      pdf.text("PILLAR PERFORMANCE ANALYSIS", margin, yPosition)
      yPosition += 10

      // Table Header
      pdf.setFillColor(241, 245, 249)
      pdf.rect(margin, yPosition, contentWidth, 8, 'F')
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "bold")
      pdf.text("Pillar", margin + 2, yPosition + 5)
      pdf.text("Score", margin + 120, yPosition + 5)
      pdf.text("Status", margin + 150, yPosition + 5)
      pdf.text("Level", margin + 180, yPosition + 5)
      yPosition += 8

      // Table Rows
      pdf.setFont("helvetica", "normal")
      pillarScores.forEach((score, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = margin
        }

        const status = score >= 70 ? "Excellent" : score >= 50 ? "Good" : "Needs Improvement"
        const level = score >= 70 ? "Excellent" : score >= 50 ? "Good" : "Needs Improvement"
        
        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252)
          pdf.rect(margin, yPosition, contentWidth, 6, 'F')
        }
        
        pdf.setFontSize(9)
        pdf.text(pillarNames[index], margin + 2, yPosition + 4)
        pdf.text(`${score.toFixed(1)}%`, margin + 120, yPosition + 4)
        pdf.text(status, margin + 150, yPosition + 4)
        pdf.text(level, margin + 180, yPosition + 4)
        yPosition += 6
      })

      yPosition += 10

      // Company Footer with Signature
      const footerY = pageHeight - 60
      
      // Signature Section
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("Certification Authority", margin, footerY)
      
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.text("Dr. Innovation Excellence", margin, footerY + 8)
      pdf.text("Chief Innovation Officer", margin, footerY + 14)
      pdf.text("Indian Institute of Innovation & Certification", margin, footerY + 20)
      
      // Signature Line
      pdf.line(margin + 80, footerY + 25, margin + 120, footerY + 25)
      pdf.setFontSize(8)
      pdf.text("Digital Signature", margin + 95, footerY + 28)
      
      // Company Footer
      pdf.setFillColor(15, 23, 42)
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.setFont("helvetica", "normal")
      pdf.text("© 2024 Indian Institute of Innovation & Certification. All rights reserved.", pageWidth / 2, pageHeight - 8, { align: "center" })
      pdf.text("This report is confidential and proprietary to the organization.", pageWidth / 2, pageHeight - 4, { align: "center" })

      // Save the PDF with professional filename
      const fileName = `IIICI_Innovation_Assessment_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

      toast({
        title: "Professional Report Generated!",
        description: "Innovation maturity report with company standards has been downloaded.",
        variant: "default",
      })

    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error Generating Report",
        description: "There was an issue generating the PDF report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 70) return "bg-green-50"
    if (score >= 50) return "bg-yellow-50"
    return "bg-red-50"
  }

  const pillarNames = [
    "Strategic Foundation",
    "Resource Allocation",
    "Innovation Processes",
    "Knowledge & IP",
    "Strategic Intelligence",
    "Performance Measurement",
  ]

  const CircularProgress = ({ score, size = 120 }: { score: number; size?: number }) => {
    const safeScore = isNaN(score) || !isFinite(score) ? 0 : Math.max(0, Math.min(100, score))
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (safeScore / 100) * circumference



    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={safeScore >= 70 ? "text-green-600" : safeScore >= 50 ? "text-yellow-600" : "text-red-600"}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(safeScore)}`}>{Math.round(safeScore)}%</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
        </div>
      </div>
    )
  }

  const getCertificationBadge = () => {
    switch (certificationLevel) {
      case "Gold":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Award className="w-3 h-3 mr-1" />
            Gold Certified
          </Badge>
        )
      case "Certified":
        return (
          <Badge className="bg-green-500 text-white">
            <Award className="w-3 h-3 mr-1" />
            Certified
          </Badge>
        )
      default:
        return <Badge className="bg-gray-500 text-white">Not Certified</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 ${getScoreBackground(overallScore)}`} />
        <CardHeader className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold">Innovation Maturity Score</CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {getCertificationBadge()}
                {issuedDate && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Issued {new Date(issuedDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <CircularProgress score={overallScore} size={120} />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={generateQuickPDF}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Download Report"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {expiryDate && (
            <div className="text-sm text-muted-foreground">
              Certification expires on {new Date(expiryDate).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pillar Scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillarScores.map((score, index) => {
          const safeScore = isNaN(score) || !isFinite(score) ? 0 : Math.max(0, Math.min(100, score))
          const hasData = safeScore > 0
          
          return (
            <Card key={index} className={`hover:shadow-lg transition-shadow cursor-pointer ${!hasData ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Pillar {index + 1}</span>
                  <TrendingUp className={`w-4 h-4 ${getScoreColor(safeScore)}`} />
                </CardTitle>
                <div className="text-xs text-muted-foreground">{pillarNames[index]}</div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CircularProgress score={safeScore} size={80} />
                  <div className="text-center sm:text-right">
                    <div className={`text-xl font-bold ${getScoreColor(safeScore)}`}>
                      {Math.round(safeScore)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {safeScore >= 70 ? "Excellent" : safeScore >= 50 ? "Good" : hasData ? "Needs Work" : "No Data"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
