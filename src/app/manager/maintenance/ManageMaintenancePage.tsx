'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Power,
  Upload,
  X,
  Save,
  Eye,
  EyeOff,
  Clock,
  Phone,
  Mail,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useMaintenanceMode, MaintenanceConfig } from '@/hooks/useMaintenanceMode';
import { toast } from 'sonner';

export default function ManageMaintenancePage() {
  const {
    config,
    loading,
    saving,
    uploadingBg,
    saveConfig,
    toggleMaintenance,
    uploadBackgroundImage,
    removeBackgroundImage,
  } = useMaintenanceMode();

  const [form, setForm] = useState<Omit<MaintenanceConfig, 'enabled' | 'background_image_url'>>({
    title: '',
    subtitle: '',
    estimated_done: '',
    contact_phone: '',
    contact_email: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Sync form when config is loaded
  useEffect(() => {
    if (!loading) {
      setForm({
        title: config.title,
        subtitle: config.subtitle,
        estimated_done: config.estimated_done
          ? new Date(config.estimated_done).toISOString().slice(0, 16)
          : '',
        contact_phone: config.contact_phone,
        contact_email: config.contact_email,
      });
    }
  }, [loading, config]);

  const handleSaveForm = async () => {
    const estimatedDone = form.estimated_done
      ? new Date(form.estimated_done).toISOString()
      : null;

    const result = await saveConfig({
      title: form.title,
      subtitle: form.subtitle,
      estimated_done: estimatedDone,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
    });

    if (result.success) {
      toast.success('Pengaturan maintenance berhasil disimpan');
    } else {
      toast.error('Gagal menyimpan pengaturan');
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadBackgroundImage(file);
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = config.enabled;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
          <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mode Maintenance</h1>
          <p className="text-muted-foreground mt-0.5">
            Aktifkan untuk menampilkan halaman pemeliharaan kepada pengunjung. Admin tetap bisa mengakses panel ini.
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-2xl border-2 p-6 transition-all duration-500 ${
          isActive
            ? 'border-red-400 bg-red-50 dark:bg-red-950/20 shadow-red-100 dark:shadow-red-900/20 shadow-lg'
            : 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 shadow-emerald-100 dark:shadow-emerald-900/20 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Status icon */}
            <div
              className={`p-3 rounded-xl ${isActive ? 'bg-red-100 dark:bg-red-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40'}`}
            >
              {isActive ? (
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {/* Live dot */}
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}
                />
                <span
                  className={`font-bold text-lg ${isActive ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}
                >
                  {isActive ? 'Mode Maintenance AKTIF' : 'Website Berjalan Normal'}
                </span>
              </div>
              <p className={`text-sm mt-0.5 ${isActive ? 'text-red-600/70 dark:text-red-400/70' : 'text-emerald-600/70 dark:text-emerald-400/70'}`}>
                {isActive
                  ? 'Pengunjung melihat halaman maintenance. Panel admin tetap dapat diakses.'
                  : 'Semua halaman dapat diakses oleh pengunjung secara normal.'}
              </p>
            </div>
          </div>

          {/* Toggle button */}
          <button
            id="btn-toggle-maintenance"
            onClick={() => toggleMaintenance(!isActive)}
            disabled={saving}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60 shadow-md hover:shadow-lg active:scale-95 ${
              isActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            {isActive ? 'Nonaktifkan Maintenance' : 'Aktifkan Maintenance'}
          </button>
        </div>
      </div>

      {/* Active warning */}
      {isActive && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Perhatian:</span> Website saat ini dalam mode maintenance. Semua pengunjung (kecuali admin) akan diarahkan ke halaman maintenance.
            Anda bisa{' '}
            <a
              href="/maintenance"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 inline-flex items-center gap-1"
            >
              lihat tampilan maintenance <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Settings */}
        <div className="bg-card border rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold flex items-center gap-2 border-b pb-3">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            Konten Halaman Maintenance
          </h2>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="maint-title">
              Judul Halaman
            </label>
            <input
              id="maint-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Sedang dalam Pemeliharaan"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="maint-subtitle">
              Subjudul / Pesan
            </label>
            <textarea
              id="maint-subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Kami sedang melakukan pembaruan sistem..."
            />
          </div>

          {/* Estimated done */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2" htmlFor="maint-eta">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Estimasi Selesai <span className="text-muted-foreground font-normal">(opsional)</span>
            </label>
            <input
              id="maint-eta"
              type="datetime-local"
              value={form.estimated_done || ''}
              onChange={(e) => setForm({ ...form, estimated_done: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground">
              Jika diisi, akan tampil countdown timer di halaman maintenance.
            </p>
          </div>

          <hr />

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2" htmlFor="maint-phone">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Nomor Telepon Kontak
            </label>
            <input
              id="maint-phone"
              type="text"
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="(021) 7884-0233"
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-2" htmlFor="maint-email">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email Kontak
            </label>
            <input
              id="maint-email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="info@ragunan.go.id"
            />
          </div>

          {/* Save button */}
          <button
            id="btn-save-maintenance-form"
            onClick={handleSaveForm}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Pengaturan
          </button>
        </div>

        {/* Background Image Upload */}
        <div className="space-y-4">
          <div className="bg-card border rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold flex items-center gap-2 border-b pb-3">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              Background Kustom
            </h2>

            <p className="text-sm text-muted-foreground">
              Upload gambar background untuk halaman maintenance. Jika tidak diupload, akan menggunakan desain default (gradasi hijau Ragunan).
            </p>

            {/* Current background preview */}
            {config.background_image_url ? (
              <div className="relative rounded-xl overflow-hidden border aspect-video bg-muted">
                <img
                  src={config.background_image_url}
                  alt="Background kustom"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={removeBackgroundImage}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Background
                  </button>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                    Aktif
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border-2 border-dashed border-muted aspect-video bg-muted/40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="w-10 h-10 opacity-30" />
                <span className="text-sm font-medium">Belum ada background kustom</span>
                <span className="text-xs">Menggunakan desain default</span>
              </div>
            )}

            {/* Upload button */}
            <input
              ref={bgInputRef}
              id="input-bg-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleBgUpload}
            />
            <button
              onClick={() => bgInputRef.current?.click()}
              disabled={uploadingBg || saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-primary/40 text-primary rounded-lg font-semibold text-sm hover:bg-primary/5 hover:border-primary disabled:opacity-60 transition-all"
            >
              {uploadingBg ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploadingBg ? 'Mengupload...' : config.background_image_url ? 'Ganti Background' : 'Upload Background'}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG, WebP • Maks. 5MB • Rekomendasi: 1920×1080px
            </p>
          </div>

          {/* Preview link */}
          <div className="bg-card border rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-muted-foreground" />
              Preview Halaman Maintenance
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Buka halaman maintenance di tab baru untuk melihat tampilannya sebelum diaktifkan.
            </p>
            <a
              href="/maintenance"
              target="_blank"
              rel="noopener noreferrer"
              id="btn-preview-maintenance"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Preview di Tab Baru
            </a>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-2">💡 Cara Kerja Mode Maintenance</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1.5 list-none">
          <li>• <strong>Aktif:</strong> Semua pengunjung yang belum login akan diarahkan ke halaman maintenance</li>
          <li>• <strong>Admin bypass:</strong> Admin yang sudah login tetap bisa mengakses panel <code>/manager</code> seperti biasa</li>
          <li>• <strong>Perubahan instan:</strong> Tidak perlu restart server — toggle langsung berlaku dalam hitungan detik</li>
          <li>• <strong>Fail-safe:</strong> Jika terjadi error pada sistem, website akan tetap berjalan normal (tidak block pengunjung)</li>
        </ul>
      </div>
    </div>
  );
}
