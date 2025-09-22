"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  Table,
  Share2,
  Mail,
  Copy,
  Printer,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Building2,
  Award,
  Calendar,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
// Dynamic imports for client-side only libraries

interface ExportReportsProps {
  overallScore: number;
  pillarScores: number[];
  certificationLevel: "Gold" | "Certified" | "Not Certified";
  organizationName: string;
  issuedDate?: string;
  expiryDate?: string;
}

export function ExportReports({
  overallScore,
  pillarScores,
  certificationLevel,
  organizationName,
  issuedDate,
  expiryDate,
}: ExportReportsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const pillarNames = [
    "Strategic Foundation & Leadership",
    "Resource Allocation & Infrastructure",
    "Innovation Processes & Culture",
    "Knowledge & IP Management",
    "Strategic Intelligence & Collaboration",
    "Performance Measurement & Improvement",
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 70) return "Excellent";
    if (score >= 50) return "Good";
    return "Needs Improvement";
  };

  const generatePDFReport = async (
    type: "comprehensive" | "executive" = "comprehensive"
  ) => {
    setIsGenerating(true);

    try {
      console.log("Starting PDF generation...", {
        type,
        organizationName,
        overallScore,
      });

      // Dynamic import for client-side only
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      let yPosition = margin;

      // Company Header with Logo Area
      pdf.setFillColor(15, 23, 42); // Dark blue background
      pdf.rect(0, 0, pageWidth, 40, "F");

      // Company Logo Text (placeholder for actual logo)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("IIICI", 20, 15);

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Indian Institute of Innovation & Certification", 20, 25);
      pdf.text("Innovation Excellence Assessment", 20, 32);

      // Report Title
      pdf.setTextColor(0, 0, 0);
      yPosition = 50;
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        "INNOVATION MATURITY ASSESSMENT REPORT",
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 15;

      // Certificate Badge
      pdf.setFillColor(34, 197, 94); // Green
      pdf.roundedRect(pageWidth / 2 - 30, yPosition - 5, 60, 20, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("CERTIFIED", pageWidth / 2, yPosition + 2, { align: "center" });
      pdf.setFontSize(10);
      pdf.text(certificationLevel.toUpperCase(), pageWidth / 2, yPosition + 8, {
        align: "center",
      });

      yPosition += 25;
      pdf.setTextColor(0, 0, 0);

      // Organization Details Box
      pdf.setFillColor(248, 250, 252); // Light gray
      pdf.roundedRect(margin, yPosition, contentWidth, 35, 3, 3, "F");

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Organization Information", margin + 5, yPosition + 8);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Organization: ${organizationName}`, margin + 5, yPosition + 16);
      pdf.text(
        `Assessment Date: ${
          issuedDate
            ? new Date(issuedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
        }`,
        margin + 5,
        yPosition + 22
      );
      pdf.text(
        `Report Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        margin + 5,
        yPosition + 28
      );

      yPosition += 45;

      // Overall Score Section
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        "OVERALL INNOVATION MATURITY SCORE",
        pageWidth / 2,
        yPosition + 8,
        { align: "center" }
      );

      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${overallScore.toFixed(1)}%`, pageWidth / 2, yPosition + 20, {
        align: "center",
      });

      yPosition += 35;
      pdf.setTextColor(0, 0, 0);

      // Performance Level Indicator
      const performanceLevel =
        overallScore >= 85
          ? "LEADING"
          : overallScore >= 70
          ? "OPTIMIZING"
          : overallScore >= 60
          ? "STRUCTURED"
          : overallScore >= 50
          ? "DEVELOPING"
          : "INITIATING";

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `Performance Level: ${performanceLevel}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 15;

      // Pillar Performance Table
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("PILLAR PERFORMANCE ANALYSIS", margin, yPosition);
      yPosition += 10;

      // Table Header
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, yPosition, contentWidth, 8, "F");
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Pillar", margin + 2, yPosition + 5);
      pdf.text("Score", margin + 120, yPosition + 5);
      pdf.text("Status", margin + 150, yPosition + 5);
      pdf.text("Level", margin + 180, yPosition + 5);
      yPosition += 8;

      // Table Rows
      pdf.setFont("helvetica", "normal");
      pillarScores.forEach((score, index) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        const status = getScoreStatus(score);
        const level =
          score >= 70
            ? "Excellent"
            : score >= 50
            ? "Good"
            : "Needs Improvement";

        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPosition, contentWidth, 6, "F");
        }

        pdf.setFontSize(9);
        pdf.text(pillarNames[index], margin + 2, yPosition + 4);
        pdf.text(`${score.toFixed(1)}%`, margin + 120, yPosition + 4);
        pdf.text(status, margin + 150, yPosition + 4);
        pdf.text(level, margin + 180, yPosition + 4);
        yPosition += 6;
      });

      yPosition += 10;

      // Recommendations Section
      if (type === "comprehensive") {
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("STRATEGIC RECOMMENDATIONS", margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        const recommendations = [
          "Focus on strengthening areas with scores below 70% to achieve higher certification levels",
          "Develop comprehensive action plans for continuous innovation improvement",
          "Implement industry best practices and innovation frameworks",
          "Establish regular assessment cycles for ongoing performance monitoring",
          "Invest in innovation training and capability building programs",
          "Create cross-functional innovation teams to drive organizational change",
        ];

        recommendations.forEach((rec, index) => {
          if (yPosition > pageHeight - 50) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(`${index + 1}.`, margin, yPosition);

          pdf.setFont("helvetica", "normal");
          const lines = pdf.splitTextToSize(rec, contentWidth - 10);
          pdf.text(lines, margin + 8, yPosition);
          yPosition += lines.length * 4 + 2;
        });
      }

      // Company Footer with Signature
      const footerY = pageHeight - 60;

      // Signature Section
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Certification Authority", margin, footerY);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Dr. Innovation Excellence", margin, footerY + 8);
      pdf.text("Chief Innovation Officer", margin, footerY + 14);
      pdf.text(
        "Indian Institute of Innovation & Certification",
        margin,
        footerY + 20
      );

      // Signature Line
      pdf.line(margin + 80, footerY + 25, margin + 120, footerY + 25);
      pdf.setFontSize(8);
      pdf.text("Digital Signature", margin + 95, footerY + 28);

      // Company Footer
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "© 2024 Indian Institute of Innovation & Certification. All rights reserved.",
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
      pdf.text(
        "This report is confidential and proprietary to the organization.",
        pageWidth / 2,
        pageHeight - 4,
        { align: "center" }
      );

      // Save the PDF with professional filename
      const fileName = `IIICI_Innovation_Assessment_${organizationName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.pdf`;
      console.log("Attempting to save PDF with filename:", fileName);

      try {
        pdf.save(fileName);
        console.log("PDF saved successfully");

        toast({
          title: "Professional Report Generated!",
          description: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } report with company standards has been downloaded.`,
          variant: "default",
        });
      } catch (saveError) {
        console.error("Error saving PDF:", saveError);

        // Fallback: try to open in new window
        const pdfBlob = pdf.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Professional Report Generated!",
          description: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } report with company standards has been downloaded.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error Generating Report",
        description:
          "There was an issue generating the PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      console.log("Starting CSV export...", { organizationName, overallScore });

      const csvData = [
        ["IIICI Certification Report", ""],
        ["Organization", organizationName],
        [
          "Assessment Date",
          issuedDate
            ? new Date(issuedDate).toLocaleDateString()
            : new Date().toLocaleDateString(),
        ],
        ["Certification Level", certificationLevel],
        ["Overall Score", `${overallScore.toFixed(1)}%`],
        ["", ""],
        ["Pillar", "Score", "Status", "Performance Level"],
        [
          "Overall",
          `${overallScore.toFixed(1)}%`,
          certificationLevel,
          getScoreStatus(overallScore),
        ],
        ...pillarScores.map((score, index) => [
          pillarNames[index],
          `${score.toFixed(1)}%`,
          getScoreStatus(score),
          score >= 70
            ? "Excellent"
            : score >= 50
            ? "Good"
            : "Needs Improvement",
        ]),
      ];

      const csvContent = csvData
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      const fileName = `IIICI_Scores_${organizationName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.csv`;
      console.log("Attempting to download CSV with filename:", fileName);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      console.log("CSV exported successfully");
      toast({
        title: "CSV Exported Successfully!",
        description: "Your data has been exported to CSV format.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export Error",
        description:
          "There was an issue exporting the CSV file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);

    try {
      // Use exceljs instead of xlsx to avoid self reference issues
      const ExcelJS = await import("exceljs");

      console.log("Starting Excel export...", {
        organizationName,
        overallScore,
      });

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();

      // Sheet 1: Executive Summary
      const executiveSummaryData = [
        ["INDIAN INSTITUTE OF INNOVATION & CERTIFICATION"],
        ["INNOVATION MATURITY ASSESSMENT REPORT"],
        [""],
        ["Organization Information"],
        ["Organization Name", organizationName],
        [
          "Assessment Date",
          issuedDate
            ? new Date(issuedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
        ],
        [
          "Report Generated",
          new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        ],
        ["Certification Level", certificationLevel],
        [""],
        ["Overall Performance"],
        ["Overall Innovation Maturity Score", `${overallScore.toFixed(1)}%`],
        [
          "Performance Level",
          overallScore >= 85
            ? "LEADING"
            : overallScore >= 70
            ? "OPTIMIZING"
            : overallScore >= 60
            ? "STRUCTURED"
            : overallScore >= 50
            ? "DEVELOPING"
            : "INITIATING",
        ],
        [""],
        ["Assessment Summary"],
        ["Total Pillars Assessed", "6"],
        [
          "Strong Pillars (≥70%)",
          pillarScores.filter((score) => score >= 70).length.toString(),
        ],
        [
          "Areas for Improvement",
          pillarScores.filter((score) => score < 70).length.toString(),
        ],
        [""],
        ["Certification Authority"],
        ["Name", "Dr. Innovation Excellence"],
        ["Title", "Chief Innovation Officer"],
        ["Organization", "Indian Institute of Innovation & Certification"],
        ["Signature", "Digitally Signed"],
        [""],
        [
          "© 2024 Indian Institute of Innovation & Certification. All rights reserved.",
        ],
        ["This report is confidential and proprietary to the organization."],
      ];

      const executiveSheet = workbook.addWorksheet("Executive Summary");

      // Add data to the sheet
      executiveSummaryData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellRef = executiveSheet.getCell(rowIndex + 1, colIndex + 1);
          cellRef.value = cell;

          // Style header rows
          if (rowIndex === 0 || rowIndex === 1) {
            cellRef.font = { bold: true, size: 14 };
            cellRef.alignment = { horizontal: "center" };
          }
        });
      });

      // Set column widths
      executiveSheet.getColumn(1).width = 30;
      executiveSheet.getColumn(2).width = 25;

      // Sheet 2: Detailed Pillar Analysis
      const pillarAnalysisData = [
        ["PILLAR PERFORMANCE ANALYSIS"],
        [""],
        [
          "Pillar",
          "Score (%)",
          "Status",
          "Performance Level",
          "Recommendations",
        ],
        ...pillarScores.map((score, index) => {
          const status = getScoreStatus(score);
          const level =
            score >= 70
              ? "Excellent"
              : score >= 50
              ? "Good"
              : "Needs Improvement";
          const recommendations =
            score >= 70
              ? "Maintain excellence and share best practices"
              : score >= 50
              ? "Focus on strengthening weak areas"
              : "Requires immediate attention and improvement plan";

          return [
            pillarNames[index],
            score.toFixed(1),
            status,
            level,
            recommendations,
          ];
        }),
        [""],
        ["Overall Assessment"],
        [
          "Average Score",
          (
            pillarScores.reduce((a, b) => a + b, 0) / pillarScores.length
          ).toFixed(1) + "%",
        ],
        [
          "Highest Performing Pillar",
          pillarNames[pillarScores.indexOf(Math.max(...pillarScores))],
        ],
        [
          "Lowest Performing Pillar",
          pillarNames[pillarScores.indexOf(Math.min(...pillarScores))],
        ],
        [
          "Score Range",
          `${Math.min(...pillarScores).toFixed(1)}% - ${Math.max(
            ...pillarScores
          ).toFixed(1)}%`,
        ],
      ];

      const pillarSheet = workbook.addWorksheet("Pillar Analysis");

      // Add data to the sheet
      pillarAnalysisData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellRef = pillarSheet.getCell(rowIndex + 1, colIndex + 1);
          cellRef.value = cell;

          // Style header rows
          if (rowIndex === 0) {
            cellRef.font = { bold: true, size: 14 };
            cellRef.alignment = { horizontal: "center" };
          }
        });
      });

      // Set column widths
      pillarSheet.getColumn(1).width = 40;
      pillarSheet.getColumn(2).width = 12;
      pillarSheet.getColumn(3).width = 15;
      pillarSheet.getColumn(4).width = 18;
      pillarSheet.getColumn(5).width = 50;

      // Sheet 3: Strategic Recommendations
      const recommendationsData = [
        ["STRATEGIC RECOMMENDATIONS"],
        [""],
        ["Priority", "Recommendation", "Expected Impact", "Timeline"],
        [
          "High",
          "Focus on strengthening areas with scores below 70%",
          "Significant improvement in overall score",
          "3-6 months",
        ],
        [
          "High",
          "Develop comprehensive action plans for continuous improvement",
          "Sustainable innovation culture",
          "6-12 months",
        ],
        [
          "Medium",
          "Implement industry best practices and frameworks",
          "Enhanced innovation processes",
          "3-9 months",
        ],
        [
          "Medium",
          "Establish regular assessment cycles",
          "Ongoing performance monitoring",
          "1-3 months",
        ],
        [
          "Medium",
          "Invest in innovation training programs",
          "Improved innovation capabilities",
          "6-12 months",
        ],
        [
          "Low",
          "Create cross-functional innovation teams",
          "Better collaboration and knowledge sharing",
          "3-6 months",
        ],
        [""],
        ["Implementation Guidelines"],
        ["1. Prioritize recommendations based on current performance gaps"],
        [
          "2. Assign dedicated resources and budget for improvement initiatives",
        ],
        ["3. Establish clear metrics and KPIs for measuring progress"],
        ["4. Conduct regular reviews and adjustments to the improvement plan"],
        ["5. Engage leadership and stakeholders in the innovation journey"],
        [""],
        ["Next Steps"],
        ["• Schedule follow-up assessment in 6 months"],
        ["• Develop detailed implementation roadmap"],
        ["• Assign innovation champions for each pillar"],
        ["• Establish innovation governance structure"],
        ["• Create communication plan for stakeholders"],
      ];

      const recommendationsSheet = workbook.addWorksheet("Recommendations");

      // Add data to the sheet
      recommendationsData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellRef = recommendationsSheet.getCell(
            rowIndex + 1,
            colIndex + 1
          );
          cellRef.value = cell;

          // Style header rows
          if (rowIndex === 0) {
            cellRef.font = { bold: true, size: 14 };
            cellRef.alignment = { horizontal: "center" };
          }
        });
      });

      // Set column widths
      recommendationsSheet.getColumn(1).width = 12;
      recommendationsSheet.getColumn(2).width = 50;
      recommendationsSheet.getColumn(3).width = 30;
      recommendationsSheet.getColumn(4).width = 15;

      // Sheet 4: Raw Data
      const rawData = [
        ["RAW ASSESSMENT DATA"],
        [""],
        ["Organization", organizationName],
        [
          "Assessment Date",
          issuedDate
            ? new Date(issuedDate).toISOString()
            : new Date().toISOString(),
        ],
        ["Overall Score", overallScore],
        ["Certification Level", certificationLevel],
        [""],
        ["Pillar Scores"],
        ["Pillar ID", "Pillar Name", "Score", "Percentage"],
        ...pillarScores.map((score, index) => [
          index + 1,
          pillarNames[index],
          score,
          `${score.toFixed(1)}%`,
        ]),
        [""],
        ["Metadata"],
        ["Report Version", "1.0"],
        ["Generated By", "IIICI Certification System"],
        ["Generated On", new Date().toISOString()],
        ["Report ID", `IIICI-${Date.now()}`],
      ];

      const rawDataSheet = workbook.addWorksheet("Raw Data");

      // Add data to the sheet
      rawData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellRef = rawDataSheet.getCell(rowIndex + 1, colIndex + 1);
          cellRef.value = cell;

          // Style header rows
          if (rowIndex === 0) {
            cellRef.font = { bold: true, size: 14 };
            cellRef.alignment = { horizontal: "center" };
          }
        });
      });

      // Set column widths
      rawDataSheet.getColumn(1).width = 12;
      rawDataSheet.getColumn(2).width = 40;
      rawDataSheet.getColumn(3).width = 12;
      rawDataSheet.getColumn(4).width = 15;

      // Generate Excel file
      const fileName = `IIICI_Innovation_Assessment_${organizationName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.xlsx`;
      console.log("Attempting to download Excel with filename:", fileName);

      // Generate Excel file buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Create blob and download
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Excel exported successfully");
      toast({
        title: "Professional Excel Report Generated!",
        description:
          "Your comprehensive assessment data has been exported with professional formatting.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        title: "Export Error",
        description:
          "There was an issue exporting the Excel file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const shareResults = async (
    method: "native" | "email" | "clipboard" = "native"
  ) => {
    setIsSharing(true);

    try {
      const shareText = `${organizationName} achieved ${certificationLevel} certification with ${overallScore.toFixed(
        1
      )}% overall score in IIICI Innovation Assessment.`;
      const shareUrl = window.location.href;

      switch (method) {
        case "native":
          if (navigator.share) {
            await navigator.share({
              title: "IIICI Certification Results",
              text: shareText,
              url: shareUrl,
            });
          } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(
              `${shareText}\n\nView full report: ${shareUrl}`
            );
            toast({
              title: "Results Copied!",
              description: "Results have been copied to your clipboard.",
              variant: "default",
            });
          }
          break;

        case "email":
          const emailSubject = encodeURIComponent(
            "IIICI Certification Results"
          );
          const emailBody = encodeURIComponent(
            `${shareText}\n\nView full report: ${shareUrl}`
          );
          window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
          break;

        case "clipboard":
          await navigator.clipboard.writeText(
            `${shareText}\n\nView full report: ${shareUrl}`
          );
          toast({
            title: "Results Copied!",
            description: "Results have been copied to your clipboard.",
            variant: "default",
          });
          break;
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Sharing Error",
        description:
          "There was an issue sharing the results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const performanceLevel =
        overallScore >= 85
          ? "LEADING"
          : overallScore >= 70
          ? "OPTIMIZING"
          : overallScore >= 60
          ? "STRUCTURED"
          : overallScore >= 50
          ? "DEVELOPING"
          : "INITIATING";

      printWindow.document.write(`
        <html>
          <head>
            <title>IIICI Innovation Assessment Report - ${organizationName}</title>
            <style>
              @page {
                margin: 0.5in;
                size: A4;
              }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px;
                color: #1f2937;
                line-height: 1.6;
              }
              .company-header {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: white;
                padding: 20px;
                margin: -20px -20px 30px -20px;
                text-align: center;
              }
              .company-logo {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .company-subtitle {
                font-size: 14px;
                opacity: 0.9;
              }
              .report-title {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                color: #1f2937;
                margin: 30px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .certificate-badge {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                text-align: center;
                margin: 20px auto;
                width: fit-content;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .cert-badge-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .cert-badge-level {
                font-size: 14px;
                opacity: 0.9;
              }
              .org-info {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .org-info h3 {
                margin-top: 0;
                color: #1e293b;
                font-size: 18px;
              }
              .org-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 15px;
              }
              .org-detail {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid #e2e8f0;
              }
              .org-detail:last-child {
                border-bottom: none;
              }
              .score-section {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                margin: 30px 0;
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
              }
              .score-number {
                font-size: 48px;
                font-weight: bold;
                margin: 10px 0;
              }
              .score-label {
                font-size: 18px;
                margin-bottom: 10px;
              }
              .performance-level {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 500;
              }
              .pillars-section {
                margin: 30px 0;
              }
              .pillars-title {
                font-size: 20px;
                font-weight: bold;
                color: #1e293b;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .pillar {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                margin: 10px 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                transition: all 0.2s ease;
              }
              .pillar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
              }
              .pillar-name {
                font-weight: bold;
                color: #1e293b;
                font-size: 16px;
              }
              .pillar-score {
                font-size: 18px;
                font-weight: bold;
              }
              .pillar-status {
                font-size: 14px;
                color: #6b7280;
                margin-top: 5px;
              }
              .excellent { color: #059669; }
              .good { color: #d97706; }
              .needs-improvement { color: #dc2626; }
              .recommendations {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 20px;
                margin: 30px 0;
                border-radius: 0 8px 8px 0;
              }
              .recommendations h3 {
                margin-top: 0;
                color: #92400e;
                font-size: 18px;
              }
              .recommendations ul {
                margin: 10px 0;
                padding-left: 20px;
              }
              .recommendations li {
                margin: 8px 0;
                color: #78350f;
              }
              .signature-section {
                margin: 40px 0;
                padding: 20px;
                border-top: 2px solid #e2e8f0;
              }
              .signature-title {
                font-size: 16px;
                font-weight: bold;
                color: #1e293b;
                margin-bottom: 15px;
              }
              .signature-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
              }
              .signature-info {
                font-size: 14px;
                line-height: 1.8;
              }
              .signature-line {
                border-bottom: 1px solid #374151;
                width: 200px;
                margin: 20px 0 5px 0;
              }
              .footer {
                background: #0f172a;
                color: white;
                padding: 15px;
                margin: 30px -20px -20px -20px;
                text-align: center;
                font-size: 12px;
              }
              .footer p {
                margin: 5px 0;
                opacity: 0.8;
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .company-header, .footer { margin: -15px; }
                .score-section { box-shadow: none; }
                .pillar { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="company-header">
              <div class="company-logo">IIICI</div>
              <div class="company-subtitle">Indian Institute of Innovation & Certification</div>
              <div class="company-subtitle">Innovation Excellence Assessment</div>
            </div>
            
            <div class="report-title">Innovation Maturity Assessment Report</div>
            
            <div class="certificate-badge">
              <div class="cert-badge-title">CERTIFIED</div>
              <div class="cert-badge-level">${certificationLevel.toUpperCase()}</div>
            </div>
            
            <div class="org-info">
              <h3>Organization Information</h3>
              <div class="org-details">
                <div class="org-detail">
                  <span><strong>Organization:</strong></span>
                  <span>${organizationName}</span>
                </div>
                <div class="org-detail">
                  <span><strong>Assessment Date:</strong></span>
                  <span>${
                    issuedDate
                      ? new Date(issuedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                  }</span>
                </div>
                <div class="org-detail">
                  <span><strong>Report Generated:</strong></span>
                  <span>${new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>
                <div class="org-detail">
                  <span><strong>Certification Level:</strong></span>
                  <span>${certificationLevel}</span>
                </div>
              </div>
            </div>
            
            <div class="score-section">
              <div class="score-label">Overall Innovation Maturity Score</div>
              <div class="score-number">${overallScore.toFixed(1)}%</div>
              <div class="performance-level">Performance Level: ${performanceLevel}</div>
            </div>
            
            <div class="pillars-section">
              <div class="pillars-title">Pillar Performance Analysis</div>
              ${pillarScores
                .map((score, index) => {
                  const statusClass =
                    score >= 70
                      ? "excellent"
                      : score >= 50
                      ? "good"
                      : "needs-improvement";
                  return `
                  <div class="pillar">
                    <div class="pillar-header">
                      <div class="pillar-name">${pillarNames[index]}</div>
                      <div class="pillar-score ${statusClass}">${score.toFixed(
                    1
                  )}%</div>
                    </div>
                    <div class="pillar-status">Status: ${getScoreStatus(
                      score
                    )} | Level: ${
                    score >= 70
                      ? "Excellent"
                      : score >= 50
                      ? "Good"
                      : "Needs Improvement"
                  }</div>
                  </div>
                `;
                })
                .join("")}
            </div>
            
            <div class="recommendations">
              <h3>Strategic Recommendations</h3>
              <ul>
                <li>Focus on strengthening areas with scores below 70% to achieve higher certification levels</li>
                <li>Develop comprehensive action plans for continuous innovation improvement</li>
                <li>Implement industry best practices and innovation frameworks</li>
                <li>Establish regular assessment cycles for ongoing performance monitoring</li>
                <li>Invest in innovation training and capability building programs</li>
                <li>Create cross-functional innovation teams to drive organizational change</li>
              </ul>
            </div>
            
            <div class="signature-section">
              <div class="signature-title">Certification Authority</div>
              <div class="signature-details">
                <div class="signature-info">
                  <strong>Name:</strong> Dr. Innovation Excellence<br>
                  <strong>Title:</strong> Chief Innovation Officer<br>
                  <strong>Organization:</strong> Indian Institute of Innovation & Certification<br>
                  <div class="signature-line"></div>
                  <em>Digital Signature</em>
                </div>
                <div class="signature-info">
                  <strong>Assessment ID:</strong> IIICI-${Date.now()}<br>
                  <strong>Report Version:</strong> 1.0<br>
                  <strong>Valid Until:</strong> ${
                    expiryDate
                      ? new Date(expiryDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"
                  }<br>
                  <strong>Next Assessment:</strong> Recommended in 6 months
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2024 Indian Institute of Innovation & Certification. All rights reserved.</p>
              <p>This report is confidential and proprietary to the organization.</p>
              <p>Generated by IIICI Certification System on ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {overallScore.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <Badge
                className={
                  certificationLevel === "Gold"
                    ? "bg-yellow-500 text-white"
                    : certificationLevel === "Certified"
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }
              >
                {certificationLevel}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pillarScores.filter((score) => score >= 70).length}/6
              </div>
              <div className="text-xs text-muted-foreground">
                Strong Pillars
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {issuedDate
                  ? new Date(issuedDate).getFullYear()
                  : new Date().getFullYear()}
              </div>
              <div className="text-xs text-muted-foreground">
                Assessment Year
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export & Share Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* PDF Reports */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Professional PDF Reports
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => generatePDFReport("comprehensive")}
                  disabled={isGenerating}
                  className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating..." : "Comprehensive Report"}
                </Button>
                <Button
                  onClick={() => generatePDFReport("executive")}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex-1 min-w-[200px] border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Executive Summary
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Professional reports with company branding, signatures, and
                detailed analysis
              </p>
            </div>

            {/* Data Export */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Table className="w-4 h-4" />
                Professional Data Export
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={exportToCSV}
                  disabled={isExporting}
                  variant="outline"
                  className="flex-1 min-w-[150px] border-green-200 text-green-700 hover:bg-green-50 hover:text-green-700"
                >
                  <Table className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export CSV"}
                </Button>
                <Button
                  onClick={exportToExcel}
                  disabled={isExporting}
                  className="flex-1 min-w-[150px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:text-white"
                >
                  <Table className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export Excel"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Multi-sheet Excel reports with professional formatting and
                comprehensive data analysis
              </p>
            </div>

            {/* Sharing Options */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Results
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  onClick={() => shareResults("native")}
                  disabled={isSharing}
                  variant="outline"
                  className="min-w-[120px]"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isSharing ? "Sharing..." : "Share"}
                </Button>
                <Button
                  onClick={() => shareResults("email")}
                  disabled={isSharing}
                  variant="outline"
                  className="min-w-[120px]"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  onClick={() => shareResults("clipboard")}
                  disabled={isSharing}
                  variant="outline"
                  className="min-w-[120px]"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={printReport}
                  variant="outline"
                  className="min-w-[120px]"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>Available Report Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">
                    Professional Comprehensive Report
                  </div>
                  <div className="text-sm text-blue-700">
                    Company-branded PDF with signatures, detailed analysis, and
                    strategic recommendations
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => generatePDFReport("comprehensive")}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">
                    Executive Summary Report
                  </div>
                  <div className="text-sm text-green-700">
                    High-level overview with company branding for leadership and
                    stakeholders
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generatePDFReport("executive")}
                disabled={isGenerating}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-start gap-3">
                <Table className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-900">
                    Multi-Sheet Excel Report
                  </div>
                  <div className="text-sm text-purple-700">
                    Professional Excel workbook with 4 comprehensive sheets and
                    detailed analysis
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={exportToExcel}
                disabled={isExporting}
                className="bg-purple-600 hover:bg-purple-700 text-white hover:text-white"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-900">
                    Print-Ready Report
                  </div>
                  <div className="text-sm text-orange-700">
                    Professional print layout with company branding and
                    signature section
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={printReport}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Printer className="w-3 h-3 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={reportRef} className="border rounded-lg p-6 bg-white">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                IIICI Certification Report
              </h2>
              <p className="text-muted-foreground">{organizationName}</p>
              <p className="text-sm text-muted-foreground">
                Assessment Date:{" "}
                {issuedDate
                  ? new Date(issuedDate).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-primary mb-2">
                {overallScore.toFixed(1)}%
              </div>
              <div className="text-lg font-medium">
                Overall Innovation Maturity Score
              </div>
              <Badge className="mt-2 text-sm">{certificationLevel}</Badge>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Pillar Performance Analysis</h3>
              {pillarScores.map((score, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <span className="font-medium">{pillarNames[index]}</span>
                  <div className="text-right">
                    <span className={`font-bold ${getScoreColor(score)}`}>
                      {score.toFixed(1)}%
                    </span>
                    <div className="text-sm text-muted-foreground">
                      {getScoreStatus(score)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Generated by IIICI Certification System
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
