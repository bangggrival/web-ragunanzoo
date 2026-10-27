import { useState, useEffect, useRef } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { Animal } from '@/hooks/useAnimals';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/contexts/LanguageContext';
import GalleryPicker from '@/components/gallery/GalleryPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnimalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal?: (Animal & { model_url?: string | null; audio_url?: string | null }) | null;
  onSuccess: () => void;
}

const statuses = ['Dilindungi', 'Rentan', 'Aman'];
const healthStatuses = ['Sehat', 'Sakit', 'Perawatan'];

export default function AnimalFormModal({ isOpen, onClose, animal, onSuccess }: AnimalFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const { getFaunaCategories, getCategoryDisplay } = useCategories();
  const { language } = useLanguage();
  const faunaCategories = getFaunaCategories();
  const [showGallery, setShowGallery] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    latin_name: '',
    species: '',
    category_id: '',
    category: 'Mamalia',
    category_en: 'Mammals',
    habitat: '',
    habitat_en: '',
    status: 'Dilindungi',
    health_status: 'Sehat',
    description: '',
    description_en: '',
    image_url: '',
    model_url: '',
    audio_url: '',
    location: '',
    zone: '',
    latitude: null as number | null,
    longitude: null as number | null,
    is_featured: false
  });

  useEffect(() => {
    if (animal) {
      setFormData({
        name: animal.name || '',
        name_en: animal.name_en || '',
        latin_name: animal.latin_name || '',
        species: animal.species || '',
        category_id: animal.category_id || '',
        category: animal.category || 'Mamalia',
        category_en: animal.category_en || 'Mammals',
        habitat: animal.habitat || '',
        habitat_en: animal.habitat_en || '',
        status: animal.status || 'Dilindungi',
        health_status: animal.health_status || 'Sehat',
        description: animal.description || '',
        description_en: animal.description_en || '',
        image_url: animal.image_url || '',
        model_url: animal.model_url || '',
        audio_url: animal.audio_url || '',
        location: animal.location || '',
        zone: animal.zone || '',
        latitude: animal.latitude || null,
        longitude: animal.longitude || null,
        is_featured: animal.is_featured || false
      });
    } else {
      setFormData({
        name: '',
        name_en: '',
        latin_name: '',
        species: '',
        category_id: '',
        category: 'Mamalia',
        category_en: 'Mammals',
        habitat: '',
        habitat_en: '',
        status: 'Dilindungi',
        health_status: 'Sehat',
        description: '',
        description_en: '',
        image_url: '',
        model_url: '',
        audio_url: '',
        location: '',
        zone: '',
        latitude: null,
        longitude: null,
        is_featured: false
      });
    }
  }, [animal, isOpen]);

  const handleCategoryChange = (catId: string) => {
    const selectedCat = faunaCategories.find(c => c.id === catId);
    if (selectedCat) {
      setFormData(prev => ({
        ...prev,
        category_id: selectedCat.id,
        category: selectedCat.name_id,
        category_en: selectedCat.name_en || selectedCat.name_id
      }));
    } else {
      setFormData(prev => ({ ...prev, category_id: catId }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const timestamp = Date.now();
      const safeName = formData.name.toLowerCase().replace(/\s+/g, '-') || 'animal';
      const ext = file.name.split('.').pop();
      const fileName = `${safeName}-${timestamp}.${ext}`;

      const { data: uploadData, error } = await supabase.storage
        .from('animal-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('animal-images')
        .getPublicUrl(uploadData.path);

      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success('Gambar berhasil diupload');
    } catch (error: any) {
      toast.error('Gagal mengupload gambar: ' + error.message);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(glb|gltf)$/i)) {
      toast.error('Format file harus .glb atau .gltf');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 50MB');
      return;
    }

    setUploadingModel(true);
    try {
      const timestamp = Date.now();
      const safeName = formData.name.toLowerCase().replace(/\s+/g, '-') || 'animal';
      const fileName = `${safeName}-${timestamp}.glb`;

      const { data: uploadData, error } = await supabase.storage
        .from('animal-models')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('animal-models')
        .getPublicUrl(uploadData.path);

      setFormData(prev => ({ ...prev, model_url: urlData.publicUrl }));
      toast.success('Model 3D berhasil diupload');
    } catch (error: any) {
      toast.error('Gagal mengupload model: ' + error.message);
    } finally {
      setUploadingModel(false);
      if (modelInputRef.current) modelInputRef.current.value = '';
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      toast.error('Format file harus .mp3, .wav, .ogg, atau .m4a');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 20MB');
      return;
    }

    setUploadingAudio(true);
    try {
      const timestamp = Date.now();
      const safeName = formData.name.toLowerCase().replace(/\s+/g, '-') || 'animal';
      const ext = file.name.split('.').pop();
      const fileName = `${safeName}-${timestamp}.${ext}`;

      const { data: uploadData, error } = await supabase.storage
        .from('animal-audio')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('animal-audio')
        .getPublicUrl(uploadData.path);

      setFormData(prev => ({ ...prev, audio_url: urlData.publicUrl }));
      toast.success('Audio berhasil diupload');
    } catch (error: any) {
      toast.error('Gagal mengupload audio: ' + error.message);
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Nama satwa wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        name_en: formData.name_en || formData.name,
        latin_name: formData.latin_name,
        species: formData.species,
        category_id: formData.category_id || null,
        category: formData.category,
        category_en: formData.category_en,
        habitat: formData.habitat,
        habitat_en: formData.habitat_en || formData.habitat,
        status: formData.status,
        health_status: formData.health_status,
        description: formData.description,
        description_en: formData.description_en || formData.description,
        image_url: formData.image_url || null,
        model_url: formData.model_url || null,
        audio_url: formData.audio_url || null,
        location: formData.location,
        zone: formData.zone,
        latitude: formData.latitude,
        longitude: formData.longitude,
        is_featured: formData.is_featured
      };

      if (animal) {
        const { error } = await supabase
          .from('animals')
          .update(payload as never)
          .eq('id', animal.id);
        
        if (error) throw error;
        toast.success('Satwa berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('animals')
          .insert(payload as never);
        
        if (error) throw error;
        toast.success('Satwa berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  const isUploading = uploadingImage || uploadingModel || uploadingAudio;

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
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <AppIcon name="fluent-emoji-flat:paw-prints" className="w-4 h-4 text-primary" />
            </div>
            <span>{animal ? 'Edit Satwa' : 'Tambah Satwa'}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <AppIcon name="solar:close-circle-bold" className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="manager-modal-body min-h-0 !block space-y-5">
          {/* Media */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Media</p>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Image */}
              {formData.image_url ? (
                <div className="relative group w-16 h-16 rounded-lg overflow-hidden border border-manager-border">
                  <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, image_url: ''})}
                    className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <AppIcon name="solar:close-circle-bold" className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-16 h-16 border-2 border-dashed border-manager-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 hover:bg-muted/30 transition-all disabled:opacity-50"
                  >
                    {uploadingImage ? <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" /> : <AppIcon name="solar:gallery-bold-duotone" className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-[9px] text-muted-foreground mt-1">Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGallery(true)}
                    className="w-16 h-16 border border-primary/30 bg-primary/5 rounded-lg flex flex-col items-center justify-center hover:bg-primary/10 transition-all text-primary"
                  >
                    <AppIcon name="solar:folder-with-files-bold-duotone" className="w-4 h-4" />
                    <span className="text-[9px] font-semibold mt-1">Galeri</span>
                  </button>
                </div>
              )}

              {/* 3D Model */}
              {formData.model_url ? (
                <div className="relative group w-16 h-16 rounded-lg overflow-hidden border border-manager-border bg-muted flex items-center justify-center">
                  <AppIcon name="solar:box-bold-duotone" className="w-6 h-6 text-primary" />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, model_url: ''})}
                    className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <AppIcon name="solar:close-circle-bold" className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => modelInputRef.current?.click()}
                  disabled={uploadingModel}
                  className="w-16 h-16 border-2 border-dashed border-manager-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 hover:bg-muted/30 transition-all disabled:opacity-50"
                >
                  {uploadingModel ? <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" /> : <AppIcon name="solar:box-bold-duotone" className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-[9px] text-muted-foreground mt-1">3D Model</span>
                </button>
              )}

              {/* Audio */}
              {formData.audio_url ? (
                <div className="relative group w-16 h-16 rounded-lg overflow-hidden border border-manager-border bg-muted flex items-center justify-center">
                  <AppIcon name="solar:volume-loud-bold-duotone" className="w-6 h-6 text-primary" />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, audio_url: ''})}
                    className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <AppIcon name="solar:close-circle-bold" className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploadingAudio}
                  className="w-16 h-16 border-2 border-dashed border-manager-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 hover:bg-muted/30 transition-all disabled:opacity-50"
                >
                  {uploadingAudio ? <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" /> : <AppIcon name="solar:volume-loud-bold-duotone" className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-[9px] text-muted-foreground mt-1">Audio</span>
                </button>
              )}
              
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageUpload} className="hidden" />
              <input ref={modelInputRef} type="file" accept=".glb,.gltf" onChange={handleModelUpload} className="hidden" />
              <input ref={audioInputRef} type="file" accept=".mp3,.wav,.ogg,.m4a" onChange={handleAudioUpload} className="hidden" />
            </div>
          </div>

          {/* Informasi Dasar */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Informasi Dasar</p>
            <div className="manager-form-grid space-y-3">
              <div className="manager-form-grid-2">
                <div>
                  <label className="manager-input-label">Nama *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="manager-input"
                    placeholder="Orangutan"
                  />
                </div>
                <div>
                  <label className="manager-input-label">Nama (EN)</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                    className="manager-input"
                    placeholder="Orangutan"
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
                    placeholder="Pongo pygmaeus"
                  />
                </div>
                <div>
                  <label className="manager-input-label">Spesies</label>
                  <input
                    type="text"
                    value={formData.species}
                    onChange={(e) => setFormData({...formData, species: e.target.value})}
                    className="manager-input"
                    placeholder="Primata"
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
                    {faunaCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{getCategoryDisplay(c, language)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Lokasi & Status */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Status & Lokasi</p>
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
            <p className="manager-form-section-title">Deskripsi</p>
            <div className="space-y-4">
              <div>
                <label className="manager-input-label">Bahasa Indonesia</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  className="manager-textarea"
                  placeholder="Deskripsi satwa..."
                />
              </div>
              <div>
                <label className="manager-input-label">Bahasa Inggris (EN)</label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  rows={2}
                  className="manager-textarea"
                  placeholder="Animal description..."
                />
              </div>
            </div>
            <label className="manager-checkbox-row cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                className="w-4 h-4 text-primary rounded border-manager-border focus:ring-primary"
              />
              <span className="text-sm text-foreground">Tampilkan sebagai unggulan</span>
            </label>
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
            onClick={() => handleSubmit()}
            disabled={loading || isUploading}
            className="manager-btn-primary"
          >
            {loading ? (
              <>
                <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : animal ? 'Simpan Perubahan' : 'Tambah Satwa'}
          </button>
        </div>
      </div>

      {/* Gallery Picker Modal */}
      <GalleryPicker
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={(url) => {
          setFormData(prev => ({ ...prev, image_url: url }));
          setShowGallery(false);
        }}
        category="animals"
      />
    </div>
  );
}
