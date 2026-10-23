'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  MapPin, 
  Volume2, 
  Pause,
  ExternalLink,
  Box
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LazyImage from '@/components/ui/LazyImage';
import { Skeleton } from '@/components/ui/skeleton';
import { Animal } from '@/hooks/useAnimals';
import { toast } from 'sonner';

interface FeaturedAnimalsCarouselProps {
  animals: Animal[];
  loading: boolean;
}

/**
 * FeaturedAnimalsCarousel - Modern Editorial Snap Carousel
 * - Kartu potret editorial (aspect-[3/4]) dengan Embla snap track.
 * - Pemutar audio instan langsung pada kartu untuk satwa dengan suara.
 * - Badge status konservasi / 3D AR terintegrasi.
 * - Zoom gambar sinematik & tipografi berjenjang.
 */
export default function FeaturedAnimalsCarousel({ animals, loading }: FeaturedAnimalsCarouselProps) {
  const { language, t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Cleanup audio playback on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle instant sound preview button
  const handleToggleAudio = (e: React.MouseEvent, animal: Animal) => {
    e.preventDefault();
    e.stopPropagation();

    if (!animal.audio_url) return;

    if (playingAudioId === animal.id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = animal.audio_url;
    audioRef.current.play()
      .then(() => {
        setPlayingAudioId(animal.id);
      })
      .catch(() => {
        setPlayingAudioId(null);
        toast.error(language === 'en' ? 'Audio file unavailable' : 'Berkas suara satwa tidak dapat diputar');
      });

    audioRef.current.onended = () => setPlayingAudioId(null);
    audioRef.current.onerror = () => {
      setPlayingAudioId(null);
      toast.error(language === 'en' ? 'Audio file not found' : 'Berkas suara satwa tidak ditemukan');
    };
  };

  if (loading) {
    return (
      <section className="py-6 sm:py-8 px-3 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-[0_0_82%] sm:flex-[0_0_46%] md:flex-[0_0_32%] lg:flex-[0_0_24%] aspect-[3/4] bg-muted/60 rounded-2xl sm:rounded-3xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!animals || animals.length === 0) return null;

  return (
    <section className="py-6 sm:py-10 px-3 sm:px-6 relative overflow-hidden bg-transparent">
      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Section Header with Top Controls */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6 px-1">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                {t('featured_animals')}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block">
                {language === 'en' ? 'Explore iconic wildlife species at Ragunan' : 'Jelajahi keanekaragaman satwa ikonik Ragunan'}
              </p>
            </div>
          </div>

          {/* Navigation & Link Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={scrollPrev}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-card hover:bg-muted border border-border text-foreground flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 group"
                aria-label="Previous animal"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={scrollNext}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-card hover:bg-muted border border-border text-foreground flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 group"
                aria-label="Next animal"
              >
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <Link
              href="/fauna"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-card hover:bg-muted border border-border text-foreground text-[11px] sm:text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              <span>{t('view_all_animals')}</span>
              <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        <div ref={emblaRef} className="overflow-hidden -mx-2.5 py-1">
          <div className="flex">
            {animals.map((animal) => {
              const animalName = (language === 'en' && animal.name_en) ? animal.name_en : animal.name;
              const categoryBadge = animal.category || animal.species || (language === 'en' ? 'FAUNA' : 'SATWA');
              const subText = animal.latin_name || animal.habitat || (language === 'en' ? 'Iconic Species' : 'Satwa Ikonik');
              const isPlayingThis = playingAudioId === animal.id;

              return (
                <div
                  key={animal.id}
                  className="flex-[0_0_82%] sm:flex-[0_0_46%] md:flex-[0_0_32%] lg:flex-[0_0_25%] min-w-0 px-2 sm:px-2.5"
                >
                  <Link
                    href={`/animals/${animal.id}`}
                    className="group relative block aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-border/70 hover:border-primary/50 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.22),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 ease-spring select-none"
                  >
                    {/* Background Media */}
                    <LazyImage
                      src={animal.image_url || ''}
                      alt={animalName}
                      className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.06]"
                      wrapperClassName="w-full h-full"
                    />

                    {/* Ambient Scrim Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/15 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2 z-10 pointer-events-auto min-w-0">
                      {/* Category Badge */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md border border-white/20 bg-primary/90 text-white shadow-sm pointer-events-none min-w-0 max-w-[130px] sm:max-w-[160px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                        <span className="truncate">{categoryBadge}</span>
                      </span>

                      {/* Right Meta Pill: Audio Shortcut or Status */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {animal.model_url && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/85 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/20 shadow-xs pointer-events-none shrink-0">
                            <Box className="w-2.5 h-2.5" />
                            <span>3D</span>
                          </span>
                        )}

                        {animal.audio_url ? (
                          <button
                            type="button"
                            onClick={(e) => handleToggleAudio(e, animal)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold border shadow-sm transition-all hover:scale-105 active:scale-95 ${
                              isPlayingThis
                                ? 'bg-amber-400 text-amber-950 border-amber-300 font-extrabold shadow-amber-500/40'
                                : 'bg-black/60 hover:bg-black/85 text-amber-300 border-white/20'
                            }`}
                            title={isPlayingThis ? 'Hentikan Suara' : 'Dengarkan Suara Satwa'}
                          >
                            {isPlayingThis ? (
                              <>
                                <Pause className="w-3 h-3 text-amber-950 animate-pulse" />
                                <span>Suara</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-amber-400" />
                                <span>Suara</span>
                              </>
                            )}
                          </button>
                        ) : animal.status ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-emerald-300 text-[10px] font-bold border border-white/20 shadow-sm pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{animal.status}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold tracking-wider uppercase shadow-md backdrop-blur-md pointer-events-none">
                            <Sparkles className="w-2.5 h-2.5 fill-amber-900 text-amber-900" />
                            <span>Ikonik</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Editorial Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-5 z-10 flex flex-col justify-end text-white">
                      {/* Subtitle / Latin Name */}
                      <p className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-emerald-300 line-clamp-1 mb-1 italic drop-shadow-sm">
                        {subText}
                      </p>

                      {/* Primary Animal Name */}
                      <h4 className="text-base sm:text-lg md:text-xl font-black text-white group-hover:text-amber-200 transition-colors line-clamp-1 leading-snug drop-shadow-md">
                        {animalName}
                      </h4>

                      {/* Location Indicator */}
                      {animal.location && (
                        <p className="text-[11px] text-white/80 line-clamp-1 flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="w-3 h-3 text-primary-foreground/90 flex-shrink-0" />
                          <span className="truncate">{animal.location}</span>
                        </p>
                      )}

                      {/* Interactive Footer Action Row */}
                      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/15 text-xs text-white/90">
                        <span className="text-[11px] font-semibold text-white/90 group-hover:text-white transition-colors">
                          {language === 'en' ? 'Explore Animal' : 'Jelajahi Satwa'}
                        </span>

                        {/* Rotating Arrow Indicator */}
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 group-hover:bg-primary text-white flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-110">
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Indicator Dots & Mobile Counter */}
        {scrollSnaps.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-5">
            {/* Mobile Slide Counter Badge */}
            <span className="sm:hidden px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-primary text-white shadow-sm">
              {selectedIndex + 1} / {scrollSnaps.length}
            </span>

            {/* Smooth Indicator Pill Dots */}
            <div className="flex items-center justify-center gap-1">
              {scrollSnaps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollTo(idx)}
                  style={{
                    width: idx === selectedIndex ? '18px' : '6px',
                    height: '6px',
                    padding: 0,
                    margin: 0,
                    border: 'none',
                    outline: 'none',
                  }}
                  className={`rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer ${
                    idx === selectedIndex
                      ? 'bg-primary shadow-sm'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
