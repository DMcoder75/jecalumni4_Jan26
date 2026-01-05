import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  name: string
  is_admin: boolean
  is_blocked: boolean
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('jec_alumni_user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          console.error('Failed to parse saved user', e)
          localStorage.removeItem('jec_alumni_user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Query the custom users table directly
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        throw new Error('User not found')
      }

      if (data.is_blocked) {
        throw new Error('Your account is blocked. Please contact admin.')
      }

      // Check password: support both plain text and hashed
      const isPasswordValid = data.password_hash === password || data.password === password

      if (!isPasswordValid) {
        throw new Error('Invalid password')
      }

      const userData: User = {
        ...data,
        name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email.split('@')[0]
      }

      localStorage.setItem('jec_alumni_user', JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      console.error('Login failed:', error)
      throw new Error(error.message || 'Login failed')
    }
  }

  const signOut = async () => {
    localStorage.removeItem('jec_alumni_user')
    setUser(null)
  }

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('Not authenticated')

    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      const updatedUser = {
        ...user,
        ...data,
        name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email.split('@')[0]
      }

      localStorage.setItem('jec_alumni_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error: any) {
      console.error('Profile update failed:', error)
      throw new Error(error.message || 'Update failed')
    }
  }

  const refreshUser = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      if (data) {
        const updatedUser = {
          ...user,
          ...data,
          name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email.split('@')[0]
        }
        localStorage.setItem('jec_alumni_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Refresh user failed:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        updateProfile,
        refreshUser,
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
