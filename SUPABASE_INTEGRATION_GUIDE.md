# Supabase Integration Guide - JEC MCA Alumni Platform

## Overview

This guide walks you through integrating Supabase as the backend database for the JEC MCA Alumni Connection Digital Channel. Supabase provides PostgreSQL database, authentication, real-time capabilities, and storage out of the box.

## Prerequisites

- Supabase account (create at https://supabase.com)
- Your Supabase project URL and API keys
- Node.js and npm/pnpm installed

## Step 1: Set Up Supabase Project

### 1.1 Create a New Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter project name: `jec-mca-alumni`
4. Choose a strong database password
5. Select your region (closest to your users)
6. Click "Create new project"

### 1.2 Wait for Project Initialization
- Supabase will set up your PostgreSQL database
- This typically takes 2-3 minutes
- You'll see a confirmation when ready

## Step 2: Create Database Schema

### 2.1 Access SQL Editor
1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Name it `JEC Alumni Setup`

### 2.2 Run the Setup Script
1. Copy the entire contents of `SUPABASE_SETUP.sql`
2. Paste it into the SQL Editor
3. Click **Run** button
4. Wait for all queries to execute successfully

### 2.3 Verify Tables
After the script completes:
1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `connections`
   - `jobs`
   - `job_applications`
   - `events`
   - `event_registrations`
   - `news`
   - `mentorships`
   - `success_stories`
   - `messages`
   - `notifications`
   - `comments`

## Step 3: Configure Authentication

### 3.1 Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Click on **Email**
3. Toggle **Enable Email provider** to ON
4. Configure email settings:
   - Enable "Confirm email" if desired
   - Set redirect URL to your app URL

### 3.2 Configure OAuth (Optional)
If you want to support Google/GitHub login:
1. Go to **Authentication** → **Providers**
2. Click on **Google** or **GitHub**
3. Toggle to enable
4. Add your OAuth credentials from Google/GitHub console

### 3.3 Get Your API Keys
1. Go to **Settings** → **API**
2. Copy these keys (you'll need them):
   - **Project URL**: `https://[your-project].supabase.co`
   - **Anon Key**: `sb_anon_...` (public key for browser)
   - **Service Role Key**: `sb_service_...` (secret key for server)

## Step 4: Configure Environment Variables

### 4.1 Update `.env.local`
Create or update your `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tbuqphydoaekxrtodmts.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Server-side only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4.2 Update `.env.production`
For production deployment:

```env
VITE_SUPABASE_URL=https://tbuqphydoaekxrtodmts.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 5: Install Supabase Client

### 5.1 Install Dependencies
```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-react
```

### 5.2 Create Supabase Client
Create `client/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 6: Update Frontend Integration

### 6.1 Create Auth Hook
Create `client/src/hooks/useSupabaseAuth.ts`:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  }
}
```

### 6.2 Create Data Hooks
Create `client/src/hooks/useAlumni.ts`:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAlumni() {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlumni(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const searchAlumni = async (query: string, filters: any = {}) => {
    try {
      let q = supabase.from('users').select('*')

      if (query) {
        q = q.or(`name.ilike.%${query}%,company.ilike.%${query}%,skills.ilike.%${query}%`)
      }

      if (filters.batch) {
        q = q.eq('batch', filters.batch)
      }

      if (filters.company) {
        q = q.eq('company', filters.company)
      }

      const { data, error } = await q

      if (error) throw error
      setAlumni(data || [])
    } catch (err) {
      setError(err as Error)
    }
  }

  return {
    alumni,
    loading,
    error,
    fetchAlumni,
    searchAlumni,
  }
}
```

## Step 7: Row Level Security (RLS) Best Practices

### 7.1 Understanding RLS
RLS ensures users can only access data they're authorized to see:

- **Public data** (news, events, alumni directory): Readable by all
- **Private data** (messages, applications): Only readable by involved parties
- **User profiles**: Readable by all, editable only by owner

### 7.2 Testing RLS
1. Go to **SQL Editor**
2. Run queries to verify RLS works:

```sql
-- Test as authenticated user
SELECT * FROM users;

-- Test as anonymous user
SELECT * FROM users;
```

### 7.3 Bypassing RLS (Server-side only)
For server operations, use the Service Role Key:

```typescript
// Server-side only
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This bypasses RLS
const { data } = await supabaseAdmin.from('users').select('*')
```

## Step 8: Storage Configuration (Optional)

### 8.1 Create Storage Buckets
1. Go to **Storage** in Supabase
2. Click **Create new bucket**
3. Create these buckets:
   - `profile-pictures` (public)
   - `event-images` (public)
   - `story-images` (public)

### 8.2 Configure Bucket Policies
For each bucket:
1. Click the bucket name
2. Go to **Policies**
3. Add policies for read/write access

## Step 9: Real-time Features (Optional)

### 9.1 Enable Real-time
1. Go to **Replication** in your project settings
2. Enable replication for tables you want real-time updates:
   - `messages` (for live messaging)
   - `notifications` (for live notifications)

### 9.2 Subscribe to Changes
```typescript
const subscription = supabase
  .from('messages')
  .on('*', (payload) => {
    console.log('New message:', payload.new)
  })
  .subscribe()
```

## Step 10: Testing Your Setup

### 10.1 Test Authentication
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123456'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'test123456'
})
```

### 10.2 Test Data Operations
```typescript
// Create user profile
const { data, error } = await supabase
  .from('users')
  .insert([{
    auth_id: user.id,
    email: user.email,
    name: 'John Doe',
    batch: '2020'
  }])

// Query data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('batch', '2020')
```

## Troubleshooting

### Issue: "Relation does not exist"
**Solution:** Ensure all tables were created by running the setup script again

### Issue: "Permission denied" errors
**Solution:** Check RLS policies - ensure they allow the operation you're trying to perform

### Issue: "Invalid API key"
**Solution:** Verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct

### Issue: Authentication not working
**Solution:** Check that email provider is enabled in Authentication settings

## Security Checklist

- [ ] Service Role Key is never exposed to client
- [ ] RLS is enabled on all tables
- [ ] Policies are restrictive (least privilege)
- [ ] Storage buckets have appropriate access policies
- [ ] API keys are rotated regularly
- [ ] CORS is configured correctly
- [ ] Email verification is enabled
- [ ] Rate limiting is configured

## Next Steps

1. **Implement Frontend Pages:** Build alumni directory, job board, events pages
2. **Add Real-time Features:** Implement live messaging and notifications
3. **Set Up Storage:** Configure profile pictures and event images
4. **Create Admin Panel:** Build tools for managing content and users
5. **Deploy:** Push to production with proper environment variables

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

## Support

For issues or questions:
1. Check Supabase documentation
2. Review RLS policies
3. Check browser console for errors
4. Review Supabase logs in the dashboard
