import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  first_name?: string
  last_name?: string
  name: string
  batch?: string
  company?: string
  designation?: string
  skills?: string
  bio?: string
  profile_picture_url?: string
  location?: string
  linkedin_url?: string
  phone?: string
  is_verified: boolean
  is_mentor: boolean
  is_admin: boolean
  is_blocked: boolean
  email_verified: boolean
  mentor_expertise?: string
  created_at: string
  updated_at: string
  last_signed_in?: string
  [key: string]: any
}

export type Job = {
  id: string
  title: string
  description: string
  company: string
  location?: string
  salary_range?: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
  posted_by: string
  posted_at: string
  expires_at?: string
  status: 'active' | 'closed' | 'archived'
  views_count: number
  applications_count: number
  created_at: string
}

export type Event = {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  event_type: 'reunion' | 'webinar' | 'meetup' | 'workshop' | 'conference'
  capacity?: number
  created_by: string
  created_at: string
  updated_at: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  image_url?: string
  registrations_count: number
}

export type Message = {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export type Mentorship = {
  id: string
  mentor_id: string
  mentee_id: string
  expertise?: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export type News = {
  id: string
  title: string
  content: string
  author_id: string
  category?: string
  featured: boolean
  image_url?: string
  created_at: string
  updated_at: string
  views_count: number
}

export type SuccessStory = {
  id: string
  title: string
  content: string
  author_id: string
  category?: string
  featured: boolean
  image_url?: string
  created_at: string
  updated_at: string
  views_count: number
}
