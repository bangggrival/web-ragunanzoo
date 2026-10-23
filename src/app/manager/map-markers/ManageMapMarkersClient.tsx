"use client";

import { useState, useRef, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { MapPin, Save, Plus, Trash2, GripVertical, ImageOff, MousePointer2, X, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ZoneMarker } from '@/hooks/useZoneMarkers';
import { cn } from '@/lib/utils';
import { SiteSettings } from '@/hooks/useSiteSettings';
import { createMarkerAction, deleteMarkerAction, updateMarkerAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

export default function ManageMapMarkersClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [markers, setMarkers] = useState<ZoneMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<ZoneMarker | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isClickToPlaceMode, setIsClickToPlaceMode] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [newMarker, setNewMarker] = useState({
    id: '',
    name: '',
    name_en: '',
    color: '#6366f1', // default green
    position_x: 50,
    position_y: 50,
    description: '',
    description_en: '',
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: markersData } = await supabase.from('zone_markers').select('*').order('zone_name', { ascending: true });
        if (markersData) setMarkers(markersData as any);
        const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
        if (settingsData) setSettings(settingsData as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'zone_markers') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);

  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapImageUrl = settings?.map_image_url || null;

  const handleMouseDown = (marker: ZoneMarker) => {
    if (isClickToPlaceMode) return;
    setSelectedMarker(marker);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mapContainerRef.current) return;
    
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    if (isClickToPlaceMode) {
      setPreviewPosition({ x: clampedX, y: clampedY });
    }
    
    if (isDragging && selectedMarker) {
      setSelectedMarker({
        ...selectedMarker,
        position_x: clampedX,
        position_y: clampedY,
      });
    }
  };

  const handleMouseUp = async () => {
    if (isDragging && selectedMarker) {
      try {
        const result = await updateMarkerAction(selectedMarker.id, {
          position_x: selectedMarker.position_x,
          position_y: selectedMarker.position_y,
        });
        
        if (!result.success) throw new Error(result.error);
        
        setMarkers(prev => prev.map(m => m.id === selectedMarker.id ? selectedMarker : m));
        toast.success('Posisi marker berhasil diperbarui');
      } catch (err: any) {
        toast.error('Gagal memperbarui posisi marker: ' + err.message);
      }
    }
    setIsDragging(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isClickToPlaceMode || !mapContainerRef.current) return;
    
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setNewMarker(prev => ({
      ...prev,
      position_x: clampedX,
      position_y: clampedY,
    }));
    setIsClickToPlaceMode(false);
    setPreviewPosition(null);
    setIsCreateDialogOpen(true);
    
    toast.success(`Posisi ditandai: X: ${clampedX.toFixed(1)}%, Y: ${clampedY.toFixed(1)}%`);
  };

  const handleSaveMarker = async (marker: ZoneMarker) => {
    setSaving(true);
    try {
      const result = await updateMarkerAction(marker.id, {
        name: marker.name,
        name_en: marker.name_en,
        color: marker.color,
        description: marker.description,
        description_en: marker.description_en,
        is_active: marker.is_active,
        position_x: marker.position_x,
        position_y: marker.position_y
      });
      
      if (!result.success) throw new Error(result.error);
      
      setMarkers(prev => prev.map(m => m.id === marker.id ? marker : m));
      toast.success('Marker berhasil diperbarui');
    } catch (err: any) {
      toast.error('Gagal memperbarui marker: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMarker = async () => {
    if (!newMarker.id || !newMarker.name) {
      toast.error('ID dan Nama zona wajib diisi');
      return;
    }

    setSaving(true);
    try {
      const result = await createMarkerAction(newMarker);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Marker baru berhasil ditambahkan');
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error('Gagal menambahkan marker: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMarker = async (id: string) => {
    if ((await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus marker ini?'))) {
      try {
        const result = await deleteMarkerAction(id);
        if (!result.success) throw new Error(result.error);
        
        setMarkers(prev => prev.filter(m => m.id !== id));
        setSelectedMarker(null);
        toast.success('Marker berhasil dihapus');
      } catch (err: any) {
        toast.error('Gagal menghapus marker: ' + err.message);
      }
    }
  };

  const getMarkerPosition = (marker: ZoneMarker) => {
    if (selectedMarker?.id === marker.id && isDragging) {
      return { x: selectedMarker.position_x, y: selectedMarker.position_y };
    }
    return { x: marker.position_x, y: marker.position_y };
  };

  const startClickToPlaceMode = () => {
    setIsClickToPlaceMode(true);
    setSelectedMarker(null);
    toast.info('Klik pada peta untuk menandai posisi marker baru');
  };

  const cancelClickToPlaceMode = () => {
    setIsClickToPlaceMode(false);
    setPreviewPosition(null);
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm p-8">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <LayoutTemplate className="w-5 h-5 text-green-500" />
            </div>
            Kelola Marker Peta
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Drag marker pada peta untuk mengatur posisi, atau klik untuk menambah baru</p>
        </div>
        
        <div className="flex gap-3">
          {isClickToPlaceMode ? (
            <button onClick={cancelClickToPlaceMode} className="flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-300 font-bold shadow-sm">
              <X className="w-4 h-4" />
              Batal Mode Tandai
            </button>
          ) : (
            <button onClick={startClickToPlaceMode} className="flex items-center justify-center gap-2 bg-white text-green-600 border border-green-200 px-5 py-2.5 rounded-xl hover:bg-green-50 transition-all duration-300 font-bold shadow-sm">
              <MousePointer2 className="w-4 h-4" />
              Klik untuk Tandai
            </button>
          )}
          <button onClick={() => { setNewMarker({ id: '', name: '', name_en: '', color: '#6366f1', position_x: 50, position_y: 50, description: '', description_en: '', is_active: true }); setIsCreateDialogOpen(true); }} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            Tambah Zona Manual
          </button>
        </div>
      </div>

      {isClickToPlaceMode && (
        <div className="p-5 rounded-2xl bg-green-50/50 border border-green-200 flex items-center gap-4 animate-pulse">
          <div className="p-3 rounded-xl bg-green-100 border border-green-200 shadow-sm">
            <MousePointer2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-900 text-lg">Mode Klik untuk Tandai Aktif</p>
            <p className="text-sm font-medium text-green-700/80">Arahkan cursor ke peta lalu klik lokasi yang diinginkan untuk menambahkan marker baru.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" />
              Peta Interaktif
            </h3>
            
            {mapImageUrl ? (
              <div 
                ref={mapContainerRef} 
                className={cn(
                  "relative w-full rounded-[1.5rem] overflow-hidden select-none border border-slate-200 shadow-inner bg-slate-100",
                  isClickToPlaceMode ? "cursor-crosshair ring-4 ring-green-500/30" : "cursor-default"
                )}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => { handleMouseUp(); if (isClickToPlaceMode) setPreviewPosition(null); }}
                onClick={handleMapClick}
              >
                <img src={mapImageUrl} alt="Peta" className="w-full h-auto pointer-events-none" draggable={false} />
                
                {isClickToPlaceMode && previewPosition && (
                  <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none" style={{ left: `${previewPosition.x}%`, top: `${previewPosition.y}%` }}>
                    <div className="flex flex-col items-center">
                      <div className="p-2 rounded-full shadow-lg border-2 border-white ring-4 ring-green-500/50 bg-green-500">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                
                {markers.filter(m => m.is_active).map((marker) => {
                  const pos = getMarkerPosition(marker);
                  return (
                    <div
                      key={marker.id}
                      className={cn(
                        "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200",
                        isClickToPlaceMode ? "pointer-events-none opacity-40 grayscale" : "cursor-grab active:cursor-grabbing hover:scale-110",
                        selectedMarker?.id === marker.id ? 'z-20 scale-110' : 'z-10'
                      )}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      onMouseDown={() => handleMouseDown(marker)}
                    >
                      <div className="flex flex-col items-center">
                        <div className={cn("w-8 h-8 rounded-full shadow-lg border-2 border-white flex items-center justify-center", selectedMarker?.id === marker.id && "ring-4 ring-offset-1")} style={{ backgroundColor: marker.color, '--tw-ring-color': marker.color } as any}>
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="mt-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-lg border border-white/20 backdrop-blur-sm" style={{ backgroundColor: marker.color }}>
                          {marker.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <ImageOff className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-bold text-slate-600">Peta belum diupload</p>
                <p className="text-xs font-medium text-slate-500">Upload gambar peta terlebih dahulu di Pengaturan Website.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[2rem] shadow-sm max-h-[500px] flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center justify-between">
              Daftar Zona
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{markers.length} Marker</Badge>
            </h3>
            
            <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1">
              {markers.map((marker) => (
                <div key={marker.id} onClick={() => setSelectedMarker(marker)} className={cn("p-4 rounded-xl border-2 transition-all cursor-pointer", selectedMarker?.id === marker.id ? 'border-green-500 bg-green-50/50 shadow-md' : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner border border-white/50 shrink-0" style={{ backgroundColor: marker.color }}>
                      <MapPin className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{marker.name}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">X: {marker.position_x.toFixed(1)}% | Y: {marker.position_y.toFixed(1)}%</p>
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <Switch checked={marker.is_active} onCheckedChange={async (checked) => {
                        await updateMarkerAction(marker.id, { is_active: checked });
                        setMarkers(prev => prev.map(m => m.id === marker.id ? { ...m, is_active: checked } : m));
                        toast.success(checked ? 'Marker diaktifkan' : 'Marker dinonaktifkan');
                      }} className="data-[state=checked]:bg-green-500" />
                    </div>
                  </div>
                </div>
              ))}
              {markers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500 font-medium text-sm">Belum ada marker zona</p>
                </div>
              )}
            </div>
          </div>

          {selectedMarker && !isDragging && (
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[2rem] shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-800">Edit Zona</h3>
                <button onClick={() => handleDeleteMarker(selectedMarker.id)} className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama (ID)</Label>
                    <Input value={selectedMarker.name} onChange={e => setSelectedMarker({ ...selectedMarker, name: e.target.value })} className="h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama (EN)</Label>
                    <Input value={selectedMarker.name_en || ''} onChange={e => setSelectedMarker({ ...selectedMarker, name_en: e.target.value })} className="h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Warna Marker</Label>
                    <div className="flex gap-2">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                        <input type="color" value={selectedMarker.color} onChange={e => setSelectedMarker({ ...selectedMarker, color: e.target.value })} className="absolute inset-0 w-full h-full scale-[2] cursor-pointer" />
                      </div>
                      <Input value={selectedMarker.color} onChange={e => setSelectedMarker({ ...selectedMarker, color: e.target.value })} className="h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-mono text-sm uppercase" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Posisi Koordinat</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">X</span>
                        <Input type="number" value={selectedMarker.position_x.toFixed(1)} onChange={e => setSelectedMarker({ ...selectedMarker, position_x: parseFloat(e.target.value) || 0 })} className="h-10 pl-7 bg-slate-50 border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Y</span>
                        <Input type="number" value={selectedMarker.position_y.toFixed(1)} onChange={e => setSelectedMarker({ ...selectedMarker, position_y: parseFloat(e.target.value) || 0 })} className="h-10 pl-7 bg-slate-50 border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Deskripsi (ID)</Label>
                  <Textarea value={selectedMarker.description || ''} onChange={e => setSelectedMarker({ ...selectedMarker, description: e.target.value })} rows={2} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 text-sm resize-none" />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Deskripsi (EN)</Label>
                  <Textarea value={selectedMarker.description_en || ''} onChange={e => setSelectedMarker({ ...selectedMarker, description_en: e.target.value })} rows={2} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 text-sm resize-none" />
                </div>

                <Button className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20" onClick={() => handleSaveMarker(selectedMarker)} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setIsCreateDialogOpen(false)}>
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-md flex flex-col overflow-hidden border border-white/60">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                  <Plus className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Tambah Zona Baru</h2>
              </div>
              <button onClick={() => setIsCreateDialogOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
                <Label className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2 block">Koordinat Marker</Label>
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-black text-green-300">X:</span>
                    <Input type="number" value={newMarker.position_x.toFixed(1)} onChange={e => setNewMarker({ ...newMarker, position_x: parseFloat(e.target.value) || 0 })} className="h-9 bg-white border-green-200 focus-visible:ring-green-500 font-bold text-green-900" />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-black text-green-300">Y:</span>
                    <Input type="number" value={newMarker.position_y.toFixed(1)} onChange={e => setNewMarker({ ...newMarker, position_y: parseFloat(e.target.value) || 0 })} className="h-9 bg-white border-green-200 focus-visible:ring-green-500 font-bold text-green-900" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">ID Zona (Slug)</Label>
                  <Input value={newMarker.id} onChange={e => setNewMarker({ ...newMarker, id: e.target.value.toLowerCase().replace(/\s/g, '-') })} placeholder="contoh: edukasi" className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Warna</Label>
                  <div className="flex gap-2">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                      <input type="color" value={newMarker.color} onChange={e => setNewMarker({ ...newMarker, color: e.target.value })} className="absolute inset-0 w-full h-full scale-[2] cursor-pointer" />
                    </div>
                    <Input value={newMarker.color} onChange={e => setNewMarker({ ...newMarker, color: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-mono text-sm uppercase" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama (ID)</Label>
                  <Input value={newMarker.name} onChange={e => setNewMarker({ ...newMarker, name: e.target.value })} placeholder="Nama zona" className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama (EN)</Label>
                  <Input value={newMarker.name_en} onChange={e => setNewMarker({ ...newMarker, name_en: e.target.value })} placeholder="Zone name" className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Deskripsi (ID)</Label>
                <Textarea value={newMarker.description} onChange={e => setNewMarker({ ...newMarker, description: e.target.value })} placeholder="Deskripsi zona" rows={2} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 text-sm resize-none" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Deskripsi (EN)</Label>
                <Textarea value={newMarker.description_en} onChange={e => setNewMarker({ ...newMarker, description_en: e.target.value })} placeholder="Zone description" rows={2} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 text-sm resize-none" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1 rounded-xl h-11 border-slate-200 font-bold bg-white hover:bg-slate-50">Batal</Button>
                <Button onClick={handleCreateMarker} disabled={saving} className="flex-1 rounded-xl h-11 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20">
                  {saving ? 'Menyimpan...' : 'Tambah Zona'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    {ConfirmComponent}
    </div>
  );
}
