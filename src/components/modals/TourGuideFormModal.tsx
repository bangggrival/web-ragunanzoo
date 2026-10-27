import React, { useState, useEffect } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TourGuide, uploadTourGuidePhoto } from '@/hooks/useTourGuides';
import { toast } from 'sonner';

const languageOptions = [
  { value: 'id', label: 'Indonesia' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];

const specializationOptions = [
  { value: 'satwa', label: 'Satwa' },
  { value: 'burung', label: 'Burung' },
  { value: 'reptil', label: 'Reptil' },
  { value: 'primata', label: 'Primata' },
  { value: 'mamalia', label: 'Mamalia' },
  { value: 'flora', label: 'Flora' },
];

interface TourGuideFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: TourGuide | null;
  onSubmit: (data: Omit<TourGuide, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews'>) => Promise<void>;
  isPending: boolean;
}

export function TourGuideFormModal({
  open,
  onOpenChange,
  guide,
  onSubmit,
  isPending,
}: TourGuideFormModalProps) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [phone, setPhone] = useState('');
  const [bioId, setBioId] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [hourlyRate, setHourlyRate] = useState(75000);
  const [languages, setLanguages] = useState<string[]>(['id']);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (guide) {
      setName(guide.name);
      setPhoto(guide.photo_url || '');
      setPhone(guide.phone || '');
      setBioId(guide.bio_id || '');
      setBioEn(guide.bio_en || '');
      setHourlyRate(guide.hourly_rate);
      setLanguages(guide.languages || ['id']);
      setSpecializations(guide.specialization || []);
      setIsActive(guide.is_active ?? true);
    } else {
      resetForm();
    }
  }, [guide, open]);

  const resetForm = () => {
    setName('');
    setPhoto('');
    setPhone('');
    setBioId('');
    setBioEn('');
    setHourlyRate(75000);
    setLanguages(['id']);
    setSpecializations([]);
    setIsActive(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadTourGuidePhoto(file);
      setPhoto(url);
      toast.success('Foto berhasil diunggah');
    } catch (error) {
      toast.error('Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const toggleLanguage = (value: string) => {
    if (languages.includes(value)) {
      setLanguages(languages.filter(l => l !== value));
    } else {
      setLanguages([...languages, value]);
    }
  };

  const toggleSpecialization = (value: string) => {
    if (specializations.includes(value)) {
      setSpecializations(specializations.filter(s => s !== value));
    } else {
      setSpecializations([...specializations, value]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Nama pemandu wajib diisi');
      return;
    }

    await onSubmit({
      name: name.trim(),
      photo_url: photo || null,
      phone: phone || null,
      bio_id: bioId || null,
      bio_en: bioEn || null,
      hourly_rate: hourlyRate,
      languages,
      specialization: specializations,
      is_active: isActive,
    });
  };

  const isEditing = !!guide;

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/45 backdrop-blur-md animate-in fade-in duration-300" 
      onClick={() => onOpenChange(false)}
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
              <AppIcon name="solar:user-id-bold-duotone" className="w-4 h-4 text-primary" />
            </div>
            <span>{isEditing ? 'Edit Pemandu' : 'Tambah Pemandu Baru'}</span>
          </div>
          <button 
            onClick={() => onOpenChange(false)} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <AppIcon name="solar:close-circle-bold" className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="manager-modal-body min-h-0 !block space-y-5">
          {/* Informasi Dasar */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              <AppIcon name="solar:user-circle-bold-duotone" className="w-4 h-4" />
              Informasi Dasar
            </p>

            <div className="manager-form-grid">
              <div>
                <label className="manager-input-label">Nama Pemandu *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="manager-input"
                />
              </div>

              <div>
                <label className="manager-input-label">Foto Profil</label>
                <div className="flex gap-2">
                  <Input
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="URL foto atau upload file"
                    className="manager-input flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button type="button" variant="outline" disabled={uploading} asChild>
                      <span className="flex items-center gap-1.5 h-11">
                        {uploading ? (
                          <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" />
                        ) : (
                          <AppIcon name="solar:upload-track-2-bold-duotone" className="w-4 h-4" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                {photo && (
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src={photo}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-full border-2 border-muted"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPhoto('')}
                      className="text-destructive hover:text-destructive text-xs"
                    >
                      Hapus foto
                    </Button>
                  </div>
                )}
              </div>

              <div className="manager-form-grid-2">
                <div>
                  <label className="manager-input-label">No. Telepon</label>
                  <div className="relative">
                    <AppIcon name="solar:phone-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="manager-input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="manager-input-label">Tarif Per Jam (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <Input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                      className="manager-input pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Keahlian */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              <AppIcon name="solar:star-bold-duotone" className="w-4 h-4" />
              Keahlian
            </p>

            <div className="manager-form-grid">
              <div>
                <label className="manager-input-label">Bahasa yang Dikuasai</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {languageOptions.map((lang) => (
                    <Badge
                      key={lang.value}
                      variant={languages.includes(lang.value) ? 'default' : 'outline'}
                      className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1.5"
                      onClick={() => toggleLanguage(lang.value)}
                    >
                      {lang.label}
                    </Badge>
                  ))}
                </div>
                <p className="manager-input-hint">Pilih satu atau lebih</p>
              </div>

              <div>
                <label className="manager-input-label">Spesialisasi</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {specializationOptions.map((spec) => (
                    <Badge
                      key={spec.value}
                      variant={specializations.includes(spec.value) ? 'default' : 'outline'}
                      className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1.5"
                      onClick={() => toggleSpecialization(spec.value)}
                    >
                      {spec.label}
                    </Badge>
                  ))}
                </div>
                <p className="manager-input-hint">Pilih area keahlian</p>
              </div>
            </div>
          </div>

          {/* Biografi */}
          <div className="manager-form-section">
            <p className="manager-form-section-title">
              <AppIcon name="solar:document-text-bold-duotone" className="w-4 h-4" />
              Biografi
            </p>

            <div className="manager-form-grid">
              <div>
                <label className="manager-input-label">Bio (Indonesia)</label>
                <Textarea
                  value={bioId}
                  onChange={(e) => setBioId(e.target.value)}
                  placeholder="Deskripsi singkat tentang pemandu..."
                  rows={3}
                  className="manager-textarea"
                />
              </div>

              <div>
                <label className="manager-input-label">Bio (English)</label>
                <Textarea
                  value={bioEn}
                  onChange={(e) => setBioEn(e.target.value)}
                  placeholder="Short description about the guide..."
                  rows={3}
                  className="manager-textarea"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-manager-border">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Status Aktif</label>
              <p className="text-xs text-muted-foreground">
                Pemandu yang aktif akan tampil di halaman publik
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        {/* Footer */}
        <div className="manager-modal-footer">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="manager-btn-secondary"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="manager-btn-primary"
          >
            {isPending ? (
              <>
                <AppIcon name="solar:spinner-linear" className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              isEditing ? 'Simpan Perubahan' : 'Tambah Pemandu'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
