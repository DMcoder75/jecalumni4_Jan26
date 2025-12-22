import { supabase } from './supabase'

/**
 * Hash password using Web Crypto API
 * Note: In production, use a proper hashing library like bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Generate verification token
 */
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Register new user with email
 */
export async function registerUser(email: string, password: string, name: string) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new Error('Email already registered')
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    const verificationToken = generateVerificationToken()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expiry: tokenExpiry,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken)

    return { success: true, user: newUser }
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string) {
  try {
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.password_hash)
    if (!passwordMatch) {
      throw new Error('Invalid email or password')
    }

    // Check if email is verified
    if (!user.email_verified) {
      throw new Error('Please verify your email before logging in')
    }

    // Generate session token
    const sessionToken = generateVerificationToken()
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Update user session
    await supabase
      .from('users')
      .update({
        session_token: sessionToken,
        session_expiry: sessionExpiry,
        last_login: new Date().toISOString(),
      })
      .eq('id', user.id)

    // Store session in localStorage
    localStorage.setItem('session_token', sessionToken)
    localStorage.setItem('user_id', user.id)

    return { success: true, user, sessionToken }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (error || !user) {
      throw new Error('Invalid verification token')
    }

    // Check if token has expired
    if (new Date(user.verification_token_expiry) < new Date()) {
      throw new Error('Verification token has expired')
    }

    // Mark email as verified
    await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expiry: null,
      })
      .eq('id', user.id)

    return { success: true, user }
  } catch (error) {
    console.error('Email verification error:', error)
    throw error
  }
}

/**
 * Send verification email via Sendmail
 */
export async function sendVerificationEmail(email: string, name: string, token: string) {
  try {
    const response = await fetch('/api/email/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        token,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send verification email')
    }

    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email)
      .single()

    if (error || !user) {
      // Don't reveal if email exists
      return { success: true }
    }

    const resetToken = generateVerificationToken()
    const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()

    await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: tokenExpiry,
      })
      .eq('id', user.id)

    await fetch('/api/email/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: user.name,
        token: resetToken,
      }),
    })

    return { success: true }
  } catch (error) {
    console.error('Password reset request error:', error)
    throw error
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .single()

    if (error || !user) {
      throw new Error('Invalid reset token')
    }

    if (new Date(user.reset_token_expiry) < new Date()) {
      throw new Error('Reset token has expired')
    }

    const passwordHash = await hashPassword(newPassword)

    await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expiry: null,
      })
      .eq('id', user.id)

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    throw error
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    const userId = localStorage.getItem('user_id')
    if (userId) {
      await supabase
        .from('users')
        .update({
          session_token: null,
          session_expiry: null,
        })
        .eq('id', userId)
    }

    localStorage.removeItem('session_token')
    localStorage.removeItem('user_id')

    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  try {
    const sessionToken = localStorage.getItem('session_token')
    const userId = localStorage.getItem('user_id')

    if (!sessionToken || !userId) {
      return null
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('session_token', sessionToken)
      .single()

    if (error || !user) {
      localStorage.removeItem('session_token')
      localStorage.removeItem('user_id')
      return null
    }

    // Check if session has expired
    if (new Date(user.session_expiry) < new Date()) {
      localStorage.removeItem('session_token')
      localStorage.removeItem('user_id')
      return null
    }

    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}
