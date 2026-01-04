import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  isAdmin: boolean
  isBlocked: boolean
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          localStorage.removeItem('session_token')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Login failed')
    }

    const { user, token } = await response.json()
    localStorage.setItem('session_token', token)
    setUser(user)
  }

  const signOut = async () => {
    localStorage.removeItem('session_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
