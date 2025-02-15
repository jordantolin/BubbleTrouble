import { BubbleFeed } from "@/components/bubbles/bubble-feed";
import { useWebSocket } from "@/hooks/use-websocket";

export default function HomePage() {
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <BubbleFeed />
    </div>
  );
}
