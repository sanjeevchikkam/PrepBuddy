import { useState } from 'react';
import api from '@/lib/api';
import { ChatInterface, ChatMessage } from '@/components/ChatInterface';
import { toast } from '@/hooks/use-toast';
import { Briefcase, ArrowRight } from 'lucide-react';

const CareerAdvisor = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', current_role: '', target_role: '', skills: '', resume: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/career-advice', { ...form, history: [] });
      setMessages([{ role: 'assistant', content: res.data.advice || res.data.response }]);
      setSubmitted(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to get career advice.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await api.post('/career-advice', { ...form, history: newHistory });
      setMessages([...newHistory, { role: 'assistant', content: res.data.response || res.data.advice }]);
    } catch {
      toast({ title: 'Error', description: 'Failed to get response.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans text-foreground placeholder:text-muted-foreground";

  return (
    <div className="h-full flex flex-col">
      {!submitted ? (
        <div className="flex-1 overflow-y-auto flex items-start justify-center p-8 md:p-12">
          <div className="max-w-lg w-full space-y-8 animate-fade-in">
            <div className="text-center">
              <Briefcase className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="font-serif text-3xl md:text-4xl text-primary">Career Oracle</h2>
              <p className="text-secondary-foreground font-sans mt-2">
                Get personalized career advice powered by AI.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your Name" className={inputClass} />
              <input value={form.current_role} onChange={e => setForm(f => ({ ...f, current_role: e.target.value }))} placeholder="Current Role" className={inputClass} />
              <input value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))} placeholder="Target Role" className={inputClass} />
              <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Key Skills (comma-separated)" className={inputClass} />
              <textarea value={form.resume} onChange={e => setForm(f => ({ ...f, resume: e.target.value }))} placeholder="Resume / Background (optional)" rows={4} className={`${inputClass} resize-none`} />
              <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 justify-center">
                Get Advice <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {isLoading && <p className="font-mono text-xs text-muted-foreground animate-pulse-glow text-center">Consulting the oracle...</p>}
          </div>
        </div>
      ) : (
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
      )}
    </div>
  );
};

export default CareerAdvisor;
