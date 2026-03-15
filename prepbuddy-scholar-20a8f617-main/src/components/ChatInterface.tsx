import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface ChatMessage {
  role: 'human' | 'ai';
  content: string;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, isLoading }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full border-x border-border bg-background/50 backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'human' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`
              max-w-[85%] p-5 rounded-2xl shadow-sm
              ${msg.role === 'human'
                ? 'bg-primary text-primary-foreground font-medium rounded-tr-sm'
                : 'bg-paper border border-border text-foreground rounded-tl-sm'}
            `}>
              {msg.role === 'ai' ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-paper border border-border p-4 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="font-mono text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-border bg-paper/50">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="w-full bg-background border border-border rounded-full py-3 md:py-4 pl-5 md:pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans text-foreground placeholder:text-muted-foreground transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
