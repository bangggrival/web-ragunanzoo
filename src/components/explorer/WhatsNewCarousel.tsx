import { useMemo } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Sparkles, Calendar, Newspaper, PawPrint, Building2 } from 'lucide-react';
import { useWhatsNewItems } from '@/hooks/useWhatsNewItems';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import ModernMediaCard from '@/components/ui/ModernMediaCard';



const typeConfig = {
  animal: { icon: PawPrint, label: { id: 'Satwa Baru', en: 'New Animal' }, color: 'bg-primary' },
  event: { icon: Calendar, label: { id: 'Event', en: 'Event' }, color: 'bg-accent' },
  news: { icon: Newspaper, label: { id: 'Berita', en: 'News' }, color: 'bg-secondary' },
  venue: { icon: Building2, label: { id: 'Venue', en: 'Venue' }, color: 'bg-muted-foreground' },
};

export default function WhatsNewCarousel() {
  const { items, loading } = useWhatsNewItems();
  const { language, getText } = useLanguage();

  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const getLocalImage = (imageUrl: string | null) => {
    return imageUrl || undefined;
  };

  // Filter active items only
  const activeItems = useMemo(() => {
    return items.filter(item => item.is_active);
  }, [items]);

  if (loading) {
    return (
      <section className="py-4 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-secondary" />
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-[0_0_75%] sm:flex-[0_0_45%] md:flex-[0_0_30%] h-48 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section className="py-4 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-bold text-secondary">
            {language === 'en' ? "What's New" : 'Yang Terbaru'}
          </h3>
        </div>

        {/* Carousel */}
        <div ref={emblaRef} className="overflow-hidden -mx-2">
          <div className="flex">
            {activeItems.map((item) => {
              const config = typeConfig[item.item_type];
              const Icon = config.icon;
              const timeAgo = formatDistanceToNow(new Date(item.created_at), { 
                addSuffix: true, 
                locale: language === 'en' ? enUS : idLocale 
              });

              const title = getText(item.title_id, item.title_en, item.title_id);

              return (
                <div 
                  key={item.id} 
                  className="flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_32%] min-w-0 px-2.5"
                >
                  <ModernMediaCard
                    href={item.link_url}
                    imageSrc={getLocalImage(item.image_url) || '/placeholder.svg'}
                    imageAlt={title}
                    title={title}
                    subtitle={item.subtitle || undefined}
                    aspectRatio="video"
                    badgeTopLeft={
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md border border-white/20 shadow-sm ${config.color} text-white`}>
                        <Icon className="w-3 h-3" />
                        <span>{config.label[language]}</span>
                      </div>
                    }
                    metaLabel={timeAgo}
                    metaIcon={<Sparkles className="w-3 h-3 text-amber-400" />}
                    actionText={language === 'en' ? 'Explore' : 'Jelajahi'}
                    className="h-full"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
