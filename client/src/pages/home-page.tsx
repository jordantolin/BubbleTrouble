import { useState } from "react";
import { motion } from "framer-motion";
import { BubbleLayout } from "@/components/ui/bubble-layout";
import { BubbleButton } from "@/components/ui/bubble-button";
import { BubbleUniverse } from "@/components/bubbles/bubble-universe";
import { ChatModal } from "@/components/chat/chat-modal";
import { CreateBubbleModal } from "@/components/bubbles/create-bubble-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";
import { BubbleWithUser } from "@shared/schema";
import { Plus, Settings } from "lucide-react";

export default function HomePage() {
  // Initialize WebSocket connection
  useWebSocket();
  const [selectedBubble, setSelectedBubble] = useState<BubbleWithUser | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: bubbles, isLoading, error } = useQuery<BubbleWithUser[]>({
    queryKey: ["/api/bubbles"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  return (
    <BubbleLayout>
      {/* Header */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-4">
        <div className="text-yellow-400/80 text-sm">
          {bubbles?.length || 0} bubbles floating
        </div>
        <BubbleButton
          variant="ghost"
          size="icon"
          className="text-yellow-400/80 hover:text-yellow-400"
        >
          <Settings className="h-4 w-4" />
        </BubbleButton>
      </div>

      {/* Create Bubble Button */}
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-white px-8 py-4 rounded-full font-medium shadow-[0_0_20px_rgba(253,224,71,0.3)] hover:shadow-[0_0_25px_rgba(253,224,71,0.5)] transition-all duration-300 text-lg backdrop-blur-sm"
        >
          Share your thoughts...
        </button>
      </motion.div>

      {/* Main Content */}
      <main className="h-screen relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-yellow-600">
            Failed to load bubbles. Please try again.
          </div>
        ) : (
          <BubbleUniverse
            bubbles={bubbles || []}
            onBubbleClick={(bubble) => setSelectedBubble(bubble)}
          />
        )}
      </main>

      {/* Chat Modal */}
      {selectedBubble && (
        <ChatModal
          bubble={selectedBubble}
          onClose={() => setSelectedBubble(null)}
        />
      )}

      {/* Create Bubble Modal */}
      <CreateBubbleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Tutorial Hint */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/10 backdrop-blur-md text-yellow-600 px-6 py-3 rounded-full text-sm border border-yellow-300/20 shadow-lg"
      >
        ✨ Click bubbles to chat, drag to explore
      </motion.div>
    </BubbleLayout>
  );
}
