import { User, InsertUser, Bubble, InsertBubble, Comment, InsertComment, BubbleWithUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getBubbleComments(bubbleId: number): Promise<Comment[]>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private bubbles: Map<number, Bubble>;
  private comments: Map<number, Comment>;
  private currentId: { user: number; bubble: number; comment: number };

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.users = new Map();
    this.bubbles = new Map();
    this.comments = new Map();
    this.currentId = { user: 1, bubble: 1, comment: 1 };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const user: User = {
      id,
      ...insertUser,
      displayName: insertUser.displayName ?? null,
      bio: insertUser.bio ?? null,
      avatarUrl: insertUser.avatarUrl ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createBubble(insertBubble: InsertBubble): Promise<Bubble> {
    const id = this.currentId.bubble++;
    const bubble: Bubble = {
      id,
      ...insertBubble,
      createdAt: new Date(),
      likes: 0,
    };
    this.bubbles.set(id, bubble);
    return bubble;
  }

  async getBubble(id: number): Promise<BubbleWithUser | undefined> {
    const bubble = this.bubbles.get(id);
    if (!bubble) return undefined;
    const user = await this.getUser(bubble.userId);
    if (!user) return undefined;
    return {
      ...bubble,
      user: {
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getBubbles(): Promise<BubbleWithUser[]> {
    const bubbles = Array.from(this.bubbles.values());
    return Promise.all(
      bubbles.map(async (bubble) => {
        const user = await this.getUser(bubble.userId);
        if (!user) throw new Error("User not found");
        return {
          ...bubble,
          user: {
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
          },
        };
      })
    );
  }

  async getUserBubbles(userId: number): Promise<BubbleWithUser[]> {
    const bubbles = Array.from(this.bubbles.values()).filter(
      (bubble) => bubble.userId === userId
    );
    const user = await this.getUser(userId);
    if (!user) return [];
    return bubbles.map((bubble) => ({
      ...bubble,
      user: {
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    }));
  }

  async likeBubble(id: number): Promise<void> {
    const bubble = this.bubbles.get(id);
    if (!bubble) throw new Error("Bubble not found");
    bubble.likes = (bubble.likes || 0) + 1;
    this.bubbles.set(id, bubble);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentId.comment++;
    const comment: Comment = {
      id,
      ...insertComment,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getBubbleComments(bubbleId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.bubbleId === bubbleId
    );
  }
}

export const storage = new MemStorage();