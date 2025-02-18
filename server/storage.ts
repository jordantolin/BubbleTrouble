import { User, InsertUser, Bubble, InsertBubble, Comment, InsertComment, BubbleWithUser, users, bubbles, comments, follows, notifications, messages, InsertMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

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
  getTrendingBubbles(): Promise<BubbleWithUser[]>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getBubbleComments(bubbleId: number): Promise<Comment[]>;

  // Follow operations
  createFollow(followerId: number, followedId: number): Promise<void>;
  removeFollow(followerId: number, followedId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  isFollowing(followerId: number, followedId: number): Promise<boolean>;

  // Message operations
  createMessage(message: InsertMessage): Promise<any>;
  getMessage(id: number): Promise<any>;
  getBubbleMessages(bubbleId: number): Promise<any[]>;

  // Notification operations
  createNotification(userId: number, type: string, actorId: number, bubbleId?: number): Promise<void>;
  getNotifications(userId: number): Promise<NotificationWithDetails[]>;
  markNotificationsAsRead(userId: number): Promise<void>;
  getUnreadNotificationCount(userId: number): Promise<number>;
}

export class SQLiteStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
      ttl: 86400000, // session TTL (24 hours)
      stale: false, // delete expired sessions immediately
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      displayName: insertUser.displayName ?? null,
      bio: insertUser.bio ?? null,
      avatarUrl: insertUser.avatarUrl ?? null,
    }).returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  async createBubble(insertBubble: InsertBubble): Promise<Bubble> {
    const result = await db.insert(bubbles)
      .values({
        userId: insertBubble.userId,
        content: insertBubble.content,
        hashtags: Array.isArray(insertBubble.hashtags) ? insertBubble.hashtags.join(',') : insertBubble.hashtags,
        mood: insertBubble.mood,
        likes: 0,
      })
      .returning();
    return result[0];
  }

  async getBubble(id: number): Promise<BubbleWithUser | undefined> {
    const result = await db
      .select({
        id: bubbles.id,
        userId: bubbles.userId,
        content: bubbles.content,
        createdAt: bubbles.createdAt,
        likes: bubbles.likes,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(bubbles)
      .where(eq(bubbles.id, id))
      .leftJoin(users, eq(bubbles.userId, users.id))
      .limit(1);
    return result[0];
  }

  async getBubbles(): Promise<BubbleWithUser[]> {
    return await db
      .select({
        id: bubbles.id,
        userId: bubbles.userId,
        content: bubbles.content,
        createdAt: bubbles.createdAt,
        likes: bubbles.likes,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(bubbles)
      .leftJoin(users, eq(bubbles.userId, users.id));
  }

  async getUserBubbles(userId: number): Promise<BubbleWithUser[]> {
    return await db
      .select({
        id: bubbles.id,
        userId: bubbles.userId,
        content: bubbles.content,
        createdAt: bubbles.createdAt,
        likes: bubbles.likes,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(bubbles)
      .leftJoin(users, eq(bubbles.userId, users.id))
      .where(eq(bubbles.userId, userId));
  }

  async likeBubble(id: number): Promise<void> {
    await db.update(bubbles)
      .set({ likes: sql`likes + 1` })
      .where(eq(bubbles.id, id));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments)
      .values({
        bubbleId: insertComment.bubbleId,
        userId: insertComment.userId,
        content: insertComment.content,
      })
      .returning();
    return result[0];
  }

  async getBubbleComments(bubbleId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.bubbleId, bubbleId));
  }

  async getTrendingBubbles(): Promise<BubbleWithUser[]> {
    const result = await db
      .select({
        id: bubbles.id,
        userId: bubbles.userId,
        content: bubbles.content,
        createdAt: bubbles.createdAt,
        likes: bubbles.likes,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
        commentCount: db
          .select({ count: sql`count(*)` })
          .from(comments)
          .where(eq(comments.bubbleId, bubbles.id))
          .as('commentCount')
      })
      .from(bubbles)
      .leftJoin(users, eq(bubbles.userId, users.id))
      .orderBy(sql`likes + commentCount desc`)
      .limit(10);

    return result;
  }

  async createFollow(followerId: number, followedId: number): Promise<void> {
    await db.insert(follows).values({
      followerId,
      followedId,
    });
    await this.createNotification(followedId, 'follow', followerId);
  }

  async removeFollow(followerId: number, followedId: number): Promise<void> {
    await db.delete(follows)
      .where(sql`follower_id = ${followerId} AND followed_id = ${followedId}`);
  }

  async getFollowers(userId: number): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .innerJoin(follows, eq(follows.followerId, users.id))
      .where(eq(follows.followedId, userId));
  }

  async getFollowing(userId: number): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .innerJoin(follows, eq(follows.followedId, users.id))
      .where(eq(follows.followerId, userId));
  }

  async isFollowing(followerId: number, followedId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(follows)
      .where(sql`follower_id = ${followerId} AND followed_id = ${followedId}`);
    return result.length > 0;
  }

  async createNotification(userId: number, type: string, actorId: number, bubbleId?: number): Promise<void> {
    await db.insert(notifications).values({
      userId,
      type,
      actorId,
      bubbleId: bubbleId || null,
      read: 0,
    });
  }

  async getNotifications(userId: number): Promise<NotificationWithDetails[]> {
    return await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        type: notifications.type,
        actorId: notifications.actorId,
        bubbleId: notifications.bubbleId,
        read: notifications.read,
        createdAt: notifications.createdAt,
        actor: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
        },
        bubble: {
          content: bubbles.content,
        },
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.actorId, users.id))
      .leftJoin(bubbles, eq(notifications.bubbleId, bubbles.id))
      .where(eq(notifications.userId, userId))
      .orderBy(sql`created_at desc`);
  }

  async markNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ read: 1 })
      .where(sql`user_id = ${userId} AND read = 0`);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(notifications)
      .where(sql`user_id = ${userId} AND read = 0`);
    return Number(result[0].count);
  }
}

export const storage = new SQLiteStorage();