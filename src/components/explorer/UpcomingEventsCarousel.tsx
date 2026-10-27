'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Event } from '@/hooks/useEvents';
import ModernMediaCard from '@/components/ui/ModernMediaCard';

interface UpcomingEventsCarouselProps {
  events: Event[];
  loading: boolean;
}

export default function UpcomingEventsCarousel({ events, loading }: UpcomingEventsCarouselProps) {
  const { language, getText, t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, setScrollSnaps, onSelect]);

  const getLocalImage = (imageUrl: string | null) => {
    return imageUrl || undefined;
  };

  const getCategoryConfig = (category?: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('feed') || cat.includes('makan')) {
      return { icon: 'fluent-emoji-flat:fork-and-knife-with-plate', label: language === 'en' ? 'Feeding Time' : 'Feeding Time', badgeClass: 'bg-amber-500/90 text-white' };
    }
    if (cat.includes('edu') || cat.includes('sekolah')) {
      return { icon: 'solar:square-academic-cap-2-bold-duotone', label: language === 'en' ? 'Education' : 'Edukasi', badgeClass: 'bg-emerald-600/90 text-white' };
    }
    return { icon: 'solar:calendar-bold-duotone', label: language === 'en' ? 'Show & Event' : 'Pertunjukan', badgeClass: 'bg-primary/90 text-white' };
  };

  if (loading) {
    return (
      <section className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-[0_0_85%] sm:flex-[0_0_48%] md:flex-[0_0_32%] h-44 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section className="py-6 px-4 relative">
      <div className="container mx-auto">

        {/* Section Header with Controls */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-5 px-1 sm:px-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
              <AppIcon name="solar:calendar-bold-duotone" className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                {t('upcoming_events')}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block">
                {language === 'en' ? "Don't miss exciting activities at Ragunan" : 'Jangan lewatkan kegiatan seru di Ragunan'}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={scrollPrev}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-card hover:bg-muted border border-border text-foreground flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 group"
                aria-label="Previous event"
              >
                <AppIcon name="solar:alt-arrow-left-linear" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-card hover:bg-muted border border-border text-foreground flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 group"
                aria-label="Next event"
              >
                <AppIcon name="solar:alt-arrow-right-linear" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-card hover:bg-muted border border-border text-foreground text-[11px] sm:text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              <span>{t('view_all_events')}</span>
              <AppIcon name="solar:arrow-right-up-linear" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        <div ref={emblaRef} className="overflow-hidden -mx-2.5 py-1">
          <div className="flex">
            {events.map((event) => {
              const eventTitle = getText(event.title_id, event.title_en, event.title);
              const eventDesc = getText(event.description_id, event.description_en, event.description || '');
              const catConfig = getCategoryConfig(event.category || event.type || '');

              return (
                <div 
                  key={event.id} 
                  className="flex-[0_0_88%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_28%] min-w-0 px-2.5"
                >
                  <ModernMediaCard
                    href="/events"
                    imageSrc={getLocalImage(event.image_url) || '/placeholder.svg'}
                    imageAlt={eventTitle}
                    title={eventTitle}
                    subtitle={catConfig.label}
                    description={eventDesc || undefined}
                    aspectRatio="video"
                    badgeTopLeft={
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md border shadow-sm ${catConfig.badgeClass}`}>
                        <AppIcon name={catConfig.icon} className="w-3.5 h-3.5" />
                        <span>{catConfig.label}</span>
                      </div>
                    }
                    badgeTopRight={
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-extrabold border border-white/20 shadow-sm">
                        <AppIcon name="solar:clock-circle-bold" className="w-3 h-3 text-amber-400" />
                        <span>{event.time || '10:30 WIB'}</span>
                      </div>
                    }
                    metaLabel={event.location || undefined}
                    actionText={language === 'en' ? 'View Event' : 'Lihat Acara'}
                    className="h-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Pill Dots Pagination & Counter */}
        {scrollSnaps.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-5">
            {/* Mobile Counter Badge */}
            <span className="sm:hidden px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-secondary text-white shadow-sm">
              {selectedIndex + 1} / {scrollSnaps.length}
            </span>

            <div className="flex items-center justify-center gap-1">
              {scrollSnaps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollTo(idx)}
                  style={{
                    width: idx === selectedIndex ? '14px' : '5px',
                    height: '5px',
                    padding: 0,
                    margin: 0,
                    minWidth: 0,
                    minHeight: 0,
                    border: 'none',
                    outline: 'none',
                  }}
                  className={`rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer ${
                    idx === selectedIndex 
                      ? 'bg-secondary shadow-sm' 
                      : 'bg-muted-foreground/40 hover:bg-muted-foreground/70'
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
