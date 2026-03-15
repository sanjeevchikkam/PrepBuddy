import { useState } from 'react';
import api from '@/lib/api';
import { FileUploader } from '@/components/FileUploader';
import { ChatInterface, ChatMessage } from '@/components/ChatInterface';
import { toast } from '@/hooks/use-toast';

const ImageNotes = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setUploadedFile(file);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('req', JSON.stringify({ history: [] }));

    try {
      const res = await api.post('/process-image', formData);
      setMessages([{ role: 'assistant', content: res.data.notes || res.data.response }]);
      setFileUploaded(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to process image.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (uploadedFile) formData.append('image', uploadedFile);
      formData.append('req', JSON.stringify({ history: newHistory }));
      const res = await api.post('/process-image', formData);
      setMessages([...newHistory, { role: 'assistant', content: res.data.response || res.data.notes }]);
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
            <h2 className="font-serif text-3xl md:text-4xl text-primary">Visual Codex</h2>
            <p className="text-secondary-foreground font-sans">
              Upload diagrams, slides, or handwritten notes. AI will extract and structure the content.
            </p>
            <FileUploader label="Upload Image" accept="image/*" onFileSelect={handleFileUpload} />
            {isLoading && <p className="font-mono text-xs text-muted-foreground animate-pulse-glow">Analyzing image...</p>}
          </div>
        </div>
      ) : (
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
      )}
    </div>
  );
};

export default ImageNotes;
