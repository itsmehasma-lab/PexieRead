import React, { useState, useRef, useEffect } from 'react';
// Fix: Added .ts extension to fix module resolution error.
import type { ChatMessage } from '../types.ts';
// Fix: Added .tsx extension to fix module resolution error.
import { SendIcon, SpinnerIcon } from './icons.tsx';

interface ChatInterfaceProps {
  id?: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  initialPrompt?: string | null;
  onPromptUsed?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ id, messages, onSendMessage, isLoading, initialPrompt, onPromptUsed }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_LENGTH = 500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (initialPrompt && textareaRef.current) {
      setInput(initialPrompt);
      textareaRef.current.focus();
      // Move cursor to the end of the pre-filled text
      textareaRef.current.setSelectionRange(initialPrompt.length, initialPrompt.length);
      onPromptUsed?.();
    }
  }, [initialPrompt]);

  const triggerSendMessage = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSendMessage();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent new line on Enter
        triggerSendMessage();
    }
  }

  const charCountColor = input.length > MAX_LENGTH ? 'text-red-400' : 'text-gray-400';

  return (
    <div id={id} className="w-full p-6 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl">
      <h3 className="text-xl font-semibold text-gray-200 tracking-wide mb-4">Follow-up Chat</h3>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-50 rounded-bl-lg'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1]?.role === 'user' && (
          <div className="flex justify-start">
             <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl bg-gray-700 text-gray-50 rounded-bl-lg flex items-center">
                <SpinnerIcon className="w-5 h-5 animate-spin"/>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              className="w-full p-3 pr-12 text-base bg-white/5 border border-white/10 rounded-lg text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none overflow-y-hidden"
              disabled={isLoading}
              rows={1}
              maxLength={MAX_LENGTH}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-gray-400 bg-white/10 rounded-md hover:bg-white/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <SendIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs">
            <p className="text-gray-400">
                <kbd className="px-1.5 py-0.5 border border-gray-600 rounded-md bg-white/5">Shift</kbd> + <kbd className="px-1.5 py-0.5 border border-gray-600 rounded-md bg-white/5">Enter</kbd> to add a new line.
            </p>
            <span className={`font-mono ${charCountColor}`}>
                {input.length}/{MAX_LENGTH}
            </span>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;