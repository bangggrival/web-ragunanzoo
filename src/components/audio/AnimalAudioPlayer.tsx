'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { wildlifeAudio } from '@/utils/WildlifeAudioSynthesizer';
import { useLanguage } from '@/contexts/LanguageContext';

export interface AnimalAudioPlayerProps {
  audioUrl?: string | null;
  animalName: string;
  onClose?: () => void;
  embedded?: boolean;
  className?: string;
}

export default function AnimalAudioPlayer({
  audioUrl,
  animalName,
  onClose,
  embedded = false,
  className = '',
}: AnimalAudioPlayerProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizerMode, setIsSynthesizerMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthStopperRef = useRef<{ stop: () => void } | null>(null);

  // Initialize audio file if audioUrl exists
  useEffect(() => {
    if (audioUrl && audioUrl.trim()) {
      setIsSynthesizerMode(false);
      setIsLoading(true);
      setError(null);

      const audio = new Audio(audioUrl);
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 3);
        setIsLoading(false);
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });

      audio.addEventListener('error', () => {
        // Fallback to synthesizer if audio file fails
        console.warn('Audio URL could not be loaded, falling back to Web Audio Synthesizer');
        setIsSynthesizerMode(true);
        setIsLoading(false);
      });

      return () => {
        audio.pause();
        audio.src = '';
      };
    } else {
      // Direct synthesizer mode
      setIsSynthesizerMode(true);
      setIsLoading(false);
      setDuration(2.6);
    }
  }, [audioUrl, animalName]);

  // Clean up synthesizer & animation on unmount
  useEffect(() => {
    return () => {
      wildlifeAudio.stopAll();
      if (synthStopperRef.current) {
        synthStopperRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Visualizer Animation
  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (bufferLength * 0.6)) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength * 0.6; i++) {
        const value = dataArray[i];
        const barHeight = Math.max((value / 255) * canvas.height * 0.9, 4);

        // Natural gradient from emerald to amber
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.6, '#34d399');
        gradient.addColorStop(1, '#fbbf24');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, Math.max(barWidth - 2, 2), barHeight, 3);
        ctx.fill();

        x += barWidth;
      }
    };

    draw();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      // Pause
      if (audioRef.current && !isSynthesizerMode) {
        audioRef.current.pause();
      }
      if (synthStopperRef.current) {
        synthStopperRef.current.stop();
        synthStopperRef.current = null;
      }
      wildlifeAudio.stopAll();
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      // Play
      setIsPlaying(true);
      setProgress(0);

      if (isSynthesizerMode || !audioRef.current) {
        const soundType = wildlifeAudio.detectSoundType(animalName);
        const stopper = wildlifeAudio.playAnimalSound(soundType, () => {
          setIsPlaying(false);
          setProgress(100);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
        });
        synthStopperRef.current = stopper;
        analyserRef.current = stopper.analyser;
        drawVisualizer();

        // Progress simulation for synthesizer
        const startTime = Date.now();
        const interval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed >= duration) {
            clearInterval(interval);
            setProgress(100);
          } else {
            setProgress((elapsed / duration) * 100);
          }
        }, 50);
      } else {
        audioRef.current.play().catch(e => {
          console.warn('Audio play error, falling back to synth:', e);
          setIsSynthesizerMode(true);
          togglePlay();
        });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ═════════════════════════════════════════════
  // MODE 1: EMBEDDED STAGE (Terselip di Halaman)
  // ═════════════════════════════════════════════
  if (embedded) {
    return (
      <div className={`p-4 sm:p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 shadow-2xs">
              <AppIcon icon="solar:volume-loud-bold-duotone" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>{isEn ? 'Vocalizations & Sounds' : 'Suara & Panggilan Satwa'}</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {isEn ? `Natural bio-acoustics of ${animalName}` : `Karakteristik audio alami ${animalName}`}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
            <AppIcon icon="solar:magic-stick-3-bold-duotone" className="w-3 h-3 text-emerald-500" />
            <span>{isEn ? 'Bio-Audio' : 'Audio Alami'}</span>
          </span>
        </div>

        {/* Waveform Visualizer Canvas */}
        <div className="relative h-16 w-full rounded-2xl bg-muted/40 border border-border/60 overflow-hidden mb-3.5 flex items-center justify-center">
          <canvas ref={canvasRef} width={400} height={64} className="w-full h-full" />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground/70 font-medium">
                {isEn ? 'Press play to hear audio' : 'Tekan tombol play untuk mendengarkan'}
              </span>
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <AppIcon icon="solar:spinner-linear" className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <>
                <AppIcon icon="solar:pause-bold" className="w-4 h-4" />
                <span>{isEn ? 'Pause' : 'Jeda'}</span>
              </>
            ) : (
              <>
                <AppIcon icon="solar:play-bold" className="w-4 h-4 fill-current" />
                <span>{isEn ? 'Play Sound' : 'Putar Suara'}</span>
              </>
            )}
          </button>

          {/* Progress Bar */}
          <div className="flex-1 mx-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{formatTime((progress / 100) * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <AppIcon icon="solar:volume-cross-bold-duotone" className="w-4 h-4" /> : <AppIcon icon="solar:volume-loud-bold-duotone" className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // MODE 2: FULL IMMERSION MODAL
  // ═════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
            <AppIcon icon="solar:music-notes-bold-duotone" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">{animalName}</h2>
            <p className="text-white/60 text-xs">{isEn ? 'Wildlife Acoustic Audio' : 'Audio Suara Satwa Ragunan'}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <AppIcon icon="solar:close-circle-bold" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Visualizer Box */}
      <div className="w-full max-w-lg aspect-video rounded-3xl overflow-hidden bg-black/70 border border-white/10 relative p-4 flex flex-col justify-between mb-6 shadow-2xl">
        <canvas ref={canvasRef} width={500} height={220} className="w-full h-full" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white/60 pointer-events-none">
          <span className="flex items-center gap-1">
            <AppIcon icon="solar:magic-stick-3-bold-duotone" className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSynthesizerMode ? (isEn ? 'Acoustic Synthesizer' : 'Generator Akustik Alami') : (isEn ? 'Master Studio Audio' : 'Rekaman Asli Habitat')}</span>
          </span>
          <span>{isPlaying ? (isEn ? 'Vocalizing...' : 'Sedang Bersuara...') : (isEn ? 'Ready' : 'Siap')}</span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="w-full max-w-lg flex flex-col items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? <AppIcon icon="solar:pause-bold" className="w-7 h-7" /> : <AppIcon icon="solar:play-bold" className="w-7 h-7 fill-current ml-1" />}
        </button>

        {/* Progress */}
        <div className="w-full">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-1.5">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
