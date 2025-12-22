# JEC MCA Alumni Connection Digital Channel - Implementation Guide

## Overview

This document provides a comprehensive guide for implementing the JEC MCA Alumni Connection Digital Channel. It covers database schema design, API endpoints, frontend components, and deployment considerations.

## Technology Stack

The platform is built on a modern, scalable technology stack designed for performance and maintainability:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 19, TypeScript | User interface and client-side logic |
| **Styling** | Tailwind CSS 4, shadcn/ui | Responsive design and component library |
| **Backend** | Express.js, Node.js | Server and API management |
| **API** | tRPC | Type-safe RPC framework |
| **Database** | MySQL/TiDB, Drizzle ORM | Data persistence and queries |
| **Authentication** | Manus OAuth | Secure user authentication |
| **File Storage** | AWS S3 | Profile pictures and event photos |
| **State Management** | React Query, tRPC | Server state and caching |

## Database Schema Design

### Core Tables

#### Users Table
Stores alumni profile information and authentication data.

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  batch VARCHAR(50),
  company VARCHAR(255),
  designation VARCHAR(255),
  skills TEXT,
  bio TEXT,
  profilePictureUrl VARCHAR(512),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Connections Table
Manages relationships and connections between alumni.

```sql
CREATE TABLE connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  connectedUserId INT NOT NULL,
  status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (connectedUserId) REFERENCES users(id),
  UNIQUE KEY unique_connection (userId, connectedUserId)
);
```

#### Jobs Table
Stores job postings from alumni and recruiters.

```sql
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary VARCHAR(100),
  jobType ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
  postedBy INT NOT NULL,
  postedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP,
  status ENUM('active', 'closed', 'archived') DEFAULT 'active',
  FOREIGN KEY (postedBy) REFERENCES users(id)
);
```

#### Events Table
Manages alumni events and reunions.

