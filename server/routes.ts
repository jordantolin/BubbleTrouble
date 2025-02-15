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

  return httpServer;
}