import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
});

export const bubbles = sqliteTable("bubbles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  topic: text("topic").notNull(),
  reflects: integer("reflects").default(0),
  messageCount: integer("message_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bubbleId: integer("bubble_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bubbleId: integer("bubble_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
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
  topic: true,

});

export const insertMessageSchema = createInsertSchema(messages).pick({
  bubbleId: true,
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
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type User = typeof users.$inferSelect;
export type Bubble = typeof bubbles.$inferSelect;
export type Comment = typeof comments.$inferSelect;

export const follows = sqliteTable("follows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  followerId: integer("follower_id").notNull(),
  followedId: integer("followed_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'follow', 'like', 'comment'
  actorId: integer("actor_id").notNull(),
  bubbleId: integer("bubble_id"),
  read: integer("read").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followedId: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  actorId: true,
  bubbleId: true,
});

export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Follow = typeof follows.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type BubbleWithUser = Bubble & {
  user: Pick<User, 'username' | 'displayName' | 'avatarUrl'>;
};

export type NotificationWithDetails = Notification & {
  actor: Pick<User, 'username' | 'displayName' | 'avatarUrl'>;
  bubble?: Pick<Bubble, 'content'>;
};
