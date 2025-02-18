import { WebSocket } from "ws";
import { BubbleWithUser } from "@shared/schema";
import type { IncomingMessage } from "http";
import { parse } from "cookie";
import session from "express-session";
import { storage } from "./storage";

type WebSocketMessage = {
  type: "new_bubble" | "bubble_liked" | "new_comment" | "new_message";
  bubble?: BubbleWithUser;
  comment?: Comment;
  message?: any;
  bubbleId?: number;
};

export function handleWebSocket(ws: WebSocket, request: IncomingMessage) {
  // Parse session from the websocket request
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) {
    ws.close(1008, "No session found");
    return;
  }

  const cookies = parse(cookieHeader);
  const sessionID = cookies["connect.sid"];
  if (!sessionID) {
    ws.close(1008, "No session found");
    return;
  }

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      // Handle different message types
      switch (message.type) {
        case "new_bubble":
          // Broadcast to all clients
          if (message.bubble) {
            broadcast({ type: "new_bubble", bubble: message.bubble });
          }
          break;
        case "bubble_liked":
          if (message.bubble) {
            broadcast({ type: "bubble_liked", bubble: message.bubble });
          }
          break;
        case "new_message":
          if (message.message && message.bubbleId) {
            broadcast({ 
              type: "new_message", 
              message: message.message,
              bubbleId: message.bubbleId 
            });
          }
          break;
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
}

function broadcast(message: WebSocketMessage) {
  (global as any).wss?.clients?.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}