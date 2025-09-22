import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email-service'
import { NotificationType } from '@prisma/client'

interface CreateNotificationOptions {
  userId: string
  title: string
  message: string
  type: NotificationType
  sendEmail?: boolean
  emailSubject?: string
  emailHtml?: string
}

interface ApplicationStatusNotificationOptions {
  applicationId: string
  userId: string
  userName: string
  userEmail: string
  institutionName: string
  newStatus: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESUBMISSION_REQUIRED'
  reason?: string
  certificationLevel?: string
}

class NotificationService {
  async createNotification({
    userId,
    title,
    message,
    type,
    sendEmail = false,
    emailSubject,
    emailHtml
  }: CreateNotificationOptions): Promise<boolean> {
    try {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
        }
      })

      // Send email if requested
      if (sendEmail && emailSubject && emailHtml) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        })

        if (user?.email) {
          await emailService.sendEmail({
            to: user.email,
            subject: emailSubject,
            html: emailHtml
          })
        }
      }

      return true
    } catch (error) {
      console.error('Error creating notification:', error)
      return false
    }
  }

  async handleApplicationStatusChange({
    applicationId,
    userId,
    userName,
    userEmail,
    institutionName,
    newStatus,
    reason,
    certificationLevel
  }: ApplicationStatusNotificationOptions): Promise<boolean> {
    try {
      let notificationTitle = ''
      let notificationMessage = ''
      let emailSent = false

      switch (newStatus) {
        case 'UNDER_REVIEW':
          notificationTitle = 'Application Under Review'
          notificationMessage = 'Your Innovation Assessment application is now under review by our expert panel. You will receive feedback within 5-7 business days.'
          
          // Send email notification
          emailSent = await emailService.sendApplicationUnderReviewEmail(
            userEmail,
            userName,
            applicationId,
            institutionName
          )
          break

        case 'APPROVED':
          notificationTitle = 'Application Approved! 🎉'
          notificationMessage = `Congratulations! Your Innovation Assessment application has been approved. You have achieved ${certificationLevel} certification.`
          
          // Send email notification
          emailSent = await emailService.sendApplicationApprovedEmail(
            userEmail,
            userName,
            applicationId,
            certificationLevel || 'Certified',
            institutionName
          )
          break

        case 'REJECTED':
          notificationTitle = 'Application Rejected'
          notificationMessage = reason || 'Your application has been rejected. Please review the feedback and consider resubmitting.'
          
          // Send email notification
          emailSent = await emailService.sendApplicationRejectedEmail(
            userEmail,
            userName,
            applicationId,
            reason,
            institutionName,
            false // isResubmissionRequired = false for rejected
          )
          break

        case 'RESUBMISSION_REQUIRED':
          notificationTitle = 'Resubmission Required'
          notificationMessage = reason || 'Your application requires additional information or evidence. Please review the feedback and resubmit your application.'
          
          // Send email notification
          emailSent = await emailService.sendApplicationRejectedEmail(
            userEmail,
            userName,
            applicationId,
            reason,
            institutionName,
            true // isResubmissionRequired = true for resubmission
          )
          break
      }

      // Create in-app notification
      await this.createNotification({
        userId,
        title: notificationTitle,
        message: notificationMessage,
        type: newStatus === 'APPROVED' ? 'SUCCESS' : 'INFO'
      })

      // Notify admins about status changes (except for initial submission)
      if (newStatus !== 'UNDER_REVIEW') {
        await this.notifyAdminsOfStatusChange(applicationId, institutionName, newStatus, userName)
      }

      return emailSent
    } catch (error) {
      console.error('Error handling application status change:', error)
      return false
    }
  }

  async notifyAdminsOfNewApplication(applicationId: string, institutionName: string): Promise<boolean> {
    try {
      // Get all admin and super admin users
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          },
          isActive: true
        },
        select: {
          id: true,
          email: true,
          name: true
        }
      })

      if (admins.length === 0) {
        console.log('No admin users found to notify')
        return false
      }

      // Create notifications for all admins
      const notificationPromises = admins.map(admin =>
        this.createNotification({
          userId: admin.id,
          title: 'New Application Submitted',
          message: `A new Innovation Assessment application has been submitted by ${institutionName}. Please review it at your earliest convenience.`,
          type: 'INFO'
        })
      )

      await Promise.all(notificationPromises)

      // Send email to all admins
      const adminEmails = admins.map(admin => admin.email).filter(Boolean) as string[]
      if (adminEmails.length > 0) {
        await emailService.sendNewApplicationNotification(adminEmails, applicationId, institutionName)
      }

      return true
    } catch (error) {
      console.error('Error notifying admins of new application:', error)
      return false
    }
  }

  private async notifyAdminsOfStatusChange(
    applicationId: string,
    institutionName: string,
    newStatus: string,
    userName: string
  ): Promise<void> {
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          },
          isActive: true
        },
        select: { id: true }
      })

      const statusMessages = {
        'APPROVED': 'has been approved',
        'REJECTED': 'requires additional information'
      }

      const message = statusMessages[newStatus as keyof typeof statusMessages] || 'status has been updated'

      const notificationPromises = admins.map(admin =>
        this.createNotification({
          userId: admin.id,
          title: 'Application Status Updated',
          message: `Application from ${institutionName} (${userName}) ${message}.`,
          type: 'INFO'
        })
      )

      await Promise.all(notificationPromises)
    } catch (error) {
      console.error('Error notifying admins of status change:', error)
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId: userId,
          isRead: false
        }
      })
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}

export const notificationService = new NotificationService()
