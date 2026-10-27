"use client";

import React, { useState, useMemo, useEffect } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { allMapPoints } from './zoneConfig';

export interface RouteOptionPoint {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  coords?: { lat: number; lng: number };
  position?: { x: number; y: number };
}

export interface ThematicTourPreset {
  id: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  icon: string;
  badge: string;
  originId: string;
  destId: string;
}

interface RoutePlannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userMapPosition?: { x: number; y: number } | null;
  userGpsCoords?: { latitude: number; longitude: number } | null;
  initialOriginId?: string;
  initialDestId?: string;
  isNavigatingActive?: boolean;
  onStartRoute: (params: {
    originId: string;
    destId: string;
    preference?: 'shaded' | 'fastest' | 'stroller';
    originPoint?: { x?: number; y?: number; lat?: number; lng?: number; name: string };
    destPoint?: { x?: number; y?: number; lat?: number; lng?: number; name: string };
  }) => void;
  onStopRoute?: () => void;
}

export const THEMATIC_TOURS: ThematicTourPreset[] = [
  {
    id: 'tour_iconic',
    titleId: 'Tur Satwa Ikonik & Populer',
    titleEn: 'Iconic & Popular Wildlife Tour',
    descId: 'Rute lengkap melihat Harimau, Gajah Sumatera, Jerapah, hingga Primata Schmutzer.',
    descEn: 'See Tigers, Sumatran Elephants, Giraffes, and Schmutzer Primates.',
    icon: '🐅',
    badge: 'Paling Populer',
    originId: 'pintu_utara',
    destId: 'primata'
  },
  {
    id: 'tour_family',
    titleId: 'Wisata Santai Keluarga & Anak',
    titleEn: 'Family & Kids Leisure Tour',
    descId: 'Melintasi Danau Pelikan, panggung feeding show, dan halte kereta wisata keliling.',
    descEn: 'Visit Pelican Lake, feeding show stage, and scenic tour tram stops.',
    icon: '👨‍👩‍👧',
    badge: 'Favorit Anak',
    originId: 'pintu_utara',
    destId: 'burung'
  }
];

