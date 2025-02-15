import { useState } from "react";
import { motion } from "framer-motion";
import { BubbleWithUser } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BubbleCardProps {
  bubble: BubbleWithUser;
}

export function BubbleCard({ bubble }: BubbleCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      await apiRequest("POST", `/api/bubbles/${bubble.id}/like`);
      queryClient.invalidateQueries({ queryKey: ["/api/bubbles"] });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bubble-card p-4 mb-4"
    >
      <div className="flex items-start space-x-3">
        <Avatar>
          <AvatarImage src={bubble.user.avatarUrl} />
          <AvatarFallback>{bubble.user.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{bubble.user.displayName}</span>
            <span className="text-sm text-gray-500">@{bubble.user.username}</span>
          </div>
          <p className="mt-2">{bubble.content}</p>
          <div className="mt-3 flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className="hover:text-pink-500 transition-colors"
            >
              <Heart className="h-4 w-4 mr-1" />
              {bubble.likes}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
