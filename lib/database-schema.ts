// Database schema definitions for IIICI certification system

export interface User {
  id: string
  email: string
  instituteName: string
  industry: string
  organizationSize: string
  createdAt: Date
  updatedAt: Date
}

export interface Application {
  id: string
  userId: string
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected"
  submittedAt?: Date
  reviewedAt?: Date
  reviewedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface IndicatorResponse {
  id: string
  applicationId: string
  indicatorId: string
  pillarId: number
  rawValue: any
  normalizedScore: number
  measurementUnit: string
  hasEvidence: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Evidence {
  id: string
  indicatorResponseId: string
  type: "file" | "link"
  fileName?: string
  fileSize?: number
  fileType?: string
  url: string
  uploadedAt: Date
}

export interface ScoreAudit {
  id: string
  applicationId: string
  pillarId: number
  pillarScore: number
  overallScore: number
  certificationLevel: "Gold" | "Certified" | "Not Certified"
  calculatedAt: Date
  calculatedBy: string
  scoreData: any // JSON blob with detailed calculations
}

export interface Certification {
  id: string
  applicationId: string
  userId: string
  certificationLevel: "Gold" | "Certified" | "Not Certified"
  overallScore: number
  pillarScores: { [pillarId: number]: number }
  issuedAt: Date
  expiresAt: Date
  certificateUrl?: string
  badgeUrl?: string
}

export interface AdminReview {
  id: string
  applicationId: string
  reviewerId: string
  indicatorId?: string
  action: "approve" | "reject" | "request_evidence" | "override_score"
  comments: string
  originalScore?: number
  adjustedScore?: number
  createdAt: Date
}

// Mock database functions (would be replaced with actual database operations)
export class MockDatabase {
  static async saveApplication(application: Partial<Application>): Promise<Application> {
    // Mock implementation
    return {
      id: "app_" + Date.now(),
      userId: application.userId!,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...application,
    } as Application
  }

  static async saveIndicatorResponse(response: Partial<IndicatorResponse>): Promise<IndicatorResponse> {
    return {
      id: "ind_" + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...response,
    } as IndicatorResponse
  }

  static async saveScoreAudit(audit: Partial<ScoreAudit>): Promise<ScoreAudit> {
    return {
      id: "audit_" + Date.now(),
      calculatedAt: new Date(),
      calculatedBy: "system",
      ...audit,
    } as ScoreAudit
  }

  static async saveCertification(cert: Partial<Certification>): Promise<Certification> {
    const issuedAt = new Date()
    const expiresAt = new Date(issuedAt)
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Valid for 1 year

    return {
      id: "cert_" + Date.now(),
      issuedAt,
      expiresAt,
      ...cert,
    } as Certification
  }
}
