import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
});

export const bubbles = pgTable("bubbles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  likes: integer("likes").default(0),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  bubbleId: integer("bubble_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
});

export const insertBubbleSchema = createInsertSchema(bubbles).pick({
  userId: true,
  content: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  bubbleId: true,
  userId: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBubble = z.infer<typeof insertBubbleSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type User = typeof users.$inferSelect;
export type Bubble = typeof bubbles.$inferSelect;
export type Comment = typeof comments.$inferSelect;

export type BubbleWithUser = Bubble & {
  user: Pick<User, 'username' | 'displayName' | 'avatarUrl'>;
};
