import { X, MapPin, PawPrint, Footprints, Clock, Navigation, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import type { Animal } from '@/hooks/useAnimals';

interface ZoneInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  zone: string;
  color: string;
  animals: Animal[];
  description: string;
  distanceKm?: number | null;
  walkingTimeMinutes?: number | null;
  targetCoords?: { lat: number; lng: number } | null;
  onSelectForRoute?: () => void;
  onSelectAsOrigin?: () => void;
}

export default function ZoneInfoModal({ 
  isOpen, 
  onClose, 
  zone, 
  color, 
  animals,
  description,
  distanceKm,
  walkingTimeMinutes,
  targetCoords,
  onSelectForRoute,
  onSelectAsOrigin
}: ZoneInfoModalProps) {
  const { language } = useLanguage();

  const getAnimalImage = (imageUrl: string | null) => {
    return imageUrl || '';
  };

  const formattedDistance = distanceKm != null
    ? distanceKm < 1
      ? `${Math.round(distanceKm * 1000)} meter`
      : `${distanceKm.toFixed(1)} km`
    : null;

  const googleMapsUrl = targetCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${targetCoords.lat},${targetCoords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Taman Margasatwa Ragunan ' + zone)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden rounded-3xl border border-border/80 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header with Zone Color & Atmospheric Pattern */}
        <div 
          className="relative px-6 py-5 text-white overflow-hidden flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {/* Subtle decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -right-2 -bottom-10 w-24 h-24 rounded-full bg-black/10 pointer-events-none" />

          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-xl font-extrabold text-white tracking-tight">
                <span className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </span>
                  <span>{language === 'en' ? `${zone} Zone` : `Zona ${zone}`}</span>
                </span>
              </DialogTitle>
            </DialogHeader>

            <p className="text-white/90 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-3 sm:line-clamp-none">
              {description}
            </p>

            {/* Distance & ETA walking badge if user location is active */}
            {formattedDistance && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                  <Footprints className="w-3.5 h-3.5 text-amber-300" />
                  <span>{formattedDistance}</span>
                </span>
                {walkingTimeMinutes != null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                    <Clock className="w-3.5 h-3.5 text-emerald-300" />
                    <span>~{walkingTimeMinutes} {language === 'en' ? 'min walk' : 'menit jalan kaki'}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Animals List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 overscroll-contain">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PawPrint className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'en' ? 'Animals in this zone' : 'Satwa di zona ini'}</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
              {animals.length} {language === 'en' ? 'species' : 'spesies'}
            </span>
          </div>
          
          {animals.length > 0 ? (
            <div className="space-y-2">
              {animals.map((animal) => (
                <Link
                  key={animal.id}
                  href={`/animals/${animal.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/40 hover:bg-muted/90 border border-border/60 hover:border-primary/40 transition-all group shadow-2xs hover:shadow-sm"
                >
                  <img
                    src={getAnimalImage(animal.image_url)}
                    alt={animal.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-border/80 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {animal.name}
                    </h5>
                    <p className="text-xs text-muted-foreground italic truncate">
                      {animal.latin_name}
                    </p>
                    {(animal as any).category && (
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md bg-background text-[10px] font-semibold text-primary border border-border/60">
                        {language === 'en' 
                          ? (animal as any).category_en || (animal as any).category
                          : (animal as any).category
                        }
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 px-4 bg-muted/20 rounded-2xl border border-dashed border-border/80">
              <p className="text-muted-foreground text-xs">
                {language === 'en' 
                  ? 'No specific animal profiles listed under this zone yet.' 
                  : 'Belum ada data rincian satwa terdaftar di zona ini.'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3 sm:p-4 pt-2 border-t border-border/60 bg-card/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
          {onSelectForRoute && (
            <button
              type="button"
              onClick={() => {
                onSelectForRoute();
                onClose();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Navigate to Here' : 'Pandu Rute ke Sini'}</span>
            </button>
          )}

          {onSelectAsOrigin && (
            <button
              type="button"
              onClick={() => {
                onSelectAsOrigin();
                onClose();
              }}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-muted hover:bg-muted/90 text-foreground text-xs font-bold border border-border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Mulai rute perjalanan dari titik ini"
            >
              <Footprints className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'Start From Here' : 'Mulai Dari Sini'}</span>
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Google Maps</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
