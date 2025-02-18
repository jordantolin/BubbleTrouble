import React, { useState } from 'react';
import Bubble from './Bubble';
import ChatWindow from '../chat/ChatWindow';

const TOPICS = [
  'Technology', 'Art', 'Music', 'Gaming', 'Sports',
  'Food', 'Travel', 'Fashion', 'Movies', 'Books'
];

interface BubbleData {
  id: string;
  topic: string;
  content: string;
  reflects: number;
}

const BubbleUniverse: React.FC = () => {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [content, setContent] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const handleCreateBubble = () => {
    if (selectedTopic && content) {
      const newBubble: BubbleData = {
        id: Date.now().toString(),
        topic: selectedTopic,
        content,
        reflects: 0,
      };
      setBubbles(prev => [...prev, newBubble]);
      setIsCreating(false);
      setSelectedTopic('');
      setContent('');
    }
  };

  const handleReflect = (bubbleId: string) => {
    setBubbles(prev =>
      prev.map(bubble =>
        bubble.id === bubbleId
          ? { ...bubble, reflects: bubble.reflects + 1 }
          : bubble
      )
    );
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      {/* Create Bubble Button */}
      <button
        onClick={() => setIsCreating(true)}
        className="fixed bottom-8 right-8 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 z-50"
      >
        Create Bubble
      </button>

      {/* Create Bubble Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Create a New Bubble</h3>
            
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="">Select a Topic</option>
              {TOPICS.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-2 border rounded mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBubble}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                disabled={!selectedTopic || !content}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bubbles */}
      {bubbles.map(bubble => (
        <Bubble
          key={bubble.id}
          topic={bubble.topic}
          content={bubble.content}
          reflects={bubble.reflects}
          onReflect={() => handleReflect(bubble.id)}
          onClick={() => setActiveChatId(bubble.id)}
        />
      ))}

      {/* Chat Window */}
      {activeChatId && (
        <ChatWindow
          isOpen={true}
          onClose={() => setActiveChatId(null)}
          topic={bubbles.find(b => b.id === activeChatId)?.topic || ''}
        />
      )}
    </div>
  );
};

export default BubbleUniverse;
