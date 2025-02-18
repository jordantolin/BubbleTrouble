import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import { Select } from '@/components/ui/select';

const TOPICS = [
  { id: 'tech', label: 'Technology', icon: '💻' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'health', label: 'Health', icon: '❤️' }
];

interface CreateBubbleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBubbleModal({ isOpen, onClose }: CreateBubbleModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);
    return () => ws.close();
  }, []);

  const createBubbleMutation = useMutation({
    mutationFn: async (data: { content: string; topic: string }) => {
      const response = await fetch('/api/bubbles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: user?.id,
          reflects: 0
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create bubble');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bubbles'] });
      setContent('');
      setHashtags([]);
      setCurrentHashtag('');
      setMood('neutral');
      onClose();
      toast({
        title: 'Success!',
        description: 'Your bubble is now floating in the universe',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create bubble',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    if (!user || !content.trim() || !topic || createBubbleMutation.isPending) return;

    createBubbleMutation.mutate({
      content,
      topic
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg rounded-[32px] bg-gradient-to-br from-yellow-100/90 to-yellow-50/90 backdrop-blur-xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-yellow-900/50 hover:text-yellow-900"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-yellow-900 mb-2">
                  Create a Bubble
                </h2>
                <p className="text-yellow-700">
                  Share your thoughts that will float away after {duration} hours
                </p>
              </div>

              <div className="space-y-4">
                {/* Topic Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {[
                    'Technology', 'Art', 'Music', 'Sports', 'Food',
                    'Travel', 'Movies', 'Books', 'Science', 'Gaming',
                    'Fashion', 'Health', 'Nature', 'Politics', 'Business'
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setContent((prev) => prev ? `${prev}\n#${topic}` : `#${topic}`);
                        setHashtags((prev) => [...new Set([...prev, topic])]);
                      }}
                      className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm hover:bg-yellow-200 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind? Click a topic above to get started!"
                  className="w-full h-32 px-4 py-3 rounded-2xl bg-white/50 border border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 text-yellow-900 placeholder:text-yellow-600/50 transition-all duration-300 resize-none"
                />

                <div className="flex items-center space-x-2">

                  <div className="flex-1 relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-600/50" />
                    <Input
                      placeholder="Add hashtags (press Enter)"
                      className="pl-10 bubble-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim();
                          if (value && !hashtags.includes(value)) {
                            setHashtags([...hashtags, value]);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-900 text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-700" />
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="flex-1 h-2 bg-yellow-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-500"
                  />
                  <span className="text-sm text-yellow-700 min-w-[4ch]">
                    {duration}h
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white/90 rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Float Bubble
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
