import { int, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table matching the provided PostgreSQL schema structure.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(), // Using varchar(36) for UUID compatibility in MySQL
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  batch: varchar("batch", { length: 10 }),
  company: varchar("company", { length: 255 }),
  designation: varchar("designation", { length: 255 }),
  location: varchar("location", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  websiteUrl: text("website_url"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  resetToken: varchar("reset_token", { length: 255 }),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  sessionToken: varchar("session_token", { length: 255 }),
  sessionExpiry: timestamp("session_expiry"),
  isAdmin: boolean("is_admin").default(false),
  isBlocked: boolean("is_blocked").default(false),
  isMentor: boolean("is_mentor").default(false),
  mentorExpertise: text("mentor_expertise"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  lastLogin: timestamp("last_login"),
  profileCompletionPercentage: int("profile_completion_percentage").default(0),
  notificationPreferences: json("notification_preferences").default({
    email_jobs: true,
    email_events: true,
    email_messages: true
  }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  description: text("description"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
