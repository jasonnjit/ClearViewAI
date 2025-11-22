import React, { useState } from 'react';
import { Eraser, Download, RotateCcw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { removeWatermark } from './services/geminiService';
import { AppStatus, ProcessedImage, ProcessingError } from './types';
import { Uploader } from './components/Uploader';
import { ImageDiffViewer } from './components/ImageDiffViewer';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [imageData, setImageData] = useState<ProcessedImage>({
    original: '',
    processed: null,
    mimeType: '',
  });
  const [error, setError] = useState<ProcessingError | null>(null);

  const handleFileSelect = (base64: string, mimeType: string) => {
    setImageData({
      original: `data:${mimeType};base64,${base64}`,
      processed: null,
      mimeType: mimeType,
    });
    // Store raw base64 (without prefix) for API call later if we want manual trigger, 
    // but usually user wants to see preview first.
    setStatus(AppStatus.IDLE); 
  };

  const handleProcess = async () => {
    if (!imageData.original) return;

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      // Strip the data URL prefix for the API
      const base64Raw = imageData.original.split(',')[1];
      const resultBase64 = await removeWatermark(base64Raw, imageData.mimeType);

      setImageData(prev => ({
        ...prev,
        processed: `data:${imageData.mimeType};base64,${resultBase64}`,
      }));
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError({ message: err.message || "Something went wrong" });
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setImageData({ original: '', processed: null, mimeType: '' });
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  const handleDownload = () => {
    if (!imageData.processed) return;
    
    const link = document.createElement('a');
    link.href = imageData.processed;
    link.download = `clearview-cleaned-${Date.now()}.${imageData.mimeType.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ClearView AI
            </span>
          </div>
          <div className="text-sm font-medium text-slate-400 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Intro Hero (Only show when IDLE and no image selected) */}
        {!imageData.original && (
          <div className="text-center max-w-2xl mx-auto mb-12 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Remove Watermarks <br/>
              <span className="text-indigo-400">Like Magic</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              Upload your image and let our AI restore the background, removing text overlays, logos, and stamps instantly.
            </p>
          </div>
        )}

        {/* Workspace */}
        <div className="w-full flex flex-col items-center gap-8">
          
          {/* Uploader State */}
          {!imageData.original && (
            <Uploader onFileSelect={handleFileSelect} isLoading={status === AppStatus.PROCESSING} />
          )}

          {/* Preview / Action State */}
          {imageData.original && status === AppStatus.IDLE && (
            <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800/50">
                <img 
                  src={imageData.original} 
                  alt="Original" 
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleReset} icon={<RotateCcw className="w-4 h-4" />}>
                  Change Image
                </Button>
                <Button variant="primary" onClick={handleProcess} icon={<Eraser className="w-4 h-4" />}>
                  Remove Watermark
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {status === AppStatus.PROCESSING && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-indigo-400 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Cleaning your image...</h3>
              <p className="text-slate-400">AI is analyzing and reconstructing the background</p>
            </div>
          )}

          {/* Success / Comparison State */}
          {status === AppStatus.SUCCESS && imageData.processed && (
            <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
              
              <div className="w-full flex justify-between items-center max-w-4xl">
                 <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                   <ImageIcon className="w-5 h-5 text-indigo-400"/>
                   Result
                 </h2>
                 <div className="flex gap-3">
                   <Button variant="outline" onClick={handleReset} size="sm" icon={<RotateCcw className="w-4 h-4"/>}>
                     Start Over
                   </Button>
                   <Button variant="primary" onClick={handleDownload} size="sm" icon={<Download className="w-4 h-4"/>}>
                     Download HD
                   </Button>
                 </div>
              </div>

              <ImageDiffViewer original={imageData.original} processed={imageData.processed} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-4">
                 <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                   <h4 className="font-medium text-white mb-1">Seamless Removal</h4>
                   <p className="text-sm text-slate-400">Watermarks and overlays completely erased.</p>
                 </div>
                 <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                   <h4 className="font-medium text-white mb-1">Inpainting</h4>
                   <p className="text-sm text-slate-400">Background content intelligently reconstructed.</p>
                 </div>
                 <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                   <h4 className="font-medium text-white mb-1">High Quality</h4>
                   <p className="text-sm text-slate-400">Preserves original image details.</p>
                 </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === AppStatus.ERROR && (
             <div className="max-w-md w-full bg-red-950/30 border border-red-900/50 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-red-200 mb-2">Processing Failed</h3>
                <p className="text-red-300/70 mb-6">
                  {error?.message || "We couldn't process this image. Please try again with a different file."}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setStatus(AppStatus.IDLE)}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleProcess}>
                    Try Again
                  </Button>
                </div>
             </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-auto bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} ClearView AI. All rights reserved.</p>
          <div className="flex gap-6">
             <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;