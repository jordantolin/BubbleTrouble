import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBubbleSchema, insertPostSchema, insertMessageSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Bubbles
  app.post("/api/bubbles", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertBubbleSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error);
    
    const bubble = await storage.createBubble({
      ...result.data,
      creatorId: req.user.id,
    });
    res.status(201).json(bubble);
  });

  app.get("/api/bubbles", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const bubbles = await storage.listBubbles();
    res.json(bubbles);
  });

  app.get("/api/bubbles/trending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const bubbles = await storage.listBubbles();
    // Sort by member count for trending
    bubbles.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
    res.json(bubbles.slice(0, 5));
  });

  app.get("/api/bubbles/discover", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const bubbles = await storage.listBubbles();
    // Randomize for discover
    bubbles.sort(() => Math.random() - 0.5);
    res.json(bubbles.slice(0, 5));
  });

  app.get("/api/posts/explore", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const allPosts = await storage.listPosts();
    const now = new Date();
    const validPosts = allPosts.filter(post => new Date(post.expiresAt) > now);
    // Sort by newest first
    validPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(validPosts);
  });

  app.get("/api/posts/trending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const allPosts = await storage.listPosts();
    const now = new Date();
    const validPosts = allPosts.filter(post => new Date(post.expiresAt) > now);
    // Sort by likes for trending
    validPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    res.json(validPosts);
  });

  // Posts
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error);
    
    const expiryHours = Math.floor(Math.random() * 23) + 1; // 1-24 hours
    const post = await storage.createPost({
      ...result.data,
      authorId: req.user.id,
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
    });
    res.status(201).json(post);
  });

  app.get("/api/bubbles/:bubbleId/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const bubbleId = parseInt(req.params.bubbleId);
    if (isNaN(bubbleId)) return res.sendStatus(400);
    
    const posts = await storage.listBubblePosts(bubbleId);
    const now = new Date();
    const validPosts = posts.filter(post => new Date(post.expiresAt) > now);
    res.json(validPosts);
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error);
    
    const message = await storage.createMessage({
      ...result.data,
      senderId: req.user.id,
    });
    res.status(201).json(message);
  });

  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.listUserMessages(req.user.id);
    res.json(messages);
  });

  const httpServer = createServer(app);
  return httpServer;
}
