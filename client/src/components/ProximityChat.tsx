import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Send, Users, MessageSquare } from 'lucide-react';
import { socket } from '../network/socket';

export const ProximityChat: React.FC = () => {
  const { activeRoomId, peersInRoom, chatMessages, currentZoneName } = useAppStore();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('ProximityChat State:', { activeRoomId, peerCount: peersInRoom?.length });
  }, [activeRoomId, peersInRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    socket.emit('chat_message', {
      text: inputText.trim(),
      roomId: activeRoomId
    });

    setInputText('');
  };

  if (!activeRoomId) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="fixed right-6 bottom-6 w-80 h-[450px] glass-panel rounded-2xl flex flex-col overflow-hidden z-40 border-l-4 border-blue-500 shadow-2xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-blue-500/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold leading-tight">
              {currentZoneName ? currentZoneName : 'Proximity Chat'}
            </h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-medium">Connected to peers</span>
            </div>
          </div>
        </div>
        <div className="flex -space-x-2">
          {peersInRoom && peersInRoom.map((peer) => {
            if (!peer || !peer.username || typeof peer.username !== 'string') return null;
            
            const peerId = peer.id || Math.random().toString();
            
            // Generate a consistent color from username
            const colors = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
            const firstChar = peer.username[0] || '?';
            const colorIdx = firstChar.charCodeAt(0) % colors.length;
            
            return (
              <div 
                key={peerId} 
                className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-[11px] font-bold text-white shadow-lg"
                style={{ backgroundColor: colors[colorIdx] }}
                title={peer.username}
              >
                {firstChar.toUpperCase()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-xs text-slate-500">Walk near others to start a conversation</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            if (!msg) return null;
            const isMe = socket && socket.id ? msg.senderId === socket.id : false;
            const senderDisplayName = msg.senderName || 'Unknown User';
            const msgId = msg.id || Math.random().toString();

            return (
              <div 
                key={msgId} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {isMe ? 'You' : senderDisplayName}
                  </span>
                </div>
                <div 
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                  }`}
                >
                  {msg.text || ''}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/50 border-t border-slate-700/50">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 pr-10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
          />
          <button 
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};
