import { useState, useRef } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
}

export const FileUploader = ({ onFileSelect, accept, label }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative group cursor-pointer overflow-hidden
        border-2 border-dashed rounded-xl p-12 transition-all duration-300
        ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-paper'}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) { setFileName(file.name); onFileSelect(file); }
        }}
      />
      <div className="flex flex-col items-center gap-4 text-center">
        {fileName ? (
          <CheckCircle2 className="w-12 h-12 text-primary animate-fade-in" />
        ) : (
          <Upload className="w-12 h-12 text-secondary-foreground group-hover:text-primary transition-colors" />
        )}
        <div>
          <p className="font-serif text-xl text-foreground">
            {fileName || label}
          </p>
          <p className="text-sm text-secondary-foreground mt-1 font-mono">
            {fileName ? 'File ready for processing' : 'Drag and drop or click to browse'}
          </p>
        </div>
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 shadow-inner-glow" />
    </div>
  );
};
