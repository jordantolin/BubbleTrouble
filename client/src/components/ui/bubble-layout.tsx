import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BubbleLayoutProps {
  children: ReactNode;
}

export function BubbleLayout({ children }: BubbleLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 text-gray-800 overflow-hidden relative">
      {/* Decorative background bubbles */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-30"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0) 70%)',
            top: '10%',
            left: '20%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-20"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 235, 59, 0.15) 0%, rgba(255, 235, 59, 0) 70%)',
            bottom: '20%',
            right: '10%',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[60px] opacity-15"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 243, 176, 0.15) 0%, rgba(255, 243, 176, 0) 70%)',
            top: '60%',
            left: '60%',
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bubble particle effects */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-yellow-200/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%',
            }}
            animate={{
              y: [0, -window.innerHeight * 1.2],
              x: [0, (Math.random() - 0.5) * 100],
              scale: [1, 0],
              opacity: [0.2, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
