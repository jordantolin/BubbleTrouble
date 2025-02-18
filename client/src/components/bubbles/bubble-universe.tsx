import { BubbleWithUser } from '@shared/schema';
import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { MessageCircle, Sparkles, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateBubbleModal } from './create-bubble-modal';
import { ChatModal } from '../chat/chat-modal';

interface BubbleProps {
  bubble: BubbleWithUser;
  style: React.CSSProperties;
  onClick: () => void;
  onReflect: () => void;
  onHover: (id: number | null) => void;
  isHovered: boolean;
  reflectCount: number;
}

function Bubble({ bubble, style, onClick, onReflect, onHover, isHovered, reflectCount }: BubbleProps) {
  const userInitial = bubble.user?.displayName?.[0] || bubble.user?.username?.[0] || '?';
  const baseSize = 150 + (reflectCount * 10); // Bubble grows with reflects
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleReflect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReflect();
  };

  // Create smooth floating animation
  const x = useSpring(style.left as number, {
    stiffness: 10,
    damping: 20,
    mass: 2
  });

  const y = useSpring(style.top as number, {
    stiffness: 10,
    damping: 20,
    mass: 2
  });

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        ...style,
        width: baseSize,
        height: baseSize,
      }}
      animate={{
        x,
        y,
        scale: isHovered ? 1.1 : 1,
        zIndex: isHovered ? 10 : 1,
      }}
      onHoverStart={() => onHover(bubble.id)}
      onHoverEnd={() => onHover(null)}
      onClick={handleClick}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        mass: 1,
      }}
    >
      <div
        className="relative rounded-full p-4 flex items-center justify-center text-center transition-all duration-500 hover:duration-200 w-full h-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255, 236, 153, ${isHovered ? '0.95' : '0.85'}), rgba(255, 223, 0, ${isHovered ? '0.9' : '0.75'}))`,
          backdropFilter: 'blur(8px)',
          boxShadow: `
            0 8px 16px rgba(0,0,0,0.1),
            inset -2px -2px 8px rgba(0,0,0,0.05), 
            inset 2px 2px 8px rgba(255,255,255,0.5),
            ${isHovered ? '0 0 40px rgba(255, 223, 0, 0.5)' : ''}
          `,
          border: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        <div className="w-full h-full flex flex-col justify-center items-center gap-2 p-4">
          <div className="w-8 h-8 rounded-full bg-yellow-600/20 flex items-center justify-center text-yellow-800 font-medium mb-1">
            {userInitial}
          </div>
          <div className="text-yellow-900 font-medium text-sm line-clamp-2 text-center">
            {bubble.content}
          </div>
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 text-xs text-yellow-800 mt-1"
              >
                <button
                  onClick={handleReflect}
                  className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 px-2 py-1 rounded-full transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> {reflectCount}
                </button>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {bubble.messageCount || 0}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function getRandomPosition(containerSize: { width: number; height: number }, bubbleSize: number) {
  const padding = 100; // Keep bubbles away from edges
  const maxX = containerSize.width - bubbleSize - padding * 2;
  const maxY = containerSize.height - bubbleSize - padding * 2;
  return {
    left: Math.max(padding, Math.floor(Math.random() * maxX) + padding),
    top: Math.max(padding, Math.floor(Math.random() * maxY) + padding),
    scale: 0.8 + Math.random() * 0.4,
    rotation: Math.random() * 30 - 15,
    floatX: Math.random() * 2 - 1,
    floatY: Math.random() * 2 - 1,
  };
}

export function BubbleUniverse({ 
  bubbles,
  onBubbleClick
}: {
  bubbles: BubbleWithUser[],
  onBubbleClick: (bubble: BubbleWithUser) => void
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'latest' | 'popular'>('latest');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [bubblePositions, setBubblePositions] = useState<React.CSSProperties[]>([]);
  const [hoveredBubble, setHoveredBubble] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);


  const updatePositions = useCallback(() => {
    const container = document.getElementById('bubble-container');
    if (container) {
      const { width, height } = container.getBoundingClientRect();
      setContainerSize({ width, height });
      const newPositions = bubbles.map(() => 
        getRandomPosition({ width, height }, 120)
      );
      setBubblePositions(newPositions);
    }
  }, [bubbles]);

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [updatePositions]);

  const filteredBubbles = bubbles
    .filter(bubble => 
      bubble.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (selectedFilter === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return b.likes - a.likes;
    });

  return (
    <div className="w-full h-screen bg-gradient-to-br from-yellow-100 via-yellow-50 to-white p-8 relative">
      {/* Search and Filters */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bubbles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full bg-white/80 hover:bg-white focus:bg-white backdrop-blur-sm border border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition-all w-64"
          />
          <Search className="w-4 h-4 text-yellow-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-yellow-600 hover:text-yellow-500"
        >
          <Filter className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => setSelectedFilter('latest')}
                className={`px-4 py-2 rounded-full transition-colors ${selectedFilter === 'latest' ? 'bg-yellow-500 text-white' : 'bg-white/80 text-yellow-600'}`}
              >
                Latest
              </button>
              <button
                onClick={() => setSelectedFilter('popular')}
                className={`px-4 py-2 rounded-full transition-colors ${selectedFilter === 'popular' ? 'bg-yellow-500 text-white' : 'bg-white/80 text-yellow-600'}`}
              >
                Popular
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Bubble Container */}
      <div 
        id="bubble-container"
        className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm shadow-2xl border border-white/50"
      >
        <AnimatePresence>
          {filteredBubbles.map((bubble, i) => (
            <Bubble
              key={bubble.id}
              bubble={bubble}
              style={bubblePositions[i] || {}}
              onClick={() => onBubbleClick(bubble)}
              onHover={setHoveredBubble}
              isHovered={hoveredBubble === bubble.id}
              onReflect={() => {}}
              reflectCount={bubble.reflects || 0}
            />
          ))}
        </AnimatePresence>
      </div>


    </div>
  );
}

