"use client";

import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw, MapPin, Shield, Info, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface LightboxMediaData {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  category?: string | null;
  zone?: string | null;
  status?: string | null;
  healthStatus?: string | null;
  audioUrl?: string | null;
  modelUrl?: string | null;
  description?: string | null;
}

interface MediaLightboxModalProps {
  media: LightboxMediaData | null;
  onClose: () => void;
}

export default function MediaLightboxModal({ media, onClose }: MediaLightboxModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Reset zoom and rotation when modal opens
    setZoom(1);
    setRotation(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [media, onClose]);

  if (!media) return null;

  const handleDownload = async () => {
    try {
      const res = await fetch(media.imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${media.title.toLowerCase().replace(/\s+/g, '_')}_ragunan.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Foto berhasil diunduh');
    } catch {
      window.open(media.imageUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] animate-slide-in-up text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Main Image Viewer Area */}
        <div className="flex-1 bg-black/60 relative flex items-center justify-center min-h-[300px] md:min-h-[500px] overflow-hidden p-4 select-none">
          {/* Controls Bar on Top of Image */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-2xl p-1.5 border border-white/10">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
              title="Putar Foto"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute top-4 right-4 z-20 flex md:hidden">
            <button
              onClick={onClose}
              className="p-2 bg-black/50 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Render Zoomable Image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={media.imageUrl}
              alt={media.title}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl pointer-events-auto"
            />
          </div>
        </div>

        {/* Info & Metadata Sidebar */}
        <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="hidden md:flex justify-end mb-3">
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {media.category && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                {media.category}
              </span>
            )}

            <h3 className="text-xl font-black text-white leading-tight">{media.title}</h3>
            {media.subtitle && (
              <p className="text-sm text-slate-400 italic mt-0.5">{media.subtitle}</p>
            )}

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5 text-xs text-slate-300">
              {media.zone && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Zona:</strong> {media.zone}</span>
                </div>
              )}

              {media.status && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span><strong>Status:</strong> {media.status}</span>
                </div>
              )}

              {media.healthStatus && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 badge-live-pulse" />
                  <span><strong>Kesehatan:</strong> {media.healthStatus}</span>
                </div>
              )}

              {media.description && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-slate-400 line-clamp-4 leading-relaxed">
                    {media.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
            <Button
              onClick={handleDownload}
              className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2 shadow-lg btn-interactive"
            >
              <Download className="w-4 h-4" />
              Unduh Foto Resolusi Penuh
            </Button>
            
            <a
              href={media.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka di Tab Baru
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
