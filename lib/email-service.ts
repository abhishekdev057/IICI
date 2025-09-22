import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null

  constructor() {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP credentials not configured. Email functionality will be disabled.')
      this.transporter = null
      return
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
    try {
      // Check if transporter is configured
      if (!this.transporter) {
        console.warn('⚠️ Email transporter not configured. Skipping email send.')
        return false
      }

      const mailOptions = {
        from: `"IIICI Innovation Assessment" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('✅ Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('❌ Email sending failed:', error)
      return false
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  // Enhanced HTML template with modern UI design
  getHtmlTemplate(
    title: string,
    content: string,
    ctaText?: string,
    ctaLink?: string,
    userRole?: string
  ): string {
    const roleColor = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ? '#dc2626' : '#2563eb';
    const roleBadge = userRole ? `
      <div style="display: inline-block; background-color: ${roleColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px;">
        ${userRole.replace('_', ' ')}
      </div>
    ` : '';

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header with gradient -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
          <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">IIICI</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Innovation Assessment Platform</p>
          </div>
          <h2 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">${title}</h2>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
          ${roleBadge}
          <div style="color: #374151; font-size: 16px;">
            ${content}
          </div>
          ${ctaLink && ctaText ? `
            <div style="text-align: center; margin-top: 32px;">
              <a href="${ctaLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); transition: all 0.2s;">
                ${ctaText}
              </a>
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
            &copy; ${new Date().getFullYear()} IIICI. All rights reserved.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This email was sent from our secure platform. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  }

  // User authentication emails
  async sendWelcomeEmail(userEmail: string, userName: string, userRole: string, isNewUser: boolean = true): Promise<boolean> {
    const subject = isNewUser 
      ? 'Welcome to IIICI Innovation Assessment Platform! 🎉'
      : 'Welcome back to IIICI Innovation Assessment Platform! 👋'
    
    const welcomeMessage = isNewUser 
      ? `Welcome to the IIICI Innovation Assessment Platform! We're excited to have you join our community of innovative organizations.`
      : `Welcome back to the IIICI Innovation Assessment Platform! We're glad to see you again.`
    
    const roleSpecificContent = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' 
      ? `
        <p>As an <strong>${userRole.replace('_', ' ')}</strong>, you have access to:</p>
        <ul style="margin: 16px 0; padding-left: 20px;">
          <li>Review and manage applications</li>
          <li>Access admin dashboard and analytics</li>
          <li>Manage user accounts and permissions</li>
          <li>Generate reports and insights</li>
        </ul>
      `
      : `
        <p>As a <strong>${userRole.replace('_', ' ')}</strong>, you can:</p>
        <ul style="margin: 16px 0; padding-left: 20px;">
          <li>Complete your innovation assessment</li>
          <li>Track your application progress</li>
          <li>View your certification results</li>
          <li>Access detailed reports and recommendations</li>
        </ul>
      `

    const content = `
      <p>Dear ${userName},</p>
      
      <p>${welcomeMessage}</p>
      
      ${roleSpecificContent}
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">Getting Started</h3>
        <p style="margin: 0; color: #1e40af;">${isNewUser ? 'Complete your profile and start your innovation assessment journey.' : 'Check your dashboard for the latest updates and continue your assessment.'}</p>
      </div>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The IIICI Team</p>
    `

    const dashboardLink = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' 
      ? `${process.env.NEXTAUTH_URL}/admin`
      : `${process.env.NEXTAUTH_URL}/dashboard`

    const ctaText = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' 
      ? 'Go to Admin Dashboard'
      : isNewUser 
        ? 'Start Your Assessment'
        : 'View Dashboard'

    const html = this.getHtmlTemplate(
      isNewUser ? 'Welcome to IIICI!' : 'Welcome Back!',
      content,
      ctaText,
      dashboardLink,
      userRole
    )

    return this.sendEmail({ to: userEmail, subject, html })
  }

  // Application status change emails
  async sendApplicationUnderReviewEmail(userEmail: string, userName: string, applicationId: string, institutionName?: string): Promise<boolean> {
    const subject = 'Your Innovation Assessment Application is Under Review'
    
    const content = `
      <p>Dear ${userName},</p>
      
      <p>Thank you for submitting your Innovation Assessment application${institutionName ? ` for <strong>${institutionName}</strong>` : ''}. Our expert review team is now carefully evaluating your submission.</p>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">Review Process</h3>
        <ul style="margin: 0; color: #1e40af; padding-left: 20px;">
          <li>Our team will review your application thoroughly</li>
          <li>We'll assess your innovation practices and capabilities</li>
          <li>You'll receive detailed feedback and recommendations</li>
          <li>Your certification level will be determined</li>
        </ul>
      </div>
      
      <p>We typically complete reviews within 5-7 business days. You'll receive an email notification as soon as the review is complete.</p>
      
      <p>If you have any questions during the review process, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The IIICI Review Team</p>
      
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; color: #6b7280;">
        <strong>Application ID:</strong> ${applicationId}
      </div>
    `

    const html = this.getHtmlTemplate(
      'Application Under Review',
      content,
      'View Dashboard',
      `${process.env.NEXTAUTH_URL}/dashboard`
    )

    return this.sendEmail({ to: userEmail, subject, html })
  }

  async sendApplicationApprovedEmail(userEmail: string, userName: string, applicationId: string, certificationLevel: string, institutionName?: string): Promise<boolean> {
    const subject = '🎉 Congratulations! Your Innovation Assessment Application has been Approved'
    
    const content = `
      <p>Dear ${userName},</p>
      
      <p>We are thrilled to inform you that your Innovation Assessment application${institutionName ? ` for <strong>${institutionName}</strong>` : ''} has been <strong>APPROVED</strong>! 🎉</p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #15803d; margin: 0 0 8px 0; font-size: 16px;">Your Certification Details</h3>
        <p style="margin: 0; color: #15803d;">
          <strong>Certification Level:</strong> ${certificationLevel.replace('_', ' ')}<br>
          <strong>Status:</strong> Approved<br>
          <strong>Approval Date:</strong> ${new Date().toLocaleDateString()}
        </p>
      </div>
      
      <p>This is a significant achievement that demonstrates your organization's commitment to innovation excellence. Your certification is now active and you can showcase this accomplishment to stakeholders, partners, and clients.</p>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">What's Next?</h3>
        <ul style="margin: 0; color: #1e40af; padding-left: 20px;">
          <li>Access your detailed assessment results and recommendations</li>
          <li>Download your official certification certificate</li>
          <li>Share your achievement with your network</li>
          <li>Continue your innovation journey with our ongoing support</li>
        </ul>
      </div>
      
      <p>Congratulations on this outstanding achievement! We look forward to supporting your continued innovation success.</p>
      
      <p>Best regards,<br>The IIICI Certification Team</p>
      
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; color: #6b7280;">
        <strong>Application ID:</strong> ${applicationId}
      </div>
    `

    const html = this.getHtmlTemplate(
      'Application Approved! 🎉',
      content,
      'View Your Results',
      `${process.env.NEXTAUTH_URL}/dashboard`
    )

    return this.sendEmail({ to: userEmail, subject, html })
  }

  async sendApplicationRejectedEmail(userEmail: string, userName: string, applicationId: string, reason?: string, institutionName?: string, isResubmissionRequired: boolean = true): Promise<boolean> {
    const subject = isResubmissionRequired 
      ? 'Innovation Assessment Application - Resubmission Required'
      : 'Innovation Assessment Application - Not Approved'
    
    const content = `
      <p>Dear ${userName},</p>
      
      <p>Thank you for submitting your Innovation Assessment application${institutionName ? ` for <strong>${institutionName}</strong>` : ''}. After careful review by our expert panel, ${isResubmissionRequired ? 'we need additional information or evidence to complete your assessment.' : 'we regret to inform you that your application has not been approved at this time.'}</p>
      
      ${reason ? `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px;">Reviewer Feedback</h3>
        <p style="margin: 0; color: #92400e; white-space: pre-wrap;">${reason}</p>
      </div>
      ` : ''}
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">${isResubmissionRequired ? 'Next Steps' : 'What You Can Do'}</h3>
        <ul style="margin: 0; color: #1e40af; padding-left: 20px;">
          ${isResubmissionRequired ? `
          <li>Review the feedback provided above carefully</li>
          <li>Update your application with the requested information</li>
          <li>Resubmit your application for review</li>
          <li>Our team will review your updated application</li>
          ` : `
          <li>Review the feedback provided above</li>
          <li>Consider the areas for improvement mentioned</li>
          <li>You may reapply after addressing the feedback</li>
          <li>Contact our support team for guidance</li>
          `}
        </ul>
      </div>
      
      <p>${isResubmissionRequired ? 'We encourage you to address the feedback and resubmit your application. Our team is here to support you throughout this process.' : 'We encourage you to review the feedback and consider reapplying in the future. Our team is available to provide guidance and support.'}</p>
      
      <p>If you have any questions about the feedback or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The IIICI Review Team</p>
      
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 20px; font-size: 14px; color: #6b7280;">
        <strong>Application ID:</strong> ${applicationId}
      </div>
    `

    const html = this.getHtmlTemplate(
      isResubmissionRequired ? 'Resubmission Required' : 'Application Not Approved',
      content,
      isResubmissionRequired ? 'Resubmit Application' : 'Contact Support',
      isResubmissionRequired ? `${process.env.NEXTAUTH_URL}/application` : `${process.env.NEXTAUTH_URL}/contact`
    )

    return this.sendEmail({ to: userEmail, subject, html })
  }

  // Admin notification emails
  async sendNewApplicationNotification(adminEmails: string[], applicationId: string, institutionName: string): Promise<boolean> {
    const subject = 'New Innovation Assessment Application Submitted - Review Required'
    
    const content = `
      <p>A new Innovation Assessment application has been submitted and requires your review.</p>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">Application Details</h3>
        <p style="margin: 0; color: #1e40af;">
          <strong>Institution:</strong> ${institutionName}<br>
          <strong>Application ID:</strong> ${applicationId}<br>
          <strong>Submitted:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Status:</strong> Under Review
        </p>
      </div>
      
      <p>Please review this application at your earliest convenience. The application is now available in your admin dashboard for detailed review and assessment.</p>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px;">Review Guidelines</h3>
        <ul style="margin: 0; color: #92400e; padding-left: 20px;">
          <li>Review all submitted information thoroughly</li>
          <li>Check evidence and documentation provided</li>
          <li>Provide constructive feedback if needed</li>
          <li>Update application status accordingly</li>
        </ul>
      </div>
      
      <p>Thank you for your attention to this matter.</p>
      
      <p>Best regards,<br>The IIICI System</p>
    `

    const html = this.getHtmlTemplate(
      'New Application Submitted',
      content,
      'Review Application',
      `${process.env.NEXTAUTH_URL}/admin/submissions/${applicationId}`,
      'ADMIN'
    )

    // Send to all admin emails
    const results = await Promise.all(
      adminEmails.map(email => this.sendEmail({ to: email, subject, html }))
    )

    return results.every(result => result)
  }
}

export const emailService = new EmailService()