export default function RoutePlannerDrawer({
  isOpen,
  onClose,
  userMapPosition,
  userGpsCoords,
  initialOriginId = 'current',
  initialDestId = 'primata',
  isNavigatingActive = false,
  onStartRoute,
  onStopRoute
}: RoutePlannerDrawerProps) {
  const { language } = useLanguage();

  const [originId, setOriginId] = useState<string>(initialOriginId);
  const [destId, setDestId] = useState<string>(initialDestId);
  const [activeTab, setActiveTab] = useState<'custom' | 'tours'>('custom');
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);

  // Sync when initial values change
  useEffect(() => {
    if (initialOriginId) setOriginId(initialOriginId);
  }, [initialOriginId]);

  useEffect(() => {
    if (initialDestId) setDestId(initialDestId);
  }, [initialDestId]);

  // Origin quick points
  const originList = useMemo(() => [
    {
      id: 'current',
      name: language === 'en' ? '📍 My Live GPS Location' : '📍 Posisi GPS Saya Saat Ini',
      nameEn: 'My Live GPS Location',
      sub: userGpsCoords ? 'Sinyal Terhubung' : 'GPS Aktif',
      type: 'gps'
    },
    {
      id: 'pintu_utara',
      name: language === 'en' ? '🎟️ Main North Gate (TransJakarta)' : '🎟️ Pintu Masuk Utama (Utara / TJ)',
      nameEn: 'Main North Gate',
      sub: 'Akses Busway & Drop-off',
      type: 'gate'
    },
    {
      id: 'pintu_barat',
      name: language === 'en' ? '🎟️ West Gate (Kav Polri)' : '🎟️ Pintu Masuk Barat (Kav Polri)',
      nameEn: 'West Gate',
      sub: 'Akses Parkir Kendaraan',
      type: 'gate'
    },
    {
      id: 'pintu_timur',
      name: language === 'en' ? '🎟️ East Gate' : '🎟️ Pintu Masuk Timur',
      nameEn: 'East Gate',
      sub: 'Akses Jalan Cilandak KKO',
      type: 'gate'
    },
    {
      id: 'pintu_selatan',
      name: language === 'en' ? '🎟️ South Gate (TB Simatupang)' : '🎟️ Pintu Masuk Selatan',
      nameEn: 'South Gate',
      sub: 'Akses TB Simatupang',
      type: 'gate'
    },
    {
      id: 'danau_pelikan',
      name: language === 'en' ? '🦆 Pelican Lake Plaza' : '🦆 Plaza Danau Burung Pelikan',
      nameEn: 'Pelican Lake Plaza',
      sub: 'Pusat Area Tengah',
      type: 'plaza'
    },
    {
      id: 'primata',
      name: language === 'en' ? '🦍 Schmutzer Primate Center' : '🦍 Pusat Primata Schmutzer',
      nameEn: 'Schmutzer Primate Center',
      sub: 'Suaka Primata Terbesar',
      type: 'animal'
    }
  ], [language, userGpsCoords]);

  // All Destination points from config
  const allDestinations = useMemo(() => {
    return allMapPoints.map(p => ({
      id: p.id,
      name: p.name,
      nameEn: p.nameEn || p.name,
      type: p.type || 'animal',
      color: p.color,
      pos: p.position
    }));
  }, []);

  // Filtered destination list for picker
  const filteredDestinations = useMemo(() => {
    if (!destSearchQuery.trim()) return allDestinations;
    const q = destSearchQuery.toLowerCase();
    return allDestinations.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.nameEn.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q)
    );
  }, [allDestinations, destSearchQuery]);

  // Selected points objects
  const selectedOriginObj = useMemo(() => {
    const fromList = originList.find(o => o.id === originId);
    if (fromList) return fromList;
    const fromAll = allDestinations.find(d => d.id === originId);
    return fromAll ? { id: fromAll.id, name: fromAll.name, nameEn: fromAll.nameEn, sub: 'Titik Terpilih', type: fromAll.type } : originList[0];
  }, [originList, allDestinations, originId]);

  const selectedDestObj = useMemo(() => {
    const found = allDestinations.find(d => d.id === destId);
    return found || allDestinations[0];
  }, [allDestinations, destId]);

  // Estimated Metrics
  const estimatedMetrics = useMemo(() => {
    // Standard baseline estimate
    const distMeters = 400;
    const walkMinutes = Math.max(2, Math.round(distMeters / 80));
    const calories = Math.round(walkMinutes * 4.2);

    return {
      distMeters,
      walkMinutes,
      calories
    };
  }, []);

  // Handle Swap Origin ⇄ Destination
  const handleSwapPoints = () => {
    const tempOrigin = originId === 'current' ? 'pintu_utara' : originId;
    setOriginId(destId);
    setDestId(tempOrigin);
  };

  // Handle Start Navigation
  const handleStartRoute = () => {
    onStartRoute({
      originId,
      destId,
      originPoint: {
        name: selectedOriginObj?.name || 'Titik Asal'
      },
      destPoint: {
        name: selectedDestObj?.name || 'Titik Tujuan'
      }
    });
    onClose();
  };

  // Handle Preset Tour Select
  const handleSelectTour = (tour: ThematicTourPreset) => {
    setOriginId(tour.originId);
    setDestId(tour.destId);
    setActiveTab('custom');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dark Blur Backdrop for Mobile */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity sm:hidden"
      />

      {/* Main Drawer / Bottom Sheet Container */}
      <div className={`
        fixed z-50 transition-all duration-300 ease-out
        /* Mobile: Bottom Sheet with max height & rounded top */
        inset-x-0 bottom-0 max-h-[90vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-3xl
        /* Desktop: Centered / floating modal */
        sm:inset-auto sm:top-24 sm:left-6 sm:w-[460px] sm:max-w-[calc(100vw-48px)]
        bg-[#FAF8F5] dark:bg-[#111A15] border border-border/80 shadow-2xl overflow-hidden flex flex-col
      `}>
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Header Strip */}
        <div className="px-5 py-3.5 border-b border-border/70 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <AppIcon name="solar:routing-2-bold-duotone" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
                {language === 'en' ? 'Pedestrian Route Planner' : 'Perencana Rute Pejalan Kaki'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {language === 'en' ? 'A to B navigation with tree-canopy guide' : 'Panduan navigasi titik A ke B bebas buntu'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            title="Tutup perencana rute"
          >
            <AppIcon name="solar:close-circle-bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Rute Kustom vs Tur Tematik) */}
        <div className="p-3 pb-0 flex-shrink-0">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted/70 border border-border/60 text-xs font-bold">
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-1.5 px-3 rounded-xl transition-all ${
                activeTab === 'custom'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {language === 'en' ? 'Custom Route (A ⇄ B)' : 'Rute Bebas (A ⇄ B)'}
            </button>
            <button
              onClick={() => setActiveTab('tours')}
              className={`py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'tours'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AppIcon name="solar:stars-minimalistic-bold-duotone" className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'en' ? 'Thematic Tours' : 'Tur Tematik Ragunan'}</span>
            </button>
          </div>
        </div>

        {/* Content Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {activeTab === 'custom' ? (
            <>
              {/* Origin & Destination Selector Box */}
              <div className="relative p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
                {/* Titik Asal (A) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                      <span>{language === 'en' ? 'Point A (Start From)' : 'Titik Asal A (Mulai Dari)'}</span>
                    </span>
                  </div>
                  <select
                    value={originId}
                    onChange={(e) => setOriginId(e.target.value)}
                    className="w-full h-11 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-semibold text-foreground outline-none transition-all cursor-pointer"
                  >
                    {originList.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Floating Swap Button in the middle */}
                <div className="flex items-center justify-center my-1 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-border/80" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSwapPoints}
                    className="relative z-10 w-9 h-9 rounded-full bg-background hover:bg-muted border border-border shadow-xs text-primary flex items-center justify-center transition-all hover:scale-110 active:rotate-180"
                    title="Tukar Titik Asal dan Titik Tujuan"
                  >
                    <AppIcon name="solar:sort-vertical-bold-duotone" className="w-4 h-4" />
                  </button>
                </div>

                {/* Titik Tujuan (B) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
                      <span>{language === 'en' ? 'Point B (Destination)' : 'Titik Tujuan B (Destinasi)'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSelectingDestination(!isSelectingDestination)}
                      className="text-primary hover:underline text-[11px]"
                    >
                      {isSelectingDestination ? 'Tutup Cari' : 'Cari Cepat'}
                    </button>
                  </div>

                  {isSelectingDestination ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <AppIcon name="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          value={destSearchQuery}
                          onChange={(e) => setDestSearchQuery(e.target.value)}
                          placeholder="Ketik gajah, harimau, toilet, halte..."
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-muted/70 border border-border text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-border/60 rounded-xl p-1 bg-background/50">
                        {filteredDestinations.slice(0, 15).map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setDestId(d.id);
                              setIsSelectingDestination(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                              destId === d.id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-foreground'
                            }`}
                          >
                            <span className="truncate">{d.name}</span>
                            {destId === d.id && <AppIcon name="solar:check-circle-bold" className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <select
                      value={destId}
                      onChange={(e) => setDestId(e.target.value)}
                      className="w-full h-11 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-semibold text-foreground outline-none transition-all cursor-pointer"
                    >
                      <optgroup label="🐾 Zona Satwa Populer">
                        {allDestinations.filter(d => d.type === 'animal').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🚻 Toilet & Ruang Laktasi">
                        {allDestinations.filter(d => d.type === 'toilet').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🕌 Musholla & Tempat Ibadah">
                        {allDestinations.filter(d => d.type === 'musholla').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🚋 Halte Kereta Keliling (Tram)">
                        {allDestinations.filter(d => d.type === 'tram').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🎟️ Pintu & Loket JakCard">
                        {allDestinations.filter(d => d.type === 'ticket').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🍲 Sentra Kuliner & Pujasera">
                        {allDestinations.filter(d => d.type === 'kuliner').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="🏥 Pos Medis & P3K">
                        {allDestinations.filter(d => d.type === 'medical').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  )}
                </div>
              </div>

              {/* Real-time Estimated Walking Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-muted/40 border border-border/70 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <AppIcon name="solar:walking-round-bold-duotone" className="w-3 h-3 text-emerald-500" />
                    Jarak
                  </span>
                  <div className="text-xs sm:text-sm font-extrabold text-foreground">
                    {estimatedMetrics.distMeters} m
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <AppIcon name="solar:clock-circle-bold-duotone" className="w-3 h-3 text-sky-500" />
                    Waktu
                  </span>
                  <div className="text-xs sm:text-sm font-extrabold text-foreground">
                    ~{estimatedMetrics.walkMinutes} Menit
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <AppIcon name="solar:flame-bold-duotone" className="w-3 h-3 text-amber-500" />
                    Kalori
                  </span>
                  <div className="text-xs sm:text-sm font-extrabold text-foreground">
                    {estimatedMetrics.calories} kcal
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Tab Tur Tematik Presets */
            <div className="space-y-2.5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {language === 'en'
                  ? 'Pick an official curated tour preset to explore Ragunan highlights effortlessly:'
                  : 'Pilih paket rute kurasi resmi untuk menjelajahi atraksi terbaik Ragunan tanpa bingung arah:'}
              </p>

              <div className="space-y-2">
                {THEMATIC_TOURS.map((tour) => (
                  <button
                    key={tour.id}
                    type="button"
                    onClick={() => handleSelectTour(tour)}
                    className="w-full text-left p-3.5 rounded-2xl bg-card hover:bg-muted/70 border border-border/80 hover:border-primary/50 transition-all flex items-center justify-between gap-3 group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {tour.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {language === 'en' ? tour.titleEn : tour.titleId}
                          </h4>
                          <span className="px-2 py-0.2 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex-shrink-0">
                            {tour.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {language === 'en' ? tour.descEn : tour.descId}
                        </p>
                      </div>
                    </div>

                    <AppIcon name="solar:alt-arrow-right-linear" className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-border/70 bg-card flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleStartRoute}
            className="w-full sm:flex-1 py-3 px-4 rounded-full bg-primary text-primary-foreground font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <AppIcon name="solar:routing-2-bold-duotone" className="w-4 h-4" />
            <span>
              {language === 'en' ? 'Start Navigation Route' : 'Mulai Navigasi Rute Ini'}
            </span>
          </button>

          {isNavigatingActive && onStopRoute && (
            <button
              type="button"
              onClick={() => {
                onStopRoute();
                onClose();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Stop Current Route' : 'Hentikan Rute Aktif'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
