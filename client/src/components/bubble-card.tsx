import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BubbleWithUser } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Users, Heart } from "lucide-react";
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface BubbleCardProps {
  bubble: BubbleWithUser;
  onLike?: (id: number) => void;
}

export default function BubbleCard({ bubble, onLike }: BubbleCardProps) {
  const { data: commentCount = 0, isLoading } = useQuery<number>({
    queryKey: [`/api/bubbles/${bubble.id}/comment-count`],
    queryFn: async () => {
      const response = await fetch(`/api/bubbles/${bubble.id}/comment-count`);
      if (!response.ok) throw new Error('Failed to fetch comment count');
      return response.json();
    },
  });

  return (
    <Link href={`/bubble/${bubble.id}`}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-yellow-100 via-yellow-50 to-white backdrop-blur cursor-pointer border border-yellow-200">
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-yellow-900">{bubble.content}</h3>
              <p className="text-sm text-yellow-600">
                by {bubble.user.displayName || bubble.user.username} • {formatDistanceToNow(new Date(bubble.createdAt), { addSuffix: true })}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-yellow-700">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  onLike?.(bubble.id);
                }}
                className="flex items-center gap-1 hover:text-yellow-500 transition-colors"
              >
                <Heart 
                  className="h-4 w-4" 
                  fill={bubble.likes > 0 ? 'currentColor' : 'none'} 
                  color={bubble.likes > 0 ? '#eab308' : 'currentColor'} 
                />
                <span>{bubble.likes} likes</span>
              </button>
              <div className="flex items-center gap-1">
                <MessageCircle className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
                <span>{isLoading ? '...' : `${commentCount} comments`}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}