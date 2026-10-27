import { useState, useEffect } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { Plant } from '@/hooks/usePlants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/contexts/LanguageContext';
import ImageInputWithGallery from '@/components/gallery/ImageInputWithGallery';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant?: Plant | null;
  onSuccess: () => void;
}

const statuses = ['Dilindungi', 'Rentan', 'Aman'];
const healthStatuses = ['Sehat', 'Sakit', 'Perawatan'];

export default function PlantFormModal({ isOpen, onClose, plant, onSuccess }: PlantFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { getFloraCategories, getCategoryDisplay } = useCategories();
  const { language } = useLanguage();
  const floraCategories = getFloraCategories();
  
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    latin_name: '',
    species: '',
    zone: '',
    category: '',
    category_en: '',
    category_id: '',
    location: '',
    habitat: '',
    habitat_en: '',
    description: '',
    description_en: '',
    status: 'Aman',
    health_status: 'Sehat',
    image_url: '',
    is_featured: false,
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (plant) {
      setFormData({
        name: plant.name || '',
        name_en: plant.name_en || '',
        latin_name: plant.latin_name || '',
        species: plant.species || '',
        zone: plant.zone || '',
        category: plant.category || '',
        category_en: plant.category_en || '',
        category_id: plant.category_id || '',
        location: plant.location || '',
        habitat: plant.habitat || '',
        habitat_en: plant.habitat_en || '',
        description: plant.description || '',
        description_en: plant.description_en || '',
        status: plant.status || 'Aman',
        health_status: plant.health_status || 'Sehat',
        image_url: plant.image_url || '',
        is_featured: plant.is_featured || false,
        latitude: plant.latitude?.toString() || '',
        longitude: plant.longitude?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        name_en: '',
        latin_name: '',
        species: '',
        zone: '',
        category: '',
        category_en: '',
        category_id: '',
        location: '',
        habitat: '',
        habitat_en: '',
        description: '',
        description_en: '',
        status: 'Aman',
        health_status: 'Sehat',
        image_url: '',
        is_featured: false,
        latitude: '',
        longitude: '',
      });
    }
  }, [plant, isOpen]);

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = floraCategories.find(c => c.id === categoryId);
    if (selectedCategory) {
      setFormData(prev => ({
        ...prev,
        category_id: categoryId,
        category: selectedCategory.name_id,
        category_en: selectedCategory.name_en || selectedCategory.name_id,
      }));
    } else {
      setFormData(prev => ({ ...prev, category_id: categoryId }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nama tumbuhan wajib diisi');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        name_en: formData.name_en || formData.name,
        latin_name: formData.latin_name || null,
        species: formData.species || null,
        zone: formData.zone || null,
        category: formData.category || null,
        category_en: formData.category_en || null,
        category_id: formData.category_id || null,
        location: formData.location || null,
        habitat: formData.habitat || null,
        habitat_en: formData.habitat_en || null,
        description: formData.description || null,
        description_en: formData.description_en || null,
        status: formData.status,
        health_status: formData.health_status,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (plant) {
        const { error } = await supabase
          .from('plants')
          .update(payload)
          .eq('id', plant.id);

        if (error) throw error;
        toast.success('Tumbuhan berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('plants')
          .insert([payload]);

        if (error) throw error;
        toast.success('Tumbuhan berhasil ditambahkan');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/45 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative z-50 flex flex-col overflow-hidden w-full max-w-xl bg-white/85 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 rounded-[1.25rem] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12),_0_24px_64px_-12px_rgba(0,0,0,0.15)] animate-in zoom-in-95 fade-in duration-300"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="manager-modal-header shrink-0">
          <div className="manager-modal-title">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <AppIcon name="fluent-emoji-flat:herb" className="w-4 h-4 text-green-600" />
            </div>
            <span>{plant ? 'Edit Tumbuhan' : 'Tambah Tumbuhan'}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <AppIcon name="solar:close-circle-bold" className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="manager-modal-body min-h-0 !block space-y-5">
          {/* Gambar */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Foto Tumbuhan</p>
            <ImageInputWithGallery
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              category="plants"
              placeholder="Pilih atau upload foto tumbuhan"
            />
          </div>

          {/* Informasi Dasar */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Informasi Utama</p>
            <div className="manager-form-grid space-y-3">
              <div className="manager-form-grid-2">
                <div>
                  <label className="manager-input-label">Nama (Indonesia) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="manager-input"
                    placeholder="Pohon Trembesi"
                  />
                </div>
                <div>
                  <label className="manager-input-label">Nama (English)</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                    className="manager-input"
                    placeholder="Rain Tree"
                  />
                </div>
              </div>
              <div className="manager-form-grid-2">
                <div>
                  <label className="manager-input-label">Nama Latin</label>
                  <input
                    type="text"
                    value={formData.latin_name}
                    onChange={(e) => setFormData({...formData, latin_name: e.target.value})}
                    className="manager-input"
                    placeholder="Samanea saman"
                  />
                </div>
                <div>
                  <label className="manager-input-label">Spesies</label>
                  <input
                    type="text"
                    value={formData.species}
                    onChange={(e) => setFormData({...formData, species: e.target.value})}
                    className="manager-input"
                    placeholder="Angiospermae"
                  />
                </div>
              </div>
              <div>
                <label className="manager-input-label">Kategori</label>
                <Select value={formData.category_id} onValueChange={(val) => handleCategoryChange(val)}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {floraCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{getCategoryDisplay(c, language)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Lokasi & Koordinat */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              <AppIcon name="solar:map-point-wave-bold-duotone" className="w-4 h-4 text-green-600" />
              Lokasi & Koordinat
            </p>
            <div className="manager-form-grid-3">
              <div>
                <label className="manager-input-label">Zona</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({...formData, zone: e.target.value})}
                  className="manager-input"
                  placeholder="Zona Flora Langka"
                />
              </div>
              <div>
                <label className="manager-input-label">Latitude</label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  className="manager-input"
                  placeholder="-6.3039"
                />
              </div>
              <div>
                <label className="manager-input-label">Longitude</label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  className="manager-input"
                  placeholder="106.8228"
                />
              </div>
            </div>
          </div>

          {/* Habitat & Status */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              <AppIcon name="solar:pulse-2-bold-duotone" className="w-4 h-4 text-green-600" />
              Status & Konservasi
            </p>
            <div className="manager-form-grid-2">
              <div>
                <label className="manager-input-label">Konservasi</label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="manager-input-label">Kesehatan</label>
                <Select value={formData.health_status} onValueChange={(val) => setFormData({...formData, health_status: val})}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200">
                    <SelectValue placeholder="Pilih Kesehatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {healthStatuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              <AppIcon name="solar:document-text-bold-duotone" className="w-4 h-4 text-green-600" />
              Deskripsi
            </p>
            <div className="space-y-4">
              <div>
                <label className="manager-input-label">Bahasa Indonesia</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="manager-textarea"
                  placeholder="Deskripsi singkat tentang tumbuhan..."
                />
              </div>
              <div>
                <label className="manager-input-label">Bahasa Inggris (EN)</label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  rows={3}
                  className="manager-textarea"
                  placeholder="Brief description of the plant..."
                />
              </div>
            </div>
          </div>

          {/* Unggulan Toggle */}
          <div className="manager-toggle-row bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <AppIcon name="solar:star-bold-duotone" className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Tampilkan Unggulan</p>
                <p className="text-xs text-muted-foreground">Tampil di halaman utama</p>
              </div>
            </div>
            <Switch 
              checked={formData.is_featured} 
              onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="manager-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="manager-btn-secondary"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="manager-btn-primary"
          >
            {loading ? (
              <>
                <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              plant ? 'Simpan Perubahan' : 'Tambah Tumbuhan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
