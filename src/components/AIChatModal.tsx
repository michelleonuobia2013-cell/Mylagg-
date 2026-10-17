import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, ChevronDown } from 'lucide-react';
import { playTapSound, playCoinSound } from '../utils/audio';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content:
        'Kedu! I be Mama Chichi, your Lagos Street Oracle and Guild Tactician! ' +
        'Wetin you wan know? Elemental combos for Computer Village, quick Naira careers, or how to withdraw to your bank account? No shaking at all!',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState<string>('mama_chichi');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I trigger Vaporize in dungeons?',
    'Best career path to earn fast Naira?',
    'How do bank withdrawals work in mylag?',
    'Tell me a Lagos street proverb for victory',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    playTapSound();
    const updatedMessages: Message[] = [...messages, { role: 'user', content: text.trim() }];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      setMessages([
        ...updatedMessages,
        {
          role: 'model',
          content: data.reply || 'Lagos no dey sleep! Ask me again sharp sharp.',
        },
      ]);
      playCoinSound();
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: 'model',
          content:
            'Mama Chichi here: Network fit dey do small delay, but keep your head up! Stack your LagCoins and trigger Vaporize (Pyro + Hydro) in the raid!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[620px] rounded-2xl bg-[#0d1322] border border-purple-500/60 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 bg-[#11192e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <span>Mama Chichi AI Companion</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  ONLINE
                </span>
              </h3>
              <p className="text-xs text-slate-400">Lagos Street Oracle & Tactical Guide</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector per requirement */}
            <select
              aria-label="Gemini Model Selector"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-purple-300 focus:outline-none"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (General)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              <option value="gemini-4-argon">gemini-4-argon (Complex)</option>
            </select>

            <button
              onClick={onClose}
              aria-label="Close Chat"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-600/60 flex items-center justify-center text-purple-300 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-[#151c2f] border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-600/60 flex items-center justify-center text-purple-300 shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#151c2f] border border-slate-800 p-3 rounded-2xl text-xs text-purple-300 animate-pulse">
                Mama Chichi dey consult oracle...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#0c121e] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white whitespace-nowrap text-[11px] transition"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#11192e] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Mama Chichi anything about Lagos life, combat, or payouts..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
