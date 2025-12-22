-- ============================================================================
-- JEC MCA Alumni Network - Supabase Database Setup
-- Custom Users Table (No auth.users dependency)
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM USERS TABLE (Primary Authentication Table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  batch VARCHAR(10),
  company VARCHAR(255),
  designation VARCHAR(255),
  location VARCHAR(255),
  phone VARCHAR(20),
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  
  -- Email verification
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expiry TIMESTAMP,
  
  -- Password reset
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  
  -- Session management
  session_token VARCHAR(255),
  session_expiry TIMESTAMP,
  
  -- Admin and status
  is_admin BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  mentor_expertise TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  -- Metadata
  profile_completion_percentage INTEGER DEFAULT 0,
  notification_preferences JSONB DEFAULT '{"email_jobs": true, "email_events": true, "email_messages": true}'::jsonb
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_batch ON users(batch);
CREATE INDEX idx_users_company ON users(company);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_session_token ON users(session_token);
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_token);

-- ============================================================================
-- CONNECTIONS/RELATIONSHIPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);

CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_connected_user_id ON connections(connected_user_id);
CREATE INDEX idx_connections_status ON connections(status);

-- ============================================================================
-- JOBS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  job_type VARCHAR(50), -- Full-time, Part-time, Contract, Internship
  location VARCHAR(255),
  salary_range VARCHAR(100),
  skills_required TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active', -- active, closed, archived
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_featured ON jobs(featured);

-- ============================================================================
-- JOB APPLICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_url TEXT,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'applied', -- applied, reviewing, shortlisted, rejected, accepted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(job_id, applicant_id)
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  event_type VARCHAR(50), -- Reunion, Workshop, Networking, Seminar
  max_attendees INTEGER,
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_featured ON events(featured);

-- ============================================================================
-- EVENT REGISTRATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'registered', -- registered, attended, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);

-- ============================================================================
-- NEWS/STORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50), -- News, Success Story, Achievement, Announcement
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_created_by ON news(created_by);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_featured ON news(featured);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_news_id ON comments(news_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- ============================================================================
-- MENTORSHIP TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS mentorship (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expertise VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed, rejected
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(mentor_id, mentee_id),
  CHECK (mentor_id != mentee_id)
);

CREATE INDEX idx_mentorship_mentor_id ON mentorship(mentor_id);
CREATE INDEX idx_mentorship_mentee_id ON mentorship(mentee_id);
CREATE INDEX idx_mentorship_status ON mentorship(status);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (sender_id != recipient_id)
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- job_alert, event_reminder, mentorship_request, new_message, connection_request
  title VARCHAR(255) NOT NULL,
  content TEXT,
  related_id UUID, -- ID of related object (job, event, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- BATCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_year VARCHAR(10) UNIQUE NOT NULL,
  coordinator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_members INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batches_batch_year ON batches(batch_year);
CREATE INDEX idx_batches_coordinator_id ON batches(coordinator_id);

-- ============================================================================
-- BATCH EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS batch_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batch_events_batch_id ON batch_events(batch_id);
CREATE INDEX idx_batch_events_event_date ON batch_events(event_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_events ENABLE ROW LEVEL SECURITY;

-- Users: Public can read verified users, users can update own profile
CREATE POLICY "Users can view verified profiles" ON users
  FOR SELECT USING (email_verified = true OR auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Connections: Users can only see their own connections
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.uid()::text = connected_user_id::text);

CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Jobs: Public can read, authenticated users can create
CREATE POLICY "Jobs are public" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Users can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid()::text = posted_by::text);

-- Job Applications: Users can view own applications
CREATE POLICY "Users can view own applications" ON job_applications
  FOR SELECT USING (auth.uid()::text = applicant_id::text OR auth.uid()::text IN (
    SELECT posted_by FROM jobs WHERE id = job_id
  ));

-- Events: Public can read, authenticated users can create
CREATE POLICY "Events are public" ON events
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

-- Event Registrations: Users can view own registrations
CREATE POLICY "Users can view own registrations" ON event_registrations
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- News: Public can read, authenticated users can create
CREATE POLICY "News is public" ON news
  FOR SELECT USING (true);

CREATE POLICY "Users can create news" ON news
  FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

-- Comments: Public can read, authenticated users can create
CREATE POLICY "Comments are public" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Mentorship: Users can view mentorship related to them
CREATE POLICY "Users can view own mentorship" ON mentorship
  FOR SELECT USING (auth.uid()::text = mentor_id::text OR auth.uid()::text = mentee_id::text);

-- Messages: Users can only see their own messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid()::text = sender_id::text OR auth.uid()::text = recipient_id::text);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Batches: Public can read
CREATE POLICY "Batches are public" ON batches
  FOR SELECT USING (true);

-- Batch Events: Public can read
CREATE POLICY "Batch events are public" ON batch_events
  FOR SELECT USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
