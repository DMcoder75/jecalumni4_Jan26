import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

const DEFAULT_FROM = 'noreply@jecmcaalumni.com'

/**
 * Send email using Sendmail
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, from = DEFAULT_FROM } = options

  try {
    // Create email content
    const emailContent = `From: ${from}\nTo: ${to}\nSubject: ${subject}\nContent-Type: text/html; charset=UTF-8\n\n${html}`

    // Send using sendmail
    const command = `echo "${emailContent.replace(/"/g, '\\"')}" | sendmail -t`

    await execAsync(command)
    console.log(`Email sent to ${to}`)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Email verification template
 */
export function getVerificationEmailTemplate(
  name: string,
  verificationUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B3A3A; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .button { display: inline-block; background-color: #8B3A3A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JEC MCA Alumni Network</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Welcome to the JEC MCA Alumni Network! Please verify your email address to complete your registration.</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><code>${verificationUrl}</code></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Password reset email template
 */
export function getPasswordResetTemplate(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B3A3A; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .button { display: inline-block; background-color: #8B3A3A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JEC MCA Alumni Network</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><code>${resetUrl}</code></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Job alert email template
 */
export function getJobAlertTemplate(
  name: string,
  jobTitle: string,
  company: string,
  jobUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B3A3A; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .job-card { background: white; border-left: 4px solid #8B3A3A; padding: 15px; margin: 15px 0; }
          .button { display: inline-block; background-color: #8B3A3A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JEC MCA Alumni Network</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>A new job opportunity matching your profile has been posted!</p>
            <div class="job-card">
              <h3>${jobTitle}</h3>
              <p><strong>${company}</strong></p>
            </div>
            <a href="${jobUrl}" class="button">View Job Details</a>
            <p>Don't miss out on great career opportunities!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Event reminder email template
 */
export function getEventReminderTemplate(
  name: string,
  eventTitle: string,
  eventDate: string,
  eventUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B3A3A; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .event-card { background: white; border-left: 4px solid #D4AF37; padding: 15px; margin: 15px 0; }
          .button { display: inline-block; background-color: #8B3A3A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JEC MCA Alumni Network</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Reminder: An alumni event you're registered for is coming up!</p>
            <div class="event-card">
              <h3>${eventTitle}</h3>
              <p><strong>Date:</strong> ${eventDate}</p>
            </div>
            <a href="${eventUrl}" class="button">View Event Details</a>
            <p>We look forward to seeing you there!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Mentorship request email template
 */
export function getMentorshipRequestTemplate(
  mentorName: string,
  menteeName: string,
  expertise: string,
  requestUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B3A3A; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .button { display: inline-block; background-color: #8B3A3A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JEC MCA Alumni Network</h1>
          </div>
          <div class="content">
            <p>Hello ${mentorName},</p>
            <p>${menteeName} has requested to be your mentee in the area of <strong>${expertise}</strong>.</p>
            <p>Review and respond to this mentorship request:</p>
            <a href="${requestUrl}" class="button">View Request</a>
            <p>Help shape the next generation of JEC MCA alumni!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * New message notification template
 */
export function getMessageNotificationTemplate(
  name: string,
  senderName: string,
  messagePreview: string,
  messageUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B3A3A; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .message-preview { background: white; border-left: 4px solid #8B3A3A; padding: 15px; margin: 15px 0; font-style: italic; }
          .button { display: inline-block; background-color: #8B3A3A; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JEC MCA Alumni Network</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>You have a new message from ${senderName}:</p>
            <div class="message-preview">"${messagePreview}"</div>
            <a href="${messageUrl}" class="button">View Message</a>
            <p>Reply to continue the conversation!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Signup request email template
 */
export function getSignupRequestTemplate(
  email: string,
  firstName: string,
  lastName: string,
  description: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B3A3A; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JEC MCA Alumni Network - New Signup Request</h1>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>A new user has requested access to the JEC MCA Alumni Network.</p>
            <p><strong>User Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>User Email:</strong> ${email}</p>
            <p><strong>Description:</strong></p>
            <p>${description}</p>
            <p>Please review this request and provide the login credentials if approved.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Password reset request email template
 */
export function getPasswordResetRequestTemplate(
  email: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B3A3A; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JEC MCA Alumni Network - Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>A user has requested a password reset for their account.</p>
            <p><strong>User Email:</strong> ${email}</p>
            <p>Please provide the password reset instructions to the user.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
