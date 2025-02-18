import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Smile, Image, Mic, Film, Gift } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { BubbleWithUser } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ChatModalProps {
  bubble: BubbleWithUser;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'gif';
  userId: number;
  createdAt: string;
  bubbleId: number;
  user?: {
    id: number;
    username: string;
    displayName: string;
  };
}

export function ChatModal({ bubble, onClose }: ChatModalProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['chat-messages', bubble.id],
    queryFn: async () => {
      const response = await fetch(`/api/bubbles/${bubble.id}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, type }: { content: string; type: ChatMessage['type'] }) => {
      const response = await fetch(`/api/bubbles/${bubble.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', bubble.id] });
      setMessage('');
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // WebSocket connection for real-time messages
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message' && data.bubbleId === bubble.id) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', bubble.id] });
      }
    };

    return () => {
      ws.close();
    };
  }, [bubble.id, queryClient]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxSize) {
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const type = file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 
                  file.type === 'image/gif' ? 'gif' : 'file';
      
      try {
        await sendMessageMutation.mutateAsync({ content, type });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to send media',
          variant: 'destructive'
        });
      }
    };
    reader.readAsDataURL(file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const type = file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 
                  file.type === 'image/gif' ? 'gif' : 'file';
      
      try {
        await sendMessageMutation.mutateAsync({ content, type });
        setMessage('');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to send media',
          variant: 'destructive'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          try {
            await sendMessageMutation.mutateAsync({ content, type: 'audio' });
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to send audio message',
              variant: 'destructive'
            });
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access microphone',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              {bubble.user?.displayName?.[0] || bubble.user?.username?.[0] || '?'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{bubble.user?.displayName || bubble.user?.username || 'Anonymous'}</h3>
              <p className="text-sm text-gray-500">
                {new Date(bubble.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Bubble Content */}
        <div className="p-4 bg-yellow-50/50 border-b">
          <p className="text-gray-700">{bubble.content}</p>
          {bubble.hashtags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {bubble.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm text-yellow-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.userId === bubble.userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.userId === bubble.userId
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p>{msg.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white/95">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 p-3 pr-12 resize-none outline-none min-h-[80px] max-h-[160px]"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                  <Image className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-yellow-500 text-white p-3 rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
