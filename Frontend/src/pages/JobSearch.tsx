import { useState } from 'react';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Search, ArrowRight, MapPin, Building2 } from 'lucide-react';

interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  url?: string;
}

const JobSearch = () => {
  const [form, setForm] = useState({
    job_title: '', location: '', experience_level: '', skills: ''
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post('/search-jobs', form);
      setJobs(res.data.jobs || res.data.results || []);
      setSearched(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to search jobs.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans text-foreground placeholder:text-muted-foreground";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8 md:p-12 space-y-8 animate-fade-in">
        <div className="text-center">
          <Search className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-4xl text-primary">Job Search</h2>
          <p className="text-secondary-foreground font-sans mt-2">Find opportunities matched to your profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
          <input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} placeholder="Job Title" className={inputClass} />
          <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className={inputClass} />
          <input value={form.experience_level} onChange={e => setForm(f => ({ ...f, experience_level: e.target.value }))} placeholder="Experience Level" className={inputClass} />
          <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Skills" className={inputClass} />
          <button type="submit" disabled={isLoading} className="md:col-span-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 justify-center">
            {isLoading ? 'Searching...' : 'Search Jobs'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {searched && jobs.length === 0 && (
          <p className="text-center text-muted-foreground font-mono text-sm">No jobs found. Try adjusting your search.</p>
        )}

        {jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, i) => (
              <div key={i} className="p-6 bg-paper border border-border rounded-xl hover:border-primary/40 hover:shadow-glow transition-all duration-300 group">
                <h3 className="font-serif text-xl text-primary group-hover:translate-x-1 transition-transform">{job.title}</h3>
                <div className="flex items-center gap-3 mt-1 mb-3">
                  <span className="flex items-center gap-1 font-mono text-xs text-secondary-foreground"><Building2 className="w-3 h-3" />{job.company}</span>
                  <span className="flex items-center gap-1 font-mono text-xs text-secondary-foreground"><MapPin className="w-3 h-3" />{job.location}</span>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-3">{job.description}</p>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 font-mono text-xs text-primary hover:underline">
                    View Details →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch;
