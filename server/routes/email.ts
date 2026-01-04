import { Router } from 'express'
import {
  sendEmail,
  getVerificationEmailTemplate,
  getPasswordResetTemplate,
  getJobAlertTemplate,
  getEventReminderTemplate,
  getMentorshipRequestTemplate,
  getMessageNotificationTemplate,
  getSignupRequestTemplate,
  getPasswordResetRequestTemplate,
} from '../email'
import { upsertUser } from '../db'
import { nanoid } from 'nanoid'

const router = Router()

/**
 * POST /api/email/verify
 * Send verification email
 */
router.post('/verify', async (req, res) => {
  try {
    const { email, name, token } = req.body

    if (!email || !name || !token) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`
    const html = getVerificationEmailTemplate(name, verificationUrl)

    const success = await sendEmail({
      to: email,
      subject: 'Verify your JEC MCA Alumni Network email',
      html,
    })

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending verification email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/email/password-reset
 * Send password reset email
 */
router.post('/password-reset', async (req, res) => {
  try {
    const { email, name, token } = req.body

    if (!email || !name || !token) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`
    const html = getPasswordResetTemplate(name, resetUrl)

    const success = await sendEmail({
      to: email,
      subject: 'Reset your JEC MCA Alumni Network password',
      html,
    })

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/email/job-alert
 * Send job alert email
 */
router.post('/job-alert', async (req, res) => {
  try {
    const { email, name, jobTitle, company, jobId } = req.body

    if (!email || !name || !jobTitle || !company) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${jobId}`
    const html = getJobAlertTemplate(name, jobTitle, company, jobUrl)

    const success = await sendEmail({
      to: email,
      subject: `New Job Alert: ${jobTitle} at ${company}`,
      html,
    })

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending job alert email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/email/event-reminder
 * Send event reminder email
 */
router.post('/event-reminder', async (req, res) => {
  try {
    const { email, name, eventTitle, eventDate, eventId } = req.body

    if (!email || !name || !eventTitle || !eventDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const eventUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${eventId}`
    const html = getEventReminderTemplate(name, eventTitle, eventDate, eventUrl)

    const success = await sendEmail({
      to: email,
      subject: `Reminder: ${eventTitle}`,
      html,
    })

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending event reminder email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/email/mentorship-request
 * Send mentorship request notification
 */
router.post('/mentorship-request', async (req, res) => {
  try {
    const { email, mentorName, menteeName, expertise, requestId } = req.body

    if (!email || !mentorName || !menteeName || !expertise) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const requestUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/mentorship/${requestId}`
    const html = getMentorshipRequestTemplate(mentorName, menteeName, expertise, requestUrl)

    const success = await sendEmail({
      to: email,
      subject: `New Mentorship Request from ${menteeName}`,
      html,
    })

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending mentorship request email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/email/message-notification
 * Send new message notification
 */
router.post('/message-notification', async (req, res) => {
  try {
    const { email, name, senderName, messagePreview, conversationId } = req.body

    if (!email || !name || !senderName || !messagePreview) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const messageUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/messages/${conversationId}`
    const html = getMessageNotificationTemplate(name, senderName, messagePreview, messageUrl)

    const success = await sendEmail({
      to: email,
      subject: `New message from ${senderName}`,
      html,
    })

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending message notification email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/email/signup-request
 * Send signup request to admin
 */
router.post('/signup-request', async (req, res) => {
  try {
    const { email, firstName, lastName, description } = req.body

    if (!email || !firstName || !lastName || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create a pending user in the database
    await upsertUser({
      openId: `pending_${nanoid()}`,
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      description,
      emailVerified: false,
      role: 'user',
    })

    const adminEmail = 'jecmcaalumni.noreply@gmail.com'
    const html = getSignupRequestTemplate(email, firstName, lastName, description)

    const success = await sendEmail({
      to: adminEmail,
      subject: `New Signup Request from ${email}`,
      html,
    })

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending signup request email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/email/password-reset-request
 * Send password reset request to admin
 */
router.post('/password-reset-request', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const adminEmail = 'jecmcaalumni.noreply@gmail.com'
    const html = getPasswordResetRequestTemplate(email)

    const success = await sendEmail({
      to: adminEmail,
      subject: `Password Reset Request from ${email}`,
      html,
    })

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error sending password reset request email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
