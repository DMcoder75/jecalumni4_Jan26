import { Router } from 'express'
import { getUserByEmail, upsertUser } from '../db'
import { nanoid } from 'nanoid'

const router = Router()

/**
 * POST /api/auth/login
 * Custom login logic using the users table
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // In a real app, use bcrypt to compare hashes. 
    // For now, we compare with the passwordHash field.
    if (user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been blocked' })
    }

    // Create a simple session token
    const sessionToken = nanoid(32)
    await upsertUser({
      email: user.email,
      sessionToken,
      sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      lastLogin: new Date()
    })

    // Remove sensitive data before sending
    const { passwordHash, ...safeUser } = user
    res.json({ 
      user: { ...safeUser, sessionToken },
      token: sessionToken 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/auth/me
 * Get current user from session token
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    // This is a simplified check. In production, use a proper session store.
    // For now, we'll find the user by session token.
    const db = await import('../db').then(m => m.getDb())
    if (!db) return res.status(500).json({ error: 'Database not available' })
    
    const { users } = await import('../../drizzle/schema')
    const { eq } = await import('drizzle-orm')
    
    const result = await db.select().from(users).where(eq(users.sessionToken, token)).limit(1)
    
    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid session' })
    }

    const { passwordHash, ...safeUser } = result[0]
    res.json(safeUser)
  } catch (error) {
    console.error('Auth check error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
