import { useState, useEffect } from 'react';
import { X, Utensils, Image as ImageIcon, FolderOpen, Save } from 'lucide-react';
import { FeedingSchedule } from '@/hooks/useFeedingSchedules';
import GalleryPicker from '@/components/gallery/GalleryPicker';

interface FeedingScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: FeedingSchedule | null;
  onSuccess: (data: any) => void;
}

export default function FeedingScheduleFormModal({ isOpen, onClose, schedule, onSuccess }: FeedingScheduleFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  const [formData, setFormData] = useState({
    name_id: '',
    name_en: '',
    timesStr: '',
    image_url: '',
    color: 'from-primary/20 to-secondary/20',
    is_published: true,
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        name_id: schedule.name_id || '',
        name_en: schedule.name_en || '',
        timesStr: schedule.times ? schedule.times.join(', ') : '',
        image_url: schedule.image_url || '',
        color: schedule.color || 'from-primary/20 to-secondary/20',
        is_published: schedule.is_published ?? true,
      });
    } else {
      setFormData({
        name_id: '',
        name_en: '',
        timesStr: '',
        image_url: '',
        color: 'from-orange-500/20 to-red-500/20',
        is_published: true,
      });
    }
  }, [schedule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process times array
      const times = formData.timesStr
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const submitData = {
        name_id: formData.name_id,
        name_en: formData.name_en,
        times,
        image_url: formData.image_url,
        color: formData.color,
        is_published: formData.is_published,
      };

      await onSuccess(submitData);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{schedule ? 'Edit Jadwal Makan' : 'Tambah Jadwal Makan'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="schedule-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Gambar Latar Belakang (Opsional)</label>
              <div className="flex items-center gap-4">
                {formData.image_url && (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <FolderOpen className="w-4 h-4" />
                  Pilih dari Galeri
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Satwa (ID) *</label>
                <input
                  required
                  type="text"
                  value={formData.name_id}
                  onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Contoh: Harimau Sumatera"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Satwa (EN) *</label>
                <input
                  required
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Contoh: Sumatran Tiger"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jadwal Jam Makan (Gunakan koma sebagai pemisah) *</label>
              <input
                required
                type="text"
                value={formData.timesStr}
                onChange={(e) => setFormData({ ...formData, timesStr: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Contoh: 10:00, 14:30, 16:00"
              />
              <p className="text-xs text-muted-foreground">Format 24 jam (HH:MM)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Warna Latar (Tailwind CSS)</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Contoh: from-orange-500/20 to-red-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Publikasi</label>
                <div className="flex items-center gap-3 h-10">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium">
                      {formData.is_published ? 'Publik' : 'Disembunyikan'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="schedule-form"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </div>
      
      {showGallery && (
        <GalleryPicker
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          onSelect={(url) => {
            setFormData({ ...formData, image_url: url });
            setShowGallery(false);
          }}
        />
      )}
    </div>
  );
}
