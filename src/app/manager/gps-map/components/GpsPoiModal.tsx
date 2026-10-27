import React from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GpsPoi, PRESET_COLORS } from '../types';

interface GpsPoiModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: Partial<GpsPoi>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<GpsPoi>>>;
  onSave: (e: React.FormEvent) => void;
  pickedCoords: { lat: number; lng: number } | null;
}

export function GpsPoiModal({
  isOpen,
  onOpenChange,
  isEditing,
  formData,
  setFormData,
  onSave,
  pickedCoords
}: GpsPoiModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <AppIcon icon="MapPin" className="w-5 h-5 text-emerald-600" />
            {isEditing ? 'Edit Titik POI' : 'Tambah Titik POI Baru'}
          </DialogTitle>
          <DialogDescription>
            Isi data lengkap titik lokasi satwa atau fasilitas umum berkoordinat riil GPS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="poi-id" className="text-xs font-semibold">ID Unik (Slug) *</Label>
              <Input
                id="poi-id"
                disabled={isEditing}
                value={formData.id || ''}
                onChange={e => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                placeholder="e.g. gajah_sumatera, toilet_pintu_utara"
                required
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="poi-cat" className="text-xs font-semibold">Kategori *</Label>
              <select
                id="poi-cat"
                value={formData.category || 'animal'}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="animal">Satwa / Fauna</option>
                <option value="toilet">Toilet & Sanitasi</option>
                <option value="musholla">Musholla & Ibadah</option>
                <option value="tram">Halte Kereta Wisata</option>
                <option value="ticket">Pintu Masuk & Loket</option>
                <option value="kuliner">Pujasera & Kafe</option>
                <option value="medical">Pos Medis & P3K</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="poi-name" className="text-xs font-semibold">Nama Lokasi (Indonesia) *</Label>
              <Input
                id="poi-name"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Gajah Sumatera, Toilet 1 Pintu Barat"
                required
                className="rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="poi-name-en" className="text-xs font-semibold">Nama Lokasi (English)</Label>
              <Input
                id="poi-name-en"
                value={formData.name_en || ''}
                onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="e.g. Sumatran Elephant"
                className="rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Coordinates Section */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <AppIcon icon="Crosshair" className="w-4 h-4 text-emerald-700" />
                Koordinat Riil GPS (WGS84 Lat/Lng)
              </span>
              {pickedCoords && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      lat: pickedCoords.lat,
                      lng: pickedCoords.lng
                    });
                    toast.success('Koordinat peta disalin ke form!');
                  }}
                  className="text-xs text-emerald-700 h-7"
                >
                  Gunakan Titik Klik Terakhir
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-emerald-800">Latitude *</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.lat ?? ''}
                  onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  placeholder="-6.3125"
                  required
                  className="rounded-xl font-mono text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-emerald-800">Longitude *</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.lng ?? ''}
                  onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                  placeholder="106.8232"
                  required
                  className="rounded-xl font-mono text-xs bg-white"
                />
              </div>
            </div>

            {formData.lat != null && formData.lng != null && !isNaN(formData.lat) && !isNaN(formData.lng) && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium pt-1">
                {formData.lat >= -6.3250 && formData.lat <= -6.3000 && formData.lng >= 106.8100 && formData.lng <= 106.8350 ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <AppIcon icon="ShieldCheck" className="w-3.5 h-3.5 text-emerald-600" />
                    Koordinat valid di dalam kawasan Ragunan Zoo
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1 font-semibold">
                    <AppIcon icon="AlertTriangle" className="w-3.5 h-3.5 text-red-600" />
                    Peringatan: Koordinat berada di luar kawasan resmi Ragunan!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Emoji & Pin Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="poi-emoji" className="text-xs font-semibold">Emoji Ikon Marker</Label>
              <Input
                id="poi-emoji"
                value={formData.emoji || ''}
                onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                placeholder="🐘, 🐅, 🚻, 🚂, ☕"
                className="rounded-xl text-lg text-center"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Warna Penanda</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color || '#22c55e'}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-1"
                />
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className="w-6 h-6 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Extra details for Animals */}
          {formData.category === 'animal' && (
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 space-y-3">
              <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                <AppIcon icon="Utensils" className="w-4 h-4 text-amber-700" />
                Detail Khusus Satwa & Jadwal Makan (Feeding Show)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-amber-800">Nama Ilmiah (Latin)</Label>
                  <Input
                    value={formData.latin_name || ''}
                    onChange={e => setFormData({ ...formData, latin_name: e.target.value })}
                    placeholder="e.g. Elephas maximus sumatranus"
                    className="rounded-xl text-xs bg-white italic"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-amber-800">Status Konservasi IUCN</Label>
                  <Input
                    value={formData.conservation_status || ''}
                    onChange={e => setFormData({ ...formData, conservation_status: e.target.value })}
                    placeholder="e.g. Kritis Terancam Punah (CR)"
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-amber-800">Teks Jam Makan</Label>
                  <Input
                    value={formData.feeding_time || ''}
                    onChange={e => setFormData({ ...formData, feeding_time: e.target.value })}
                    placeholder="e.g. 14.00 WIB"
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-amber-800">Jam (0-23)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={formData.feeding_time_hour ?? ''}
                    onChange={e => setFormData({ ...formData, feeding_time_hour: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="14"
                    className="rounded-xl text-xs bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-amber-800">Menit (0-59)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={formData.feeding_time_minute ?? ''}
                    onChange={e => setFormData({ ...formData, feeding_time_minute: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="00"
                    className="rounded-xl text-xs bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-amber-800">Catatan Atraksi Feeding</Label>
                <Input
                  value={formData.feeding_note || ''}
                  onChange={e => setFormData({ ...formData, feeding_note: e.target.value })}
                  placeholder="e.g. Atraksi Mandi & Pemberian Makan Gajah Bersama Pawang"
                  className="rounded-xl text-xs bg-white"
                />
              </div>
            </div>
          )}

          {/* Operating Hours for Facilities */}
          {formData.category !== 'animal' && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50/60 rounded-2xl border border-blue-200/60">
              <div className="space-y-1">
                <Label className="text-xs text-blue-900 font-semibold">Jam Buka Fasilitas</Label>
                <Input
                  type="time"
                  value={formData.operating_hours_open || ''}
                  onChange={e => setFormData({ ...formData, operating_hours_open: e.target.value })}
                  className="rounded-xl text-xs bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-blue-900 font-semibold">Jam Tutup Fasilitas</Label>
                <Input
                  type="time"
                  value={formData.operating_hours_close || ''}
                  onChange={e => setFormData({ ...formData, operating_hours_close: e.target.value })}
                  className="rounded-xl text-xs bg-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="poi-desc" className="text-xs font-semibold">Deskripsi Lokasi</Label>
            <Textarea
              id="poi-desc"
              rows={2}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi singkat seputar kandang satwa atau petunjuk fasilitas..."
              className="rounded-xl text-sm"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Batal
            </Button>
            <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
              <AppIcon icon="Save" className="w-4 h-4 mr-1.5" />
              {isEditing ? 'Simpan Perubahan' : 'Tambahkan Titik'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
