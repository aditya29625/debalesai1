import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  collectionId: string;
  onPlayTimestamp?: (time: number) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ collectionId, onPlayTimestamp }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection_id: collectionId,
          question: input,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get answer');
      
      const data = await response.json();
      
      // Look for [PLAY:MM:SS] tags and convert them to buttons
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error: " + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    // Basic regex to find [PLAY:MM:SS]
    const parts = content.split(/(\[PLAY:\d{1,2}:\d{2}\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[PLAY:')) {
        const timeParts = part.replace('[PLAY:', '').replace(']', '').split(':');
        const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
        return (
          <button 
            key={i} 
            onClick={() => onPlayTimestamp?.(seconds)}
            className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-sm font-semibold hover:bg-brand-200"
          >
            ▶ Play {timeParts[0]}:{timeParts[1]}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-20">
            Ask me anything about your uploaded file!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {m.role === 'assistant' ? renderMessageContent(m.content) : m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none animate-pulse text-slate-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your question..."
          className="flex-1 bg-slate-50 border-none focus:ring-2 focus:ring-brand-500 rounded-lg px-4"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-brand-600 text-white p-2 px-4 rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
