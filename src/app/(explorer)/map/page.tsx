"use client";

import { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MapPin, 
  Loader2, 
  ImageOff, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  PawPrint, 
  Compass, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  Crosshair, 
  Search, 
  X, 
  Footprints, 
  Maximize2, 
  Minimize2, 
  Navigation,
  Map as MapIcon,
  Bath,
  Train,
  Ticket,
  Utensils,
  HeartPulse,
  Car,
  Check,
  ChevronDown,
  Milestone,
  Route as RouteIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useZoneMarkers } from '@/hooks/useZoneMarkers';
import { useAnimals } from '@/hooks/useAnimals';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useGeolocation, 
  gpsToMapPosition, 
  calculateDistance, 
  estimateWalkingTime, 
  isWithinZoo, 
  RAGUNAN_BOUNDS 
} from '@/hooks/useGeolocation';
import MapMarker from '@/components/map/MapMarker';
import UserLocationMarker from '@/components/map/UserLocationMarker';
import ZoneInfoModal from '@/components/map/ZoneInfoModal';
import { allMapPoints, MapPointType } from '@/components/map/zoneConfig';
import RouteEstimatorCard, { RouteCalculationResult } from '@/components/map/RouteEstimatorCard';
import RoutePlannerDrawer from '@/components/map/RoutePlannerDrawer';
import { toast } from 'sonner';

type ZoneCategoryFilter = 'all' | 'animal' | 'toilet' | 'musholla' | 'tram' | 'ticket' | 'kuliner' | 'medical';
type MapViewMode = 'interactive' | 'illustrated';

// Preset simulation coordinates inside Ragunan (Pusat Primata Schmutzer)
const SIMULATION_LOCATION = {
  latitude: -6.3015,
  longitude: 106.8250,
  accuracy: 15,
  heading: 45,
};

const categoryToMapKey: Record<ZoneCategoryFilter, string> = {
  all: 'all',
  animal: 'satwa',
  toilet: 'toilet',
  musholla: 'musholla',
  tram: 'transportasi',
  ticket: 'pintu',
  kuliner: 'kuliner',
  medical: 'medical'
};

