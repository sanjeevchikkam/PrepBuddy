import { useState } from 'react';
import api from '@/lib/api';
import { ChatInterface, ChatMessage } from '@/components/ChatInterface';
import { toast } from '@/hooks/use-toast';
import { Youtube, ArrowRight } from 'lucide-react';

const YTNotes = () => {
  const [url, setUrl] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);

    try {
      const res = await api.post('/process-yt', { url, history: [] });
      setMessages([{ role: 'assistant', content: res.data.notes || res.data.response }]);
      setSubmitted(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to process YouTube video.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await api.post('/process-yt', { url, history: newHistory });
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
          <div className="max-w-xl w-full space-y-8 text-center animate-fade-in">
            <Youtube className="w-16 h-16 text-primary mx-auto" />
            <h2 className="font-serif text-3xl md:text-4xl text-primary">YouTube Codex</h2>
            <p className="text-secondary-foreground font-sans">
              Paste a YouTube URL and get AI-generated notes from the video content.
            </p>
            <form onSubmit={handleSubmitUrl} className="flex gap-3">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-background border border-border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-5 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                Process <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {isLoading && <p className="font-mono text-xs text-muted-foreground animate-pulse-glow">Analyzing video...</p>}
          </div>
        </div>
      ) : (
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
      )}
    </div>
  );
};

export default YTNotes;
