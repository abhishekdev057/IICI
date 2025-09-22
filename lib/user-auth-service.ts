import { prisma } from '@/lib/prisma'
import { emailService } from './email-service'
import { UserRole } from '@prisma/client'

interface UserAuthEvent {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
  isNewUser: boolean
  loginTime?: Date
}

class UserAuthService {
  /**
   * Handle user authentication events (login/signup)
   */
  async handleUserAuth(event: UserAuthEvent): Promise<void> {
    try {
      const { user, isNewUser, loginTime } = event

      // Send welcome email based on user type and status
      await this.sendWelcomeEmail(user, isNewUser)

      // Log authentication event
      await this.logAuthEvent(user.id, isNewUser ? 'SIGNUP' : 'LOGIN', loginTime)

      console.log(`✅ User auth handled: ${user.email} (${isNewUser ? 'new' : 'existing'} ${user.role})`)
    } catch (error) {
      console.error('❌ Error handling user auth:', error)
      // Don't throw error to avoid breaking authentication flow
    }
  }

  /**
   * Send welcome email to user
   */
  private async sendWelcomeEmail(user: UserAuthEvent['user'], isNewUser: boolean): Promise<void> {
    try {
      const emailSent = await emailService.sendWelcomeEmail(
        user.email,
        user.name,
        user.role,
        isNewUser
      )

      if (emailSent) {
        console.log(`✅ Welcome email sent to ${user.email}`)
      } else {
        console.error(`❌ Failed to send welcome email to ${user.email}`)
      }
    } catch (error) {
      console.error(`❌ Error sending welcome email to ${user.email}:`, error)
    }
  }

  /**
   * Log authentication events for analytics
   */
  private async logAuthEvent(userId: string, eventType: 'SIGNUP' | 'LOGIN', timestamp?: Date): Promise<void> {
    try {
      // You can extend this to log to a separate analytics table if needed
      console.log(`📊 Auth event: ${eventType} for user ${userId} at ${timestamp || new Date()}`)
      
      // For now, we'll just log to console. In the future, you could:
      // - Store in a separate analytics table
      // - Send to external analytics service
      // - Update user last login timestamp
    } catch (error) {
      console.error('❌ Error logging auth event:', error)
    }
  }

  /**
   * Check if user is new (first time login)
   */
  async isNewUser(userId: string): Promise<boolean> {
    try {
      // Check if user has any applications or activity
      const [applicationCount, notificationCount] = await Promise.all([
        prisma.application.count({ where: { userId } }),
        prisma.notification.count({ where: { userId } })
      ])

      // Consider user new if they have no applications and no notifications
      return applicationCount === 0 && notificationCount === 0
    } catch (error) {
      console.error('❌ Error checking if user is new:', error)
      return false // Default to existing user if error
    }
  }

  /**
   * Get user role display name
   */
  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Administrator'
      case 'ADMIN':
        return 'Administrator'
      case 'USER':
        return 'User'
      default:
        return 'User'
    }
  }
}

export const userAuthService = new UserAuthService()
