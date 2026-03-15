import { useState } from 'react';
import api from '@/lib/api';
import { ChatInterface, ChatMessage } from '@/components/ChatInterface';
import { toast } from '@/hooks/use-toast';
import { AlignLeft, ArrowRight } from 'lucide-react';

const TextNotes = () => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsLoading(true);

    try {
      const res = await api.post('/process-text', { text, history: [] });
      setMessages([{ role: 'assistant', content: res.data.notes || res.data.response }]);
      setSubmitted(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to process text.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (msg: string) => {
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: msg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await api.post('/process-text', { text, history: newHistory });
      setMessages([...newHistory, { role: 'assistant', content: res.data.response || res.data.notes }]);
    } catch {
      toast({ title: 'Error', description: 'Failed to get response.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {!submitted ? (
        <div className="flex-1 flex items-center justify-center p-8 md:p-12">
          <div className="max-w-2xl w-full space-y-8 text-center animate-fade-in">
            <AlignLeft className="w-16 h-16 text-primary mx-auto" />
            <h2 className="font-serif text-3xl md:text-4xl text-primary">Text Codex</h2>
            <p className="text-secondary-foreground font-sans">
              Paste any text — lecture notes, articles, or raw content — and get AI-structured summaries.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here..."
                rows={8}
                className="w-full bg-background border border-border rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans text-foreground placeholder:text-muted-foreground resize-none"
              />
              <button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                Analyze Text <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {isLoading && <p className="font-mono text-xs text-muted-foreground animate-pulse-glow">Analyzing text...</p>}
          </div>
        </div>
      ) : (
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
      )}
    </div>
  );
};

export default TextNotes;
