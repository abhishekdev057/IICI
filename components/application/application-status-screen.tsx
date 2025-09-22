"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ArrowRight,
  RefreshCw,
  Mail,
  Calendar,
  User,
  Building,
} from "lucide-react";
import { toast } from "sonner";

interface ApplicationStatusScreenProps {
  application: {
    id: string;
    status: string;
    submittedAt: string;
    reviewedAt?: string;
    institutionData?: {
      name: string;
      industry: string;
      country: string;
    };
    scoreAudits?: Array<{
      overallScore: number;
      certificationLevel: string;
      calculatedAt: string;
    }>;
  };
  reviewComments?: string;
}

export function ApplicationStatusScreen({
  application,
  reviewComments,
}: ApplicationStatusScreenProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isResubmitting, setIsResubmitting] = useState(false);

  const handleResubmit = async () => {
    try {
      setIsResubmitting(true);

      // Update application status back to DRAFT for resubmission
      const response = await fetch(
        `/api/applications/enhanced/${application.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "DRAFT",
          }),
        }
      );

      if (response.ok) {
        toast.success("Application reset for resubmission");
        router.push("/application");
      } else {
        toast.error("Failed to reset application for resubmission");
      }
    } catch (error) {
      toast.error("Error resetting application");
    } finally {
      setIsResubmitting(false);
    }
  };

  const getStatusConfig = () => {
    switch (application.status) {
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return {
          icon: <Clock className="h-12 w-12 text-blue-500" />,
          title: "Application Under Review",
          description:
            "Your Innovation Assessment application is currently being reviewed by our expert panel.",
          badge: (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Under Review
            </Badge>
          ),
          color: "blue",
          showEmail: true,
          emailMessage:
            "You will receive an email notification once the review is complete.",
        };

      case "APPROVED":
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: "Application Approved! 🎉",
          description:
            "Congratulations! Your Innovation Assessment application has been approved.",
          badge: (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Approved
            </Badge>
          ),
          color: "green",
          showEmail: true,
          emailMessage:
            "You have received an email with your certification details.",
        };

      case "REJECTED":
        return {
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          title: "Application Rejected",
          description:
            "Unfortunately, your application has been rejected. Please review the feedback below.",
          badge: (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              Rejected
            </Badge>
          ),
          color: "red",
          showEmail: true,
          emailMessage: "You have received an email with detailed feedback.",
          showResubmit: true,
        };

      case "RESUBMISSION_REQUIRED":
        return {
          icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
          title: "Resubmission Required",
          description:
            "Your application requires additional information or evidence. Please review the feedback below.",
          badge: (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              Resubmission Required
            </Badge>
          ),
          color: "orange",
          showEmail: true,
          emailMessage: "You have received an email with detailed feedback.",
          showResubmit: true,
        };

      default:
        return {
          icon: <FileText className="h-12 w-12 text-gray-500" />,
          title: "Application Status",
          description: "Your application status is being processed.",
          badge: (
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
              {application.status}
            </Badge>
          ),
          color: "gray",
          showEmail: false,
          emailMessage: "",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const latestScore = application.scoreAudits?.[0];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">{statusConfig.icon}</div>
          <div>
            <h1 className="text-3xl font-bold">{statusConfig.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">
              {statusConfig.description}
            </p>
          </div>
          <div className="flex justify-center">{statusConfig.badge}</div>
        </div>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Institution</p>
                  <p className="text-sm text-muted-foreground">
                    {application.institutionData?.name || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Applicant</p>
                  <p className="text-sm text-muted-foreground">
                    {session?.user?.name || "User"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {application.reviewedAt && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Reviewed</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(application.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certification Results (for approved applications) */}
        {application.status === "APPROVED" && latestScore && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Certification Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">
                    Overall Score
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {latestScore.overallScore.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800">
                    Certification Level
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-lg px-4 py-2">
                    {latestScore.certificationLevel.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Feedback (for rejected/resubmission required) */}
        {(application.status === "REJECTED" ||
          application.status === "RESUBMISSION_REQUIRED") &&
          reviewComments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Review Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-wrap">
                    {reviewComments}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

        {/* Email Notification Info */}
        {statusConfig.showEmail && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {statusConfig.emailMessage}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {application.status === "APPROVED" && (
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex items-center"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {(application.status === "REJECTED" ||
            application.status === "RESUBMISSION_REQUIRED") &&
            statusConfig.showResubmit && (
              <Button
                onClick={handleResubmit}
                disabled={isResubmitting}
                variant="outline"
                className="flex items-center"
              >
                {isResubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resubmit Application
                  </>
                )}
              </Button>
            )}

          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>

        {/* Additional Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Application ID: {application.id}
              </p>
              <p className="text-xs text-muted-foreground">
                If you have any questions about your application status, please
                contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
