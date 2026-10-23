"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Ticket, 
  Calendar, 
  Sun, 
  ChevronDown, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  CloudFog, 
  RefreshCw, 
  Wind, 
  Droplets,
  PawPrint,
  Leaf,
  Navigation,
  Headphones,
  Box,
  Sparkles
} from 'lucide-react';
import { useAnimals } from '@/hooks/useAnimals';
import { useEvents } from '@/hooks/useEvents';
import { useWeather } from '@/hooks/useWeather';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useHeroBanner } from '@/hooks/useHeroBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import NewsSection from '@/components/explorer/NewsSection';
import AnnouncementPopup from '@/components/explorer/AnnouncementPopup';
import HeroCarousel from '@/components/explorer/HeroCarousel';
import WhatsNewCarousel from '@/components/explorer/WhatsNewCarousel';
import FeaturedAnimalsCarousel from '@/components/explorer/FeaturedAnimalsCarousel';
import UpcomingEventsCarousel from '@/components/explorer/UpcomingEventsCarousel';
import FeedingTimeSchedule from '@/components/explorer/FeedingTimeSchedule';
import InstagramFeed from '@/components/explorer/InstagramFeed';
import LazyImage from '@/components/ui/LazyImage';
import AmbientBackgroundAtmosphere from '@/components/ambient/AmbientBackgroundAtmosphere';
import WeatherAtmosphereWidget from '@/components/ambient/WeatherAtmosphereWidget';

// Fallback organization logos (used when no logo_url in DB)





