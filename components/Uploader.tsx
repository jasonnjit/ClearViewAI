import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from './Button';

interface UploaderProps {
  onFileSelect: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    
    // Max size check (e.g., 5MB to be safe for API limits in this demo)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size too large. Please upload an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const result = e.target.result as string;
        // Extract MIME type and Base64 data
        const matches = result.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
           onFileSelect(matches[2], matches[1]);
        } else {
           setError("Failed to process image format.");
        }
      }
    };
    reader.onerror = () => setError("Error reading file.");
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ease-in-out text-center cursor-pointer overflow-hidden
          ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleChange}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-700/50 rounded-full group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10">
            {dragActive ? <Upload className="w-10 h-10 text-indigo-400" /> : <ImageIcon className="w-10 h-10 text-slate-300" />}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">
              {dragActive ? "Drop to upload" : "Upload your image"}
            </h3>
            <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
              Drag & drop or click to browse. <br/> Supports JPEG, PNG, WEBP.
            </p>
          </div>

          <Button 
            variant="secondary" 
            className="mt-4 pointer-events-none" // Pointer events none because the parent div handles click
            tabIndex={-1}
          >
            Select File
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-xl flex items-start gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
          <X className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};