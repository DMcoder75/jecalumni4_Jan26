# JEC MCA Alumni Network - Custom Users Table Setup Guide

## Overview

This guide explains how to set up the JEC MCA Alumni Network platform with a **completely custom users table** (not using Supabase's built-in `auth.users` table). This approach gives you full control over user data, authentication flow, and email verification.

## Key Differences

| Aspect | Supabase Auth | Custom Users |
|--------|---------------|--------------|
| User Storage | `auth.users` table | Custom `users` table |
| Password Hashing | Automatic | Manual (SHA-256) |
| Email Verification | Built-in | Custom implementation |
| Session Management | JWT tokens | Custom tokens |
| Control | Limited | Full |

## Setup Steps

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** jec-mca-alumni
   - **Database Password:** Create a strong password
   - **Region:** Choose closest to Jabalpur (Asia-Singapore or Asia-Mumbai)
4. Click "Create new project" and wait for initialization

### Step 2: Run the SQL Setup Script

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `SUPABASE_CUSTOM_USERS_SETUP.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for all tables to be created successfully

### Step 3: Verify Database Setup

After running the script, verify all tables were created:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- batches
- batch_events
- comments
- connections
- event_registrations
- events
- job_applications
- jobs
- mentorship
- messages
- news
- notifications
- users

### Step 4: Configure Supabase Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **Anon Key**
3. Add to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 5: Test Email Sending (Sendmail)

The platform uses **Sendmail** for email verification and notifications. Sendmail is typically pre-installed on Linux servers.

To test if Sendmail is working:

```bash
echo "Subject: Test Email" | sendmail -v your-email@example.com
```

If Sendmail is not installed, install it:

```bash
# Ubuntu/Debian
sudo apt-get install sendmail

# CentOS/RHEL
sudo yum install sendmail
```

## Custom Users Table Structure

The `users` table includes:

### Authentication Fields
- `email` - User's email (unique)
- `password_hash` - SHA-256 hashed password
- `email_verified` - Boolean flag for email verification
- `verification_token` - Token for email verification
- `verification_token_expiry` - Expiration time for verification token

### Session Management
- `session_token` - Custom session token
- `session_expiry` - Session expiration time
- `last_login` - Last login timestamp

### Profile Fields
- `name` - Full name
- `avatar_url` - Profile picture URL
- `bio` - User bio
- `batch` - Graduation year
- `company` - Current company
- `designation` - Job title
- `location` - City/Location
- `phone` - Contact number
- `linkedin_url` - LinkedIn profile
- `github_url` - GitHub profile
- `website_url` - Personal website

### Admin & Status
- `is_admin` - Admin privileges
- `is_blocked` - Account blocked status
- `is_mentor` - Mentor status
- `mentor_expertise` - Mentor's area of expertise

### Metadata
- `profile_completion_percentage` - Profile completion %
- `notification_preferences` - JSON object for notification settings

## Authentication Flow

### Registration

1. User submits email and password
2. Password is hashed using SHA-256
3. Verification token is generated
4. Email verification email is sent via Sendmail
5. User clicks verification link
6. Email is marked as verified

### Login

1. User enters email and password
2. Password is hashed and compared with stored hash
3. Session token is generated
4. Token is stored in localStorage
5. User is logged in

### Email Verification

1. Verification email is sent with a unique token
2. Token expires in 24 hours
3. User clicks link in email
4. Token is verified and email is marked as verified
5. User can now access full platform features

## Row Level Security (RLS)

All tables have RLS enabled with policies:

- **Users**: Verified users can be viewed publicly; users can update their own profiles
- **Jobs**: Public read access; authenticated users can create
- **Events**: Public read access; authenticated users can create
- **Messages**: Users can only see their own messages
- **Notifications**: Users can only see their own notifications
- **Mentorship**: Users can only see mentorship they're involved in

## Email Templates

The platform includes email templates for:

1. **Email Verification** - Verification link with 24-hour expiration
2. **Password Reset** - Password reset link with 1-hour expiration
3. **Job Alerts** - New job postings matching user profile
4. **Event Reminders** - Upcoming events user registered for
5. **Mentorship Requests** - New mentorship requests
6. **Message Notifications** - New messages from other users
7. **Batch Reunion** - Batch reunion event notifications

## Environment Variables

Add these to your `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email
SENDMAIL_FROM=noreply@jecmcaalumni.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

## Testing the Setup

### Test User Registration

1. Go to `/auth` page
2. Click "Sign Up"
3. Enter email, password, and name
4. Check email for verification link
5. Click verification link
6. Email should be verified

### Test Admin Portal

1. Set a user as admin in database:

```sql
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
```

2. Login as admin
3. Go to `/admin`
4. You should see admin dashboard

### Test Email Sending

Check mail logs:

```bash
tail -f /var/log/mail.log
```

## Troubleshooting

### Email not sending

1. Check if Sendmail is installed: `which sendmail`
2. Check mail logs: `tail -f /var/log/mail.log`
3. Verify email format in database
4. Check SENDMAIL_FROM environment variable

### RLS Policies not working

1. Ensure RLS is enabled on all tables
2. Check policy definitions in Supabase dashboard
3. Verify user authentication is working

### Session token not working

1. Check if session_token is stored in localStorage
2. Verify token hasn't expired
3. Check database for token expiry

## Next Steps

1. **Customize Email Templates** - Edit email templates in `server/email.ts`
2. **Add More Fields** - Extend users table with additional fields as needed
3. **Set Up Cron Jobs** - Schedule email reminders using a cron service
4. **Configure Custom Domain** - Set up custom email domain for sending emails
5. **Add Two-Factor Authentication** - Implement 2FA for enhanced security

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review email logs: `/var/log/mail.log`
3. Check browser console for JavaScript errors
4. Review server logs in Manus dashboard

---

**Last Updated:** December 2024
**Platform:** JEC MCA Alumni Network
**Database:** Supabase with Custom Users Table
