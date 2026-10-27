"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVenueHeroSettings, VenueHeroSettings } from '@/hooks/useVenueHeroSettings';
import { toast } from 'sonner';
import { AppIcon } from '@/components/ui/AppIcon';

interface VenueHeroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VenueHeroSettingsModal({ isOpen, onClose }: VenueHeroSettingsModalProps) {
  const { heroSettings, updateHeroSettings } = useVenueHeroSettings();
  const [formData, setFormData] = useState<VenueHeroSettings>(heroSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'header' | 'events' | 'categories'>('header');

  useEffect(() => {
    if (isOpen) {
      setFormData(heroSettings);
    }
  }, [isOpen, heroSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateHeroSettings(formData);
      if (res.success) {
        toast.success('Pengaturan halaman sewa tempat berhasil diperbarui!');
        onClose();
      } else {
        toast.error('Gagal memperbarui: ' + res.error);
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <AppIcon icon="Sparkles" className="w-5 h-5 text-emerald-600" />
            Pengaturan Konten Halaman Sewa Tempat
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sesuaikan judul header, keunggulan, kategori filter, dan section Ragam Kegiatan publik.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="flex border-b border-border gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'header'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            1. Header & Highlights
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'categories'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            2. Label Filter Kategori
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'events'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            3. Section Ragam Kegiatan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {activeTab === 'header' && (
            <>
              {/* Badge Text */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Label Badge Header</Label>
                <Input
                  value={formData.badge_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                  placeholder="Contoh: Fasilitas Penyewaan Lokasi Terbuka"
                  className="text-xs"
                  required
                />
              </div>

              {/* Title Text */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Judul Utama Halaman (H1)</Label>
                <Input
                  value={formData.title_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_text: e.target.value }))}
                  placeholder="Contoh: Penyewaan Tempat & Area Kegiatan"
                  className="text-xs font-bold"
                  required
                />
              </div>

              {/* Subtitle Text */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Deskripsi Tagline / Subtitle</Label>
                <Textarea
                  value={formData.subtitle_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle_text: e.target.value }))}
                  placeholder="Deskripsi singkat mengenai lokasi sewa..."
                  rows={3}
                  className="text-xs"
                  required
                />
              </div>

              {/* Highlights 1, 2, 3 */}
              <div className="border border-border/60 rounded-2xl p-4 space-y-3 bg-muted/20">
                <Label className="text-xs font-bold flex items-center gap-1.5 text-primary">
                  <AppIcon icon="CheckCircle2" className="w-3.5 h-3.5" />
                  Pill Keunggulan (Highlights Header)
                </Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Keunggulan 1</Label>
                    <Input
                      value={formData.highlight_1}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlight_1: e.target.value }))}
                      placeholder="Kapasitas s/d 1.000 Pengunjung"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Keunggulan 2</Label>
                    <Input
                      value={formData.highlight_2}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlight_2: e.target.value }))}
                      placeholder="Area Hijau Rindang"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Keunggulan 3</Label>
                    <Input
                      value={formData.highlight_3}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlight_3: e.target.value }))}
                      placeholder="Akses Parkir & Lokasi Strategis"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Info CTA Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Judul Kotak Informasi CTA</Label>
                  <Input
                    value={formData.info_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, info_title: e.target.value }))}
                    placeholder="Informasi & Layanan Sewa"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Deskripsi Kotak Informasi CTA</Label>
                  <Input
                    value={formData.info_desc}
                    onChange={(e) => setFormData(prev => ({ ...prev, info_desc: e.target.value }))}
                    placeholder="Hubungi unit pengelola untuk..."
                    className="text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4 pt-1">
              <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl">
                <Label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <AppIcon icon="Filter" className="w-3.5 h-3.5 text-emerald-600" />
                  Pengaturan Label Filter Kategori (Pill Bar)
                </Label>
                <p className="text-[11px] text-emerald-800/80">
                  Ubah teks pada tombol pill filter kategori pencarian tempat di halaman publik.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5 p-3 border border-border/80 rounded-xl bg-muted/20">
                  <Label className="text-xs font-semibold">Label Kategori 1 (Semua)</Label>
                  <Input
                    value={formData.cat_all_label}
                    onChange={(e) => setFormData(prev => ({ ...prev, cat_all_label: e.target.value }))}
                    placeholder="Semua Tempat"
                    className="text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5 p-3 border border-border/80 rounded-xl bg-muted/20">
                  <Label className="text-xs font-semibold">Label Kategori 2 (Pendopo)</Label>
                  <Input
                    value={formData.cat_pendopo_label}
                    onChange={(e) => setFormData(prev => ({ ...prev, cat_pendopo_label: e.target.value }))}
                    placeholder="Pendopo"
                    className="text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5 p-3 border border-border/80 rounded-xl bg-muted/20">
                  <Label className="text-xs font-semibold">Label Kategori 3 (Outdoor)</Label>
                  <Input
                    value={formData.cat_outdoor_label}
                    onChange={(e) => setFormData(prev => ({ ...prev, cat_outdoor_label: e.target.value }))}
                    placeholder="Area Open Space"
                    className="text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5 p-3 border border-border/80 rounded-xl bg-muted/20">
                  <Label className="text-xs font-semibold">Label Kategori 4 (Indoor / Gedung)</Label>
                  <Input
                    value={formData.cat_indoor_label}
                    onChange={(e) => setFormData(prev => ({ ...prev, cat_indoor_label: e.target.value }))}
                    placeholder="Gedung / Serbaguna"
                    className="text-xs font-bold"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <>
              {/* Section Header */}
              <div className="space-y-3 p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-emerald-900">Badge Section</Label>
                    <Input
                      value={formData.events_badge}
                      onChange={(e) => setFormData(prev => ({ ...prev, events_badge: e.target.value }))}
                      placeholder="Ragam Kegiatan"
                      className="text-xs bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-emerald-900">Judul Section (H2)</Label>
                    <Input
                      value={formData.events_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, events_title: e.target.value }))}
                      placeholder="Penggunaan Area Acara"
                      className="text-xs font-bold bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-emerald-900">Subtitle Section</Label>
                  <Input
                    value={formData.events_subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, events_subtitle: e.target.value }))}
                    placeholder="Area di Taman Margasatwa Ragunan dapat dimanfaatkan..."
                    className="text-xs bg-white"
                  />
                </div>
              </div>

              {/* 4 Cards Form */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold flex items-center gap-1.5 text-primary">
                  <AppIcon icon="PartyPopper" className="w-3.5 h-3.5" />
                  Daftar 4 Kartu Kegiatan
                </Label>

                {/* Card 1 */}
                <div className="p-3 border border-border/80 rounded-xl space-y-2 bg-muted/20">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary">Kartu 1</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={formData.event_1_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_1_title: e.target.value }))}
                      placeholder="Gathering & Outing"
                      className="text-xs font-bold"
                    />
                    <Input
                      value={formData.event_1_desc}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_1_desc: e.target.value }))}
                      placeholder="Kegiatan kebersamaan instansi, sekolah, atau organisasi."
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-3 border border-border/80 rounded-xl space-y-2 bg-muted/20">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary">Kartu 2</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={formData.event_2_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_2_title: e.target.value }))}
                      placeholder="Acara Keluarga"
                      className="text-xs font-bold"
                    />
                    <Input
                      value={formData.event_2_desc}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_2_desc: e.target.value }))}
                      placeholder="Syukuran, reuni, dan pertemuan keluarga besar."
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-3 border border-border/80 rounded-xl space-y-2 bg-muted/20">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary">Kartu 3</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={formData.event_3_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_3_title: e.target.value }))}
                      placeholder="Edukasi & Komunitas"
                      className="text-xs font-bold"
                    />
                    <Input
                      value={formData.event_3_desc}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_3_desc: e.target.value }))}
                      placeholder="Studi lapangan, pameran outdoor, dan kumpul komunitas."
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Card 4 */}
                <div className="p-3 border border-border/80 rounded-xl space-y-2 bg-muted/20">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-primary/10 text-primary">Kartu 4</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={formData.event_4_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_4_title: e.target.value }))}
                      placeholder="Dokumentasi & Media"
                      className="text-xs font-bold"
                    />
                    <Input
                      value={formData.event_4_desc}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_4_desc: e.target.value }))}
                      placeholder="Pemotretan komersial, liputan media, dan pembuatan video."
                      className="text-xs"
                    />
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
              {isSubmitting ? (
                <>
                  <AppIcon icon="Loader2" className="w-3.5 h-3.5 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
