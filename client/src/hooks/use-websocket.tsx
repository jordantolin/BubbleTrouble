import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BubbleWithUser } from "@shared/schema";

type WebSocketMessage = {
  type: "new_bubble" | "bubble_liked" | "new_comment";
  bubble?: BubbleWithUser;
  comment?: Comment;
};

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketMessage;

      switch (message.type) {
        case "new_bubble":
          queryClient.setQueryData<BubbleWithUser[]>(
            ["/api/bubbles"],
            (old = []) => [message.bubble!, ...old]
          );
          break;
        case "bubble_liked":
          queryClient.setQueryData<BubbleWithUser[]>(
            ["/api/bubbles"],
            (old = []) =>
              old.map((b) =>
                b.id === message.bubble!.id ? message.bubble! : b
              )
          );
          break;
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [queryClient]);

  return { socket };
}
