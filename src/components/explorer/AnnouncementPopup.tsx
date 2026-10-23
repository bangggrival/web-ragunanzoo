import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface Announcement {
  id: number;
  title: string;
  title_id: string | null;
  title_en: string | null;
  content: string;
  content_id: string | null;
  content_en: string | null;
  image_url: string | null;
  is_active: boolean;
}

const AUTOPLAY_INTERVAL = 4000; // 4 seconds

export default function AnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const { getText } = useLanguage();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchActiveAnnouncements();
  }, []);

  // Lock body scroll when popup is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Autoplay functionality
  useEffect(() => {
    if (!api || count <= 1) return;

    const startAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
      
      if (isPlaying) {
        autoplayRef.current = setInterval(() => {
          api.scrollNext();
        }, AUTOPLAY_INTERVAL);
      }
    };

    startAutoplay();

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [api, count, isPlaying]);

  // Reset autoplay timer on manual navigation
  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current && isPlaying) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
        api?.scrollNext();
      }, AUTOPLAY_INTERVAL);
    }
  }, [api, isPlaying]);

  const fetchActiveAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Filter only announcements with images
      const withImages = (data as Announcement[]).filter(a => a.image_url);
      if (withImages.length > 0) {
        setAnnouncements(withImages);
        setIsVisible(true);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
    resetAutoplay();
  }, [api, resetAutoplay]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
    resetAutoplay();
  }, [api, resetAutoplay]);

  const toggleAutoplay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleDotClick = useCallback((index: number) => {
    api?.scrollTo(index);
    resetAutoplay();
  }, [api, resetAutoplay]);

  if (!mounted || !isVisible || announcements.length === 0) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] animate-fade-in backdrop-blur-md p-4 sm:p-6"
      style={{ margin: 0, padding: '16px' }}
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-[90vw] sm:max-w-[450px] md:max-w-[550px] lg:max-w-[650px] animate-slide-down flex flex-col items-center bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-2 right-2 sm:-top-5 sm:-right-5 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-gray-100 text-black rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 border border-gray-200"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Carousel */}
        <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {announcements.map((announcement) => {
              const displayTitle = getText(announcement.title_id, announcement.title_en, announcement.title);
              return (
                <CarouselItem key={announcement.id} className="flex items-center justify-center">
                  <img 
                    src={announcement.image_url!} 
                    alt={displayTitle}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl mx-auto"
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Navigation arrows - only show on desktop if multiple announcements */}
        {count > 1 && (
          <div className="hidden sm:block">
            <button
              onClick={scrollPrev}
              className="absolute -left-2 sm:-left-6 md:-left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute -right-2 sm:-right-6 md:-right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Dots indicator and autoplay toggle */}
        {count > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={toggleAutoplay}
              className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-all"
              aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === current 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Custom slide-down animation */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
