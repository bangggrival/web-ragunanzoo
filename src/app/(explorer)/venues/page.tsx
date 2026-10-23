"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useVenues, type Venue } from '@/hooks/useVenues';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin, Users, Clock, Calendar as CalendarIcon, Wifi, Car, Music, Utensils, Building2,
  MessageCircle, X, ZoomIn, ZoomOut, RotateCcw, Phone, Image as ImageIcon,
  ChevronRight, ArrowRight, CheckCircle2, Search, ArrowUpDown, Sparkles, Filter, Check,
  Trees, PartyPopper, Camera, HeartHandshake, ShieldCheck, HelpCircle, AlertCircle, ClipboardList
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVenueHeroSettings } from '@/hooks/useVenueHeroSettings';
import { useDebounce } from '@/hooks/useDebounce';
import dynamic from 'next/dynamic';
import LazyImage from '@/components/ui/LazyImage';

const Panorama360Viewer = dynamic(() => import('@/components/panorama/Panorama360Viewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-900 text-white gap-3 p-6">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-sm font-medium text-slate-300">Memuat Visual Panorama 360°...</p>
    </div>
  ),
});
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useVenueBookings } from '@/hooks/useVenueBookings';
import { eachDayOfInterval, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const facilityIcons: Record<string, React.ElementType> = {
  'WiFi': Wifi,
  'Parkir': Car,
  'Sound System': Music,
  'Catering': Utensils,
};

const placeholderImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60';

type SortOption = 'name' | 'capacity' | 'price';
type CategoryFilter = 'all' | 'pendopo' | 'outdoor' | 'indoor';

export default function Venues() {
  const { venues, loading } = useVenues();
  const { settings } = useSiteSettings();
  const { language } = useLanguage();
  const { heroSettings } = useVenueHeroSettings();
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | undefined>(undefined);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [showPanorama, setShowPanorama] = useState(false);

  // Reset selected booking date when venue changes
  useEffect(() => {
    setSelectedBookingDate(undefined);
  }, [selectedVenue]);

  const { bookings } = useVenueBookings(selectedVenue?.id);
  const bookedDates = bookings
    .filter(b => b.status === 'confirmed')
    .flatMap(b => {
      try {
        return eachDayOfInterval({ start: new Date(b.start_date), end: new Date(b.end_date) });
      } catch { return []; }
    });

  const availableVenues = useMemo(() => venues.filter(v => v.is_available), [venues]);

  const filteredAndSortedVenues = useMemo(() => {
    let result = availableVenues.filter(venue => {
      const matchesSearch = 
        venue.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (venue.description && venue.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
        (venue.facilities && venue.facilities.some(f => f.toLowerCase().includes(debouncedSearchQuery.toLowerCase())));

      let matchesCategory = true;
      const lowerName = venue.name.toLowerCase();
      if (categoryFilter === 'pendopo') {
        matchesCategory = lowerName.includes('pendopo');
      } else if (categoryFilter === 'outdoor') {
        matchesCategory = lowerName.includes('taman') || lowerName.includes('outdoor') || lowerName.includes('lapangan') || lowerName.includes('open');
      } else if (categoryFilter === 'indoor') {
        matchesCategory = lowerName.includes('aula') || lowerName.includes('gedung') || lowerName.includes('hall') || lowerName.includes('serbaguna');
      }

      return matchesSearch && matchesCategory;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'capacity') return (b.capacity || 0) - (a.capacity || 0);
      if (sortBy === 'price') return (a.price_per_day || 0) - (b.price_per_day || 0);
      return 0;
    });

    return result;
  }, [availableVenues, debouncedSearchQuery, categoryFilter, sortBy]);

  const whatsappNumber = settings?.venue_whatsapp_number || settings?.whatsapp_number;
  const phoneNumber = settings?.venue_phone_number;

  const onCarouselSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    onCarouselSelect();
    carouselApi.on('select', onCarouselSelect);
    return () => { carouselApi.off('select', onCarouselSelect); };
  }, [carouselApi, onCarouselSelect]);

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const getFacilityIcon = (facility: string) => {
    return (facilityIcons[facility] || Building2) as any;
  };

  const getVenueImages = (venue: Venue): string[] => {
    let images: string[] = [];
    if (venue.image_urls && Array.isArray(venue.image_urls)) {
      images = venue.image_urls.filter(url => typeof url === 'string' && url.trim() !== '');
    }
    if (images.length === 0 && venue.image_url && typeof venue.image_url === 'string' && venue.image_url.trim() !== '') {
      images = [venue.image_url];
    }
    if (images.length === 0) {
      images = [placeholderImage];
    }
    return images;
  };

  const getWhatsAppLink = (venue: Venue, targetDate?: Date) => {
    const numberToUse = venue.whatsapp_number || whatsappNumber;
    if (!numberToUse) return null;
    let cleanNumber = numberToUse.replace(/[^\d+]/g, '');
    if (cleanNumber.startsWith('+')) cleanNumber = cleanNumber.slice(1);
    if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.slice(1);
    if (!cleanNumber.startsWith('62')) cleanNumber = '62' + cleanNumber;

    let dateText = '';
    if (targetDate) {
      const formattedDate = targetDate.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      dateText = language === 'id' ? ` untuk tanggal ${formattedDate}` : ` for ${formattedDate}`;
    }

    const message = encodeURIComponent(
      language === 'id'
        ? `Selamat siang Pengelola Ragunan Zoo, saya ingin mengajukan sewa tempat ${venue.name}${dateText}. Mohon informasi ketersediaan jadwal dan persyaratan berkas.`
        : `Hello Ragunan Zoo Management, I would like to inquire about renting ${venue.name}${dateText}. Please share availability and requirements.`
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  const openZoomModal = (imageIndex: number) => {
    setZoomImageIndex(imageIndex);
    setZoomModalOpen(true);
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background pb-12">
      
      {/* ══════════ HERO HEADER ══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 text-white">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-400/10 rounded-full blur-2xl animate-float pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 md:gap-8">
            
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-emerald-300/80 mb-2.5 font-medium">
                <Building2 className="w-3.5 h-3.5" />
                <span>Fasilitas</span>
                <ChevronRight className="w-3 h-3 text-emerald-400/50" />
                <span className="text-white font-semibold">{language === 'id' ? 'Sewa Tempat' : 'Venue Rental'}</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-xs font-semibold backdrop-blur-sm mb-3.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>{heroSettings.badge_text}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-3.5 tracking-tight">
                {heroSettings.title_text}
              </h1>

              <p className="text-emerald-100/80 text-xs sm:text-sm md:text-base leading-relaxed mb-5">
                {heroSettings.subtitle_text}
              </p>

              {/* Quick Key Highlights */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {[
                  { icon: <Users className="w-3.5 h-3.5 text-emerald-300" />, label: heroSettings.highlight_1 },
                  { icon: <Trees className="w-3.5 h-3.5 text-emerald-300" />, label: heroSettings.highlight_2 },
                  { icon: <Car className="w-3.5 h-3.5 text-emerald-300" />, label: heroSettings.highlight_3 },
                ].filter(item => item.label && item.label.trim() !== '').map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-[11px] sm:text-xs text-white backdrop-blur-md">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action CTA Box */}
            {(whatsappNumber || phoneNumber) && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:w-80 flex flex-col gap-3.5 shadow-2xl">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white mb-1">
                    {heroSettings.info_title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-emerald-100/70 leading-relaxed">
                    {heroSettings.info_desc}
                  </p>
                </div>

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(language === 'id' ? 'Selamat siang Pengelola Ragunan Zoo, saya ingin bertanya mengenai prosedur sewa tempat.' : 'Hello Ragunan Zoo Management, I would like to inquire about venue rental procedures.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BC5A] text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl active:scale-98"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {language === 'id' ? 'Hubungi Pengelola via WhatsApp' : 'Contact via WhatsApp'}
                  </a>
                )}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ══════════ 3-STEP RESERVATION FLOW ══════════ */}
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-5 sm:mb-6">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {language === 'id' ? 'Alur Pengajuan Sewa Tempat' : 'Reservation Workflow'}
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              {language === 'id' ? 'Tahapan pemesanan dan penggunaan area acara di Taman Margasatwa Ragunan' : 'Steps for reserving event areas at Ragunan Zoo'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 relative">
            {[
              {
                step: '01',
                title: language === 'id' ? 'Pilih Lokasi' : 'Select Location',
                desc: language === 'id' ? 'Pilih pendopo atau area terbuka yang sesuai dengan rencana kegiatan Anda.' : 'Choose pendopo or open space suited for your planned activity.'
              },
              {
                step: '02',
                title: language === 'id' ? 'Cek Tanggal' : 'Check Dates',
                desc: language === 'id' ? 'Klik nama lokasi untuk melihat kalender ketersediaan tanggal.' : 'Click location name to review available calendar dates.'
              },
              {
                step: '03',
                title: language === 'id' ? 'Konfirmasi Pengelola' : 'Confirm Management',
                desc: language === 'id' ? 'Hubungi pengelola via WhatsApp untuk verifikasi jadwal dan kelengkapan izin.' : 'Contact management via WhatsApp to verify schedule and permits.'
              }
            ].map((s, idx) => (
              <div key={idx} className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/50 relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs sm:text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1">{s.title}</h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SEARCH & FILTER BAR ══════════ */}
      <section className="container mx-auto px-4 pb-4 sm:pb-6">
        <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'id' ? 'Cari nama lokasi atau fasilitas...' : 'Search location name or facility...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-muted/50 border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 sm:py-2.5 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-colors text-xs sm:text-sm whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {sortBy === 'name' ? (language === 'id' ? 'Nama (A-Z)' : 'Name (A-Z)') :
                     sortBy === 'capacity' ? (language === 'id' ? 'Kapasitas (Terbesar)' : 'Capacity (Highest)') :
                     (language === 'id' ? 'Tarif (Terendah)' : 'Price (Lowest)')}
                  </span>
                </div>
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 bg-card dark:bg-[#111C16] border border-border/90 shadow-2xl shadow-black/20 rounded-2xl z-50 min-w-[200px] p-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 ring-1 ring-black/5 dark:ring-white/10 w-full sm:w-auto">
                    {[
                      { id: 'name', label: language === 'id' ? 'Nama (A-Z)' : 'Name (A-Z)' },
                      { id: 'capacity', label: language === 'id' ? 'Kapasitas (Terbesar)' : 'Capacity (Highest)' },
                      { id: 'price', label: language === 'id' ? 'Tarif (Terendah)' : 'Price (Lowest)' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => { setSortBy(item.id as SortOption); setShowSortMenu(false); }}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 font-semibold ${
                          sortBy === item.id 
                            ? 'bg-primary text-white shadow-xs' 
                            : 'text-foreground hover:bg-muted hover:text-primary'
                        }`}
                      >
                        <span>{item.label}</span>
                        {sortBy === item.id && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Category Filter Pills (Scrollable horizontally on small screens) */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-border/50 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: heroSettings.cat_all_label },
              { id: 'pendopo', label: heroSettings.cat_pendopo_label },
              { id: 'outdoor', label: heroSettings.cat_outdoor_label },
              { id: 'indoor', label: heroSettings.cat_indoor_label }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  categoryFilter === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-background border border-border text-foreground hover:border-primary/50 hover:text-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════ VENUE GRID DISPLAY (Responsive 2-Column Card Grid) ══════════ */}
      <section className="container mx-auto px-4 pb-8 sm:pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden animate-pulse shadow-sm">
                <div className="aspect-video bg-muted" />
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedVenues.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-card border border-border rounded-2xl sm:rounded-3xl px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
              {language === 'id' ? 'Lokasi Tidak Ditemukan' : 'No Venues Found'}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm mb-5 max-w-sm mx-auto">
              {language === 'id' ? 'Sesuaikan kata kunci pencarian atau pilih kategori lain.' : 'Adjust your search terms or category filter.'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
              className="px-5 py-2 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              {language === 'id' ? 'Reset Pencarian' : 'Reset Search'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredAndSortedVenues.map((venue, index) => {
              const images = getVenueImages(venue);
              return (
                <div
                  key={venue.id}
                  onClick={() => setSelectedVenue(venue)}
                  className="group bg-card border border-border rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between shadow-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div>
                    {/* Photo Header */}
                    <div className="relative aspect-video overflow-hidden bg-slate-950">
                      <LazyImage
                        src={images[0]}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        wrapperClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-2">
                        <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-600 text-white shadow-md backdrop-blur-sm">
                          ✓ Tersedia
                        </span>
                      </div>

                      {venue.price_per_day && (
                        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-black/80 text-amber-300 backdrop-blur-md border border-amber-300/30 shadow-lg">
                            {formatPrice(venue.price_per_day)} <span className="text-[9px] sm:text-[10px] text-white/80 font-normal">/ {language === 'id' ? 'hari' : 'day'}</span>
                          </span>
                        </div>
                      )}

                      {/* Bottom 360 Indicator */}
                      {venue.has_panorama && (
                        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3">
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white backdrop-blur-md flex items-center gap-1 shadow-md">
                            <ImageIcon className="w-3 h-3" /> 360° Panorama
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 sm:p-5 md:p-6 space-y-2.5 sm:space-y-3">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                          {venue.name}
                        </h3>
                        {venue.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {venue.description}
                          </p>
                        )}
                      </div>

                      {/* Capacity & Facilities Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-border/50">
                        {venue.capacity && (
                          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-[11px] sm:text-xs font-bold">
                            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>{venue.capacity} {language === 'id' ? 'Orang' : 'Guests'}</span>
                          </div>
                        )}

                        {venue.facilities && venue.facilities.slice(0, 3).map((facility, idx) => {
                          const Icon = getFacilityIcon(facility);
                          return (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-muted text-muted-foreground text-[11px] sm:text-xs font-medium">
                              <Icon className="w-3 h-3" />
                              {facility}
                            </span>
                          );
                        })}

                        {venue.facilities && venue.facilities.length > 3 && (
                          <span className="px-2 py-1 rounded-xl bg-muted text-muted-foreground text-[10px] font-semibold">
                            +{venue.facilities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-4 sm:px-5 md:px-6 py-3 bg-muted/30 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary group-hover:underline">
                      {language === 'id' ? 'Lihat Detail & Jadwal Lokasi' : 'View Details & Schedule'}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════ EVENT TYPES SHOWCASE ══════════ */}
      <section className="container mx-auto px-4 pb-8 sm:pb-12">
        <div className="bg-gradient-to-br from-emerald-900/10 via-primary/5 to-teal-900/10 border border-primary/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/20">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>{heroSettings.events_badge}</span>
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mt-2">
              {heroSettings.events_title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {heroSettings.events_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />, title: heroSettings.event_1_title, desc: heroSettings.event_1_desc },
              { icon: <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />, title: heroSettings.event_2_title, desc: heroSettings.event_2_desc },
              { icon: <Trees className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />, title: heroSettings.event_3_title, desc: heroSettings.event_3_desc },
              { icon: <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />, title: heroSettings.event_4_title, desc: heroSettings.event_4_desc },
            ].map((item, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 text-center hover:border-primary/40 hover:shadow-md transition-all flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 text-left sm:text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CONTACT CTA BANNER ══════════ */}
      {(phoneNumber || whatsappNumber) && (
        <section className="container mx-auto px-4 pb-8 sm:pb-16">
          <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900 via-green-900 to-teal-950 text-white p-6 sm:p-8 md:p-10 text-center relative overflow-hidden shadow-xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3.5 backdrop-blur-sm border border-white/20">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white mb-2">
              {language === 'id' ? 'Butuh Informasi Lebih Lanjut?' : 'Need More Information?'}
            </h3>
            <p className="text-emerald-100/75 text-xs sm:text-sm mb-5 max-w-lg mx-auto leading-relaxed">
              {language === 'id'
                ? 'Layanan Informasi Taman Margasatwa Ragunan siap membantu Anda mengenai prosedur sewa tempat dan jadwal survei.'
                : 'Ragunan Zoo Information Service is ready to assist you with venue rental procedures and site visits.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber.replace(/[^\d+]/g, '')}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-950 hover:bg-emerald-50 px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all font-bold text-xs sm:text-sm shadow-md"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  {language === 'id' ? 'Telepon Kantor Pengelola' : 'Call Office'}
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(language === 'id' ? 'Selamat siang Layanan Informasi Ragunan, saya ingin berkonsultasi mengenai sewa tempat.' : 'Hello Ragunan Information Service, I would like to inquire about venue rental.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BC5A] text-white px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all font-bold text-xs sm:text-sm shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  Hubungi WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
           VENUE DETAIL MODAL (Fully Mobile Responsive & Clean Layout)
      ══════════════════════════════════════════════════ */}
      <Dialog open={!!selectedVenue} onOpenChange={() => setSelectedVenue(null)}>
        <DialogContent className="w-[94vw] sm:w-[90vw] max-w-4xl lg:max-w-5xl max-h-[90vh] sm:max-h-[92vh] p-0 rounded-2xl sm:rounded-3xl overflow-hidden border border-border/60 shadow-2xl bg-card flex flex-col">
          {selectedVenue && (() => {
            const images = getVenueImages(selectedVenue);
            return (
              <div className="flex flex-col h-full max-h-[90vh] sm:max-h-[92vh] overflow-hidden">
                
                {/* ── Modal Sticky Header ── */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 bg-muted/40 border-b border-border flex items-center justify-between flex-shrink-0 pr-12">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 flex-shrink-0">
                      ✓ Tersedia
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base md:text-lg text-foreground truncate">
                      {selectedVenue.name}
                    </h3>
                  </div>
                </div>

                {/* ── Modal Body Content (Scrollable Container) ── */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-border">

                  {/* ── Left Column: Photo Carousel & 360 Tour ── */}
                  <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-slate-950 p-3 sm:p-4 md:p-6 flex flex-col justify-between gap-3 sm:gap-4">
                    <div>
                      {/* Photo Frame (aspect-video on mobile, aspect-[4/3] on desktop) */}
                      <div className="relative w-full aspect-video lg:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center shadow-xl">
                        <Carousel className="w-full h-full" setApi={setCarouselApi}>
                          <CarouselContent className="h-full">
                            {images.map((image, index) => (
                              <CarouselItem key={index} className="h-full">
                                <div
                                  className="relative w-full h-full cursor-zoom-in group flex items-center justify-center"
                                  onClick={() => openZoomModal(index)}
                                >
                                  <img
                                    src={image}
                                    alt={selectedVenue.name}
                                    onError={(e) => { e.currentTarget.src = placeholderImage; }}
                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                                    <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          {images.length > 1 && (
                            <>
                              <CarouselPrevious className="left-2 bg-black/50 text-white border-none hover:bg-black/80 backdrop-blur-md w-7 h-7 sm:w-8 sm:h-8" />
                              <CarouselNext className="right-2 bg-black/50 text-white border-none hover:bg-black/80 backdrop-blur-md w-7 h-7 sm:w-8 sm:h-8" />
                            </>
                          )}
                        </Carousel>

                        {images.length > 1 && (
                          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white text-[10px] sm:text-[11px] px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10 shadow-md">
                            {currentSlide + 1} / {images.length}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Strip */}
                      {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
                          {images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => carouselApi?.scrollTo(index)}
                              className={`relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all bg-slate-900 p-0.5 ${
                                currentSlide === index
                                  ? 'border-primary ring-2 ring-primary/40 scale-105'
                                  : 'border-white/10 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={image}
                                alt=""
                                onError={(e) => { e.currentTarget.src = placeholderImage; }}
                                className="w-full h-full object-contain rounded-md"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 360° Virtual Tour Button */}
                    {selectedVenue.has_panorama && selectedVenue.panorama_url && (
                      <button
                        onClick={() => setShowPanorama(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-xs font-bold shadow-md"
                      >
                        <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {language === 'id' ? 'Lihat Virtual Tour 360°' : 'View 360° Virtual Tour'}
                      </button>
                    )}
                  </div>

                  {/* ── Right Column: Specs, Facilities & Calendar ── */}
                  <div className="flex-1 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">

                    {/* Venue Description */}
                    <div>
                      <h4 className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        {language === 'id' ? 'Deskripsi Lokasi' : 'Location Description'}
                      </h4>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {selectedVenue.description || (language === 'id' ? 'Lokasi kegiatan outdoor dan pendopo serbaguna di kawasan Taman Margasatwa Ragunan.' : 'Outdoor event location and pendopo at Ragunan Zoo.')}
                      </p>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {selectedVenue.capacity && (
                        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-muted/40 border border-border/60 rounded-xl sm:rounded-2xl">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                              {language === 'id' ? 'Kapasitas' : 'Capacity'}
                            </p>
                            <p className="font-bold text-foreground text-xs sm:text-sm">
                              {selectedVenue.capacity} {language === 'id' ? 'Orang' : 'pax'}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedVenue.price_per_day && (
                        <div className="flex items-center gap-2.5 p-2.5 sm:p-3 bg-muted/40 border border-border/60 rounded-xl sm:rounded-2xl">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                              {language === 'id' ? 'Tarif / Hari' : 'Rate / Day'}
                            </p>
                            <p className="font-bold text-primary text-xs sm:text-sm">
                              {formatPrice(selectedVenue.price_per_day)}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedVenue.phone_number && (
                        <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 p-2.5 sm:p-3 bg-muted/40 border border-border/60 rounded-xl sm:rounded-2xl">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                              {language === 'id' ? 'Telepon' : 'Phone'}
                            </p>
                            <a
                              href={`tel:${selectedVenue.phone_number}`}
                              className="font-bold text-foreground text-xs sm:text-sm hover:text-primary transition-colors block truncate"
                            >
                              {selectedVenue.phone_number}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Facilities Chips */}
                    {selectedVenue.facilities && selectedVenue.facilities.length > 0 && (
                      <div>
                        <h4 className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                          {language === 'id' ? 'Fasilitas Terlayani' : 'Available Facilities'}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {selectedVenue.facilities.map((facility, index) => {
                            const Icon = getFacilityIcon(facility);
                            return (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                              >
                                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {facility}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Calendar Availability Section */}
                    <div className="border border-border/70 rounded-xl sm:rounded-2xl overflow-hidden bg-card shadow-sm">
                      <div className="px-3.5 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          <h4 className="font-bold text-xs sm:text-sm text-foreground">
                            {language === 'id' ? 'Cek Kalender Ketersediaan' : 'Check Calendar Availability'}
                          </h4>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground hidden sm:inline">
                          {language === 'id' ? 'Klik tanggal untuk pengajuan' : 'Click date to select'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-4 flex flex-col items-center">
                        <div className="w-full max-w-[280px] sm:max-w-[300px] flex justify-center">
                          <CalendarComponent
                            mode="single"
                            selected={selectedBookingDate}
                            onSelect={(date) => {
                              if (date) {
                                const isBooked = bookedDates.some(b => isSameDay(b, date));
                                if (!isBooked) {
                                  setSelectedBookingDate(date);
                                }
                              } else {
                                setSelectedBookingDate(undefined);
                              }
                            }}
                            disabled={(date) => {
                              const isBooked = bookedDates.some(b => isSameDay(b, date));
                              return isBooked;
                            }}
                            modifiers={{ booked: bookedDates, selected: selectedBookingDate ? [selectedBookingDate] : [] }}
                            modifiersClassNames={{
                              booked: '!bg-rose-500 !text-white font-bold rounded-xl cursor-not-allowed opacity-90 line-through',
                              selected: '!bg-primary !text-white font-extrabold rounded-xl shadow-md scale-105'
                            }}
                            locale={language === 'id' ? idLocale : undefined}
                            className="p-0"
                          />
                        </div>

                        {/* Legend Bar */}
                        <div className="w-full flex items-center justify-center gap-3 sm:gap-5 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border text-[11px] sm:text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-rose-500 inline-block shadow-sm" />
                            {language === 'id' ? 'Terisi' : 'Booked'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md border border-primary text-primary inline-block shadow-sm" />
                            {language === 'id' ? 'Tersedia' : 'Available'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-md bg-primary inline-block shadow-sm" />
                            {language === 'id' ? 'Dipilih' : 'Selected'}
                          </span>
                        </div>
                      </div>

                      {/* Selected Date Box */}
                      {selectedBookingDate && (
                        <div className="p-2.5 sm:p-3 bg-primary/10 border-t border-primary/20 flex items-center justify-between">
                          <div className="text-[11px] sm:text-xs">
                            <span className="text-muted-foreground">{language === 'id' ? 'Tanggal Pengajuan:' : 'Selected Date:'}</span>{' '}
                            <span className="font-bold text-primary">
                              {selectedBookingDate.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedBookingDate(undefined)}
                            className="text-[10px] sm:text-[11px] text-muted-foreground hover:text-foreground underline font-medium"
                          >
                            {language === 'id' ? 'Batal' : 'Clear'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action WhatsApp Footer Box */}
                    <div className="bg-primary/8 border border-primary/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-3">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-foreground mb-0.5">
                          {language === 'id' ? 'Pengajuan Reservasi' : 'Reservation Request'}
                        </p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                          {selectedBookingDate
                            ? (language === 'id'
                              ? `Klik tombol di bawah untuk mengajukan reservasi tanggal ${selectedBookingDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ke petugas Pengelola Ragunan.`
                              : `Click below to send reservation request for ${selectedBookingDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} to management.`)
                            : (language === 'id'
                              ? 'Pilih tanggal pada kalender di atas, atau hubungi langsung pengelola untuk informasi selengkapnya.'
                              : 'Select an available date on the calendar above or contact management directly.')}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                        {(selectedVenue.whatsapp_number || whatsappNumber) && (
                          <a
                            href={getWhatsAppLink(selectedVenue, selectedBookingDate) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BC5A] text-white px-4 py-2.5 sm:py-3 rounded-xl transition-all font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-98"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {selectedBookingDate
                              ? (language === 'id' ? 'Ajukan Tanggal Ini via WhatsApp' : 'Request Date via WhatsApp')
                              : 'Hubungi WhatsApp Pengelola'}
                          </a>
                        )}

                        {selectedVenue.phone_number && (
                          <a
                            href={`tel:${selectedVenue.phone_number}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2.5 sm:py-3 rounded-xl transition-all font-semibold text-xs sm:text-sm"
                          >
                            <Phone className="w-4 h-4" />
                            {language === 'id' ? 'Telepon Kantor' : 'Call Office'}
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ══════════ ZOOM MODAL ══════════ */}
      <Dialog open={zoomModalOpen} onOpenChange={setZoomModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[92vh] sm:max-h-[95vh] p-0 bg-black/95 border-none rounded-2xl">
          {selectedVenue && (
            <div className="relative w-full h-[80vh] sm:h-[85vh]">
              <button
                onClick={() => setZoomModalOpen(false)}
                className="absolute top-3 right-3 z-50 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit>
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    {getVenueImages(selectedVenue).length > 1 && (
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                        {zoomImageIndex + 1} / {getVenueImages(selectedVenue).length}
                      </div>
                    )}

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1.5">
                      <button onClick={() => zoomOut()} className="text-white hover:text-primary p-1 rounded-full hover:bg-white/10 transition-colors">
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button onClick={() => resetTransform()} className="text-white hover:text-primary p-1 rounded-full hover:bg-white/10 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => zoomIn()} className="text-white hover:text-primary p-1 rounded-full hover:bg-white/10 transition-colors">
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>

                    <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                      <img
                        src={getVenueImages(selectedVenue)[zoomImageIndex]}
                        alt={`${selectedVenue.name} - ${zoomImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain p-2"
                      />
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════ PANORAMA MODAL ══════════ */}
      <Dialog open={showPanorama} onOpenChange={setShowPanorama}>
        <DialogContent className="w-[95vw] max-w-4xl h-[75vh] sm:h-[80vh] p-0 rounded-2xl overflow-hidden">
          {selectedVenue?.panorama_url && (
            <Panorama360Viewer
              src={selectedVenue.panorama_url}
              title={selectedVenue.name}
              onClose={() => setShowPanorama(false)}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
