import { WebSocket } from "ws";
import { BubbleWithUser } from "@shared/schema";

type WebSocketMessage = {
  type: "new_bubble" | "bubble_liked" | "new_comment";
  bubble?: BubbleWithUser;
  comment?: Comment;
};

export function handleWebSocket(ws: WebSocket) {
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      // Handle different message types if needed
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });
}
