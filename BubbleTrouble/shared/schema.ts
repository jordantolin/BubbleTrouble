
export const messageSchema = z.object({
  content: z.string().min(1),
  receiverId: z.number(),
});

export type Message = z.infer<typeof messageSchema>;

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  preferences: jsonb("preferences").default({
    theme: "light",
    notifications: true,
    privacy: "public"
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bubbles = pgTable("bubbles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  creatorId: integer("creator_id").notNull(),
  coverImage: text("cover_image"),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bubbleMembers = pgTable("bubble_members", {
  id: serial("id").primaryKey(),
  bubbleId: integer("bubble_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").default("member").notNull(), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  bubbleId: integer("bubble_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  mediaUrls: jsonb("media_urls").default([]).notNull(),
  mediaType: text("media_type"), // image, video, mixed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  mediaUrl: text("media_url"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull(),
  targetType: text("target_type").notNull(), // post, user, bubble
  targetId: integer("target_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending").notNull(), // pending, reviewed, resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export schemas for form validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
});

export const insertBubbleSchema = createInsertSchema(bubbles).pick({
  name: true,
  description: true,
  isPrivate: true,
  coverImage: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  content: true,
  bubbleId: true,
  isAnonymous: true,
  mediaUrls: true,
  mediaType: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  receiverId: true,
  mediaUrl: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  targetType: true,
  targetId: true,
  reason: true,
});

// Export types for TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Bubble = typeof bubbles.$inferSelect;
export type BubbleMember = typeof bubbleMembers.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Report = typeof reports.$inferSelect;