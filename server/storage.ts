import { User, InsertUser, Bubble, InsertBubble, Comment, InsertComment, BubbleWithUser, users, bubbles, comments } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Bubble operations
  createBubble(bubble: InsertBubble): Promise<Bubble>;
  getBubble(id: number): Promise<BubbleWithUser | undefined>;
  getBubbles(): Promise<BubbleWithUser[]>;
  getUserBubbles(userId: number): Promise<BubbleWithUser[]>;
  likeBubble(id: number): Promise<void>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getBubbleComments(bubbleId: number): Promise<Comment[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async createBubble(insertBubble: InsertBubble): Promise<Bubble> {
    const [bubble] = await db
      .insert(bubbles)
      .values({ ...insertBubble, createdAt: new Date() })
      .returning();
    return bubble;
  }

  async getBubble(id: number): Promise<BubbleWithUser | undefined> {
    const [result] = await db
      .select({
        ...bubbles,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(bubbles)
      .where(eq(bubbles.id, id))
      .leftJoin(users, eq(bubbles.userId, users.id));

    if (!result) return undefined;

    const { user, ...bubble } = result;
    return { ...bubble, user };
  }

  async getBubbles(): Promise<BubbleWithUser[]> {
    const results = await db
      .select({
        ...bubbles,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(bubbles)
      .leftJoin(users, eq(bubbles.userId, users.id));

    return results.map(({ user, ...bubble }) => ({ ...bubble, user }));
  }

  async getUserBubbles(userId: number): Promise<BubbleWithUser[]> {
    const results = await db
      .select({
        ...bubbles,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(bubbles)
      .where(eq(bubbles.userId, userId))
      .leftJoin(users, eq(bubbles.userId, users.id));

    return results.map(({ user, ...bubble }) => ({ ...bubble, user }));
  }

  async likeBubble(id: number): Promise<void> {
    await db
      .update(bubbles)
      .set((bubble) => ({ likes: bubble.likes + 1 }))
      .where(eq(bubbles.id, id));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({ ...insertComment, createdAt: new Date() })
      .returning();
    return comment;
  }

  async getBubbleComments(bubbleId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.bubbleId, bubbleId));
  }
}

export const storage = new DatabaseStorage();