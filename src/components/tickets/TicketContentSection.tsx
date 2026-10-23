import { useState } from 'react';
import { TicketContent } from '@/hooks/useTicketContent';
import { useLanguage } from '@/contexts/LanguageContext';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { FileText, Tag, CreditCard, ScrollText } from 'lucide-react';

interface TicketContentSectionProps {
  contents: TicketContent[];
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  info: FileText,
  promo: Tag,
  payment_method: CreditCard,
  rule: ScrollText,
};

const typeColors: Record<string, any> = {
  info: 'bg-blue-500/10 text-blue-600',
  promo: 'bg-green-500/10 text-green-600',
  payment_method: 'bg-purple-500/10 text-purple-600',
  rule: 'bg-orange-500/10 text-orange-600',
};

export function TicketContentSection({ contents }: TicketContentSectionProps) {
  const { language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (imageUrl: string, allImages: string[]) => {
    const index = allImages.indexOf(imageUrl);
    setLightboxImages(allImages);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  // Collect all images for lightbox navigation
  const allImages = contents.filter((c) => c.image_url).map((c) => c.image_url!);

  // Group contents by type
  const groupedContents = contents.reduce((acc, content) => {
    const type = content.content_type || 'info';
    if (!acc[type]) acc[type] = [];
    acc[type].push(content);
    return acc;
  }, {} as Record<string, TicketContent[]>);

  if (contents.length === 0) return null;

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedContents).map(([type, items]) => {
          const Icon = typeIcons[type] || FileText;
          const colorClass = typeColors[type] || 'bg-gray-500/10 text-gray-600';

          return (
            <div key={type} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg capitalize">
                  {type === 'info' && (language === 'en' ? 'Information' : 'Informasi')}
                  {type === 'promo' && (language === 'en' ? 'Promotions' : 'Promo')}
                  {type === 'payment_method' && (language === 'en' ? 'Payment Methods' : 'Metode Pembayaran')}
                  {type === 'rule' && (language === 'en' ? 'Rules & Regulations' : 'Peraturan')}
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {items.map((content) => {
                  const title = language === 'en' && content.title_en ? content.title_en : content.title_id;
                  const description =
                    language === 'en' && content.description_en
                      ? content.description_en
                      : content.description_id;

                  return (
                    <div
                      key={content.id}
                      className="group flex flex-col rounded-2xl md:rounded-3xl bg-card border border-border/70 hover:border-primary/40 p-4 sm:p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-500 ease-spring"
                    >
                      {content.image_url && (
                        <div
                          className="relative mb-4 cursor-pointer overflow-hidden rounded-xl md:rounded-2xl bg-muted/60"
                          onClick={() => handleImageClick(content.image_url!, allImages)}
                        >
                          <img
                            src={content.image_url}
                            alt={title}
                            className="w-full h-48 sm:h-52 object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.05]"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-md">
                              {language === 'en' ? 'Click to enlarge' : 'Klik untuk memperbesar'}
                            </span>
                          </div>
                        </div>
                      )}
                      <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">{title}</h4>
                      {description && (
                        <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                          {description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
