import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, X, MessageSquare, Sparkles } from 'lucide-react';

const ChatBot = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! I am EcoBot 🌿. Ask me anything about reducing your carbon footprint, recycling, flights, or sustainable living!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Don't show chatbot if user is not logged in
  if (!user) return null;

  const quickQuestions = [
    'How can I reduce emissions?',
    'Carbon impact of flights?',
    'Rules of smart recycling'
  ];

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) setInput('');
    
    // Add user message
    const updatedMessages = [...messages, { role: 'user', text: messageText }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map message history to send to backend
      const history = updatedMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const res = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText,
          history
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Connection error. Please check if backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Helper to format response markdown-like text nicely
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      let content = line;
      let className = "text-sm text-white/90 leading-relaxed mb-1.5";

      if (line.startsWith('###')) {
        content = line.replace('###', '').trim();
        className = "text-base font-bold text-brand-300 mt-2 mb-1 border-b border-white/5 pb-0.5";
      } else if (line.startsWith('**')) {
        content = line.replace(/\*\*/g, '').trim();
        className = "text-sm font-semibold text-brand-400 mt-1.5 mb-0.5";
      } else if (line.startsWith('*')) {
        content = line.replace('*', '•').trim();
        className = "text-sm text-white/80 pl-2 leading-relaxed";
      }

      // Inline bold tags replace
      const boldParts = content.split('**');
      if (boldParts.length > 1) {
        return (
          <p key={i} className={className}>
            {boldParts.map((part, index) => 
              index % 2 === 1 ? <strong key={index} className="text-brand-300 font-bold">{part}</strong> : part
            )}
          </p>
        );
      }

      return <p key={i} className={className}>{content}</p>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-label="Open AI Eco Chatbot"
          className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-brand-500 to-emerald-600 hover:from-brand-400 hover:to-emerald-500 text-dark-950 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-brand-300/20 group relative"
        >
          <MessageSquare className="h-6 w-6 text-dark-950 group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-300"></span>
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="EcoBot Chat Assistant"
          className="w-[360px] sm:w-[400px] h-[500px] rounded-2xl bg-dark-900 border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="bg-white/[0.02] border-b border-white/[0.06] p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                <Bot className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1">
                  <span>EcoTrack Assistant</span>
                  <Sparkles className="h-3 w-3 text-brand-400 animate-pulse" />
                </h3>
                <span className="text-[10px] text-brand-400 font-semibold">Gemini Powered</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-white/40 hover:text-white p-1.5 hover:bg-white/[0.04] rounded-lg transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md border ${
                    msg.role === 'user'
                      ? 'bg-brand-500/10 border-brand-500/20 text-white rounded-br-none'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/90 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'user' ? <p className="leading-relaxed">{msg.text}</p> : formatText(msg.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl rounded-bl-none px-4 py-3.5 flex items-center space-x-1.5 shadow-md">
                  <div className="w-2.5 h-2.5 bg-brand-500/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-brand-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-brand-500/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions suggestion */}
          {messages.length === 1 && (
            <div className="px-4 py-1.5 flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-[11px] bg-white/[0.03] border border-white/[0.06] rounded-full px-2.5 py-1 text-white/60 hover:text-white hover:bg-brand-500/5 hover:border-brand-500/20 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <div className="p-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              aria-label="Chat message input"
              placeholder="Ask about green habits, emissions..."
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.05] transition-all text-white disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:bg-white/[0.04] text-dark-950 disabled:text-white/20 transition-all shadow-md active:scale-95 flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
