import { Router } from 'express'
import { getDb } from '../db'
import { users } from '../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { sendEmail, getApprovalTemplate, getPasswordResetTemplate } from '../email'

const router = Router()

/**
 * GET /api/admin/users
 * Get all users (pending and active)
 */
router.get('/users', async (req, res) => {
  try {
    const db = await getDb()
    if (!db) return res.status(500).json({ error: 'Database not available' })

    const allUsers = await db.select().from(users)
    res.json(allUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/admin/approve-user
 * Approve a pending user and send credentials
 */
router.post('/approve-user', async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'User ID is required' })

    const db = await getDb()
    if (!db) return res.status(500).json({ error: 'Database not available' })

    const userResult = await db.select().from(users).where(eq(users.id, id)).limit(1)
    if (userResult.length === 0) return res.status(404).json({ error: 'User not found' })

    const user = userResult[0]
    const generatedPassword = nanoid(10)

    await db.update(users)
      .set({ 
        emailVerified: true, 
        password: generatedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))

    // Send approval email
    const html = getApprovalTemplate(user.firstName || 'User', user.email || '', generatedPassword)
    await sendEmail({
      to: user.email || '',
      subject: 'Welcome to JEC MCA Alumni Network - Account Approved',
      html,
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error approving user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/admin/reset-password
 * Reset user password and send new one
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'User ID is required' })

    const db = await getDb()
    if (!db) return res.status(500).json({ error: 'Database not available' })

    const userResult = await db.select().from(users).where(eq(users.id, id)).limit(1)
    if (userResult.length === 0) return res.status(404).json({ error: 'User not found' })

    const user = userResult[0]
    const newPassword = nanoid(10)

    await db.update(users)
      .set({ 
        password: newPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))

    // Send password reset email
    const html = getPasswordResetTemplate(user.firstName || 'User', newPassword)
    await sendEmail({
      to: user.email || '',
      subject: 'JEC MCA Alumni Network - Password Reset',
      html,
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
