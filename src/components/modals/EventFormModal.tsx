import { useState, useEffect } from 'react';
import { X, Calendar, Globe, Loader2 } from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageInputWithGallery from '@/components/gallery/ImageInputWithGallery';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  onSuccess: () => void;
}

const eventTypes = [
  { value: 'feeding', label: 'Feeding Time' },
  { value: 'education', label: 'Edukasi' },
  { value: 'show', label: 'Pertunjukan' },
];

const zones = ['Zona A - Primata', 'Zona B - Mamalia', 'Zona C - Reptil', 'Zona D - Burung'];

export default function EventFormModal({ isOpen, onClose, event, onSuccess }: EventFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_id: '',
    title_en: '',
    description: '',
    description_id: '',
    description_en: '',
    event_date: '',
    time: '',
    zone: '',
    location: '',
    type: 'feeding',
    image_url: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        title_id: event.title_id || event.title || '',
        title_en: event.title_en || '',
        description: event.description || '',
        description_id: event.description_id || event.description || '',
        description_en: event.description_en || '',
        event_date: event.event_date || '',
        time: event.time || '',
        zone: event.zone || '',
        location: event.location || '',
        type: event.type || 'feeding',
        image_url: event.image_url || '',
      });
    } else {
      setFormData({
        title: '',
        title_id: '',
        title_en: '',
        description: '',
        description_id: '',
        description_en: '',
        event_date: '',
        time: '',
        zone: '',
        location: '',
        type: 'feeding',
        image_url: '',
      });
    }
  }, [event, isOpen]);


  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.title_id.trim()) {
      toast.error('Judul event (Indonesia) wajib diisi');
      return;
    }
    
    setLoading(true);

    const payload = {
      title: formData.title_id,
      title_id: formData.title_id,
      title_en: formData.title_en || null,
      description: formData.description_id || null,
      description_id: formData.description_id || null,
      description_en: formData.description_en || null,
      event_date: formData.event_date || null,
      time: formData.time || null,
      zone: formData.zone || null,
      location: formData.location || null,
      type: formData.type,
      image_url: formData.image_url || null,
    };

    try {
      if (event) {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', event.id);
        
        if (error) throw error;
        toast.success('Event berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(payload);
        
        if (error) throw error;
        toast.success('Event berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    }

    setLoading(false);
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
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-secondary" />
            </div>
            <span>{event ? 'Edit Event' : 'Tambah Event Baru'}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="manager-modal-body min-h-0 !block space-y-5">
          {/* Bilingual Tabs */}
          <div className="manager-form-section">
            <p className="manager-form-section-title flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Konten Multibahasa
            </p>
            
            <Tabs defaultValue="id" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="id" className="flex items-center gap-2 text-xs">
                  🇮🇩 Indonesia
                </TabsTrigger>
                <TabsTrigger value="en" className="flex items-center gap-2 text-xs">
                  🇬🇧 English
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="id" className="space-y-3 mt-0">
                <div>
                  <label className="manager-input-label">Judul Event (Indonesia) *</label>
                  <input
                    type="text"
                    value={formData.title_id}
                    onChange={(e) => setFormData({...formData, title_id: e.target.value})}
                    placeholder="Contoh: Feeding Time Gajah"
                    className="manager-input"
                  />
                </div>
                <div>
                  <label className="manager-input-label">Deskripsi (Indonesia)</label>
                  <textarea
                    value={formData.description_id}
                    onChange={(e) => setFormData({...formData, description_id: e.target.value})}
                    rows={2}
                    placeholder="Deskripsi event dalam Bahasa Indonesia..."
                    className="manager-textarea"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="en" className="space-y-3 mt-0">
                <div>
                  <label className="manager-input-label">Event Title (English)</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                    placeholder="Example: Elephant Feeding Time"
                    className="manager-input"
                  />
                </div>
                <div>
                  <label className="manager-input-label">Description (English)</label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                    rows={2}
                    placeholder="Event description in English..."
                    className="manager-textarea"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Media */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Gambar Event</p>
            <ImageInputWithGallery
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              category="events"
              showPreview={true}
              previewClassName="h-32"
            />
          </div>

          {/* Detail Event */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">Detail Event</p>
            <div className="manager-form-grid">
              <div>
                <label className="manager-input-label">Tipe Event</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="manager-select"
                >
                  {eventTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="manager-form-grid-2">
                <div>
                  <label className="manager-input-label">Tanggal</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                    className="manager-input"
                  />
                </div>
                <div>
                  <label className="manager-input-label">Waktu</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="manager-input"
                  />
                </div>
              </div>

              <div>
                <label className="manager-input-label">Zona</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({...formData, zone: e.target.value})}
                  className="manager-select"
                >
                  <option value="">Pilih Zona</option>
                  {zones.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="manager-input-label">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Contoh: Kandang Gajah"
                  className="manager-input"
                />
              </div>
            </div>
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
            disabled={loading || !formData.title_id}
            className="manager-btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              event ? 'Simpan Perubahan' : 'Tambah Event'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
