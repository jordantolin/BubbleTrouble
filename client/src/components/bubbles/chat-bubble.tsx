import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BubbleWithUser } from '@shared/schema';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface ChatBubbleProps {
  bubble: BubbleWithUser;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  userId: number;
  isWhisper?: boolean;
}

export function ChatBubble({ bubble, onClose }: ChatBubbleProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isWhispering, setIsWhispering] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    const message: Message = {
      id: Math.random().toString(),
      content: newMessage,
      userId: user.id,
      isWhisper: isWhispering,
    };

    // Animate the message as a particle
    const particle = document.createElement('div');
    particle.className = 'absolute w-3 h-3 bg-yellow-300 rounded-full';
    if (containerRef.current) {
      containerRef.current.appendChild(particle);
      
      // Random arc animation
      const startX = 20;
      const startY = containerRef.current.clientHeight - 60;
      const endX = containerRef.current.clientWidth / 2;
      const endY = containerRef.current.clientHeight / 2;
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      particle.animate([
        { transform: `translate(0, 0)` },
        { transform: `translate(${endX - startX}px, ${endY - startY}px)` }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }).onfinish = () => particle.remove();
    }

    setMessages([...messages, message]);
    setNewMessage('');
    setIsWhispering(false);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        className="relative bg-gradient-to-br from-yellow-100/90 to-yellow-50/90 rounded-full w-[600px] h-[600px] backdrop-blur-xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-yellow-900/50 hover:text-yellow-900"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center space-x-2">
          <Avatar>
            {bubble.user.avatarUrl && (
              <AvatarImage src={bubble.user.avatarUrl} alt={bubble.user.username} />
            )}
            <AvatarFallback>
              {(bubble.user.displayName?.[0] || bubble.user.username[0]).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-yellow-900">
            <div className="font-medium">{bubble.user.displayName || bubble.user.username}</div>
            <div className="text-sm opacity-70">@{bubble.user.username}</div>
          </div>
        </div>

        <div className="absolute inset-0 pt-24 pb-20 px-8 overflow-auto">
          <div className="space-y-4">
            <div className="text-yellow-900/90 text-center pb-4">{bubble.content}</div>
            
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] px-4 py-2 rounded-2xl
                    ${message.isWhisper 
                      ? 'bg-yellow-300/20 text-yellow-900/70' 
                      : message.userId === user?.id
                        ? 'bg-yellow-400/90 text-yellow-900'
                        : 'bg-yellow-100/90 text-yellow-900'
                    }
                  `}
                >
                  {message.content}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-yellow-100/90 to-transparent">
          <div className="flex space-x-2">
            <Button
              variant={isWhispering ? "default" : "outline"}
              size="icon"
              onClick={() => setIsWhispering(!isWhispering)}
              className="shrink-0"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isWhispering ? "Send a whisper..." : "Send a message..."}
              className="bg-white/50 border-yellow-200 focus:border-yellow-400 placeholder:text-yellow-900/50"
            />
            <Button
              variant="default"
              size="icon"
              onClick={handleSendMessage}
              className="shrink-0"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
