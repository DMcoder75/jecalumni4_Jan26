import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { v4 as uuidv4 } from 'uuid';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: Partial<InsertUser>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    if (!user.email) throw new Error("Email is required for upsert");

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, user.email)).limit(1);

    if (existing.length > 0) {
      // Update
      await db.update(users).set({
        ...user,
        updatedAt: new Date()
      }).where(eq(users.email, user.email));
    } else {
      // Insert
      await db.insert(users).values({
        id: uuidv4(),
        email: user.email,
        passwordHash: user.passwordHash || '',
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