export default function ExplorerHome() {
  const [mounted, setMounted] = useState(false);
  const { animals, loading: animalsLoading } = useAnimals();
  const { events, loading: eventsLoading } = useEvents();
  const { weather, loading: weatherLoading, refetch: refetchWeather, activeTheme } = useWeather();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { banners, loading: bannersLoading } = useHeroBanner();
  const { t, getText, language } = useLanguage();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const featuredAnimals = animals.filter(a => a.is_featured);
  
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(e => e.event_date && e.event_date >= today).slice(0, 3);
  
  // Use only database images - no fallbacks
  const fallbackHeroImage = settings?.hero_image_url || undefined;

  const isWeatherLoading = mounted ? weatherLoading : false;

  // Check if hero ticket button should be visible based on schedule
  const isHeroTicketVisible = () => {
    // If hero ticket is disabled, don't show
    if (settings?.hero_ticket_enabled === false) return false;
    
    // If not using schedule, always show (when enabled)
    if (!settings?.hero_ticket_use_schedule) return true;
    
    if (!mounted) return true;

    // Check schedule
    const now = new Date();
    const jakartaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentHour = jakartaTime.getHours();
    const currentMinute = jakartaTime.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const startTime = settings?.hero_ticket_start_time || '08:00';
    const endTime = settings?.hero_ticket_end_time || '17:00';
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
  };

  const showHeroTicketButton = isHeroTicketVisible();

  const getLocalImage = (imageUrl: string | null) => {
    return imageUrl || undefined;
  };



  return (
    <div className="animate-fade-in relative min-h-screen">
      {/* Page-Wide Dynamic Ambient Background Atmosphere (Golden Safari Sunlight / Rainforest Emerald Mist) */}
      <AmbientBackgroundAtmosphere theme={activeTheme} />

      {/* Announcement Popup */}
      <AnnouncementPopup />

      {/* Hero Section with Carousel & Dynamic Atmospheric Layer */}
      <section className="relative overflow-hidden">
        <HeroCarousel 
          banners={banners}
          fallbackImage={fallbackHeroImage}
          autoplayDuration={settings?.carousel_autoplay_duration || 6000}
          loading={bannersLoading || settingsLoading}
          ambientTheme={activeTheme}
        />

        {/* CTA Buttons - styled with dynamic ambient atmosphere & shadows */}
        <div className={`transition-all duration-1000 -mt-12 sm:-mt-16 md:-mt-20 pt-12 sm:pt-16 md:pt-20 pb-6 ${
          activeTheme === 'golden-safari'
            ? 'bg-gradient-to-b from-transparent via-amber-500/[0.06] to-background'
            : 'bg-gradient-to-b from-transparent via-emerald-500/[0.08] to-background'
        }`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              {/* Lihat Peta - Green with icon box & dynamic shadow */}
              <Link 
                href="/map" 
                className={`flex items-center gap-1.5 md:gap-2 backdrop-blur-xl bg-primary/85 dark:bg-primary/75 text-primary-foreground border border-white/25 pl-1 pr-3 py-1 md:pl-1.5 md:pr-5 md:py-1.5 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm hover:scale-105 transition-all ${
                  activeTheme === 'golden-safari'
                    ? 'shadow-[0_10px_25px_-5px_rgba(217,119,6,0.3),0_8px_10px_-6px_rgba(245,158,11,0.2)] hover:shadow-[0_16px_32px_-6px_rgba(217,119,6,0.4)]'
                    : 'shadow-[0_10px_25px_-5px_rgba(5,150,105,0.35),0_8px_10px_-6px_rgba(5,150,105,0.2)] hover:shadow-[0_16px_32px_-6px_rgba(5,150,105,0.45)]'
                }`}
              >
                <div className="w-7 h-7 md:w-9 md:h-9 bg-primary-foreground rounded-lg md:rounded-xl flex items-center justify-center shadow-inner">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                {t('see_map')}
              </Link>
              
              {/* Beli Tiket - Orange with icon box - Conditional based on settings */}
              {showHeroTicketButton && (
                settings?.ticket_external_url ? (
                  <a 
                    href={settings.ticket_external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 md:gap-2 backdrop-blur-xl bg-secondary/85 dark:bg-secondary/75 text-secondary-foreground border border-white/25 pl-1 pr-3 py-1 md:pl-1.5 md:pr-5 md:py-1.5 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm hover:scale-105 transition-all ${
                      activeTheme === 'golden-safari'
                        ? 'shadow-[0_10px_25px_-5px_rgba(217,119,6,0.4),0_8px_10px_-6px_rgba(245,158,11,0.25)] hover:shadow-[0_16px_32px_-6px_rgba(217,119,6,0.5)]'
                        : 'shadow-[0_10px_25px_-5px_rgba(13,148,136,0.35),0_8px_10px_-6px_rgba(5,150,105,0.2)] hover:shadow-[0_16px_32px_-6px_rgba(13,148,136,0.45)]'
                    }`}
                  >
                    <div className="w-7 h-7 md:w-9 md:h-9 bg-secondary-foreground rounded-lg md:rounded-xl flex items-center justify-center shadow-inner">
                      <Ticket className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                    </div>
                    {t('buy_tickets')}
                  </a>
                ) : (
                  <Link 
                    href="/tickets" 
                    className={`flex items-center gap-1.5 md:gap-2 backdrop-blur-xl bg-secondary/85 dark:bg-secondary/75 text-secondary-foreground border border-white/25 pl-1 pr-3 py-1 md:pl-1.5 md:pr-5 md:py-1.5 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm hover:scale-105 transition-all ${
                      activeTheme === 'golden-safari'
                        ? 'shadow-[0_10px_25px_-5px_rgba(217,119,6,0.4),0_8px_10px_-6px_rgba(245,158,11,0.25)] hover:shadow-[0_16px_32px_-6px_rgba(217,119,6,0.5)]'
                        : 'shadow-[0_10px_25px_-5px_rgba(13,148,136,0.35),0_8px_10px_-6px_rgba(5,150,105,0.2)] hover:shadow-[0_16px_32px_-6px_rgba(13,148,136,0.45)]'
                    }`}
                  >
                    <div className="w-7 h-7 md:w-9 md:h-9 bg-secondary-foreground rounded-lg md:rounded-xl flex items-center justify-center shadow-inner">
                      <Ticket className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                    </div>
                    {t('buy_tickets')}
                  </Link>
                )
              )}
              
              {/* Lihat Jadwal - Teal/Blue with icon box */}
              <Link 
                href="/events" 
                className={`flex items-center gap-1.5 md:gap-2 backdrop-blur-xl bg-accent/85 dark:bg-accent/75 text-accent-foreground border border-white/25 pl-1 pr-3 py-1 md:pl-1.5 md:pr-5 md:py-1.5 rounded-xl md:rounded-2xl font-semibold text-xs md:text-sm hover:scale-105 transition-all ${
                  activeTheme === 'golden-safari'
                    ? 'shadow-[0_10px_25px_-5px_rgba(217,119,6,0.25),0_8px_10px_-6px_rgba(245,158,11,0.15)] hover:shadow-[0_16px_32px_-6px_rgba(217,119,6,0.35)]'
                    : 'shadow-[0_10px_25px_-5px_rgba(13,148,136,0.35),0_8px_10px_-6px_rgba(13,148,136,0.2)] hover:shadow-[0_16px_32px_-6px_rgba(13,148,136,0.4)]'
                }`}
              >
                <div className="w-7 h-7 md:w-9 md:h-9 bg-accent-foreground rounded-lg md:rounded-xl flex items-center justify-center shadow-inner">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                </div>
                {t('see_schedule')}
              </Link>
            </div>

            {/* Quick Explore Chips (Pintasan Populer dengan Ikon Vektor Alami) */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap pt-4 max-w-4xl mx-auto">
              <Link
                href="/fauna"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-foreground border border-border/70 shadow-2xs backdrop-blur-md hover:scale-105 transition-all btn-interactive group"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <PawPrint className="w-3 h-3" />
                </span>
                <span>{language === 'en' ? 'Fauna Collection' : 'Koleksi Satwa'}</span>
              </Link>

              <Link
                href="/flora"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-foreground border border-border/70 shadow-2xs backdrop-blur-md hover:scale-105 transition-all btn-interactive group"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Leaf className="w-3 h-3" />
                </span>
                <span>{language === 'en' ? 'Rare Flora' : 'Flora Langka'}</span>
              </Link>

              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-foreground border border-border/70 shadow-2xs backdrop-blur-md hover:scale-105 transition-all btn-interactive group"
              >
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Navigation className="w-3 h-3" />
                </span>
                <span>{language === 'en' ? 'GPS Interactive Map' : 'Peta Rute & GPS'}</span>
              </Link>

              <Link
                href="/audio-guide"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-foreground border border-border/70 shadow-2xs backdrop-blur-md hover:scale-105 transition-all btn-interactive group"
              >
                <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Headphones className="w-3 h-3" />
                </span>
                <span>{language === 'en' ? 'Audio Tour Guide' : 'Panduan Audio'}</span>
              </Link>

              <Link
                href="/gallery-3d"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-foreground border border-border/70 shadow-2xs backdrop-blur-md hover:scale-105 transition-all btn-interactive group"
              >
                <span className="w-5 h-5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Box className="w-3 h-3" />
                </span>
                <span>{language === 'en' ? '3D Virtual Animals' : 'Galeri Satwa 3D'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Info Section - Adaptive Live Weather & Ambient Theme Controller */}
      <section className="py-3 md:py-2 px-4 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <WeatherAtmosphereWidget />
        </div>
      </section>

      {/* What's New Carousel */}
      <WhatsNewCarousel />

      {/* Feeding Time Schedule */}
      <FeedingTimeSchedule />

      {/* News Section - Moved above Highlight Satwa */}
      <section className="px-4">
        <div className="container mx-auto">
          <NewsSection />
        </div>
      </section>

      {/* Highlight Satwa Section - Modern Carousel */}
      <FeaturedAnimalsCarousel animals={featuredAnimals} loading={animalsLoading} />

      {/* Event Mendatang Section - Modern Carousel */}
      <UpcomingEventsCarousel events={upcomingEvents} loading={eventsLoading} />

      {/* Instagram Feed Section */}
      <InstagramFeed />

    </div>
  );
}
