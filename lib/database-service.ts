import { prisma } from './prisma'
import { ScoringEngine, type OverallScore } from './scoring-engine'
import type { 
  User, 
  Application, 
  InstitutionData, 
  IndicatorResponse, 
  Evidence,
  ScoreAudit,
  Certification,
  AdminReview 
} from '@prisma/client'

export class DatabaseService {
  // User Management
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        institutionData: true,
        applications: {
          include: {
            institutionData: true,
            indicatorResponses: true,
            evidence: true,
            scoreAudits: true,
            certifications: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        institutionData: true,
        applications: {
          include: {
            institutionData: true,
            indicatorResponses: true,
            evidence: true,
            scoreAudits: true,
            certifications: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async updateUserRole(userId: string, role: 'USER' | 'ADMIN' | 'SUPER_ADMIN') {
    return await prisma.user.update({
      where: { id: userId },
      data: { role }
    })
  }

  // Institution Data Management
  static async createInstitutionData(userId: string, data: Partial<InstitutionData>) {
    return await prisma.institutionData.create({
      data: {
        userId,
        ...data
      } as any
    })
  }

  static async updateInstitutionData(userId: string, data: Partial<InstitutionData>) {
    return await prisma.institutionData.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      } as any
    })
  }

  // Application Management
  static async createApplication(userId: string, institutionId: string) {
    return await prisma.application.create({
      data: {
        userId,
        institutionId,
        status: 'DRAFT'
      },
      include: {
        institutionData: true,
        indicatorResponses: true,
        evidence: true
      }
    })
  }

  static async getApplicationById(id: string) {
    return await prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        institutionData: true,
        indicatorResponses: {
          include: {
            evidence: true
          }
        },
        evidence: true,
        scoreAudits: {
          orderBy: { calculatedAt: 'desc' }
        },
        certifications: {
          orderBy: { issuedAt: 'desc' }
        },
        adminReviews: {
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async getUserApplications(userId: string) {
    return await prisma.application.findMany({
      where: { userId },
      include: {
        institutionData: true,
        indicatorResponses: true,
        evidence: true,
        scoreAudits: {
          orderBy: { calculatedAt: 'desc' }
        },
        certifications: {
          orderBy: { issuedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async updateApplicationStatus(id: string, status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED') {
    // First check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id }
    })
    
    if (!existingApplication) {
      throw new Error(`Application with id ${id} not found`)
    }
    
    return await prisma.application.update({
      where: { id },
      data: { 
        status,
        submittedAt: status === 'SUBMITTED' ? new Date() : undefined,
        reviewedAt: status === 'APPROVED' || status === 'REJECTED' ? new Date() : undefined
      }
    })
  }

  // Indicator Responses Management
  static async saveIndicatorResponse(applicationId: string, indicatorId: string, pillarId: number, rawValue: any, measurementUnit: string) {
    // Handle null/undefined values
    const safeRawValue = rawValue || null;
    const safeMeasurementUnit = measurementUnit || "percentage";
    const normalizedScore = ScoringEngine.normalizeIndicatorScore(safeRawValue, safeMeasurementUnit)
    
    return await prisma.indicatorResponse.upsert({
      where: {
        applicationId_indicatorId: {
          applicationId,
          indicatorId
        }
      },
      update: {
        rawValue: safeRawValue,
        normalizedScore,
        measurementUnit: safeMeasurementUnit,
        hasEvidence: false // Will be updated when evidence is added
      },
      create: {
        applicationId,
        indicatorId,
        pillarId,
        rawValue: safeRawValue,
        normalizedScore,
        measurementUnit: safeMeasurementUnit,
        hasEvidence: false
      }
    })
  }

  static async updateIndicatorEvidence(applicationId: string, indicatorId: string, hasEvidence: boolean) {
    return await prisma.indicatorResponse.update({
      where: {
        applicationId_indicatorId: {
          applicationId,
          indicatorId
        }
      },
      data: { hasEvidence }
    })
  }

  // Evidence Management
  static async addEvidence(indicatorResponseId: string, applicationId: string, evidenceData: {
    type: 'FILE' | 'LINK'
    fileName?: string
    fileSize?: number
    fileType?: string
    url: string
    description?: string
  }) {
    const evidence = await prisma.evidence.create({
      data: {
        indicatorResponseId,
        applicationId,
        ...evidenceData
      }
    })

    // Update indicator response to mark as having evidence
    await this.updateIndicatorEvidence(applicationId, evidenceData.url, true)

    return evidence
  }

  // Scoring and Certification
  static async calculateAndSaveScores(applicationId: string, userId: string) {
    const application = await this.getApplicationById(applicationId)
    if (!application) throw new Error('Application not found')

    // Use application userId if userId parameter is undefined
    const calculatedBy = userId || application.userId

    // Convert indicator responses to form data format
    const formData: any = {}
    application.indicatorResponses.forEach(response => {
      const pillarKey = `pillar_${response.pillarId}`
      if (!formData[pillarKey]) formData[pillarKey] = {}
      formData[pillarKey][response.indicatorId] = response.rawValue
    })

    // Calculate scores using scoring engine
    const scores = ScoringEngine.processFormData(formData)

    // Convert certification level to database enum format
    const certificationLevel = (scores.certificationLevel as any) === 'Not Certified' ? 'NOT_CERTIFIED' : 
                              (scores.certificationLevel as any) === 'Certified' ? 'CERTIFIED' : 
                              (scores.certificationLevel as any) === 'Gold' ? 'GOLD' : 'NOT_CERTIFIED'

    // Save score audit
    const scoreAudit = await prisma.scoreAudit.create({
      data: {
        applicationId,
        userId: calculatedBy,
        pillarId: 1, // Overall score
        pillarScore: scores.overallScore,
        overallScore: scores.overallScore,
        certificationLevel: certificationLevel,
        calculatedBy: calculatedBy,
        scoreData: scores as any
      }
    })

    // Create or update certification if score is sufficient
    if (certificationLevel !== 'NOT_CERTIFIED') {
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Valid for 1 year

             await prisma.certification.upsert({
         where: {
           applicationId
         },
         update: {
           certificationLevel: certificationLevel,
           overallScore: scores.overallScore,
           pillarScores: scores.pillars.reduce((acc, pillar) => {
             acc[pillar.id] = pillar.averageScore
             return acc
           }, {} as any),
           isActive: true
         },
                 create: {
          applicationId,
          userId: calculatedBy,
          certificationLevel: certificationLevel,
          overallScore: scores.overallScore,
          pillarScores: scores.pillars.reduce((acc, pillar) => {
            acc[pillar.id] = pillar.averageScore
            return acc
          }, {} as any),
          expiresAt,
          certificateUrl: null,
          badgeUrl: null
        }
       })
    }

    return { scores, scoreAudit }
  }

  // Admin Functions
  static async getAllApplications(status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED') {
    return await prisma.application.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        institutionData: true,
        scoreAudits: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        certifications: {
          orderBy: { issuedAt: 'desc' },
          take: 1
        },
        adminReviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async addAdminReview(reviewData: {
    applicationId: string
    reviewerId: string
    indicatorId?: string
    action: 'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | 'OVERRIDE_SCORE'
    comments: string
    originalScore?: number
    adjustedScore?: number
  }) {
    return await prisma.adminReview.create({
      data: reviewData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  // Analytics and Reporting
  static async getCertificationStats() {
    const totalApplications = await prisma.application.count()
    const submittedApplications = await prisma.application.count({
      where: { status: 'SUBMITTED' }
    })
    const approvedApplications = await prisma.application.count({
      where: { status: 'APPROVED' }
    })
    const totalCertifications = await prisma.certification.count({
      where: { isActive: true }
    })

    const certificationLevels = await prisma.certification.groupBy({
      by: ['certificationLevel'],
      where: { isActive: true },
      _count: {
        certificationLevel: true
      }
    })

    return {
      totalApplications,
      submittedApplications,
      approvedApplications,
      totalCertifications,
      certificationLevels
    }
  }

  static async getRecentActivity(limit = 10) {
    return await prisma.application.findMany({
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        institutionData: {
          select: {
            name: true
          }
        },
        scoreAudits: {
          orderBy: { calculatedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
  }
}
