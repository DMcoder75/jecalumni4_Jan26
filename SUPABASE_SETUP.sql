-- ============================================================================
-- JEC MCA ALUMNI CONNECTION DIGITAL CHANNEL - SUPABASE SETUP SCRIPT
-- ============================================================================
-- This script creates all necessary tables and Row Level Security (RLS) policies
-- for the Jabalpur Engineering College MCA Alumni Network platform.
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase project dashboard
-- 2. Open the SQL Editor
-- 3. Create a new query and paste this entire script
-- 4. Execute the script
-- 5. Verify all tables and policies are created
--
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE - Alumni profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(320) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  batch VARCHAR(50),
  company VARCHAR(255),
  designation VARCHAR(255),
  skills TEXT,
  bio TEXT,
  profile_picture_url VARCHAR(512),
  location VARCHAR(255),
  linkedin_url VARCHAR(512),
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  mentor_expertise TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_signed_in TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_batch ON public.users(batch);
CREATE INDEX idx_users_company ON public.users(company);
CREATE INDEX idx_users_is_mentor ON public.users(is_mentor);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view all profiles (public directory)
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- RLS Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- ============================================================================
-- 2. CONNECTIONS TABLE - Alumni relationships
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_self_connection CHECK (user_id != connected_user_id),
  UNIQUE(user_id, connected_user_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_connections_user_id ON public.connections(user_id);
CREATE INDEX idx_connections_connected_user_id ON public.connections(connected_user_id);
CREATE INDEX idx_connections_status ON public.connections(status);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own connections
CREATE POLICY "Users can view their own connections" ON public.connections
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id) 
                    OR auth.uid() = (SELECT auth_id FROM public.users WHERE id = connected_user_id));

-- RLS Policy: Users can create connection requests
CREATE POLICY "Users can create connection requests" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- RLS Policy: Users can update their own connections
CREATE POLICY "Users can update their own connections" ON public.connections
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = connected_user_id));

-- ============================================================================
-- 3. JOBS TABLE - Job postings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary_range VARCHAR(100),
  job_type VARCHAR(50) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  posted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  views_count INT DEFAULT 0,
  applications_count INT DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_company ON public.jobs(company);
CREATE INDEX idx_jobs_posted_at ON public.jobs(posted_at DESC);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view active jobs
CREATE POLICY "Anyone can view active jobs" ON public.jobs
  FOR SELECT USING (status = 'active');

-- RLS Policy: Users can create job postings
CREATE POLICY "Users can create job postings" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = posted_by));

-- RLS Policy: Job posters can update their own jobs
CREATE POLICY "Job posters can update their own jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = posted_by));

-- ============================================================================
-- 4. JOB APPLICATIONS TABLE - Track job applications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, applicant_id)
);

-- Create indexes
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_id ON public.job_applications(applicant_id);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own applications
CREATE POLICY "Users can view their own applications" ON public.job_applications
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = applicant_id)
                    OR auth.uid() = (SELECT auth_id FROM public.users WHERE id = (SELECT posted_by FROM public.jobs WHERE id = job_id)));

-- RLS Policy: Users can create applications
CREATE POLICY "Users can create applications" ON public.job_applications
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = applicant_id));

-- ============================================================================
-- 5. EVENTS TABLE - Alumni events and reunions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  event_type VARCHAR(50) CHECK (event_type IN ('reunion', 'webinar', 'meetup', 'workshop', 'conference')),
  capacity INT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  image_url VARCHAR(512),
  registrations_count INT DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view events
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

-- RLS Policy: Users can create events
CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = created_by));

-- RLS Policy: Event creators can update their events
CREATE POLICY "Event creators can update their events" ON public.events
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = created_by));

-- ============================================================================
-- 6. EVENT REGISTRATIONS TABLE - RSVP and attendance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Create indexes
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON public.event_registrations(user_id);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view registrations for events they created or their own
CREATE POLICY "Users can view event registrations" ON public.event_registrations
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id)
                    OR auth.uid() = (SELECT auth_id FROM public.users WHERE id = (SELECT created_by FROM public.events WHERE id = event_id)));

