import React from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HeatmapResponse } from '../actions';

interface GpsHeatmapPanelProps {
  heatmapData: HeatmapResponse | null;
  isLoading: boolean;
  timeRange: '1h' | '24h' | '7d' | 'all';
  setTimeRange: (val: '1h' | '24h' | '7d' | 'all') => void;
  source: 'all' | 'checkin' | 'facility_report' | 'route_search' | 'poi_crowd';
  setSource: (val: 'all' | 'checkin' | 'facility_report' | 'route_search' | 'poi_crowd') => void;
  radius: number;
  setRadius: (val: number) => void;
  blur: number;
  setBlur: (val: number) => void;
  onRefresh: () => void;
  onSimulate: () => void;
  onClear: () => void;
  onFlyToZone: (lat: number, lng: number, name: string) => void;
  showHeatmap: boolean;
  setShowHeatmap: (val: boolean) => void;
}

export function GpsHeatmapPanel({
  heatmapData,
  isLoading,
  timeRange,
  setTimeRange,
  source,
  setSource,
  radius,
  setRadius,
  blur,
  setBlur,
  onRefresh,
  onSimulate,
  onClear,
  onFlyToZone,
  showHeatmap,
  setShowHeatmap
}: GpsHeatmapPanelProps) {
  const stats = heatmapData?.stats;
  const congestedZones = heatmapData?.congestedZones || [];

  return (
    <div className="space-y-5">
      {/* 1. Header Card with Layer Toggle */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/90 p-5 rounded-[2rem] shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-sm">
              <AppIcon icon="Flame" className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                Visitor Traffic Visualizer
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px]">
                  Heatmap Engine
                </Badge>
              </h3>
              <p className="text-xs text-gray-500">
                Deteksi penumpukan massa pengunjung berdasarkan akumulasi riil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
              id="heatmap-layer-toggle"
            />
            <Label htmlFor="heatmap-layer-toggle" className="text-xs font-semibold cursor-pointer">
              {showHeatmap ? 'Lapisan Aktif' : 'Nonaktif'}
            </Label>
          </div>
        </div>

        {/* Traffic Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100 p-3 rounded-2xl">
            <div className="text-[10px] uppercase tracking-wider text-orange-700 font-bold">Total Titik Pantau</div>
            <div className="text-xl font-extrabold text-orange-950 mt-0.5">
              {stats?.totalEvents ?? 0}
            </div>
            <div className="text-[10px] text-orange-600/80">Log terakumulasi</div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-2xl">
            <div className="text-[10px] uppercase tracking-wider text-blue-700 font-bold">Check-in Pengunjung</div>
            <div className="text-xl font-extrabold text-blue-950 mt-0.5">
              {stats?.checkinCount ?? 0}
            </div>
            <div className="text-[10px] text-blue-600/80">Pindai / Masuk zona</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-2xl">
            <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">Laporan Masalah</div>
            <div className="text-xl font-extrabold text-amber-950 mt-0.5">
              {stats?.facilityReportCount ?? 0}
            </div>
            <div className="text-[10px] text-amber-600/80">Fasilitas publik</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl">
            <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">Pencarian Rute</div>
            <div className="text-xl font-extrabold text-emerald-950 mt-0.5">
              {stats?.routeSearchCount ?? 0}
            </div>
            <div className="text-[10px] text-emerald-600/80">Navigasi GPS aktif</div>
          </div>
        </div>
      </div>

      {/* 2. Early Warning Congestion Alert Banner */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/90 p-5 rounded-[2rem] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon icon="AlertTriangle" className={`w-4 h-4 ${congestedZones.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
            <h4 className="font-bold text-gray-900 text-sm">
              Sistem Deteksi Penumpukan Massa (Crowd Alert)
            </h4>
          </div>
          <Badge
            variant="outline"
            className={
              congestedZones.length > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }
          >
            {congestedZones.length > 0 ? `${congestedZones.length} Zona Padat` : 'Semua Zona Kondusif'}
          </Badge>
        </div>

        {congestedZones.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
              ⚠️ Terdeteksi konsentrasi massa di zona berikut. Klik tombol <b>"Fokus Peta"</b> untuk mengarahkan kamera ke lokasi.
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {congestedZones.map((zone, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-2 shadow-xs hover:border-orange-300 transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping flex-shrink-0" />
                      <span className="font-bold text-gray-900 text-xs truncate">{zone.name}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>Akumulasi: <b>{zone.count} aktivitas</b></span>
                      <span>•</span>
                      <span>Intensitas: <b className="text-rose-600 font-mono">{(zone.avgIntensity * 100).toFixed(0)}%</b></span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onFlyToZone(zone.lat, zone.lng, zone.name)}
                    className="h-7 text-xs rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50 flex-shrink-0"
                  >
                    <AppIcon icon="Navigation" className="w-3 h-3 mr-1" />
                    Fokus Peta
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
            <AppIcon icon="CheckCircle2" className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Arus Pengunjung Terkendali</p>
              <p className="text-emerald-700/80 mt-0.5">
                Tidak ada titik penumpukan massa di atas ambang batas kritis. Kapasitas satwa dan fasilitas dalam kondisi aman.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Filter & Controls Panel */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/90 p-5 rounded-[2rem] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <AppIcon icon="SlidersHorizontal" className="w-4 h-4 text-emerald-600" />
            Parameter Heatmap & Filter Data
          </h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg"
          >
            <AppIcon icon="RefreshCw" className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
        </div>

        {/* Filter Rentang Waktu */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <AppIcon icon="Clock" className="w-3.5 h-3.5 text-gray-500" />
            Rentang Waktu Akumulasi
          </Label>
          <div className="grid grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setTimeRange('1h')}
              className={`py-1.5 rounded-lg transition-all ${
                timeRange === '1h' ? 'bg-white text-orange-700 font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1 Jam (Live)
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('24h')}
              className={`py-1.5 rounded-lg transition-all ${
                timeRange === '24h' ? 'bg-white text-orange-700 font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              24 Jam
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              className={`py-1.5 rounded-lg transition-all ${
                timeRange === '7d' ? 'bg-white text-orange-700 font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`py-1.5 rounded-lg transition-all ${
                timeRange === 'all' ? 'bg-white text-orange-700 font-bold shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Filter Sumber Data */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <AppIcon icon="Filter" className="w-3.5 h-3.5 text-gray-500" />
            Sumber Data Panas
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
            {[
              { id: 'all', label: '🌐 Semua Sumber' },
              { id: 'checkin', label: '🎟️ Check-in' },
              { id: 'facility_report', label: '🚨 Laporan Kerusakan' },
              { id: 'route_search', label: '🧭 Pencarian Rute' },
              { id: 'poi_crowd', label: '⚠️ Status POI Padat' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSource(item.id as any)}
                className={`px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all ${
                  source === item.id
                    ? 'bg-orange-50 border-orange-300 text-orange-800 font-bold shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slider Radius Panas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Radius Pijar: <b>{radius}px</b></span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Blur Kepadatan: <b>{blur}px</b></span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              step="1"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Action & Security Controls (Simulate / Drill / Clear) */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/90 p-5 rounded-[2rem] shadow-sm space-y-3">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <AppIcon icon="ShieldCheck" className="w-4 h-4 text-blue-600" />
          Aksi Operasional & Simulasi Darurat
        </h4>
        <p className="text-xs text-gray-500">
          Gunakan simulasi untuk uji kesiapsiagaan jalur evakuasi atau crowd management saat libur nasional.
        </p>

        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          <Button
            size="sm"
            onClick={onSimulate}
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm text-xs"
          >
            <AppIcon icon="Zap" className="w-3.5 h-3.5 mr-1.5" />
            Simulasi Traffic Pengunjung (Drill)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onClear}
            disabled={isLoading}
            className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs"
          >
            <AppIcon icon="Trash2" className="w-3.5 h-3.5 mr-1.5" />
            Reset Data Traffic
          </Button>
        </div>
      </div>
    </div>
  );
}
