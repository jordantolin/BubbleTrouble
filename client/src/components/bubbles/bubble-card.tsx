import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BubbleWithUser } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BubbleCardProps {
  bubble: BubbleWithUser;
}

export function BubbleCard({ bubble }: BubbleCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

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

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/bubble/${bubble.id}`);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const avatarFallback = bubble.user.displayName?.[0] || bubble.user.username[0];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "bubble-card relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all",
        "border border-yellow-100 hover:border-yellow-200",
        "p-4 mb-4"
      )}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 opacity-50" />
      
      <div className="flex items-start space-x-4">
        <motion.div whileHover={{ scale: 1.1 }}>
          <Avatar className="h-12 w-12 ring-2 ring-yellow-100 ring-offset-2">
            {bubble.user.avatarUrl && (
              <AvatarImage src={bubble.user.avatarUrl} alt={bubble.user.username} />
            )}
            <AvatarFallback className="bg-yellow-50 text-yellow-700">
              {avatarFallback.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">
                {bubble.user.displayName || bubble.user.username}
              </span>
              <span className="text-sm text-gray-500">@{bubble.user.username}</span>
              <span className="text-xs text-gray-400">
                • {format(new Date(bubble.createdAt), 'MMM d')}
              </span>
            </div>
            {bubble.isPinned && (
              <Sparkles className="h-4 w-4 text-yellow-500" />
            )}
          </div>

          <motion.p 
            className={cn(
              "text-gray-800 leading-relaxed",
              !isExpanded && bubble.content.length > 280 && "cursor-pointer"
            )}
            onClick={() => bubble.content.length > 280 && setIsExpanded(!isExpanded)}
          >
            {isExpanded ? bubble.content : 
             bubble.content.length > 280 ? `${bubble.content.slice(0, 280)}...` : bubble.content}
          </motion.p>
          <div className="mt-4 flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={!user || isLiking}
              className={cn(
                "flex items-center space-x-1 text-sm",
                "transition-colors duration-200",
                bubble.hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              )}
            >
              <Heart className={cn(
                "h-4 w-4",
                bubble.hasLiked && "fill-current"
              )} />
              <span>{bubble.likes}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{bubble.comments || 0}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500 transition-colors duration-200"
            >
              <Share2 className="h-4 w-4" />
              <AnimatePresence>
                {showShareTooltip && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded"
                  >
                    Copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}