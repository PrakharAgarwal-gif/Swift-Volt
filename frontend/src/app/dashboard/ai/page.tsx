"use client";

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Send, Bot, User, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: "Hello! I am Swift AI, your dealer assistant. You can ask me about your current stock, sales performance, or when you should reorder." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage.content });
      const aiMessage = { id: (Date.now() + 1).toString(), role: 'ai' as const, content: res.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = { id: (Date.now() + 1).toString(), role: 'ai' as const, content: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center">
          <Zap className="w-6 h-6 text-primary mr-2" />
          Swift AI Assistant
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Ask questions about your business data and get instant answers.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary ml-3' : 'bg-gray-100 dark:bg-gray-800 mr-3'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-primary" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mr-3">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="px-4 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 rounded-tl-none flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white dark:bg-[#0f172a] border-t border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Swift AI about your stock, sales, or orders..."
              className="block w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-900 text-foreground focus:ring-primary focus:border-primary shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