```sql
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  eventDate DATETIME NOT NULL,
  location VARCHAR(255),
  capacity INT,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### Event Registrations Table
Tracks RSVP and attendance for events.

```sql
CREATE TABLE eventRegistrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  userId INT NOT NULL,
  status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
  registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES events(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE KEY unique_registration (eventId, userId)
);
```

#### News Table
Stores news and announcements.

```sql
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author INT NOT NULL,
  category VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author) REFERENCES users(id)
);
```

#### Mentorships Table
Manages mentor-mentee relationships.

```sql
CREATE TABLE mentorships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentorId INT NOT NULL,
  menteeId INT NOT NULL,
  expertise VARCHAR(255),
  status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mentorId) REFERENCES users(id),
  FOREIGN KEY (menteeId) REFERENCES users(id)
);
```

#### Success Stories Table
Stores alumni achievement stories.

```sql
CREATE TABLE successStories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  authorId INT NOT NULL,
  category VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id)
);
```

#### Messages Table
Stores direct messages between alumni.

```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  recipientId INT NOT NULL,
  content TEXT NOT NULL,
  readAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES users(id),
  FOREIGN KEY (recipientId) REFERENCES users(id)
);
```

## API Endpoints (tRPC Procedures)

### Authentication Procedures

**auth.me** - Get current user information
- Type: Query
- Access: Public
- Returns: Current user object or null

**auth.logout** - Logout current user
- Type: Mutation
- Access: Protected
- Returns: Success status

### Alumni Procedures

**alumni.getProfile** - Get alumni profile by ID
- Type: Query
- Input: `{ userId: number }`
- Returns: User profile with connections count

**alumni.updateProfile** - Update current user profile
- Type: Mutation
- Input: `{ name, email, batch, company, designation, skills, bio }`
- Returns: Updated user profile

**alumni.search** - Search alumni by criteria
- Type: Query
- Input: `{ query: string, batch?: string, company?: string, skills?: string }`
- Returns: Array of matching alumni

**alumni.getDirectory** - Get paginated alumni directory
- Type: Query
- Input: `{ page: number, limit: number, sortBy?: string }`
- Returns: Paginated alumni list

### Connection Procedures

**connections.list** - Get current user's connections
- Type: Query
- Access: Protected
- Returns: Array of connected users

**connections.sendRequest** - Send connection request
- Type: Mutation
- Input: `{ targetUserId: number }`
- Returns: Connection request status

**connections.acceptRequest** - Accept connection request
- Type: Mutation
- Input: `{ requestId: number }`
- Returns: Updated connection status

**connections.rejectRequest** - Reject connection request
- Type: Mutation
- Input: `{ requestId: number }`
- Returns: Rejection confirmation

### Job Board Procedures

**jobs.list** - Get all active job postings
- Type: Query
- Input: `{ page: number, limit: number, filter?: { company, location, jobType } }`
- Returns: Paginated job listings

**jobs.getDetail** - Get job details
- Type: Query
- Input: `{ jobId: number }`
- Returns: Detailed job information

**jobs.post** - Create new job posting
- Type: Mutation
- Input: `{ title, description, company, location, salary, jobType }`
- Returns: Created job object

**jobs.apply** - Apply for a job
- Type: Mutation
- Input: `{ jobId: number }`
- Returns: Application confirmation

### Event Procedures

**events.list** - Get upcoming events
- Type: Query
- Input: `{ page: number, limit: number }`
- Returns: Paginated event list

**events.getDetail** - Get event details
- Type: Query
- Input: `{ eventId: number }`
- Returns: Event information with attendees

**events.create** - Create new event
- Type: Mutation
- Input: `{ title, description, eventDate, location, capacity }`
- Returns: Created event object

**events.rsvp** - RSVP to event
- Type: Mutation
- Input: `{ eventId: number, status: 'registered' | 'cancelled' }`
- Returns: RSVP confirmation

### News Procedures

**news.list** - Get news and announcements
- Type: Query
- Input: `{ page: number, limit: number, category?: string }`
- Returns: Paginated news list

**news.post** - Create news post
- Type: Mutation
- Input: `{ title, content, category }`
- Returns: Created news object

### Mentorship Procedures

**mentorship.findMentors** - Search for mentors
- Type: Query
- Input: `{ expertise?: string }`
- Returns: List of available mentors

**mentorship.requestMentorship** - Request mentorship
- Type: Mutation
- Input: `{ mentorId: number }`
- Returns: Mentorship request status

**mentorship.acceptRequest** - Accept mentorship request
- Type: Mutation
- Input: `{ requestId: number }`
- Returns: Updated mentorship status

### Success Stories Procedures

**stories.list** - Get success stories
- Type: Query
- Input: `{ page: number, limit: number }`
- Returns: Paginated stories

**stories.post** - Submit success story
- Type: Mutation
- Input: `{ title, content, category }`
- Returns: Created story object

### Messaging Procedures

**messages.getConversation** - Get messages with a user
- Type: Query
- Input: `{ userId: number, limit: number }`
- Returns: Message history

**messages.send** - Send message
- Type: Mutation
- Input: `{ recipientId: number, content: string }`
- Returns: Sent message object

## Frontend Components

### Key Pages

**Home Page** - Landing page with platform overview
- Hero section with call-to-action
- Feature highlights
- Success stories preview
- Navigation to main features

**Alumni Directory** - Browse and search alumni
- Search and filter functionality
- Alumni cards with profile preview
- Connection status indicators
- Batch/cohort grouping

**Profile Page** - User profile management
- Edit profile information
- View connections
- Achievement badges
- Activity history

**Job Board** - Browse and post jobs
- Job listing with filters
- Job details page
- Application tracking
- Job posting form

**Events** - Event management and RSVP
- Event calendar view
- Event details with agenda
- RSVP management
- Event photos gallery

**Mentorship** - Find and manage mentorships
- Mentor directory with expertise
- Mentorship request system
- Active mentorship tracking
- Mentorship resources

**Success Stories** - Alumni achievements
- Featured stories showcase
- Story submission form
- Category browsing
- Story details page

**Messaging** - Direct communication
- Conversation list
- Message thread view
- Real-time notifications
- Message search

### Reusable Components

**AlumniCard** - Displays alumni profile summary
- Profile picture, name, batch, company
- Connection status button
- Quick action buttons

**JobCard** - Job listing preview
- Job title, company, location
- Job type and salary
- Apply button

**EventCard** - Event preview
- Event title, date, location
- Attendee count
- RSVP button

**StoryCard** - Success story preview
- Story title, author, category
- Excerpt text
- Read more link

## Development Workflow

### Setting Up the Project

1. Clone the repository and install dependencies
2. Configure environment variables (database URL, OAuth credentials)
3. Run database migrations: `pnpm db:push`
4. Start development server: `pnpm dev`

### Adding a New Feature

1. Define database schema in `drizzle/schema.ts`
2. Run migration: `pnpm db:push`
3. Create query helpers in `server/db.ts`
4. Add tRPC procedures in `server/routers.ts`
5. Build frontend pages in `client/src/pages/`
6. Write tests in `server/*.test.ts`
7. Test in browser and verify functionality

### Database Migrations

When modifying the schema:

```bash
# Edit drizzle/schema.ts
# Generate and apply migrations
pnpm db:push
```

## Security Considerations

### Authentication & Authorization

- Use Manus OAuth for secure authentication
- Implement role-based access control (admin, user)
- Protect sensitive procedures with `protectedProcedure`
- Validate user permissions before database operations

### Data Protection

- Encrypt sensitive data in transit (HTTPS)
- Store passwords securely (OAuth handles this)
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs

### Privacy

- Implement privacy controls for profile visibility
- Allow users to delete their accounts and data
- Comply with GDPR and privacy regulations
- Log access to sensitive operations

## Performance Optimization

### Frontend

- Implement lazy loading for images
- Use React Query caching for API responses
- Optimize bundle size with code splitting
- Implement pagination for large lists

### Backend

- Create database indexes on frequently queried columns
- Implement query caching for expensive operations
- Use connection pooling for database
- Monitor and optimize slow queries

### Deployment

- Use CDN for static assets
- Enable gzip compression
- Implement caching headers
- Monitor performance metrics

## Testing Strategy

### Unit Tests

Test individual functions and procedures:

```typescript
describe('alumni.search', () => {
  it('should find alumni by company', async () => {
    const result = await trpc.alumni.search.query({
      company: 'Google'
    });
    expect(result).toHaveLength(5);
  });
});
```

### Integration Tests

Test API endpoints and database operations:

```typescript
describe('jobs.apply', () => {
  it('should create job application', async () => {
    const application = await trpc.jobs.apply.mutate({
      jobId: 1
    });
    expect(application.status).toBe('applied');
  });
});
```

### End-to-End Tests

Test complete user workflows in the browser.

## Deployment Checklist

Before launching the platform:

- [ ] All database migrations applied
- [ ] Environment variables configured
- [ ] OAuth credentials set up
- [ ] S3 bucket configured for file storage
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring and logging set up
- [ ] Backup strategy implemented
- [ ] User documentation completed
- [ ] Admin panel tested
- [ ] Performance tested under load

## Maintenance & Operations

### Regular Tasks

- Monitor application logs for errors
- Review database performance metrics
- Update dependencies regularly
- Backup database daily
- Review user feedback and bug reports
- Optimize slow queries

### Scaling Considerations

- Implement database replication for high availability
- Use load balancing for multiple server instances
- Implement caching layer (Redis) for frequently accessed data
- Monitor resource usage and scale accordingly

## Conclusion

This implementation guide provides the foundation for building a robust, scalable alumni connection platform. By following these specifications and best practices, the JEC MCA Alumni Connection Digital Channel will deliver a reliable, user-friendly experience for all alumni and stakeholders.
