"use client";

import React, { useState, useMemo } from 'react';
import { 
  Navigation, 
  Footprints, 
  Clock, 
  MapPin, 
  Flame, 
  Trees, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Compass
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { allMapPoints } from './zoneConfig';

export interface RouteCalculationResult {
  originPoint: { x: number; y: number; name: string };
  destPoint: { x: number; y: number; name: string };
  distanceMeters: number;
  walkingMinutes: number;
  bearingDeg: number;
  bearingLabel: string;
  caloriesKcal: number;
  shadePercent: number;
}

interface RouteEstimatorCardProps {
  userMapPosition?: { x: number; y: number } | null;
  selectedDestinationId?: string | null;
  onRouteCalculated?: (result: RouteCalculationResult | null) => void;
  onSwitchToInteractiveGps?: (destinationId: string) => void;
}

export default function RouteEstimatorCard({
  userMapPosition,
  selectedDestinationId,
  onRouteCalculated,
  onSwitchToInteractiveGps
}: RouteEstimatorCardProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  const [originId, setOriginId] = useState<string>('current');
  const [destinationId, setDestinationId] = useState<string>(selectedDestinationId || 'mamalia');

  // Sync if parent selects a destination
  React.useEffect(() => {
    if (selectedDestinationId) {
      setDestinationId(selectedDestinationId);
    }
  }, [selectedDestinationId]);

  // Origin Points list
  const originOptions = useMemo(() => [
    { id: 'current', name: language === 'en' ? '📍 My Current Position (GPS / Simulation)' : '📍 Posisi GPS Saya Saat Ini', pos: userMapPosition || { x: 50, y: 50 } },
    { id: 'pintu_utara', name: language === 'en' ? '🎟️ Main North Gate (TransJakarta)' : '🎟️ Pintu Masuk Utama (Utara / TJ)', pos: { x: 48, y: 12 } },
    { id: 'pintu_barat', name: language === 'en' ? '🎟️ West Gate (Kav Polri)' : '🎟️ Pintu Masuk Barat (Kav Polri)', pos: { x: 12, y: 48 } },
    { id: 'pintu_timur', name: language === 'en' ? '🎟️ East Gate' : '🎟️ Pintu Masuk Timur', pos: { x: 88, y: 54 } },
    { id: 'pintu_selatan', name: language === 'en' ? '🎟️ South Gate (TB Simatupang)' : '🎟️ Pintu Masuk Selatan (TB Simatupang)', pos: { x: 55, y: 92 } },
    { id: 'danau_pelikan', name: language === 'en' ? '🦆 Pelican Lake Plaza' : '🦆 Plaza Danau Burung Pelikan', pos: { x: 48, y: 35 } },
    { id: 'primata', name: language === 'en' ? '🦍 Schmutzer Primate Center' : '🦍 Pusat Primata Schmutzer', pos: { x: 25, y: 35 } }
  ], [language, userMapPosition]);

  // Destination Options grouped
  const destinationGroups = useMemo(() => {
    const toilets = allMapPoints.filter(p => p.type === 'toilet');
    const mushollas = allMapPoints.filter(p => p.type === 'musholla');
    const trams = allMapPoints.filter(p => p.type === 'tram');
    const tickets = allMapPoints.filter(p => p.type === 'ticket');
    const animals = allMapPoints.filter(p => p.type === 'animal');
    const foods = allMapPoints.filter(p => p.type === 'kuliner');
    const med = allMapPoints.filter(p => p.type === 'medical');

    return [
      { label: language === 'en' ? '🚻 Restroom & Nursing' : '🚻 Toilet & Ruang Laktasi', items: toilets },
      { label: language === 'en' ? '🕌 Mosque & Prayer Rooms' : '🕌 Musholla & Tempat Ibadah', items: mushollas },
      { label: language === 'en' ? '🚋 Scenic Tram Stops' : '🚋 Halte Kereta Keliling', items: trams },
      { label: language === 'en' ? '🎟️ Gates & Ticket Counters' : '🎟️ Loket & Pintu Gerbang', items: tickets },
      { label: language === 'en' ? '🐾 Animal Enclosures' : '🐾 Zona Satwa Ragunan', items: animals },
      { label: language === 'en' ? '🍲 Food Courts & Cafes' : '🍲 Sentra Kuliner & Kafe', items: foods },
      { label: language === 'en' ? '🏥 Medical Post' : '🏥 Pos Medis & P3K', items: med },
    ];
  }, [language]);

  // Calculate Route Estimates
  const routeResult = useMemo<RouteCalculationResult | null>(() => {
    // 1. Resolve Origin Point
    let originObj: { x: number; y: number; name: string } | null = null;
    if (originId === 'current') {
      if (userMapPosition) {
        originObj = {
          x: userMapPosition.x,
          y: userMapPosition.y,
          name: language === 'en' ? 'My Location' : 'Posisi Saya'
        };
      } else {
        // Fallback default to Pintu Utara if GPS not enabled
        originObj = {
          x: 48,
          y: 12,
          name: language === 'en' ? 'Main North Gate' : 'Pintu Masuk Utama (Utara)'
        };
      }
    } else {
      const matchOpt = originOptions.find(o => o.id === originId);
      if (matchOpt) {
        originObj = {
          x: matchOpt.pos.x,
          y: matchOpt.pos.y,
          name: matchOpt.name.replace(/^[^\s]+\s/, '')
        };
      }
    }

    // 2. Resolve Destination Point
    const destObjConfig = allMapPoints.find(p => p.id === destinationId);
    if (!originObj || !destObjConfig) return null;

    const destObj = {
      x: destObjConfig.position.x,
      y: destObjConfig.position.y,
      name: language === 'en' ? destObjConfig.nameEn : destObjConfig.name
    };

    // Calculate simulated distance in meters across 147 Ha Ragunan
    const dx = destObj.x - originObj.x;
    const dy = destObj.y - originObj.y;
    const euclideanPct = Math.sqrt(dx * dx + dy * dy);

    // Scaling factor: 100% on Ragunan map is approx ~1,200m East-West, 100% height is approx ~1,500m North-South
    const distMeters = Math.max(50, Math.round(euclideanPct * 16.5 * 1.25)); // 1.25 winding path curvature factor
    const walkingMinutes = Math.max(1, Math.round((distMeters / 70))); // Average strolling speed 70 m/min (4.2 km/h)
    const calories = Math.max(2, Math.round(distMeters * 0.045));

    // Calculate Bearing Angle & Label
    const rad = Math.atan2(dx, -dy); // 0 is North
    let deg = Math.round((rad * 180) / Math.PI);
    if (deg < 0) deg += 360;

    const directions = [
      { max: 22.5, id: 'Utara', en: 'North' },
      { max: 67.5, id: 'Timur Laut', en: 'North-East' },
      { max: 112.5, id: 'Timur', en: 'East' },
      { max: 157.5, id: 'Tenggara', en: 'South-East' },
      { max: 202.5, id: 'Selatan', en: 'South' },
      { max: 247.5, id: 'Barat Daya', en: 'South-West' },
      { max: 292.5, id: 'Barat', en: 'West' },
      { max: 337.5, id: 'Barat Laut', en: 'North-West' },
      { max: 360, id: 'Utara', en: 'North' }
    ];
    const dirMatch = directions.find(d => deg <= d.max) || directions[0];
    const bearingLabel = language === 'en' ? dirMatch.en : dirMatch.id;

    // Forest canopy shade estimation (Ragunan has ~85-95% tree canopy coverage)
    const shadePercent = Math.min(96, Math.max(82, 94 - Math.round((euclideanPct % 7) * 1.5)));

    const result: RouteCalculationResult = {
      originPoint: originObj,
      destPoint: destObj,
      distanceMeters: distMeters,
      walkingMinutes: walkingMinutes,
      bearingDeg: deg,
      bearingLabel: bearingLabel,
      caloriesKcal: calories,
      shadePercent: shadePercent
    };

    return result;
  }, [originId, destinationId, userMapPosition, originOptions, language]);

  // Inform parent of route update
  React.useEffect(() => {
    if (onRouteCalculated) {
      onRouteCalculated(routeResult);
    }
  }, [routeResult, onRouteCalculated]);

  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-3xl border border-border/90 shadow-xl overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div 
        className="px-4 py-3 bg-muted/60 border-b border-border/70 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-2xs">
            <Navigation className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
              <span>{language === 'en' ? 'Walking Route & Facility Estimator' : 'Estimasi Rute & Fasilitas Jalan Kaki'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                {language === 'en' ? 'Active' : 'Siap'}
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {language === 'en' ? 'Find distance, walking time, and tree shade direction' : 'Hitung jarak, durasi jalan, dan jalur rindang'}
            </p>
          </div>
        </div>

        <button 
          className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 text-xs">
          {/* Origin & Destination Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Origin */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'en' ? 'Starting Point (Origin)' : 'Titik Mulai (Asal)'}</span>
              </label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {originOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-primary" />
                <span>{language === 'en' ? 'Destination (Target)' : 'Titik Tujuan (Destinasi)'}</span>
              </label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {destinationGroups.map(grp => (
                  <optgroup key={grp.label} label={grp.label}>
                    {grp.items.map(item => (
                      <option key={item.id} value={item.id}>
                        {language === 'en' ? item.nameEn : item.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Results Metric Strip */}
          {routeResult && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <div className="min-w-0 truncate">
                    <span className="text-[10px] text-muted-foreground block font-medium">
                      {routeResult.originPoint.name} <span className="text-primary font-bold">➔</span> {routeResult.destPoint.name}
                    </span>
                    <span className="text-xs font-extrabold text-foreground truncate block">
                      {routeResult.destPoint.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Compass className="w-3 h-3" />
                  <span>{routeResult.bearingLabel} ({routeResult.bearingDeg}°)</span>
                </div>
              </div>

              {/* 4 Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Distance */}
                <div className="p-2.5 rounded-xl bg-background border border-border/70 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">{language === 'en' ? 'Distance' : 'Jarak'}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-foreground">
                      {routeResult.distanceMeters >= 1000 
                        ? `${(routeResult.distanceMeters / 1000).toFixed(2)} km` 
                        : `${routeResult.distanceMeters} m`}
                    </span>
                  </div>
                </div>

                {/* Walking Time */}
                <div className="p-2.5 rounded-xl bg-background border border-border/70 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">{language === 'en' ? 'Est. Time' : 'Estimasi'}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-foreground">
                      ~{routeResult.walkingMinutes} {language === 'en' ? 'min' : 'menit'}
                    </span>
                  </div>
                </div>

                {/* Shade Level */}
                <div className="p-2.5 rounded-xl bg-background border border-border/70 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Trees className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">{language === 'en' ? 'Canopy Shade' : 'Kanopi Teduh'}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {routeResult.shadePercent}%
                    </span>
                  </div>
                </div>

                {/* Calories */}
                <div className="p-2.5 rounded-xl bg-background border border-border/70 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">{language === 'en' ? 'Burn' : 'Kalori'}</span>
                    <span className="text-xs sm:text-sm font-extrabold text-foreground">
                      ~{routeResult.caloriesKcal} kcal
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Open Turn-by-Turn in GPS Mode */}
              {onSwitchToInteractiveGps && (
                <button
                  onClick={() => onSwitchToInteractiveGps(destinationId)}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Open Turn-by-Turn GPS Navigation' : 'Buka Navigasi Belokan GPS Lengkap'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
