import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BubbleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isActive?: boolean;
}

export const BubbleButton = forwardRef<HTMLButtonElement, BubbleButtonProps>(
  ({ className, variant = 'default', size = 'default', isActive, ...props }, ref) => {
    const baseStyles = 'relative overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:opacity-50';
    
    const variants = {
      default: 'bg-yellow-400/90 hover:bg-yellow-500/90 text-yellow-900',
      outline: 'border-2 border-yellow-400/50 hover:border-yellow-400 text-yellow-400',
      ghost: 'hover:bg-yellow-400/20 text-yellow-400',
    };

    const sizes = {
      default: 'px-6 py-3 text-base rounded-full',
      sm: 'px-4 py-2 text-sm rounded-full',
      lg: 'px-8 py-4 text-lg rounded-full',
      icon: 'w-10 h-10 rounded-full flex items-center justify-center',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {props.children}
        
        {/* Bubble effect on hover */}
        <span className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full bg-yellow-400/20"
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{
                scale: 1.2,
                opacity: [0, 0.2, 0],
                transition: {
                  duration: 1,
                  delay: i * 0.2,
                  repeat: Infinity,
                },
              }}
            />
          ))}
        </span>

        {/* Active state glow */}
        {isActive && (
          <motion.span
            className="absolute inset-0 rounded-full bg-yellow-400/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>
    );
  }
);