-- RLS Policy: Users can register for events
CREATE POLICY "Users can register for events" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- RLS Policy: Users can update their own registrations
CREATE POLICY "Users can update their own registrations" ON public.event_registrations
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- ============================================================================
-- 7. NEWS TABLE - News and announcements
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  views_count INT DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_news_author_id ON public.news(author_id);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_featured ON public.news(featured);
CREATE INDEX idx_news_created_at ON public.news(created_at DESC);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view news
CREATE POLICY "Anyone can view news" ON public.news
  FOR SELECT USING (true);

-- RLS Policy: Users can create news (admin only - will be enforced in app)
CREATE POLICY "Users can create news" ON public.news
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = author_id));

-- RLS Policy: News authors can update their posts
CREATE POLICY "News authors can update their posts" ON public.news
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = author_id));

-- ============================================================================
-- 8. MENTORSHIPS TABLE - Mentor-mentee relationships
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mentorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expertise VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_self_mentorship CHECK (mentor_id != mentee_id),
  UNIQUE(mentor_id, mentee_id)
);

-- Create indexes
CREATE INDEX idx_mentorships_mentor_id ON public.mentorships(mentor_id);
CREATE INDEX idx_mentorships_mentee_id ON public.mentorships(mentee_id);
CREATE INDEX idx_mentorships_status ON public.mentorships(status);

-- Enable RLS
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own mentorships
CREATE POLICY "Users can view their own mentorships" ON public.mentorships
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = mentor_id)
                    OR auth.uid() = (SELECT auth_id FROM public.users WHERE id = mentee_id));

-- RLS Policy: Users can request mentorship
CREATE POLICY "Users can request mentorship" ON public.mentorships
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = mentee_id));

-- RLS Policy: Mentors can accept mentorship requests
CREATE POLICY "Mentors can accept mentorship requests" ON public.mentorships
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = mentor_id));

-- ============================================================================
-- 9. SUCCESS STORIES TABLE - Alumni achievements
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.success_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  views_count INT DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_success_stories_author_id ON public.success_stories(author_id);
CREATE INDEX idx_success_stories_category ON public.success_stories(category);
CREATE INDEX idx_success_stories_featured ON public.success_stories(featured);

-- Enable RLS
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view success stories
CREATE POLICY "Anyone can view success stories" ON public.success_stories
  FOR SELECT USING (true);

-- RLS Policy: Users can create success stories
CREATE POLICY "Users can create success stories" ON public.success_stories
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = author_id));

-- RLS Policy: Authors can update their stories
CREATE POLICY "Authors can update their stories" ON public.success_stories
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = author_id));

-- ============================================================================
-- 10. MESSAGES TABLE - Direct messaging between alumni
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_self_message CHECK (sender_id != recipient_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, recipient_id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own messages
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = sender_id)
                    OR auth.uid() = (SELECT auth_id FROM public.users WHERE id = recipient_id));

-- RLS Policy: Users can send messages
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = sender_id));

-- RLS Policy: Users can update their own messages (mark as read)
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = recipient_id));

-- ============================================================================
-- 11. NOTIFICATIONS TABLE - User notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('connection_request', 'message', 'event_reminder', 'job_application', 'mentorship_request')),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  related_item_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- RLS Policy: Users can update their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- ============================================================================
-- 12. COMMENTS TABLE - Comments on news and stories
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_type VARCHAR(50) CHECK (post_type IN ('news', 'story')),
  post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_comments_post ON public.comments(post_type, post_id);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- RLS Policy: Users can create comments
CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_id FROM public.users WHERE id = author_id));

-- RLS Policy: Authors can update their comments
CREATE POLICY "Authors can update their comments" ON public.comments
  FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = author_id));

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify all tables were created successfully:
--
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;
--
-- SELECT tablename FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;
--
-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. All tables use UUID primary keys for better security and scalability
-- 2. RLS (Row Level Security) is enabled on all tables
-- 3. Policies are designed to be user-centric and privacy-aware
-- 4. Timestamps are stored in UTC with timezone awareness
-- 5. Indexes are created on frequently queried columns for performance
-- 6. Foreign keys use ON DELETE CASCADE for data integrity
-- 7. Unique constraints prevent duplicate entries
-- 8. Check constraints enforce data validity
--
-- ============================================================================
