import { users, bubbles, posts, messages, bubbleMembers, reports } from "@shared/schema";
import type { InsertUser, User, Bubble, Post, Message, BubbleMember, Report } from "@shared/schema";
import { db } from "./db";
import { eq, or, desc, and, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;

  // Bubble operations
  createBubble(bubble: Omit<Bubble, "id" | "createdAt">): Promise<Bubble>;
  getBubble(id: number): Promise<Bubble | undefined>;
  listBubbles(): Promise<Bubble[]>;
  updateBubble(id: number, data: Partial<Omit<Bubble, "id" | "createdAt">>): Promise<Bubble>;

  // Bubble membership
  addBubbleMember(bubbleId: number, userId: number, role?: string): Promise<BubbleMember>;
  removeBubbleMember(bubbleId: number, userId: number): Promise<void>;
  getBubbleMembers(bubbleId: number): Promise<BubbleMember[]>;
  getUserBubbles(userId: number): Promise<Bubble[]>;

  // Post operations
  createPost(post: Omit<Post, "id" | "createdAt">): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  listBubblePosts(bubbleId: number): Promise<Post[]>;
  deletePost(id: number): Promise<void>;
  getUserPosts(userId: number): Promise<Post[]>;
  listPosts(): Promise<Post[]>; // Added function

  // Message operations
  createMessage(message: Omit<Message, "id" | "createdAt" | "isRead">): Promise<Message>;
  listUserMessages(userId: number): Promise<Message[]>;
  markMessageAsRead(messageId: number): Promise<void>;

  // Moderation
  createReport(report: Omit<Report, "id" | "createdAt" | "status">): Promise<Report>;
  updateReportStatus(reportId: number, status: string): Promise<Report>;
  listReports(status?: string): Promise<Report[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
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

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Bubble operations
  async createBubble(bubble: Omit<Bubble, "id" | "createdAt">): Promise<Bubble> {
    const [newBubble] = await db
      .insert(bubbles)
      .values({
        name: bubble.name,
        description: bubble.description,
        creatorId: bubble.creatorId,
        coverImage: bubble.coverImage || null,
        isPrivate: bubble.isPrivate || false,
      })
      .returning();
    return newBubble;
  }

  async getBubble(id: number): Promise<Bubble | undefined> {
    const [bubble] = await db.select().from(bubbles).where(eq(bubbles.id, id));
    return bubble;
  }

  async listBubbles(): Promise<Bubble[]> {
    return await db
      .select()
      .from(bubbles)
      .orderBy(desc(bubbles.createdAt));
  }

  async updateBubble(id: number, data: Partial<Omit<Bubble, "id" | "createdAt">>): Promise<Bubble> {
    const [bubble] = await db
      .update(bubbles)
      .set(data)
      .where(eq(bubbles.id, id))
      .returning();
    return bubble;
  }

  // Bubble membership
  async addBubbleMember(bubbleId: number, userId: number, role: string = "member"): Promise<BubbleMember> {
    const [member] = await db
      .insert(bubbleMembers)
      .values({ bubbleId, userId, role })
      .returning();
    return member;
  }

  async removeBubbleMember(bubbleId: number, userId: number): Promise<void> {
    await db
      .delete(bubbleMembers)
      .where(
        and(
          eq(bubbleMembers.bubbleId, bubbleId),
          eq(bubbleMembers.userId, userId)
        )
      );
  }

  async getBubbleMembers(bubbleId: number): Promise<BubbleMember[]> {
    return await db
      .select()
      .from(bubbleMembers)
      .where(eq(bubbleMembers.bubbleId, bubbleId))
      .orderBy(desc(bubbleMembers.joinedAt));
  }

  async getUserBubbles(userId: number): Promise<Bubble[]> {
    const members = await db
      .select()
      .from(bubbleMembers)
      .where(eq(bubbleMembers.userId, userId));

    if (members.length === 0) return [];

    return await db
      .select()
      .from(bubbles)
      .where(
        inArray(
          bubbles.id,
          members.map((m) => m.bubbleId)
        )
      );
  }

  // Post operations
  async createPost(post: Omit<Post, "id" | "createdAt">): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async listBubblePosts(bubbleId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.bubbleId, bubbleId))
      .orderBy(desc(posts.createdAt));
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async listPosts(): Promise<Post[]> { // Added function implementation
    return await db.select().from(posts);
  }

  // Message operations
  async createMessage(message: Omit<Message, "id" | "createdAt" | "isRead">): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...message,
        isRead: false,
      })
      .returning();
    return newMessage;
  }

  async listUserMessages(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Moderation
  async createReport(report: Omit<Report, "id" | "createdAt" | "status">): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values({
        ...report,
        status: "pending",
      })
      .returning();
    return newReport;
  }

  async updateReportStatus(reportId: number, status: string): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, reportId))
      .returning();
    return report;
  }

  async listReports(status?: string): Promise<Report[]> {
    let query = db.select().from(reports);
    if (status) {
      query = query.where(eq(reports.status, status));
    }
    return await query.orderBy(desc(reports.createdAt));
  }
}

export const storage = new DatabaseStorage();