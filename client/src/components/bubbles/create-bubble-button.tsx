import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send, Hash, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useClickAway } from 'react-use';

interface CreateBubbleButtonProps {
  onSuccess?: () => void;
}

export function CreateBubbleButton({ onSuccess }: CreateBubbleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('neutral');
  
  const modalRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  useClickAway(modalRef, () => {
    if (isOpen && !content.trim() && hashtags.length === 0) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const createBubbleMutation = useMutation({
    mutationFn: async (data: { content: string; hashtags: string[]; mood: string }) => {
      setIsProcessing(true);
      const response = await fetch('/api/bubbles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create bubble');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bubbles'] });
      setContent('');
      setIsOpen(false);
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (content.trim()) {
      createBubbleMutation.mutate({
        content: content.trim(),
        hashtags,
        mood
      });
    }
  };

  const handleHashtagSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentHashtag.trim()) {
      e.preventDefault();
      if (!hashtags.includes(currentHashtag.trim())) {
        setHashtags([...hashtags, currentHashtag.trim()]);
      }
      setCurrentHashtag('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col gap-4 min-w-[400px] border border-yellow-200/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-yellow-800">Create Bubble</h3>
                <div className="flex gap-2">
                  {['happy', 'neutral', 'sad'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m as 'happy' | 'neutral' | 'sad')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${mood === m ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      {m === 'happy' ? '😊' : m === 'neutral' ? '😐' : '😔'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-yellow-500 hover:text-yellow-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What's on your mind?"
                className="w-full h-32 p-4 rounded-xl bg-yellow-50/50 border border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 resize-none outline-none transition-all text-gray-700 placeholder-gray-400"
                maxLength={280}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className={`text-xs ${content.length >= 250 ? 'text-red-500' : 'text-yellow-600'}`}>
                  {content.length}/280
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-yellow-500" />
                <input
                  type="text"
                  value={currentHashtag}
                  onChange={(e) => setCurrentHashtag(e.target.value.replace(/\s+/g, ''))}
                  onKeyPress={handleHashtagSubmit}
                  placeholder="Add hashtags"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
              
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        className="hover:text-yellow-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-yellow-600 hover:bg-yellow-100 transition-colors">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-yellow-600 hover:bg-yellow-100 transition-colors">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!content.trim() || createBubbleMutation.isPending}
                className="bg-yellow-500 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
              >
                {createBubbleMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Share Bubble</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow ${
          isOpen ? 'bg-yellow-600' : ''
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
