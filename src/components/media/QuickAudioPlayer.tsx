"use client";

import { useState, useRef, useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface QuickAudioPlayerProps {
  audioUrl?: string | null;
  label?: string;
  size?: 'sm' | 'md';
}

export default function QuickAudioPlayer({ audioUrl, label, size = 'sm' }: QuickAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!audioUrl) return null;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!audioRef.current) {
      setIsLoading(true);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.oncanplay = () => {
        setIsLoading(false);
      };

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onpause = () => {
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        toast.error('Gagal memutar audio satwa.');
      };

      audio.play().catch(() => {
        setIsLoading(false);
        setIsPlaying(false);
        toast.error('Tidak dapat memutar audio.');
      });
    } else {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          toast.error('Tidak dapat memutar audio.');
        });
      }
    }
  };

  return (
    <button
      type="button"
      onClick={togglePlay}
      className={`inline-flex items-center gap-1.5 rounded-full transition-all border font-bold ${
        isPlaying
          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 ring-2 ring-amber-500/20 shadow-sm'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
      } ${size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'} btn-interactive`}
      title={isPlaying ? 'Jeda Audio Suara' : 'Dengarkan Suara Satwa'}
    >
      {isLoading ? (
        <AppIcon name="solar:spinner-linear" className="w-3.5 h-3.5 animate-spin text-amber-500" />
      ) : isPlaying ? (
        <>
          <AppIcon name="solar:pause-bold" className="w-3 h-3 text-amber-500" />
          {/* Animated Waveform Bars */}
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 bg-amber-500 rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
          </div>
        </>
      ) : (
        <AppIcon name="solar:volume-loud-bold-duotone" className="w-3.5 h-3.5 text-slate-500 group-hover:text-foreground" />
      )}
      <span>{label || (isPlaying ? 'Memutar' : 'Suara')}</span>
    </button>
  );
}
