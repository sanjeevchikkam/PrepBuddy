import { useState } from 'react';
import api from '@/lib/api';
import { FileUploader } from '@/components/FileUploader';
import { ChatInterface, ChatMessage } from '@/components/ChatInterface';
import { toast } from '@/hooks/use-toast';

const JobSearch = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setUploadedFile(file);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append(
      'req',
      JSON.stringify({ message: 'Find me relevant jobs based on my resume.', history: [] })
    );

    try {
      const res = await api.post('/job-search', formData);
      setMessages([{ role: 'ai', content: res.data.reply }]);
      setFileUploaded(true);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to process resume. Ensure backend is running.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newHistory: ChatMessage[] = [...messages, { role: 'human', content: text }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (uploadedFile) formData.append('resume', uploadedFile);
      formData.append('req', JSON.stringify({ message: text, history: newHistory }));

      const res = await api.post('/job-search', formData);
      setMessages([...newHistory, { role: 'ai', content: res.data.reply }]);
    } catch {
      toast({ title: 'Error', description: 'Failed to get response.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {!fileUploaded ? (
        <div className="flex-1 flex items-center justify-center p-8 md:p-12">
          <div className="max-w-xl w-full space-y-8 text-center animate-fade-in">
            <h2 className="font-serif text-3xl md:text-4xl text-primary">Job Search</h2>
            <p className="text-secondary-foreground font-sans">
              Upload your resume and our AI will find the most relevant job opportunities tailored to your skills.
            </p>
            <FileUploader label="Upload Resume" accept=".pdf" onFileSelect={handleFileUpload} />
            {isLoading && (
              <p className="font-mono text-xs text-muted-foreground animate-pulse-glow">
                Analyzing resume and searching jobs...
              </p>
            )}
          </div>
        </div>
      ) : (
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default JobSearch;