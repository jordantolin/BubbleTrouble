import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BubbleWithUser } from '@shared/schema';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Clock } from 'lucide-react';

interface BubbleDetailsProps {
  bubble: BubbleWithUser;
  onClose: () => void;
}

export function BubbleDetails({ bubble, onClose }: BubbleDetailsProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const created = new Date(bubble.createdAt);
      const duration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const elapsed = now.getTime() - created.getTime();
      const remaining = duration - elapsed;

      if (remaining <= 0) {
        setTimeLeft('Expired');
        setProgress(0);
        return;
      }

      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      setTimeLeft(`${hours}h ${minutes}m`);
      setProgress((remaining / duration) * 100);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [bubble.createdAt]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-lg overflow-hidden"
        layoutId={`bubble-${bubble.id}`}
      >
        {/* Bubble background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/90 to-yellow-50/90 backdrop-blur-xl rounded-[32px]" />

        {/* Time indicator ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(255, 215, 0, 0.2)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(255, 215, 0, 0.8)"
            strokeWidth="2"
            strokeDasharray={`${progress * 3.14}, 1000`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Content */}
        <div className="relative p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                {bubble.user.avatarUrl && (
                  <AvatarImage src={bubble.user.avatarUrl} alt={bubble.user.username} />
                )}
                <AvatarFallback>
                  {(bubble.user.displayName?.[0] || bubble.user.username[0]).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-yellow-900">
                  {bubble.user.displayName || bubble.user.username}
                </h3>
                <p className="text-sm text-yellow-700">@{bubble.user.username}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-yellow-900/50 hover:text-yellow-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="py-4">
            <p className="text-lg text-yellow-900">{bubble.content}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-yellow-700">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{timeLeft} left</span>
            </div>
            <Button variant="ghost" size="sm" className="text-yellow-700 hover:text-yellow-900">
              <MessageCircle className="h-4 w-4 mr-1" />
              Reply in private
            </Button>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-yellow-300/30"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: '100%',
                scale: 0
              }}
              animate={{
                y: '0%',
                scale: [0, 1, 0],
                x: `${Math.random() * 100}%`
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
