// Simple test file to verify email service functionality
import { emailService } from './email-service'

export async function testEmailService() {
  console.log('🧪 Testing email service...')
  
  try {
    // Test the HTML template generation
    const testHtml = emailService.getHtmlTemplate(
      'Test Email',
      '<p>This is a test email to verify the email service is working correctly.</p>',
      'Test Button',
      'https://example.com',
      'USER'
    )
    
    console.log('✅ HTML template generated successfully')
    console.log('📧 Template length:', testHtml.length)
    
    // Test email sending (will only work if SMTP is configured)
    const emailSent = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from IIICI',
      html: testHtml
    })
    
    if (emailSent) {
      console.log('✅ Test email sent successfully')
    } else {
      console.log('⚠️ Test email not sent (SMTP not configured or failed)')
    }
    
    return true
  } catch (error) {
    console.error('❌ Email service test failed:', error)
    return false
  }
}

// Export for potential use in API routes
export { testEmailService }
