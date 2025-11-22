import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface ImageDiffViewerProps {
  original: string;
  processed: string;
}

export const ImageDiffViewer: React.FC<ImageDiffViewerProps> = ({ original, processed }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  const handleTouchStart = () => setIsResizing(true);

  const handleStopResizing = useCallback(() => setIsResizing(false), []);

  const handleMove = useCallback((clientX: number) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(percentage);
  }, [isResizing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleStopResizing);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleStopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleStopResizing);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleStopResizing);
    };
  }, [isResizing, handleMove, handleStopResizing]);

  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
      <div 
        ref={containerRef}
        className="relative w-full aspect-auto select-none overflow-hidden cursor-ew-resize group"
        style={{ minHeight: '300px' }}
      >
        {/* Processed Image (Background) */}
        <img 
          src={processed} 
          alt="Processed" 
          className="block w-full h-auto object-contain pointer-events-none select-none"
        />

        {/* Original Image (Overlay/Clipped) */}
        <div 
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={original} 
            alt="Original" 
            className="block h-full object-cover object-left max-w-none pointer-events-none select-none"
            style={{ 
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' 
            }}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="w-8 h-8 -ml-3.5 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-800 transform hover:scale-110 transition-transform">
            <ChevronsLeftRight size={16} />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20 pointer-events-none">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-indigo-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20 pointer-events-none">
          Cleaned
        </div>
      </div>
      
      <div className="p-4 bg-slate-800 border-t border-slate-700 text-center text-slate-400 text-sm">
        Drag the slider to compare results
      </div>
    </div>
  );
};