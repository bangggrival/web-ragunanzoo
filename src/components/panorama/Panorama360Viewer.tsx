import { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';
import { X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface Panorama360ViewerProps {
  src: string;
  onClose?: () => void;
  title?: string;
  isFullscreen?: boolean;
}

export default function Panorama360Viewer({ 
  src, 
  onClose, 
  title,
  isFullscreen: initialFullscreen = false 
}: Panorama360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !src) return;

    // Initialize viewer
    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: src,
      navbar: ['zoom', 'move', 'fullscreen'],
      defaultYaw: 0,
      defaultPitch: 0,
      touchmoveTwoFingers: true,
      mousewheelCtrlKey: false,
      loadingTxt: 'Memuat panorama...',
    });

    viewerRef.current.addEventListener('ready', () => {
      setIsLoading(false);
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [src]);

  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.animate({
        yaw: 0,
        pitch: 0,
        zoom: 50,
        speed: '2rpm'
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!src) return null;

  return (
    <div 
      className={`
        ${isFullscreen 
          ? 'fixed inset-0 z-50 bg-black' 
          : 'relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden'
        }
      `}
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          {title && (
            <h3 className="text-white font-medium text-sm md:text-base">{title}</h3>
          )}
          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-white text-xs shadow-sm">
            360°
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
            title="Reset posisi"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
            title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-5 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Memuat panorama 360°...</p>
          </div>
        </div>
      )}

      {/* Panorama Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full text-white text-xs md:text-sm pointer-events-none shadow-lg">
        Geser untuk menjelajahi • Scroll untuk zoom
      </div>
    </div>
  );
}
