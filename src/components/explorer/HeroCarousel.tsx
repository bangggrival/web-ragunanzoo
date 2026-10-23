import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import { HeroBanner } from '@/hooks/useHeroBanner';
import { Volume2, VolumeX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BannerAmbientAtmosphere from '@/components/ambient/BannerAmbientAtmosphere';
import { ActiveAmbientTheme, useWeatherAmbient } from '@/contexts/WeatherAmbientContext';

interface HeroCarouselProps {
  banners: HeroBanner[];
  fallbackImage?: string;
  autoplayDuration?: number; // in milliseconds
  loading?: boolean;
  ambientTheme?: ActiveAmbientTheme;
}

export default function HeroCarousel({ 
  banners, 
  fallbackImage,
  autoplayDuration = 6000,
  loading = false,
  ambientTheme
}: HeroCarouselProps) {
  let contextTheme: ActiveAmbientTheme = 'golden-safari';
  try {
    const weatherAmbient = useWeatherAmbient();
    contextTheme = weatherAmbient.activeTheme;
  } catch {
    // Graceful fallback if rendered outside provider
  }
  const currentTheme = ambientTheme || contextTheme;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  
  // Filter active banners or use all if none specifically active
  const displayBanners = banners.length > 0 ? banners : [];
  const hasBanners = displayBanners.length > 0;

  const isVideoRef = useRef(false);

  // Memoize autoplay plugin with dynamic duration. 
  // We disable stopOnMouseEnter here because the plugin will blindly resume autoplay 
  // on mouse leave, ruining our custom video pause logic. We handle it manually instead.
  const autoplayPlugin = useMemo(
    () => Autoplay({ delay: autoplayDuration, stopOnInteraction: false, stopOnMouseEnter: false }),
    [autoplayDuration]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 30,
    },
    [autoplayPlugin]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    
    const autoplay = emblaApi.plugins().autoplay;
    let isCurrentVideo = false;

    // Pause all videos except the selected one
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === newIndex) {
          isCurrentVideo = true;
          video.currentTime = 0; // Reset video to start
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });

    isVideoRef.current = isCurrentVideo;

    // If current slide is a video, stop autoplay so the video can play fully
    if (autoplay) {
      if (isCurrentVideo) {
        autoplay.stop();
      } else {
        autoplay.reset();
        autoplay.play();
      }
    }
  }, [emblaApi]);

  const handleMouseEnter = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;
    if (autoplay) autoplay.stop();
  }, [emblaApi]);

  const handleMouseLeave = useCallback(() => {
    const autoplay = emblaApi?.plugins().autoplay;
    // Only resume autoplay if the current slide is NOT a video
    if (autoplay && !isVideoRef.current) {
      autoplay.play();
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Hack for iOS / mobile autoplay
  useEffect(() => {
    videoRefs.current.forEach(video => {
      if (video) {
        video.defaultMuted = true;
        video.muted = isMuted;
      }
    });
  }, [isMuted, banners]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRefs.current.forEach(video => {
      if (video) video.muted = !isMuted;
    });
  };

  // Check if any banner has video
  const hasVideo = displayBanners.some(b => b.video_url || b.media_type === 'video');

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="relative w-full aspect-square md:aspect-[16/9] lg:aspect-[2.5/1] bg-slate-950/5 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
    );
  }

  // If no banners and no fallback image, don't render hero section
  if (!hasBanners && !fallbackImage) {
    return null;
  }

  // If no banners but has fallback image from database
  if (!hasBanners && fallbackImage) {
    return (
      <div className="relative w-full aspect-square md:aspect-[16/9] lg:aspect-[2.5/1] bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 transition-opacity duration-700">
          <img 
            src={fallbackImage} 
            alt="Ragunan Zoo Background" 
            className="w-full h-full object-contain"
          />
        </div>
        <BannerAmbientAtmosphere theme={currentTheme} />
      </div>
    );
  }

  // Render clickable banner content (image or video)
  const renderBannerContent = (banner: HeroBanner, index: number) => {
    const isVideo = banner.media_type === 'video' && banner.video_url;
    
    const mediaContent = isVideo ? (
      <video
        ref={el => { videoRefs.current[index] = el; }}
        src={banner.video_url!}
        className="w-full h-full object-contain"
        loop={displayBanners.length === 1} // Only loop if it's the only banner
        muted={isMuted}
        playsInline={true}
        autoPlay={index === selectedIndex}
        onTimeUpdate={() => {
          const autoplay = emblaApi?.plugins().autoplay;
          if (autoplay) autoplay.stop();
        }}
        onEnded={() => {
          if (emblaApi && displayBanners.length > 1) {
            emblaApi.scrollNext();
          }
        }}
      />
    ) : (
      <img 
        src={banner.image_url || fallbackImage} 
        alt={`Hero Banner ${index + 1}`} 
        className="w-full h-full object-contain"
      />
    );

    const content = (
      <div className={cn(
        "absolute inset-0 transition-all duration-700 ease-out flex items-center justify-center bg-slate-950",
        banner.link_url && "cursor-pointer",
        selectedIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
      )}>
        {/* Professional cinematic blurred background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-[-10%] blur-3xl opacity-30 scale-110">
            {isVideo ? (
              <video src={banner.video_url!} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <img src={banner.image_url || fallbackImage} className="w-full h-full object-cover" />
            )}
          </div>
          {/* Subtle dark overlay to make main content pop */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 w-full h-full drop-shadow-2xl">
          {mediaContent}
        </div>
      </div>
    );

    // If banner has link_url, wrap in Link or anchor
    if (banner.link_url) {
      const isExternal = banner.link_url.startsWith('http');
      if (isExternal) {
        return (
          <a 
            href={banner.link_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block absolute inset-0"
          >
            {content}
          </a>
        );
      }
      return (
        <Link href={banner.link_url} className="block absolute inset-0">
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <div 
      className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[21/9] bg-slate-950 overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {displayBanners.map((banner, index) => (
            <div 
              key={banner.id} 
              className="flex-[0_0_100%] min-w-0 relative h-full"
            >
              {renderBannerContent(banner, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Adaptive Ambient Theme Overlay (Golden Safari Sunlight / Rainforest Emerald Mist) */}
      <BannerAmbientAtmosphere theme={currentTheme} />

      {/* Video Mute Toggle */}
      {hasVideo && (
        <button
          onClick={toggleMute}
          className="absolute bottom-24 md:bottom-28 left-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* Dot Indicators */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-16 sm:bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-30">
          {displayBanners.map((_, index) => (
            <div
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "rounded-full transition-all duration-300 shadow-sm cursor-pointer",
                selectedIndex === index 
                  ? "bg-white" 
                  : "bg-white/50 hover:bg-white/80"
              )}
              style={{
                width: selectedIndex === index ? '16px' : '5px',
                height: '5px',
                padding: 0,
                margin: 0
              }}
              role="button"
              tabIndex={0}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