function ExplorerMapContent() {
  const searchParams = useSearchParams();
  const initialPoi = searchParams.get('poi') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialView = searchParams.get('view') === 'illustrated' ? 'illustrated' : 'interactive';

  const { settings, loading: settingsLoading } = useSiteSettings();
  const { markers, loading: markersLoading } = useZoneMarkers();
  const { animals } = useAnimals();
  const { language } = useLanguage();
  
  const { 
    position: geoPos, 
    loading: geoLoading, 
    getCurrentPosition, 
    startWatching, 
    stopWatching 
  } = useGeolocation();

  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // States
  const [viewMode, setViewMode] = useState<MapViewMode>(initialView);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<{
    id: string;
    name: string;
    nameEn: string;
    color: string;
    description: string;
    descriptionEn: string;
    distanceKm?: number | null;
    walkingTimeMinutes?: number | null;
    targetCoords?: { lat: number; lng: number } | null;
  } | null>(null);
  
  const [highlightedZone, setHighlightedZone] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ZoneCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [isSimulatingLocation, setIsSimulatingLocation] = useState(false);
  const [activeRouteResult, setActiveRouteResult] = useState<RouteCalculationResult | null>(null);
  const [selectedRouteDestId, setSelectedRouteDestId] = useState<string | null>(null);

  // States for unified native map controls (Zero-iframe double-header)
  const [activeBasemap, setActiveBasemap] = useState<'osmHot' | 'osmStandard' | 'satellite'>('osmHot');
  const [isParkingSaved, setIsParkingSaved] = useState(false);
  const [interactiveGpsAccuracy, setInteractiveGpsAccuracy] = useState<number | null>(null);
  const [isInteractiveGpsActive, setIsInteractiveGpsActive] = useState(false);
  const [gpsStatusDetails, setGpsStatusDetails] = useState<{
    isRealGps: boolean;
    isInsideZoo: boolean;
    accuracy: number | null;
    latitude: number | null;
    longitude: number | null;
    distanceToRagunanKm: string | null;
    errorReason: string | null;
    statusText?: string;
    isInsecure: boolean;
    selectedLocationLabel?: string;
  }>({
    isRealGps: false,
    isInsideZoo: false,
    accuracy: null,
    latitude: null,
    longitude: null,
    distanceToRagunanKm: null,
    errorReason: null,
    isInsecure: false,
    selectedLocationLabel: 'Pusat Kawasan Ragunan'
  });

  // States for A-to-B route planner & active turn navigation
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);
  const [routePlannerOriginId, setRoutePlannerOriginId] = useState('current');
  const [routePlannerDestId, setRoutePlannerDestId] = useState('primata');
  const [isNavigatingActive, setIsNavigatingActive] = useState(false);
  const [activeNavInfo, setActiveNavInfo] = useState<{
    destinationName?: string;
    totalDistance?: number;
    durationMinutes?: number;
    instruction?: string;
    roadName?: string;
    canopyPercentage?: number;
  } | null>(null);


  // Determine effective user location (real GPS, iframe synced GPS, or simulation)
  const effectiveLocation = useMemo(() => {
    if (isSimulatingLocation) {
      if (gpsStatusDetails.latitude && gpsStatusDetails.longitude) {
        return {
          latitude: gpsStatusDetails.latitude,
          longitude: gpsStatusDetails.longitude,
          accuracy: gpsStatusDetails.accuracy || 15,
          timestamp: Date.now(),
        };
      }
      return {
        ...SIMULATION_LOCATION,
        timestamp: Date.now(),
      };
    }
    if (isGpsActive || isInteractiveGpsActive) {
      if (geoPos) return geoPos;
      if (gpsStatusDetails.latitude && gpsStatusDetails.longitude) {
        return {
          latitude: gpsStatusDetails.latitude,
          longitude: gpsStatusDetails.longitude,
          accuracy: gpsStatusDetails.accuracy || 15,
          timestamp: Date.now(),
        };
      }
    }
    return null;
  }, [isSimulatingLocation, isGpsActive, isInteractiveGpsActive, geoPos, gpsStatusDetails]);

  // Two-way postMessage communication with Leaflet engine
  useEffect(() => {
    const handleMapMessage = (event: MessageEvent) => {
      if (!event.data) return;
      const { type, data } = event.data;

      if (type === 'MAP_READY') {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'SET_CATEGORY_FILTER',
          category: categoryToMapKey[categoryFilter] || 'all'
        }, '*');
        iframeRef.current?.contentWindow?.postMessage({
          type: 'SET_BASEMAP',
          basemap: activeBasemap
        }, '*');
      }

      if (type === 'POI_SELECTED' && data) {
        const targetCoords = data.coords ? { lat: data.coords[0], lng: data.coords[1] } : null;
        let distanceKm: number | null = null;
        let walkingTimeMinutes: number | null = null;

        if (effectiveLocation && targetCoords) {
          distanceKm = calculateDistance(
            effectiveLocation.latitude,
            effectiveLocation.longitude,
            targetCoords.lat,
            targetCoords.lng
          );
          walkingTimeMinutes = estimateWalkingTime(distanceKm);
        }

        setSelectedZone({
          id: data.id || '',
          name: data.name || '',
          nameEn: data.nameEn || data.name || '',
          color: data.isAnimal ? '#1b5e20' : '#0284c7',
          description: data.description || '',
          descriptionEn: data.descriptionEn || data.description || '',
          distanceKm,
          walkingTimeMinutes,
          targetCoords,
        });
        setHighlightedZone(data.id || null);
      }

      if (type === 'GPS_UPDATE' && data) {
        if (data.isRealGps && data.accuracy) {
          setInteractiveGpsAccuracy(Math.round(data.accuracy));
          setIsInteractiveGpsActive(true);
        } else {
          setInteractiveGpsAccuracy(null);
          setIsInteractiveGpsActive(false);
        }
        if (data.locationName) {
          setGpsStatusDetails(prev => ({
            ...prev,
            selectedLocationLabel: data.locationName,
            latitude: data.latitude ?? prev.latitude,
            longitude: data.longitude ?? prev.longitude,
            isRealGps: !!data.isRealGps
          }));
        }
      }

      if (type === 'GPS_STATUS_UPDATE' && data) {
        setGpsStatusDetails(prev => ({
          ...prev,
          isRealGps: !!data.isRealGps,
          isInsideZoo: !!data.isInsideZoo,
          accuracy: data.accuracy || null,
          latitude: data.latitude || prev.latitude,
          longitude: data.longitude || prev.longitude,
          distanceToRagunanKm: data.distanceToRagunanKm || null,
          errorReason: data.errorReason || null,
          statusText: data.statusText,
          isInsecure: !!data.isInsecure
        }));
        if (data.isRealGps && data.accuracy) {
          setInteractiveGpsAccuracy(Math.round(data.accuracy));
          setIsInteractiveGpsActive(true);
        } else if (!data.isRealGps) {
          setIsInteractiveGpsActive(false);
        }
      }

      if (type === 'PARKING_UPDATE' && data) {
        setIsParkingSaved(!!data.isSaved);
      }

      if (type === 'ROUTE_INFO_UPDATE' && data) {
        setIsNavigatingActive(true);
        setActiveNavInfo(data);
      }

      if (type === 'ROUTE_STOPPED') {
        setIsNavigatingActive(false);
        setActiveNavInfo(null);
      }
    };

    window.addEventListener('message', handleMapMessage);
    return () => window.removeEventListener('message', handleMapMessage);
  }, [categoryFilter, activeBasemap, effectiveLocation]);

  const handleCategoryFilterSelect = (cat: ZoneCategoryFilter) => {
    setCategoryFilter(cat);
    if (viewMode === 'interactive' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'SET_CATEGORY_FILTER',
        category: categoryToMapKey[cat] || 'all'
      }, '*');
    }
  };

  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
    if (viewMode === 'interactive' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'SEARCH_QUERY',
        query
      }, '*');
    }
  };

  const handleBasemapSelect = (tile: 'osmHot' | 'osmStandard' | 'satellite') => {
    setActiveBasemap(tile);
    if (viewMode === 'interactive' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'SET_BASEMAP',
        basemap: tile
      }, '*');
    }
    toast.success(
      tile === 'satellite'
        ? (language === 'en' ? 'Satellite HD map activated' : 'Citra Satelit HD diaktifkan')
        : tile === 'osmStandard'
        ? (language === 'en' ? 'Standard street map activated' : 'Peta Jalan Standar diaktifkan')
        : (language === 'en' ? 'Ragunan nature trail map activated' : 'Peta Jalur Wisata Ragunan diaktifkan')
    );
  };

  const handleSwitchViewMode = (mode: MapViewMode) => {
    setViewMode(mode);
    if (mode === 'interactive') {
      // Pilar 1: Hindari double-watcher dengan mematikan watcher parent
      stopWatching();
      if (isGpsActive && iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage({
          type: 'SET_USER_LOCATION',
          preset: 'device_gps'
        }, '*');
      }
    } else {
      // Jika beralih ke mode brosur/ilustrasi dan GPS aktif
      if (isGpsActive && !isSimulatingLocation) {
        getCurrentPosition();
        startWatching();
      }
    }
  };

  const handleParkingToggleInteractive = () => {
    if (viewMode === 'interactive' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'TOGGLE_PARKING' }, '*');
    }
  };

  const handleStartRoute = (params: {
    originId: string;
    destId: string;
    preference?: 'shaded' | 'fastest' | 'stroller';
    originPoint?: { x?: number; y?: number; lat?: number; lng?: number; name: string };
    destPoint?: { x?: number; y?: number; lat?: number; lng?: number; name: string };
  }) => {
    setIsNavigatingActive(true);
    setRoutePlannerOriginId(params.originId);
    setRoutePlannerDestId(params.destId);

    if (viewMode === 'interactive' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'START_NAVIGATION',
        originId: params.originId,
        destId: params.destId,
        preference: params.preference
      }, '*');
      toast.success(
        language === 'en'
          ? 'Walking navigation route started!'
          : 'Panduan navigasi rute pejalan kaki aktif!'
      );
    } else {
      // Illustrated mode
      setSelectedRouteDestId(params.destId);
      const destMarker = markers.find(m => m.id === params.destId) || allDisplayPoints.find(p => p.id === params.destId);
      if (destMarker) {
        setHighlightedZone(destMarker.id);
      }
      toast.success(
        language === 'en'
          ? 'Route trajectory generated on illustrated map'
          : 'Jalur rute divisualisasikan pada peta brosur'
      );
    }
  };

  const handleStopRoute = () => {
    setIsNavigatingActive(false);
    setActiveNavInfo(null);
    setActiveRouteResult(null);
    setSelectedRouteDestId(null);

    if (viewMode === 'interactive' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'STOP_NAVIGATION'
      }, '*');
    }
    toast.info(
      language === 'en' ? 'Navigation stopped' : 'Navigasi rute telah dihentikan'
    );
  };

  const loading = settingsLoading || markersLoading;
  const mapImageUrl = settings?.map_image_url || null;
  const activeMarkers = markers.filter(m => m.is_active);

  // Calculate iframe URL with initial params
  const interactiveMapUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (initialPoi) params.set('poi', initialPoi);
    if (initialSearch) params.set('search', initialSearch);
    const qs = params.toString();
    return `/interactive-map/index.html${qs ? `?${qs}` : ''}`;
  }, [initialPoi, initialSearch]);

  // Convert effective user location to map percentage coordinates (x: 0-100%, y: 0-100%)
  const userMapPosition = useMemo(() => {
    if (!effectiveLocation) return null;
    const pos = gpsToMapPosition(effectiveLocation.latitude, effectiveLocation.longitude);
    if (!pos && (isSimulatingLocation || isGpsActive || isInteractiveGpsActive)) {
      // Fallback ke Pintu Masuk Utama jika lokasi pengguna di luar kawasan Ragunan
      return { x: 48, y: 12 };
    }
    return pos;
  }, [effectiveLocation, isSimulatingLocation, isGpsActive, isInteractiveGpsActive]);

  // Convert marker percentage (x, y) into GPS Lat/Lng coordinates
  const getMarkerCoords = (posX: number, posY: number) => {
    const { north, south, east, west } = RAGUNAN_BOUNDS;
    const lng = west + (posX / 100) * (east - west);
    const lat = north - (posY / 100) * (north - south);
    return { lat, lng };
  };

  // Handle GPS toggle button for illustrated mode
  const handleToggleGps = () => {
    if (isGpsActive || isSimulatingLocation) {
      stopWatching();
      setIsGpsActive(false);
      setIsSimulatingLocation(false);
      toast.info(language === 'en' ? 'Location tracking deactivated' : 'Pelacakan lokasi dinonaktifkan');
      return;
    }

    getCurrentPosition();
    startWatching();
    setIsGpsActive(true);
    toast.info(language === 'en' ? 'Activating GPS sensor...' : 'Mengaktifkan sensor GPS...');
  };

  // Check user GPS boundaries
  useEffect(() => {
    if (isGpsActive && geoPos) {
      const inside = isWithinZoo(geoPos.latitude, geoPos.longitude);
      if (!inside && !isSimulatingLocation) {
        toast(
          language === 'en' 
            ? 'You are outside Ragunan area' 
            : 'Anda terdeteksi di luar area Ragunan', 
          {
            description: language === 'en' 
              ? 'Simulation mode activated at Schmutzer to test distance and route calculation.' 
              : 'Mode simulasi di Schmutzer diaktifkan agar rute dan jarak dapat Anda coba.',
          }
        );
        setIsSimulatingLocation(true);
      }
    }
  }, [isGpsActive, geoPos, isSimulatingLocation, language]);

  // Unified points combining database markers and official facility/zone points
  const allDisplayPoints = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      name_en?: string | null;
      color: string;
      position_x: number;
      position_y: number;
      description?: string | null;
      description_en?: string | null;
      type: MapPointType;
    }> = activeMarkers.map(m => {
      const nameL = (m.name + ' ' + (m.name_en || '')).toLowerCase();
      let type: MapPointType = 'animal';
      if (nameL.includes('toilet') || nameL.includes('laktasi')) type = 'toilet';
      else if (nameL.includes('musholla') || nameL.includes('masjid')) type = 'musholla';
      else if (nameL.includes('halte') || nameL.includes('kereta') || nameL.includes('tram')) type = 'tram';
      else if (nameL.includes('pintu') || nameL.includes('loket') || nameL.includes('gerbang')) type = 'ticket';
      else if (nameL.includes('pujasera') || nameL.includes('kafe') || nameL.includes('kuliner')) type = 'kuliner';
      else if (nameL.includes('medis') || nameL.includes('p3k')) type = 'medical';

      return {
        id: m.id,
        name: m.name,
        name_en: m.name_en,
        color: m.color,
        position_x: Number(m.position_x),
        position_y: Number(m.position_y),
        description: m.description,
        description_en: m.description_en,
        type,
      };
    });

    allMapPoints.forEach(p => {
      const exists = list.some(item => 
        item.id === p.id || 
        item.name.toLowerCase() === p.name.toLowerCase()
      );
      if (!exists) {
        list.push({
          id: p.id,
          name: p.name,
          name_en: p.nameEn,
          color: p.color,
          position_x: p.position.x,
          position_y: p.position.y,
          description: p.description,
          description_en: p.descriptionEn,
          type: p.type || 'animal',
        });
      }
    });

    return list;
  }, [activeMarkers]);

  // Filter markers based on category and live search query
  const filteredMarkers = useMemo(() => {
    return allDisplayPoints.filter(m => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (m.name + ' ' + (m.name_en || '')).toLowerCase().includes(q);
        const descMatch = (m.description || '').toLowerCase().includes(q);
        const animalMatch = animals.some(a => {
          const zoneName = (m.name + ' ' + (m.name_en || '')).toLowerCase();
          const inThisZone = a.zone && zoneName.includes(a.zone.toLowerCase());
          return inThisZone && (a.name.toLowerCase().includes(q) || (a.latin_name || '').toLowerCase().includes(q));
        });
        if (!nameMatch && !descMatch && !animalMatch) return false;
      }

      if (categoryFilter === 'all') return true;
      if (categoryFilter === 'animal') return m.type === 'animal';
      if (categoryFilter === 'toilet') return m.type === 'toilet';
      if (categoryFilter === 'musholla') return m.type === 'musholla';
      if (categoryFilter === 'tram') return m.type === 'tram';
      if (categoryFilter === 'ticket') return m.type === 'ticket';
      if (categoryFilter === 'kuliner') return m.type === 'kuliner';
      if (categoryFilter === 'medical') return m.type === 'medical';

      return true;
    });
  }, [allDisplayPoints, categoryFilter, searchQuery, animals]);

  // Match animals for the selected zone
  const selectedZoneAnimals = useMemo(() => {
    if (!selectedZone) return [];
    const term = (selectedZone.name + ' ' + selectedZone.nameEn).toLowerCase();
    return animals.filter(a => {
      const zoneMatch = a.zone && term.includes(a.zone.toLowerCase());
      const locMatch = a.location && term.includes(a.location.toLowerCase());
      const catMatch = a.category && term.includes(a.category.toLowerCase());
      const nameMatch = term.includes('primata') && (a.category?.toLowerCase().includes('primata') || a.name.toLowerCase().includes('orangutan') || a.name.toLowerCase().includes('kera'));
      const birdMatch = (term.includes('burung') || term.includes('aves')) && (a.category?.toLowerCase().includes('burung') || a.category?.toLowerCase().includes('aves'));
      const mammalMatch = (term.includes('mamalia') || term.includes('gajah') || term.includes('harimau') || term.includes('singa') || term.includes('jerapah')) && a.category?.toLowerCase().includes('mamalia');
      const reptilMatch = (term.includes('reptil') || term.includes('komodo') || term.includes('buaya') || term.includes('kura')) && a.category?.toLowerCase().includes('reptil');
      return zoneMatch || locMatch || catMatch || nameMatch || birdMatch || mammalMatch || reptilMatch;
    });
  }, [selectedZone, animals]);

  const handleDownloadMap = async () => {
    if (!mapImageUrl) return;
    try {
      const response = await fetch(mapImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'peta-ragunan.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(language === 'en' ? 'Map downloaded!' : 'Peta berhasil diunduh!');
    } catch {
      toast.error(language === 'en' ? 'Failed to download map' : 'Gagal mengunduh peta');
    }
  };

  const handleSwitchToGps = (destId: string) => {
    setViewMode('interactive');
    if (iframeRef.current) {
      iframeRef.current.src = `/interactive-map/index.html?poi=${destId}`;
    }
    toast.success(language === 'en' ? 'Switched to live GPS navigation' : 'Beralih ke panduan navigasi GPS aktif');
  };

  const handleMarkerClick = (marker: {
    id: string;
    name: string;
    name_en?: string | null;
    color: string;
    position_x: number;
    position_y: number;
    description?: string | null;
    description_en?: string | null;
    type?: MapPointType;
  }) => {
    setHighlightedZone(marker.id);
    setSelectedRouteDestId(marker.id);
    const targetCoords = getMarkerCoords(Number(marker.position_x), Number(marker.position_y));
    let distanceKm: number | null = null;
    let walkingTimeMinutes: number | null = null;

    if (effectiveLocation) {
      distanceKm = calculateDistance(
        effectiveLocation.latitude,
        effectiveLocation.longitude,
        targetCoords.lat,
        targetCoords.lng
      );
      walkingTimeMinutes = estimateWalkingTime(distanceKm);
    }

    setSelectedZone({
      id: marker.id,
      name: marker.name,
      nameEn: marker.name_en || marker.name,
      color: marker.color,
      description: marker.description || '',
      descriptionEn: marker.description_en || marker.description || '',
      distanceKm,
      walkingTimeMinutes,
      targetCoords,
    });
  };

  // Live autocomplete suggestions for instant interactive search
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return allDisplayPoints
      .filter((p) => {
        const name = (p.name || '').toLowerCase();
        const nameEn = (p.name_en || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes(q) || nameEn.includes(q) || desc.includes(q);
      })
      .slice(0, 6);
  }, [searchQuery, allDisplayPoints]);

  const handleSelectSearchSuggestion = (item: (typeof allDisplayPoints)[0]) => {
    setSearchQuery('');
    if (viewMode === 'interactive' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'FOCUS_POI',
        poi: item.name
      }, '*');
      toast.success(
        language === 'en'
          ? `Focusing on ${item.name_en || item.name}`
          : `Menuju ke lokasi ${item.name}`
      );
    } else {
      handleMarkerClick(item);
    }
  };

  const handleCloseModal = () => {
    setSelectedZone(null);
    setHighlightedZone(null);
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
      {/* ── TOOLBAR: Pusat Kontrol Peta Terpadu ── */}
      <div className="flex-shrink-0 z-20 bg-[#FAF8F5]/98 dark:bg-[#0A120E]/98 backdrop-blur-2xl border-b border-border/80 shadow-xs">

        {/* Baris 1: Mode Switcher + Rute A-B + Aksi Cepat (Responsive across all screens) */}
        <div className="px-2 sm:px-4 py-1 sm:py-1.5 flex items-center justify-between gap-1 sm:gap-1.5 min-w-0 overflow-x-auto no-scrollbar touch-pan-x">
          {/* Mode Switcher Pill */}
          <div className="inline-flex p-0.5 rounded-full bg-muted/80 dark:bg-card border border-border/70 shadow-2xs flex-shrink-0">
            <button
              onClick={() => handleSwitchViewMode('interactive')}
              className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 h-7.5 sm:h-9 rounded-full text-[11px] sm:text-xs font-bold transition-all active:scale-95 touch-manipulation cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">{language === 'en' ? 'Interactive GPS' : 'Interaktif GPS'}</span>
              <span className="sm:hidden font-bold">GPS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            </button>
            <button
              onClick={() => handleSwitchViewMode('illustrated')}
              className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 h-7.5 sm:h-9 rounded-full text-[11px] sm:text-xs font-bold transition-all active:scale-95 touch-manipulation cursor-pointer ${
                viewMode === 'illustrated'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Brosur</span>
            </button>
          </div>

          {/* Rute A-B Button & Quick Stop when Active */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsRoutePlannerOpen(true)}
              className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 h-7.5 sm:h-9 rounded-full text-[11px] sm:text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer flex-shrink-0 touch-manipulation ${
                isNavigatingActive
                  ? 'bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/30'
                  : 'bg-card hover:bg-muted text-foreground border border-border/80'
              }`}
              title="Perencana Rute Pejalan Kaki Titik A ke B"
            >
              <Milestone className={`w-3.5 h-3.5 flex-shrink-0 ${isNavigatingActive ? 'text-white' : 'text-primary'}`} />
              <span className="whitespace-nowrap">{language === 'en' ? 'Route' : 'Rute'}</span>
              {isNavigatingActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
            {isNavigatingActive && (
              <button
                onClick={handleStopRoute}
                className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center justify-center text-xs font-bold transition-all active:scale-90 flex-shrink-0 touch-manipulation cursor-pointer"
                title="Hentikan Rute Navigasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1 min-w-1" />

          {/* ── Compact Icon Actions Row ── */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Basemap Dropdown — only in interactive mode */}
            {viewMode === 'interactive' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex items-center justify-center w-7.5 h-7.5 sm:w-auto sm:h-9 sm:gap-1.5 sm:px-3 rounded-full bg-card hover:bg-muted text-foreground border border-border/80 text-xs font-bold shadow-2xs transition-all active:scale-90 flex-shrink-0 touch-manipulation cursor-pointer"
                    title="Pilih Lapisan Peta"
                  >
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">{language === 'en' ? 'Layers' : 'Lapisan'}</span>
                    <ChevronDown className="hidden sm:block w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl border-border/80 shadow-xl bg-card">
                  <DropdownMenuItem
                    onClick={() => handleBasemapSelect('osmHot')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Peta Wisata Ragunan</span>
                    </div>
                    {activeBasemap === 'osmHot' && <Check className="w-3.5 h-3.5 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBasemapSelect('osmStandard')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>Peta Jalan Standar</span>
                    </div>
                    {activeBasemap === 'osmStandard' && <Check className="w-3.5 h-3.5 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBasemapSelect('satellite')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span>Citra Satelit HD</span>
                    </div>
                    {activeBasemap === 'satellite' && <Check className="w-3.5 h-3.5 text-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Parkir — only interactive mode */}
            {viewMode === 'interactive' && (
              <button
                onClick={handleParkingToggleInteractive}
                className={`inline-flex items-center justify-center w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full text-xs font-bold transition-all active:scale-90 shadow-2xs flex-shrink-0 touch-manipulation cursor-pointer ${
                  isParkingSaved
                    ? 'bg-sky-600 text-white shadow-sky-600/25'
                    : 'bg-card hover:bg-muted text-foreground border border-border/80'
                }`}
                title={isParkingSaved ? 'Hapus titik parkir' : 'Ingat & Pandu ke Posisi Parkir'}
              >
                <Car className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isParkingSaved ? 'text-white' : 'text-sky-600 dark:text-sky-400'}`} />
              </button>
            )}

            {/* Download — illustrated mode only */}
            {viewMode === 'illustrated' && mapImageUrl && (
              <button
                onClick={handleDownloadMap}
                className="inline-flex items-center justify-center w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full bg-card hover:bg-muted text-foreground border border-border/80 text-xs font-semibold shadow-2xs transition-all active:scale-90 flex-shrink-0 touch-manipulation cursor-pointer"
                title="Unduh Peta HD"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="inline-flex items-center justify-center w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full bg-card hover:bg-muted text-foreground border border-border/80 text-xs font-semibold shadow-2xs transition-all active:scale-90 flex-shrink-0 touch-manipulation cursor-pointer"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Baris 2: Search Bar with Autocomplete Suggestions */}
        <div className="px-2 sm:px-4 pb-1 sm:pb-1.5 relative">
          <div className="relative w-full">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder={language === 'en' ? 'Search animals, gates, restrooms...' : 'Cari satwa, toilet, loket, musholla...'}
              className="w-full pl-8.5 pr-8.5 py-1.5 h-8 sm:h-9.5 rounded-full bg-card/90 dark:bg-card border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium transition-all placeholder:text-muted-foreground/70 shadow-2xs touch-manipulation"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchInputChange('')}
                className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 w-5.5 h-5.5 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-full hover:bg-muted touch-manipulation cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown List */}
          {searchQuery.trim().length >= 2 && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-2 right-2 sm:left-4 sm:right-4 mt-1 bg-card/98 dark:bg-[#0A120E]/98 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto overscroll-contain p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1">
              <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>{language === 'en' ? 'Suggestions' : 'Rekomendasi Titik'}</span>
                <span>{searchSuggestions.length} hasil</span>
              </div>
              {searchSuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectSearchSuggestion(item)}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-muted/70 active:scale-[0.99] transition-all group cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {item.type === 'animal' ? '🐾' : item.type === 'toilet' ? '🚻' : item.type === 'musholla' ? '🕌' : item.type === 'kuliner' ? '🍴' : '📍'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {language === 'en' ? item.name_en || item.name : item.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {item.type === 'animal' ? (language === 'en' ? 'Wildlife Zone' : 'Kandang Satwa') : (language === 'en' ? 'Public Facility' : 'Fasilitas Umum')}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 flex-shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">
                    <Navigation className="w-3 h-3" />
                    <span>{language === 'en' ? 'View' : 'Lihat'}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Baris 3: Category Filter Pills */}
        <div className="px-2 sm:px-4 pb-1 sm:pb-1.5 border-t border-border/50 pt-1 sm:pt-1.5 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar touch-pan-x">
          {[
            { key: 'all',     labelMobile: 'Semua',    labelFull: language === 'en' ? 'All' : 'Semua Titik',       icon: <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
            { key: 'animal',  labelMobile: 'Satwa',    labelFull: language === 'en' ? 'Fauna' : 'Satwa / Fauna',   icon: <PawPrint className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
            { key: 'toilet',  labelMobile: 'Toilet',   labelFull: language === 'en' ? 'Restrooms' : 'Toilet',      icon: <Bath className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
            { key: 'musholla',labelMobile: 'Musholla', labelFull: language === 'en' ? 'Mosque' : 'Musholla',       icon: <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
            { key: 'tram',    labelMobile: 'Halte',    labelFull: language === 'en' ? 'Tram' : 'Halte Kereta',    icon: <Train className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
            { key: 'ticket',  labelMobile: 'Loket',    labelFull: language === 'en' ? 'Gates' : 'Loket & Gerbang', icon: <Ticket className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
            { key: 'kuliner', labelMobile: 'Kuliner',  labelFull: language === 'en' ? 'Food' : 'Pujasera',        icon: <Utensils className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
            { key: 'medical', labelMobile: 'P3K',      labelFull: language === 'en' ? 'First Aid' : 'Pos Medis',  icon: <HeartPulse className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleCategoryFilterSelect(item.key as ZoneCategoryFilter)}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 min-h-[26px] sm:min-h-[30px] rounded-full text-[10.5px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 flex-shrink-0 touch-manipulation cursor-pointer ${
                categoryFilter === item.key
                  ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                  : 'bg-card/70 hover:bg-muted text-foreground border border-border/70 hover:border-border'
              }`}
            >
              {item.icon}
              <span className="sm:hidden">{item.labelMobile}</span>
              <span className="hidden sm:inline">{item.labelFull}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MODE 1: INTERACTIVE GPS LEAFLET MAP (Edge-to-Edge Full Focus) ── */}
      {viewMode === 'interactive' && (
        <div 
          className={`w-full relative ${
            isFullscreen 
              ? 'fixed inset-0 z-[100] h-[100dvh] bg-background flex flex-col' 
              : 'flex-1 min-h-0'
          }`}
          style={!isFullscreen ? { height: '100%' } : undefined}
        >
          {isFullscreen && (
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-background/95 backdrop-blur-md border-b border-border/70 z-10 flex-shrink-0 h-11">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-foreground">
                  {language === 'en' ? 'Ragunan Zoo Fullscreen GPS Navigator' : 'Navigasi GPS Layar Penuh Ragunan Zoo'}
                </span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm active:scale-95"
              >
                <Minimize2 className="w-3 h-3" />
                <span>{language === 'en' ? 'Close' : 'Tutup'}</span>
              </button>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={interactiveMapUrl}
            title="Peta Interaktif Ragunan Zoo"
            className="absolute inset-0 w-full h-full border-0 block"
            style={{ width: '100%', height: isFullscreen ? 'calc(100dvh - 44px)' : '100%', border: 'none' }}
            allow="geolocation; camera; microphone; accelerometer; gyroscope"
            onLoad={() => {
              try {
                iframeRef.current?.contentWindow?.postMessage({ type: 'INVALIDATE_SIZE' }, '*');
              } catch (_e) {
                // Ignore cross-origin postMessage errors
              }
            }}
          />
        </div>
      )}

      {/* ── MODE 2: ILLUSTRATED BROCHURE MAP (FALLBACK / CLASSIC) ── */}
      {viewMode === 'illustrated' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="bg-card rounded-3xl shadow-card border border-border/80 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 bg-muted/30">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground text-sm">
                  {language === 'en' ? 'Loading map...' : 'Memuat peta kawasan...'}
                </p>
              </div>
            ) : mapImageUrl ? (
              <div className="p-3 sm:p-4 md:p-6 space-y-4">
                {/* Illustrated Map Sub-Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pb-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <MapIcon className="w-4 h-4 text-primary" />
                    <span>{language === 'en' ? 'Official Illustrated Layout of TM Ragunan' : 'Peta Brosur Ilustrasi Resmi Kawasan Ragunan'}</span>
                  </div>
                  {effectiveLocation && !isWithinZoo(effectiveLocation.latitude, effectiveLocation.longitude) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>{language === 'en' ? 'Simulated at North Gate (Outside Zoo)' : 'Simulasi di Pintu Utama (Lokasi di Luar Kawasan)'}</span>
                    </span>
                  )}
                  <span className="font-semibold text-primary">
                    {filteredMarkers.length} dari {activeMarkers.length} Titik Ditampilkan
                  </span>
                </div>

                {/* Interactive Map Canvas with Floating HUD */}
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-inner bg-slate-900/5 dark:bg-slate-950">
                  <TransformWrapper
                    ref={transformRef}
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit
                    wheel={{ step: 0.1 }}
                    pinch={{ step: 5 }}
                    doubleClick={{ mode: 'toggle' }}
                  >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <>
                        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 backdrop-blur-xl bg-card/85 dark:bg-slate-900/85 p-1.5 rounded-2xl border border-border/80 shadow-lg">
                          <button
                            onClick={handleToggleGps}
                            aria-label="Track location"
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all shadow-2xs touch-manipulation active:scale-90 cursor-pointer ${
                              effectiveLocation 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                : 'bg-background hover:bg-muted text-foreground hover:text-primary'
                            }`}
                            title={effectiveLocation ? 'Lokasi Aktif' : 'Aktifkan GPS'}
                          >
                            <Crosshair className={`w-4 h-4 ${effectiveLocation ? 'animate-pulse' : ''}`} />
                          </button>

                          <div className="w-full h-px bg-border/60 my-0.5" />

                          <button
                            onClick={() => zoomIn()}
                            aria-label="Zoom in"
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-background hover:bg-muted flex items-center justify-center text-foreground hover:text-primary transition-all shadow-2xs touch-manipulation active:scale-90 cursor-pointer"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => zoomOut()}
                            aria-label="Zoom out"
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-background hover:bg-muted flex items-center justify-center text-foreground hover:text-primary transition-all shadow-2xs touch-manipulation active:scale-90 cursor-pointer"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => resetTransform()}
                            aria-label="Reset zoom"
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-background hover:bg-muted flex items-center justify-center text-foreground hover:text-primary transition-all shadow-2xs touch-manipulation active:scale-90 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-3 z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl bg-card/85 dark:bg-slate-900/85 border border-border/80 text-xs font-semibold text-foreground shadow-md pointer-events-none">
                          <span className={`w-2 h-2 rounded-full ${effectiveLocation ? 'bg-emerald-500 animate-ping' : 'bg-primary animate-pulse'}`} />
                          <span>
                            {effectiveLocation
                              ? (isSimulatingLocation
                                  ? (language === 'en' ? 'Simulating location at Schmutzer' : 'Simulasi posisi: Pusat Primata Schmutzer')
                                  : (language === 'en' ? 'Live GPS tracking active' : 'GPS Aktif • Posisi Anda terpantau di peta'))
                              : (language === 'en' ? 'Pinch/drag to explore • Tap markers' : 'Cubit & geser peta • Ketuk marker zona')}
                          </span>
                        </div>

                        <TransformComponent
                          wrapperStyle={{ width: '100%', maxHeight: '72vh' }}
                          contentStyle={{ width: '100%' }}
                        >
                          <div className="relative w-full">
                            <img
                              src={mapImageUrl}
                              alt="Peta Ragunan"
                              className="w-full h-auto select-none"
                              draggable={false}
                            />

                            {/* SVG Visual Route Trajectory Overlay */}
                            {activeRouteResult && (
                              <svg 
                                className="absolute inset-0 w-full h-full pointer-events-none z-15"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                              >
                                <defs>
                                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#059669" />
                                  </linearGradient>
                                  <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#10b981" floodOpacity="0.7"/>
                                  </filter>
                                </defs>
                                
                                {/* Background glow track */}
                                <line
                                  x1={activeRouteResult.originPoint.x}
                                  y1={activeRouteResult.originPoint.y}
                                  x2={activeRouteResult.destPoint.x}
                                  y2={activeRouteResult.destPoint.y}
                                  stroke="#10b981"
                                  strokeWidth="1.2"
                                  strokeOpacity="0.35"
                                  strokeLinecap="round"
                                />

                                {/* Animated dashed path */}
                                <line
                                  x1={activeRouteResult.originPoint.x}
                                  y1={activeRouteResult.originPoint.y}
                                  x2={activeRouteResult.destPoint.x}
                                  y2={activeRouteResult.destPoint.y}
                                  stroke="url(#routeGradient)"
                                  strokeWidth="0.8"
                                  strokeDasharray="1.8,1.8"
                                  strokeLinecap="round"
                                  filter="url(#routeGlow)"
                                  className="animate-pulse"
                                />

                                {/* Origin Point Circle */}
                                <circle
                                  cx={activeRouteResult.originPoint.x}
                                  cy={activeRouteResult.originPoint.y}
                                  r="1.3"
                                  fill="#059669"
                                  stroke="#ffffff"
                                  strokeWidth="0.4"
                                />

                                {/* Target Point Ring */}
                                <circle
                                  cx={activeRouteResult.destPoint.x}
                                  cy={activeRouteResult.destPoint.y}
                                  r="1.8"
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth="0.5"
                                  className="animate-ping"
                                />
                                <circle
                                  cx={activeRouteResult.destPoint.x}
                                  cy={activeRouteResult.destPoint.y}
                                  r="1.2"
                                  fill="#ef4444"
                                  stroke="#ffffff"
                                  strokeWidth="0.4"
                                />
                              </svg>
                            )}
                            
                            {userMapPosition && (
                              <UserLocationMarker
                                position={userMapPosition}
                                accuracy={effectiveLocation?.accuracy || 15}
                                heading={effectiveLocation && 'heading' in effectiveLocation ? (effectiveLocation as any).heading : undefined}
                                isLoading={geoLoading}
                              />
                            )}

                            {filteredMarkers.map((marker) => (
                              <MapMarker
                                key={marker.id}
                                zone={language === 'en' && marker.name_en ? marker.name_en : marker.name}
                                color={marker.color}
                                position={{ x: Number(marker.position_x), y: Number(marker.position_y) }}
                                onClick={() => handleMarkerClick(marker)}
                                isActive={highlightedZone === marker.id || selectedRouteDestId === marker.id}
                                iconType={marker.type}
                              />
                            ))}
                          </div>
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                </div>

                {/* Legend */}
                <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      {language === 'en'
                        ? 'Displaying official animal zones, feeder spots, shelters, and park gates.'
                        : 'Menampilkan zona satwa resmi, kandang pamer, shelter istirahat, dan gerbang masuk.'}
                    </span>
                  </div>
                  <span className="font-semibold text-primary">
                    {filteredMarkers.length} dari {activeMarkers.length} Titik Ditampilkan
                  </span>
                </div>

                {/* Route Estimator & Walking Guide Card */}
                <RouteEstimatorCard
                  userMapPosition={userMapPosition}
                  selectedDestinationId={selectedRouteDestId}
                  onRouteCalculated={(res) => setActiveRouteResult(res)}
                  onSwitchToInteractiveGps={handleSwitchToGps}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-muted/30 p-8">
                <ImageOff className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-center text-muted-foreground">
                  {language === 'en' 
                    ? 'Map image not available. Please check manager settings.' 
                    : 'Gambar peta tidak tersedia. Silakan periksa pengaturan manager.'}
                </p>
              </div>
            )}
          </div>

          {/* Zone Quick Directory Cards for Illustrated Mode */}
          {activeMarkers.length > 0 && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{language === 'en' ? 'Direct Zone Directory' : 'Daftar Zona Kandang & Fasilitas'}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {language === 'en' ? 'Select a zone to inspect animals living there' : 'Pilih zona untuk melihat rincian satwa yang dapat dikunjungi'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredMarkers.map((marker) => {
                const zoneName = language === 'en' && marker.name_en ? marker.name_en : marker.name;
                const isCurrentHighlighted = highlightedZone === marker.id;

                let distLabel: string | null = null;
                if (effectiveLocation) {
                  const targetCoords = getMarkerCoords(Number(marker.position_x), Number(marker.position_y));
                  const d = calculateDistance(
                    effectiveLocation.latitude,
                    effectiveLocation.longitude,
                    targetCoords.lat,
                    targetCoords.lng
                  );
                  distLabel = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
                }

                return (
                  <button
                    key={marker.id}
                    onClick={() => handleMarkerClick(marker)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all group ${
                      isCurrentHighlighted
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border/80 bg-card hover:border-primary/50 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: marker.color }}
                      >
                        {marker.type === 'toilet' && <Bath className="w-3.5 h-3.5" />}
                        {marker.type === 'musholla' && <Compass className="w-3.5 h-3.5" />}
                        {marker.type === 'tram' && <Train className="w-3.5 h-3.5" />}
                        {marker.type === 'ticket' && <Ticket className="w-3.5 h-3.5" />}
                        {marker.type === 'kuliner' && <Utensils className="w-3.5 h-3.5" />}
                        {marker.type === 'medical' && <HeartPulse className="w-3.5 h-3.5" />}
                        {(marker.type === 'animal' || !marker.type) && <PawPrint className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs sm:text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                          {zoneName}
                        </span>
                        {distLabel && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Footprints className="w-2.5 h-2.5 text-primary" />
                            <span>{distLabel}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )}

      {/* Zone Info Modal for Illustrated Mode */}
      {viewMode === 'illustrated' && selectedZone && (
        <ZoneInfoModal
          isOpen={!!selectedZone}
          onClose={handleCloseModal}
          zone={language === 'en' ? selectedZone.nameEn : selectedZone.name}
          color={selectedZone.color}
          animals={selectedZoneAnimals}
          description={language === 'en' ? selectedZone.descriptionEn : selectedZone.description}
          distanceKm={selectedZone.distanceKm}
          walkingTimeMinutes={selectedZone.walkingTimeMinutes}
          targetCoords={selectedZone.targetCoords}
          onSelectForRoute={() => {
            if (selectedZone) {
              setRoutePlannerDestId(selectedZone.id);
              setIsRoutePlannerOpen(true);
            }
          }}
          onSelectAsOrigin={() => {
            if (selectedZone) {
              setRoutePlannerOriginId(selectedZone.id);
              setIsRoutePlannerOpen(true);
            }
          }}
        />
      )}

      {/* Route Planner Drawer (Mobile Bottom-Sheet & Desktop Floating Card) */}
      <RoutePlannerDrawer
        isOpen={isRoutePlannerOpen}
        onClose={() => setIsRoutePlannerOpen(false)}
        userMapPosition={userMapPosition}
        userGpsCoords={effectiveLocation ? { latitude: effectiveLocation.latitude, longitude: effectiveLocation.longitude } : null}
        initialOriginId={routePlannerOriginId}
        initialDestId={routePlannerDestId}
        isNavigatingActive={isNavigatingActive}
        onStartRoute={handleStartRoute}
        onStopRoute={handleStopRoute}
      />

      {/* Floating Active Navigation Bar for Illustrated Mode (Interactive mode uses native Leaflet HUD) */}
      {viewMode === 'illustrated' && isNavigatingActive && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-20px)] p-2.5 px-3.5 rounded-2xl bg-[#0e261c]/95 dark:bg-[#07150f]/95 backdrop-blur-xl border border-emerald-500/40 text-white shadow-2xl flex items-center justify-between gap-2.5 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold truncate text-emerald-300">
                {activeNavInfo?.destinationName ? `Menuju ${activeNavInfo.destinationName}` : 'Navigasi Pejalan Kaki Aktif'}
              </div>
              <div className="text-[11px] text-white/80 truncate">
                {activeNavInfo?.totalDistance 
                  ? `${activeNavInfo.totalDistance}m • ~${activeNavInfo.durationMinutes || 4} mnt jalan`
                  : 'Ikuti garis rute hijau di peta'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsRoutePlannerOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-colors cursor-pointer touch-manipulation"
            >
              Rute
            </button>
            <button
              onClick={handleStopRoute}
              className="px-2.5 py-1 rounded-xl bg-red-500/25 hover:bg-red-500/35 text-red-200 text-[11px] font-bold transition-colors cursor-pointer touch-manipulation"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ExplorerMap() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    }>
      <ExplorerMapContent />
    </Suspense>
  );
}
