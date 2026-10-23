"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  RefreshCw,
  Search,
  Compass,
  Clock,
  Utensils,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  Sparkles,
  Train,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Crosshair,
  ArrowUp,
  ArrowDown,
  Building2,
  Bath,
  Ticket,
  HeartPulse,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/useConfirm';
import {
  getGpsPoisAction,
  createGpsPoiAction,
  updateGpsPoiAction,
  deleteGpsPoiAction,
  updatePoiClosureAction,
  updatePoiCapacityAction,
  updatePoiAnnouncementAction,
  getTramRouteAction,
  createTramPointAction,
  updateTramPointAction,
  deleteTramPointAction,
  reorderTramRouteAction
} from './actions';

import {
  GpsPoi,
  TramRoutePoint,
  CATEGORY_OPTIONS,
  PRESET_COLORS
} from './types';
import { GpsPoiModal } from './components/GpsPoiModal';
import { TramPointModal } from './components/TramPointModal';
import { GpsClosureModal } from './components/GpsClosureModal';
import { GpsAnnouncementModal } from './components/GpsAnnouncementModal';
import { GpsAnalyticsTab } from './components/GpsAnalyticsTab';

export default function ManageGpsMapClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  // State Tabs
  const [activeTab, setActiveTab] = useState<'pois' | 'tram' | 'status' | 'analytics'>('pois');

  // Data States
  const [pois, setPois] = useState<GpsPoi[]>([]);
  const [tramPoints, setTramPoints] = useState<TramRoutePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  // Interactive Pin Picking Mode
  const [isPickCoordsMode, setIsPickCoordsMode] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Leaflet Map State
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const tramPolylineRef = useRef<any>(null);
  const pickMarkerRef = useRef<any>(null);

  // Dialog States
  const [isPoiDialogOpen, setIsPoiDialogOpen] = useState(false);
  const [isEditingPoi, setIsEditingPoi] = useState(false);
  const [poiFormData, setPoiFormData] = useState<Partial<GpsPoi>>({
    id: '',
    name: '',
    name_en: '',
    category: 'animal',
    lat: -6.3125,
    lng: 106.8232,
    color: '#22c55e',
    emoji: '🐘',
    description: '',
    description_en: '',
    is_active: true,
    latin_name: '',
    conservation_status: '',
    feeding_time: '',
    feeding_time_hour: undefined,
    feeding_time_minute: undefined,
    feeding_note: '',
    operating_hours_open: '',
    operating_hours_close: '',
    capacity_status: 'normal',
    sort_order: 0
  });

  // Tram Point Dialog
  const [isTramDialogOpen, setIsTramDialogOpen] = useState(false);
  const [editingTramPoint, setEditingTramPoint] = useState<TramRoutePoint | null>(null);
  const [tramFormData, setTramFormData] = useState<{
    lat: number;
    lng: number;
    halt_name: string;
    is_halt: boolean;
  }>({
    lat: -6.3125,
    lng: 106.8232,
    halt_name: '',
    is_halt: false
  });

  // Closure Quick Modal
  const [closureModalPoi, setClosureModalPoi] = useState<GpsPoi | null>(null);
  const [closureReason, setClosureReason] = useState('');
  const [closureUntil, setClosureUntil] = useState('');

  // Announcement Quick Modal
  const [announcementModalPoi, setAnnouncementModalPoi] = useState<GpsPoi | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementExpiry, setAnnouncementExpiry] = useState('');

  // 1. Fetch initial data
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [poisRes, tramRes] = await Promise.all([
        getGpsPoisAction({ active_only: 'false' }),
        getTramRouteAction()
      ]);
      if (poisRes?.data) setPois(poisRes.data);
      if (tramRes?.data) setTramPoints(tramRes.data);
    } catch (err: any) {
      console.error('Error fetching GPS map data:', err);
      toast.error('Gagal memuat data peta GPS: ' + (err.message || 'Koneksi error'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for SSE updates
    const handleRealtime = (e: any) => {
      if (e.detail?.table === 'gps_pois' || e.detail?.table === 'tram_route_points') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtime);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtime);
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    const loadLeaflet = async () => {
      // Ensure Leaflet CSS is present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Ensure Leaflet JS is loaded
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Gagal memuat script Leaflet'));
          document.head.appendChild(script);
        });
      }

      if (isCancelled || !mapContainerRef.current) return;

      const L = (window as any).L;

      // Clean up previous map if exists
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }

      // Initialize map centered at Ragunan
      const map = L.map(mapContainerRef.current, {
        center: [-6.3125, 106.8232],
        zoom: 16,
        minZoom: 14,
        maxZoom: 19,
        zoomControl: true
      });

      // OSM HOT Basemap
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Layer groups
      markersGroupRef.current = L.layerGroup().addTo(map);

      // Click event for coordinate picker
      map.on('click', (e: any) => {
        const coords = { lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) };
        setPickedCoords(coords);

        // Update pick marker
        if (pickMarkerRef.current) {
          pickMarkerRef.current.setLatLng(e.latlng);
        } else {
          pickMarkerRef.current = L.circleMarker(e.latlng, {
            radius: 8,
            color: '#dc2626',
            fillColor: '#ef4444',
            fillOpacity: 0.9,
            weight: 3
          }).addTo(map);
        }

        pickMarkerRef.current.bindPopup(`<b>Titik Terpilih</b><br>Lat: ${coords.lat}<br>Lng: ${coords.lng}`).openPopup();
        toast.info(`Koordinat dipilih: ${coords.lat}, ${coords.lng}`);
      });

      leafletMapInstanceRef.current = map;
      renderMapMarkers(map, pois, tramPoints);
    };

    loadLeaflet().catch(err => console.error('Error loading Leaflet map:', err));

    return () => {
      isCancelled = true;
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 3. Render Leaflet Markers whenever pois or tramPoints change
  const renderMapMarkers = useCallback((mapInstance?: any, currentPois?: GpsPoi[], currentTram?: TramRoutePoint[]) => {
    const map = mapInstance || leafletMapInstanceRef.current;
    if (!map || !(window as any).L) return;
    const L = (window as any).L;

    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    const poisToDisplay = currentPois || pois;
    const tramToDisplay = currentTram || tramPoints;

    // A. Render Tram Polyline
    if (tramPolylineRef.current) {
      map.removeLayer(tramPolylineRef.current);
      tramPolylineRef.current = null;
    }

    if (tramToDisplay && tramToDisplay.length > 1) {
      const latLngs = tramToDisplay.map(pt => [pt.lat, pt.lng]);
      tramPolylineRef.current = L.polyline(latLngs, {
        color: '#d97706',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 8',
        lineJoin: 'round'
      }).addTo(map);

      // Render Halte markers
      tramToDisplay.filter(pt => pt.is_halt).forEach(pt => {
        const haltIcon = L.divIcon({
          className: 'manager-tram-halt',
          html: `<div style="background:#d97706; color:white; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3); font-size:12px;">🚂</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        const m = L.marker([pt.lat, pt.lng], { icon: haltIcon });
        m.bindPopup(`<b>Halte: ${pt.halt_name || 'Halte Kereta'}</b><br>Urutan #${pt.sequence_order}`);
        markersGroupRef.current.addLayer(m);
      });
    }

    // B. Render POIs Markers
    poisToDisplay.forEach(poi => {
      const isClosed = poi.is_temporarily_closed;
      const isPadat = poi.capacity_status === 'padat';
      const bgColor = isClosed ? '#dc2626' : (poi.color || '#22c55e');

      const markerHtml = `
        <div style="position:relative; text-align:center;">
          <div style="background:${bgColor}; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2.5px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.35); font-size:16px;">
            ${poi.emoji || '📍'}
          </div>
          ${isClosed ? `<div style="position:absolute; top:-6px; right:-8px; background:#ef4444; color:white; font-size:8px; font-weight:bold; padding:1px 4px; border-radius:6px; border:1px solid white;">TUTUP</div>` : ''}
          ${isPadat ? `<div style="position:absolute; bottom:-6px; right:-8px; background:#f97316; color:white; font-size:8px; font-weight:bold; padding:1px 4px; border-radius:6px; border:1px solid white;">PADAT</div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'manager-poi-marker',
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family:inherit; min-width:180px;">
          <div style="font-weight:700; font-size:14px; margin-bottom:2px; color:#111;">${poi.emoji || ''} ${poi.name}</div>
          <div style="font-size:11px; color:#666; margin-bottom:6px;">Kategori: <b>${poi.category}</b></div>
          ${poi.feeding_time ? `<div style="font-size:11px; color:#15803d; font-weight:600; margin-bottom:4px;">🍖 Feeding: ${poi.feeding_time}</div>` : ''}
          ${poi.operating_hours_open ? `<div style="font-size:11px; color:#0284c7; margin-bottom:4px;">🕒 Buka: ${poi.operating_hours_open} - ${poi.operating_hours_close || ''}</div>` : ''}
          ${isClosed ? `<div style="font-size:11px; color:#dc2626; font-weight:bold; background:#fee2e2; padding:3px 6px; border-radius:4px; margin-top:4px;">⚠️ Tutup: ${poi.closure_reason || 'Sedang renovasi'}</div>` : ''}
          ${poi.local_announcement ? `<div style="font-size:11px; color:#b45309; background:#fef3c7; padding:3px 6px; border-radius:4px; margin-top:4px;">📢 ${poi.local_announcement}</div>` : ''}
          <div style="margin-top:8px; font-size:10px; color:#999;">Lat: ${poi.lat}, Lng: ${poi.lng}</div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setPickedCoords({ lat: poi.lat, lng: poi.lng });
      });

      markersGroupRef.current.addLayer(marker);
    });
  }, [pois, tramPoints]);

  useEffect(() => {
    if (leafletMapInstanceRef.current) {
      renderMapMarkers();
    }
  }, [renderMapMarkers]);

  // Center map to POI
  const flyToPoi = (poi: GpsPoi) => {
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.flyTo([poi.lat, poi.lng], 18, { duration: 1 });
      setPickedCoords({ lat: poi.lat, lng: poi.lng });
    }
  };

  // 4. Filtering POIs for list
  const filteredPois = useMemo(() => {
    return pois.filter(poi => {
      const matchesSearch =
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (poi.name_en && poi.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        poi.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (poi.description && poi.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || poi.category === selectedCategory;

      const matchesStatus =
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? (poi.is_active && !poi.is_temporarily_closed) :
        poi.is_temporarily_closed;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [pois, searchQuery, selectedCategory, statusFilter]);

  // Handle Create / Edit POI Form Submit
  const handleSavePoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poiFormData.id || !poiFormData.name || !poiFormData.category || poiFormData.lat == null || poiFormData.lng == null) {
      toast.error('ID, Nama, Kategori, Latitude, dan Longitude wajib diisi.');
      return;
    }

    try {
      if (isEditingPoi) {
        await updateGpsPoiAction(poiFormData.id, poiFormData);
        toast.success(`Titik POI "${poiFormData.name}" berhasil diperbarui!`);
      } else {
        await createGpsPoiAction(poiFormData);
        toast.success(`Titik POI baru "${poiFormData.name}" berhasil ditambahkan!`);
      }
      setIsPoiDialogOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving POI:', err);
      toast.error('Gagal menyimpan POI: ' + err.message);
    }
  };

  // Handle Delete POI
  const handleDeletePoi = async (poi: GpsPoi) => {
    const isConfirmed = await confirm(
      `Hapus Titik POI "${poi.name}"?`,
      'Apakah Anda yakin ingin menghapus titik lokasi ini secara permanen dari peta GPS?'
    );

    if (!isConfirmed) return;

    try {
      await deleteGpsPoiAction(poi.id);
      toast.success(`Titik POI "${poi.name}" berhasil dihapus.`);
      fetchData();
    } catch (err: any) {
      toast.error('Gagal menghapus POI: ' + err.message);
    }
  };

  // Quick Toggle Closure
  const handleToggleClosureQuick = async (poi: GpsPoi) => {
    if (!poi.is_temporarily_closed) {
      // Open dialog to provide reason
      setClosureModalPoi(poi);
      setClosureReason(poi.closure_reason || 'Perawatan berkala & renovasi fasilitas');
      setClosureUntil(poi.closure_until || '');
    } else {
      // Directly re-open
      try {
        await updatePoiClosureAction(poi.id, { is_temporarily_closed: false });
        toast.success(`Status "${poi.name}" dibuka kembali untuk pengunjung.`);
        fetchData();
      } catch (err: any) {
        toast.error('Gagal membuka zona: ' + err.message);
      }
    }
  };

  // Save Closure from Modal
  const handleSaveClosureModal = async () => {
    if (!closureModalPoi) return;
    try {
      await updatePoiClosureAction(closureModalPoi.id, {
        is_temporarily_closed: true,
        closure_reason: closureReason,
        closure_until: closureUntil || undefined
      });
      toast.success(`"${closureModalPoi.name}" ditandai TUTUP sementara.`);
      setClosureModalPoi(null);
      fetchData();
    } catch (err: any) {
      toast.error('Gagal memperbarui status tutup: ' + err.message);
    }
  };

  // Quick Change Capacity
  const handleCapacityChange = async (poi: GpsPoi, capacity: 'normal' | 'padat' | 'sepi') => {
    try {
      await updatePoiCapacityAction(poi.id, capacity);
      toast.success(`Kapasitas "${poi.name}" diubah menjadi: ${capacity.toUpperCase()}`);
      fetchData();
    } catch (err: any) {
      toast.error('Gagal memperbarui kapasitas: ' + err.message);
    }
  };

  // Save Announcement Modal
  const handleSaveAnnouncementModal = async () => {
    if (!announcementModalPoi) return;
    try {
      await updatePoiAnnouncementAction(announcementModalPoi.id, {
        local_announcement: announcementText,
        announcement_expires_at: announcementExpiry || undefined
      });
      toast.success(`Pengumuman lokal untuk "${announcementModalPoi.name}" disimpan.`);
      setAnnouncementModalPoi(null);
      fetchData();
    } catch (err: any) {
      toast.error('Gagal menyimpan pengumuman: ' + err.message);
    }
  };

  // Open Create POI
  const handleOpenCreatePoi = () => {
    setIsEditingPoi(false);
    setPoiFormData({
      id: '',
      name: '',
      name_en: '',
      category: 'animal',
      lat: pickedCoords ? pickedCoords.lat : -6.3125,
      lng: pickedCoords ? pickedCoords.lng : 106.8232,
      color: '#22c55e',
      emoji: '🐘',
      description: '',
      description_en: '',
      is_active: true,
      latin_name: '',
      conservation_status: '',
      feeding_time: '',
      feeding_time_hour: undefined,
      feeding_time_minute: undefined,
      feeding_note: '',
      operating_hours_open: '',
      operating_hours_close: '',
      capacity_status: 'normal',
      sort_order: pois.length * 10 + 10
    });
    setIsPoiDialogOpen(true);
  };

  // Open Edit POI
  const handleOpenEditPoi = (poi: GpsPoi) => {
    setIsEditingPoi(true);
    setPoiFormData({ ...poi });
    setIsPoiDialogOpen(true);
  };

  // Tram Route Handlers
  const handleAddTramPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTramPoint) {
        await updateTramPointAction(editingTramPoint.id, tramFormData);
        toast.success('Waypoint kereta diperbarui.');
      } else {
        await createTramPointAction(tramFormData);
        toast.success('Waypoint kereta baru ditambahkan.');
      }
      setIsTramDialogOpen(false);
      setEditingTramPoint(null);
      fetchData();
    } catch (err: any) {
      toast.error('Gagal menyimpan titik kereta: ' + err.message);
    }
  };

  const handleDeleteTramPoint = async (point: TramRoutePoint) => {
    const isConfirmed = await confirm(
      `Hapus Waypoint #${point.sequence_order}?`,
      'Hapus waypoint ini dari jalur kereta wisata?'
    );
    if (!isConfirmed) return;

    try {
      await deleteTramPointAction(point.id);
      toast.success('Waypoint dihapus.');
      fetchData();
    } catch (err: any) {
      toast.error('Gagal menghapus waypoint: ' + err.message);
    }
  };

  const handleMoveTramPoint = async (index: number, direction: 'up' | 'down') => {
    const newPoints = [...tramPoints];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPoints.length) return;

    const temp = newPoints[index];
    newPoints[index] = newPoints[targetIndex];
    newPoints[targetIndex] = temp;

    const orderPayload = newPoints.map((pt, i) => ({
      id: pt.id,
      sequence_order: i + 1
    }));

    try {
      await reorderTramRouteAction(orderPayload);
      setTramPoints(newPoints.map((pt, i) => ({ ...pt, sequence_order: i + 1 })));
      toast.success('Urutan waypoint diperbarui.');
    } catch (err: any) {
      toast.error('Gagal mengubah urutan: ' + err.message);
      fetchData();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {ConfirmComponent}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-[2rem] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Compass className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Peta GPS Interaktif
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Leaflet Engine
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Kelola titik satwa & fasilitas koordinat GPS nyata (WGS84 Lat/Lng), status buka/tutup zona, jam makan satwa, dan rute kereta wisata.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isRefreshing}
            className="rounded-xl border-gray-200"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            Segarkan
          </Button>

          <Link href="/map" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Buka Peta Publik
            </Button>
          </Link>

          {activeTab === 'pois' && (
            <Button
              onClick={handleOpenCreatePoi}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Titik POI
            </Button>
          )}

          {activeTab === 'tram' && (
            <Button
              onClick={() => {
                setEditingTramPoint(null);
                setTramFormData({
                  lat: pickedCoords ? pickedCoords.lat : -6.3125,
                  lng: pickedCoords ? pickedCoords.lng : 106.8232,
                  halt_name: '',
                  is_halt: false
                });
                setIsTramDialogOpen(true);
              }}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Titik Jalur
            </Button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('pois')}
          className={`px-5 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'pois'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/60 text-gray-600 hover:bg-white/90'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Titik Lokasi Satwa & Fasilitas ({pois.length})
        </button>

        <button
          onClick={() => setActiveTab('tram')}
          className={`px-5 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'tram'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/60 text-gray-600 hover:bg-white/90'
          }`}
        >
          <Train className="w-4 h-4" />
          Jalur Kereta Keliling ({tramPoints.length} Waypoints)
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`px-5 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'status'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/60 text-gray-600 hover:bg-white/90'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Status Zona, Tutup & Kapasitas
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 rounded-2xl font-medium text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/60 text-gray-600 hover:bg-white/90'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Statistik & Panduan Koordinat
        </button>
      </div>

      {/* ─── TAB 1: POI MANAGER (SPLIT SCREEN MAP + LIST) ─── */}
      {activeTab === 'pois' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEAFLET MAP PREVIEW (7 COLUMNS) */}
          <div className="lg:col-span-7 bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-semibold text-gray-900 text-base">Live Preview Peta Leaflet</h3>
              </div>
              <div className="flex items-center gap-2">
                {pickedCoords && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-mono">
                    Lat: {pickedCoords.lat}, Lng: {pickedCoords.lng}
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (leafletMapInstanceRef.current) {
                      leafletMapInstanceRef.current.flyTo([-6.3125, 106.8232], 16);
                    }
                  }}
                  className="text-xs rounded-xl h-8"
                >
                  <Crosshair className="w-3.5 h-3.5 mr-1" />
                  Pusat Ragunan
                </Button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
              <div
                ref={mapContainerRef}
                id="manager-leaflet-map"
                className="w-full h-[520px] bg-slate-100 z-10"
              />
              <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-700 shadow-sm flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Klik di mana saja pada peta untuk mengambil koordinat Lat/Lng.</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <div>Total Titik Ditampilkan: <b className="text-gray-800">{pois.length}</b> titik</div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Aktif</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Tutup Sementara</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Jalur Kereta</span>
              </div>
            </div>
          </div>

          {/* LIST & FILTER POI (5 COLUMNS) */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-xl border border-white/80 p-5 rounded-[2rem] shadow-sm space-y-4">
            {/* Search & Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <Input
                  placeholder="Cari satwa, fasilitas, atau ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl bg-white/80 border-gray-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/80 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-white/80 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Hanya Aktif</option>
                  <option value="closed">Tutup Saja</option>
                </select>
              </div>
            </div>

            {/* POI Scrollable List */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredPois.length === 0 ? (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <MapPin className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-sm">Tidak ada titik lokasi yang cocok.</p>
                </div>
              ) : (
                filteredPois.map(poi => (
                  <div
                    key={poi.id}
                    onClick={() => flyToPoi(poi)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      poi.is_temporarily_closed
                        ? 'bg-red-50/70 border-red-200/80 hover:bg-red-50'
                        : 'bg-white/80 border-gray-200/70 hover:border-emerald-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm border border-white"
                        style={{ backgroundColor: poi.color || '#22c55e' }}
                      >
                        {poi.emoji || '📍'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm truncate">{poi.name}</span>
                          {poi.is_temporarily_closed && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Tutup</Badge>
                          )}
                          {poi.capacity_status === 'padat' && (
                            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">Padat</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-2 mt-0.5">
                          <span className="capitalize font-medium text-emerald-700">{poi.category}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}</span>
                        </div>
                        {poi.feeding_time && (
                          <div className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            <span>Makan: {poi.feeding_time}</span>
                          </div>
                        )}
                        {poi.operating_hours_open && (
                          <div className="text-[11px] text-blue-700 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Buka: {poi.operating_hours_open} - {poi.operating_hours_close || ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEditPoi(poi)}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600"
                        title="Edit POI"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeletePoi(poi)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600"
                        title="Hapus POI"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TRAM ROUTE EDITOR ─── */}
      {activeTab === 'tram' && (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <Train className="w-5 h-5 text-amber-600" />
                  Editor Titik Jalur Kereta Wisata (Tram Route)
                </h3>
                <p className="text-sm text-gray-500">
                  Kereta wisata keliling mengikuti titik koordinat berikut secara berurutan. Titik dengan status Halte akan memunculkan penanda halte di peta publik.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setEditingTramPoint(null);
                    setTramFormData({
                      lat: pickedCoords ? pickedCoords.lat : -6.3125,
                      lng: pickedCoords ? pickedCoords.lng : 106.8232,
                      halt_name: '',
                      is_halt: false
                    });
                    setIsTramDialogOpen(true);
                  }}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah Titik Koordinat
                </Button>
              </div>
            </div>

            {/* Table of Tram Waypoints */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold w-16">Urutan</th>
                    <th className="py-3.5 px-4 font-semibold">Koordinat (Lat, Lng)</th>
                    <th className="py-3.5 px-4 font-semibold">Tipe Titik</th>
                    <th className="py-3.5 px-4 font-semibold">Nama Halte</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white/70">
                  {tramPoints.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        Belum ada titik jalur kereta yang tersimpan.
                      </td>
                    </tr>
                  ) : (
                    tramPoints.map((point, idx) => (
                      <tr key={point.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-600">
                          #{point.sequence_order}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-800">
                          {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                        </td>
                        <td className="py-3 px-4">
                          {point.is_halt ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                              🚂 Halte Resmi
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Waypoint Jalur
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {point.halt_name || '-'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={idx === 0}
                            onClick={() => handleMoveTramPoint(idx, 'up')}
                            className="w-7 h-7 rounded-lg text-gray-500"
                            title="Pindah ke Atas"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={idx === tramPoints.length - 1}
                            onClick={() => handleMoveTramPoint(idx, 'down')}
                            className="w-7 h-7 rounded-lg text-gray-500"
                            title="Pindah ke Bawah"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingTramPoint(point);
                              setTramFormData({
                                lat: point.lat,
                                lng: point.lng,
                                halt_name: point.halt_name || '',
                                is_halt: point.is_halt
                              });
                              setIsTramDialogOpen(true);
                            }}
                            className="w-7 h-7 rounded-lg text-gray-600"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteTramPoint(point)}
                            className="w-7 h-7 rounded-lg text-red-600 hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: QUICK OPERATIONAL STATUS (CLOSURE, CAPACITY, ANNOUNCEMENT) ─── */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-6 rounded-[2rem] shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Pusat Kontrol Lapangan & Status Operasional Zona
              </h3>
              <p className="text-sm text-gray-500">
                Ubah status tutup sementara fasilitas/kandang, set kapasitas kepadatan pengunjung, dan berikan pengumuman pop-up real-time di peta publik.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pois.map(poi => (
                <div
                  key={poi.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                    poi.is_temporarily_closed
                      ? 'bg-red-50/80 border-red-200'
                      : 'bg-white/80 border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                        style={{ backgroundColor: poi.color || '#22c55e', color: 'white' }}
                      >
                        {poi.emoji || '📍'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{poi.name}</h4>
                        <span className="text-xs text-gray-500 capitalize">{poi.category}</span>
                      </div>
                    </div>

                    {/* Toggle Closure Switch */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-600">
                        {poi.is_temporarily_closed ? 'Tutup' : 'Buka'}
                      </span>
                      <Switch
                        checked={!poi.is_temporarily_closed}
                        onCheckedChange={() => handleToggleClosureQuick(poi)}
                      />
                    </div>
                  </div>

                  {poi.is_temporarily_closed && (
                    <div className="p-2.5 bg-red-100/70 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
                      <div className="font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Alasan: {poi.closure_reason || 'Sedang renovasi'}
                      </div>
                      {poi.closure_until && <div>Estimasi buka: {poi.closure_until}</div>}
                    </div>
                  )}

                  {/* Capacity Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Kapasitas Pengunjung Real-time</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['normal', 'padat', 'sepi'] as const).map(cap => (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => handleCapacityChange(poi, cap)}
                          className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            poi.capacity_status === cap
                              ? cap === 'padat'
                                ? 'bg-amber-500 text-white border-amber-600'
                                : cap === 'sepi'
                                ? 'bg-blue-600 text-white border-blue-700'
                                : 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {cap === 'padat' ? '🔥 Padat' : cap === 'sepi' ? '🌿 Sepi' : '✅ Normal'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Local Announcement */}
                  <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 truncate max-w-[170px]">
                      {poi.local_announcement ? `📢 ${poi.local_announcement}` : 'Belum ada pengumuman'}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAnnouncementModalPoi(poi);
                        setAnnouncementText(poi.local_announcement || '');
                        setAnnouncementExpiry(poi.announcement_expires_at ? poi.announcement_expires_at.slice(0, 16) : '');
                      }}
                      className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 px-2 rounded-lg"
                    >
                      Set Info
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: ANALYTICS & STATS ─── */}
      {activeTab === 'analytics' && (
        <GpsAnalyticsTab pois={pois} />
      )}

      {/* ─── MODAL: CREATE / EDIT POI ─── */}
      <GpsPoiModal
        isOpen={isPoiDialogOpen}
        onOpenChange={setIsPoiDialogOpen}
        isEditing={isEditingPoi}
        formData={poiFormData}
        setFormData={setPoiFormData}
        onSave={handleSavePoi}
        pickedCoords={pickedCoords}
      />

      {/* ─── MODAL: TRAM WAYPOINT ─── */}
      <TramPointModal
        isOpen={isTramDialogOpen}
        onOpenChange={setIsTramDialogOpen}
        editingPoint={editingTramPoint}
        formData={tramFormData}
        setFormData={setTramFormData}
        onSave={handleAddTramPoint}
      />

      {/* ─── MODAL: SET CLOSURE REASON ─── */}
      <GpsClosureModal
        poi={closureModalPoi}
        onClose={() => setClosureModalPoi(null)}
        reason={closureReason}
        setReason={setClosureReason}
        until={closureUntil}
        setUntil={setClosureUntil}
        onSave={handleSaveClosureModal}
      />

      {/* ─── MODAL: LOCAL ANNOUNCEMENT ─── */}
      <GpsAnnouncementModal
        poi={announcementModalPoi}
        onClose={() => setAnnouncementModalPoi(null)}
        text={announcementText}
        setText={setAnnouncementText}
        expiry={announcementExpiry}
        setExpiry={setAnnouncementExpiry}
        onSave={handleSaveAnnouncementModal}
      />
    </div>
  );
}
