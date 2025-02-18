import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBubbleSchema, insertCommentSchema } from "@shared/schema";
import { handleWebSocket } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Store WSS globally for broadcasting
  (global as any).wss = wss;

  wss.on("connection", (ws, request) => {
    console.log("WebSocket client connected");
    handleWebSocket(ws, request);
  });

  // Bubble routes
  app.get("/api/bubbles", async (req, res) => {
    const bubbles = await storage.getBubbles();
    res.json(bubbles);
  });

  // Chat Messages
  app.get("/api/bubbles/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getBubbleMessages(parseInt(req.params.id));
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post("/api/bubbles/:id/messages", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    try {
      const message = await storage.createMessage({
        bubbleId: parseInt(req.params.id),
        userId: req.user.id,
        content: content.trim(),
      });

      const messageWithUser = await storage.getMessage(message.id);

      // Notify connected clients about new message
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ 
            type: "new_message", 
            bubbleId: req.params.id,
            message: messageWithUser 
          }));
        }
      });

      res.json(messageWithUser);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  });

  app.post("/api/bubbles", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const parseResult = insertBubbleSchema.safeParse({
      ...req.body,
      userId: req.user.id,
    });

    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const bubble = await storage.createBubble(parseResult.data);
    const bubbleWithUser = await storage.getBubble(bubble.id);

    // Notify all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "new_bubble", bubble: bubbleWithUser }));
      }
    });

    res.status(201).json(bubbleWithUser);
  });

  app.post("/api/bubbles/:id/like", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const bubbleId = parseInt(req.params.id);
    await storage.likeBubble(bubbleId);
    const bubble = await storage.getBubble(bubbleId);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "bubble_liked", bubble }));
      }
    });

    res.json(bubble);
  });

  app.post("/api/bubbles/:id/comments", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const parseResult = insertCommentSchema.safeParse({
      ...req.body,
      bubbleId: parseInt(req.params.id),
      userId: req.user.id,
    });

    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const comment = await storage.createComment(parseResult.data);
    res.status(201).json(comment);
  });

  app.get("/api/bubbles/:id/comments", async (req, res) => {
    const comments = await storage.getBubbleComments(parseInt(req.params.id));
    res.json(comments);
  });

  // User bubbles route
  app.get("/api/users/:id/bubbles", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const bubbles = await storage.getUserBubbles(parseInt(req.params.id));
    res.json(bubbles);
  });

  // Follow routes
  app.post("/api/users/:id/follow", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const followedId = parseInt(req.params.id);
    await storage.createFollow(req.user.id, followedId);
    res.sendStatus(201);
  });

  app.delete("/api/users/:id/follow", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const followedId = parseInt(req.params.id);
    await storage.removeFollow(req.user.id, followedId);
    res.sendStatus(204);
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const followers = await storage.getFollowers(parseInt(req.params.id));
    res.json(followers);
  });

  app.get("/api/users/:id/following", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const following = await storage.getFollowing(parseInt(req.params.id));
    res.json(following);
  });

  app.get("/api/users/:id/is-following", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const isFollowing = await storage.isFollowing(req.user.id, parseInt(req.params.id));
    res.json({ isFollowing });
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const notifications = await storage.getNotifications(req.user.id);
    res.json(notifications);
  });

  app.post("/api/notifications/mark-read", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    await storage.markNotificationsAsRead(req.user.id);
    res.sendStatus(204);
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const count = await storage.getUnreadNotificationCount(req.user.id);
    res.json({ count });
  });

  // Trending route
  app.get("/api/bubbles/trending", async (req, res) => {
    const bubbles = await storage.getTrendingBubbles();
    res.json(bubbles);
  });

  return httpServer;
}