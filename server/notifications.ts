/**
 * Notification service for sending alerts via email
 * These functions should be called from API endpoints or cron jobs
 */

/**
 * Send job alert notifications to interested users
 */
export async function sendJobAlerts(
  jobId: string,
  jobTitle: string,
  company: string,
  userEmails: Array<{ email: string; name: string }>
) {
  try {
    for (const user of userEmails) {
      await fetch('http://localhost:3000/api/email/job-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          jobTitle,
          company,
          jobId,
        }),
      })
    }
  } catch (error) {
    console.error('Error sending job alerts:', error)
  }
}

/**
 * Send event reminder notifications
 */
export async function sendEventReminders(
  eventId: string,
  eventTitle: string,
  eventDate: string,
  userEmails: Array<{ email: string; name: string }>
) {
  try {
    for (const user of userEmails) {
      await fetch('http://localhost:3000/api/email/event-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          eventTitle,
          eventDate,
          eventId,
        }),
      })
    }
  } catch (error) {
    console.error('Error sending event reminders:', error)
  }
}

/**
 * Send mentorship request notification
 */
export async function sendMentorshipNotification(
  mentorEmail: string,
  mentorName: string,
  menteeName: string,
  expertise: string,
  requestId: string
) {
  try {
    await fetch('http://localhost:3000/api/email/mentorship-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: mentorEmail,
        mentorName,
        menteeName,
        expertise,
        requestId,
      }),
    })
  } catch (error) {
    console.error('Error sending mentorship notification:', error)
  }
}

/**
 * Send message notification
 */
export async function sendMessageNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
) {
  try {
    await fetch('http://localhost:3000/api/email/message-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: recipientEmail,
        name: recipientName,
        senderName,
        messagePreview,
        conversationId,
      }),
    })
  } catch (error) {
    console.error('Error sending message notification:', error)
  }
}

/**
 * Send batch reunion notification
 */
export async function sendBatchReunionNotification(
  userEmails: Array<{ email: string; name: string }>,
  eventTitle: string,
  eventDate: string
) {
  try {
    for (const user of userEmails) {
      const html = `
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
                <p>Hello ${user.name},</p>
                <p>Your batch is organizing a reunion event!</p>
                <h3>${eventTitle}</h3>
                <p><strong>Date:</strong> ${eventDate}</p>
                <p>Join your classmates and reconnect with old friends.</p>
                <a href="http://localhost:3000/batch-reunion" class="button">View Event</a>
              </div>
              <div class="footer">
                <p>&copy; 2024 JEC MCA Alumni Network. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `

      // Send via sendmail directly
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)

      const emailContent = `From: noreply@jecmcaalumni.com\nTo: ${user.email}\nSubject: Your Batch Reunion: ${eventTitle}\nContent-Type: text/html; charset=UTF-8\n\n${html}`

      try {
        await execAsync(
          `echo "${emailContent.replace(/"/g, '\\"')}" | sendmail -t`
        )
      } catch (error) {
        console.error('Error sending batch reunion email:', error)
      }
    }
  } catch (error) {
    console.error('Error sending batch reunion notifications:', error)
  }
}
