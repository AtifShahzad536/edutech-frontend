import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiMessageSquare, FiSend } from 'react-icons/fi';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  name: string;
  text: string;
  time: string;
  isHost?: boolean;
}

export interface ChatSectionProps {
  roomId: string;
  userId: string;
  userName: string;
  isHost?: boolean;
}

const ChatSection: React.FC<ChatSectionProps> = ({ roomId, userId, userName, isHost }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const { pusher, emit, on } = useSocket();
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pusher) return;
    
    setConnected(true);
    const channelName = `presence-room-${roomId}`;

    // Subscribe and listen for chat messages
    const unbind = on(channelName, 'chat-message', (msg: any) => {
      // Check if message is from self (to avoid duplicates if triggered optimistically)
      setMessages((prev: Message[]) => {
        if (prev.some(m => m.id === msg.id?.toString())) return prev;
        return [...prev, {
          id: msg.id?.toString() || Date.now().toString(),
          name: msg.name,
          text: msg.text,
          time: msg.time,
          isHost: msg.isHost,
        }];
      });
    });

    return () => {
      if (unbind) unbind();
      pusher.unsubscribe(channelName);
    };
  }, [pusher, roomId, on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !pusher) return;

    const msgId = Date.now().toString();
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const newMsg: Message = {
      id: msgId,
      name: userName,
      text: inputText.trim(),
      time,
      isHost: !!isHost,
    };

    // Optimistically update UI instantly
    setMessages((prev) => [...prev, newMsg]);

    emit('chat-message', {
      roomId,
      id: msgId,
      name: userName,
      text: inputText.trim(),
      time,
      isHost: !!isHost,
    });

    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-[#0a0a0b] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <FiMessageSquare className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Social Stream</h3>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">Real-time interaction</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${connected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${connected ? 'text-emerald-500' : 'text-red-500'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-20">
            <FiMessageSquare className="h-12 w-12 text-white" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white">No messages yet</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="group cursor-default animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider ${msg.isHost ? 'text-indigo-400' : 'text-gray-500'}`}>
                {msg.name} {msg.isHost && '• HOST'}
              </span>
              <span className="text-[8px] font-bold text-gray-700 uppercase">{msg.time}</span>
            </div>
            <div className={`p-4 rounded-xl rounded-tl-none border transition-all ${
              msg.isHost 
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-50' 
                : 'bg-white/[0.04] border-white/10 text-gray-200'
            } group-hover:bg-white/[0.06] group-hover:border-white/20`}>
              <p className="text-xs leading-relaxed font-medium">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-6 bg-white/[0.01] border-t border-white/5">
        <div className="relative group">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={connected ? "Say something..." : "Connecting to chat..."}
            disabled={!connected}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-medium text-white placeholder-gray-700 outline-none focus:border-indigo-500/40 transition-all duration-300 pr-14 shadow-inner disabled:opacity-50"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!connected || !inputText.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:bg-gray-700"
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
