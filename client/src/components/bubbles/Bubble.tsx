import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BubbleProps {
  topic: string;
  content: string;
  reflects: number;
  onReflect: () => void;
  onClick: () => void;
}

const Bubble: React.FC<BubbleProps> = ({ topic, content, reflects, onReflect, onClick }) => {
  const [position, setPosition] = useState({ x: Math.random() * window.innerWidth * 0.8, y: Math.random() * window.innerHeight * 0.8 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(100 + reflects * 2); // Base size + reflects bonus

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition(prev => ({
        x: prev.x + (Math.random() - 0.5) * 2,
        y: prev.y + (Math.random() - 0.5) * 2
      }));
    }, 2000);

    return () => clearInterval(moveInterval);
  }, []);

  const handleReflect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReflect();
    setSize(prev => prev + 2);
  };

  return (
    <motion.div
      ref={bubbleRef}
      className="absolute cursor-pointer"
      animate={{
        x: position.x,
        y: position.y,
        transition: { duration: 2, ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
    >
      <div 
        className="rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-1"
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full rounded-full bg-white/90 flex flex-col items-center justify-center p-2">
          <span className="text-sm font-bold text-purple-600">{topic}</span>
          <span className="text-xs text-gray-600 truncate">{content}</span>
          <button
            onClick={handleReflect}
            className="absolute bottom-2 right-2 text-xs bg-purple-500 text-white rounded-full p-1"
          >
            ✨ {reflects}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Bubble;
