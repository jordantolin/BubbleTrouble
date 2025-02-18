import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'gif';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, topic }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSendMessage = (content: string, type: Message['type'] = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const type = file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 'file';
      handleSendMessage(content, type);
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current);
        const reader = new FileReader();
        reader.onload = (e) => {
          handleSendMessage(e.target?.result as string, 'audio');
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="bg-white rounded-lg w-96 h-[600px] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{topic}</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  {message.type === 'text' && (
                    <div className="bg-purple-100 p-2 rounded-lg max-w-[80%] self-end">
                      {message.content}
                    </div>
                  )}
                  {message.type === 'image' && (
                    <img src={message.content} alt="Shared" className="max-w-[80%] rounded-lg self-end" />
                  )}
                  {message.type === 'video' && (
                    <video src={message.content} controls className="max-w-[80%] rounded-lg self-end" />
                  )}
                  {message.type === 'audio' && (
                    <audio src={message.content} controls className="max-w-[80%] self-end" />
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                  className="flex-1 border rounded-full px-4 py-2"
                  placeholder="Type a message..."
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-full"
                >
                  📎
                </button>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-full ${isRecording ? 'text-red-600' : 'text-purple-600'} hover:bg-purple-100`}
                >
                  🎤
                </button>
                <button
                  onClick={() => handleSendMessage(inputText)}
                  className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatWindow;
