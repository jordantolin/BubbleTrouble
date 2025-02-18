import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BubbleWithUser } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface FloatingBubbleProps {
  bubble: BubbleWithUser;
  position: { x: number; y: number };
  onClose: () => void;
}

function FloatingBubble({ bubble, position, onClose }: FloatingBubbleProps) {
  const avatarFallback = bubble.user.displayName?.[0] || bubble.user.username[0];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
      className="bg-yellow-100 rounded-2xl p-4 shadow-lg min-w-[300px] max-w-[400px] z-10"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <Avatar>
            {bubble.user.avatarUrl && (
              <AvatarImage src={bubble.user.avatarUrl} alt={bubble.user.username} />
            )}
            <AvatarFallback>{avatarFallback.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-yellow-900">
              {bubble.user.displayName || bubble.user.username}
            </div>
            <div className="text-sm text-yellow-700">@{bubble.user.username}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-yellow-700 hover:text-yellow-900"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-yellow-900 mt-2">{bubble.content}</div>
    </motion.div>
  );
}

export function BubbleMap() {
  const { data: bubbles } = useQuery<BubbleWithUser[]>({
    queryKey: ["/api/bubbles"],
  });
  const [selectedBubble, setSelectedBubble] = useState<{
    bubble: BubbleWithUser;
    position: { x: number; y: number };
  } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (selectedBubble && mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        if (
          selectedBubble.position.x > rect.width ||
          selectedBubble.position.y > rect.height
        ) {
          setSelectedBubble(null);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedBubble]);

  const handleMapClick = (e: React.MouseEvent) => {
    if (!mapRef.current || !bubbles || bubbles.length === 0) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Randomly select a bubble to display
    const randomBubble = bubbles[Math.floor(Math.random() * bubbles.length)];
    setSelectedBubble({
      bubble: randomBubble,
      position: { x, y },
    });
  };

  return (
    <div
      ref={mapRef}
      onClick={handleMapClick}
      className="relative w-full h-[calc(100vh-4rem)] bg-gradient-to-br from-yellow-50 via-white to-yellow-50 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        {/* Decorative background bubbles */}
        <div className="absolute w-40 h-40 bg-yellow-100/30 rounded-full blur-xl top-1/4 left-1/4 animate-float" />
        <div className="absolute w-32 h-32 bg-yellow-100/30 rounded-full blur-xl bottom-1/3 right-1/3 animate-float-delayed" />
        <div className="absolute w-24 h-24 bg-yellow-100/30 rounded-full blur-xl top-1/3 right-1/4 animate-float-slow" />
      </div>

      <AnimatePresence>
        {selectedBubble && (
          <FloatingBubble
            bubble={selectedBubble.bubble}
            position={selectedBubble.position}
            onClose={() => setSelectedBubble(null)}
          />
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-yellow-700 text-sm bg-white/80 px-4 py-2 rounded-full shadow-sm">
        Click anywhere on the map to float a bubble
      </div>
    </div>
  );
}
