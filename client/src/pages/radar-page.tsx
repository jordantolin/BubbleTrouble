import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BubbleWithUser } from '@shared/schema';
import { BubbleGrid } from '@/components/3d/bubble-grid';
import { ChatBubble } from '@/components/bubbles/chat-bubble';
import { Button } from '@/components/ui/button';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RadarPage() {
  const { data: bubbles } = useQuery<BubbleWithUser[]>({
    queryKey: ['/api/bubbles'],
  });
  
  const [selectedBubble, setSelectedBubble] = useState<BubbleWithUser | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#1A1A1A] text-[#E0E0E0]">
      {/* Accessibility Controls */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReducedMotion(!reducedMotion)}
          className="bg-black/20 hover:bg-black/40 text-white"
        >
          {reducedMotion ? (
            <EyeOff className="h-4 w-4 mr-2" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          {reducedMotion ? 'Reduced Motion' : 'Full Motion'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="bg-black/20 hover:bg-black/40 text-white"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Level Progress */}
      <motion.div 
        className="fixed top-4 left-4 z-50 bg-black/20 backdrop-blur-sm rounded-full p-2 pr-4 flex items-center space-x-2"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 overflow-hidden">
          <div 
            className="absolute inset-0 bg-[#FFD700]"
            style={{
              transform: `translateY(${100 - 75}%)`,
              transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
            75
          </div>
        </div>
        <div className="text-sm font-medium">Bubble Level</div>
      </motion.div>

      {/* Main 3D Bubble Grid */}
      <div className={reducedMotion ? 'filter saturate-50 brightness-75' : ''}>
        <BubbleGrid
          bubbles={bubbles || []}
          onBubbleClick={(bubble) => setSelectedBubble(bubble)}
        />
      </div>

      {/* Chat Bubble Modal */}
      <AnimatePresence>
        {selectedBubble && (
          <ChatBubble
            bubble={selectedBubble}
            onClose={() => setSelectedBubble(null)}
          />
        )}
      </AnimatePresence>

      {/* Tutorial Hint */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-sm text-white/70 px-4 py-2 rounded-full text-sm"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1 }}
      >
        Click on bubbles to join conversations
      </motion.div>
    </div>
  );
}
