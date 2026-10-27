"use client";

import { useState, useRef, useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateSiteSettingsAction } from './actions';

import defaultLogo from '@/assets/tiger-mascot.png';
import defaultHero from '@/assets/hero-banner.jpg';

interface ManageBrandingClientProps {
  initialSettings: SiteSettings | null;
}

interface ImageUploadCardProps {
  title: string;
  description: string;
  currentImage: string | null;
  defaultImage: string;
  aspectRatio: string;
  recommendedSize: string;
  onUpload: (url: string) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  bucket: string;
  folder: string;
}

const removeBlackBackgroundFromFile = (file: File): Promise<{ file: File; cleaned: boolean }> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve({ file, cleaned: false });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ file, cleaned: false });

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        const w = img.width;
        const h = img.height;
        const cornerIndices = [
          0,
          (w - 1) * 4,
          (h - 1) * w * 4,
          ((h - 1) * w + (w - 1)) * 4
        ];

        let darkCornerCount = 0;
        for (const idx of cornerIndices) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a > 150 && r < 50 && g < 50 && b < 50) {
            darkCornerCount++;
          }
        }

        if (darkCornerCount < 2) {
          return resolve({ file, cleaned: false });
        }

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a > 0 && r < 50 && g < 50 && b < 50) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return resolve({ file, cleaned: false });
          const cleanedName = file.name.replace(/\.[^/.]+$/, "") + "-transparent.png";
          const cleanedFile = new File([blob], cleanedName, { type: "image/png" });
          resolve({ file: cleanedFile, cleaned: true });
        }, "image/png");
      };
      img.onerror = () => resolve({ file, cleaned: false });
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve({ file, cleaned: false });
    reader.readAsDataURL(file);
  });
};

function ImageUploadCard({
  title,
  description,
  currentImage,
  defaultImage,
  aspectRatio,
  recommendedSize,
  onUpload,
  uploading,
  setUploading,
  bucket,
  folder,
}: ImageUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const { file: processedFile, cleaned } = await removeBlackBackgroundFromFile(file);
      file = processedFile;

      if (cleaned) {
        toast.success('Latar belakang hitam pada logo otomatis dibersihkan menjadi transparan!');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      onUpload(publicUrl);
      toast.success('Gambar berhasil diupload');
    } catch (err) {
      console.error('Error uploading:', err);
      toast.error('Gagal mengupload gambar');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const displayImage = currentImage || defaultImage;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] border border-white/80 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>
          <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">
            Ukuran disarankan: {recommendedSize}
          </p>
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100/90 mb-5 ${aspectRatio}`}
      >
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-contain p-2"
        />
        {!currentImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
            <span className="text-xs font-bold text-white bg-slate-800/80 px-3 py-1.5 rounded-lg shadow-sm">
              Default
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-1 h-10 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <AppIcon icon="Loader2" className="w-4 h-4 animate-spin text-green-500" />
          ) : (
            <AppIcon icon="Upload" className="w-4 h-4 text-slate-400" />
          )}
          {uploading ? 'Mengupload...' : 'Ganti Gambar'}
        </button>
        {currentImage && (
          <button
            onClick={() => onUpload('')}
            title="Reset ke default"
            className="w-10 h-10 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl flex items-center justify-center transition-colors"
          >
            <AppIcon icon="Image" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ManageBrandingClient() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [footerDescriptionId, setFooterDescriptionId] = useState('');
  const [footerDescriptionEn, setFooterDescriptionEn] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMobileUploading, setLogoMobileUploading] = useState(false);
  const [footerLogoUploading, setFooterLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [loadingLogoUploading, setLoadingLogoUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);

  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) {
          setSettings(data as any);
          setSiteName(data.site_name || '');
          setFooterDescriptionId(data.footer_description_id || '');
          setFooterDescriptionEn(data.footer_description_en || '');
          setContactAddress(data.contact_address || '');
          setContactPhone(data.contact_phone || '');
          setContactEmail(data.contact_email || '');
          setSocialInstagram(data.social_instagram || '');
          setSocialFacebook(data.social_facebook || '');
          setSocialTwitter(data.social_twitter || '');
          setSocialYoutube(data.social_youtube || '');
          setSocialTiktok(data.social_tiktok || '');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'site_settings') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const handleSaveSiteName = async () => {
    if (!siteName.trim()) {
      toast.error('Nama situs tidak boleh kosong');
      return;
    }

    try {
      setSaving(true);
      const result = await updateSiteSettingsAction({ site_name: siteName.trim() });
      if (!result.success) throw new Error(result.error);
      toast.success('Nama situs berhasil disimpan');
    } catch (err: any) {
      toast.error('Gagal menyimpan nama situs: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async () => {
    try {
      setSavingFooter(true);
      const result = await updateSiteSettingsAction({ 
        footer_description_id: footerDescriptionId.trim(),
        footer_description_en: footerDescriptionEn.trim(),
        contact_address: contactAddress.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        social_instagram: socialInstagram.trim() || null,
        social_facebook: socialFacebook.trim() || null,
        social_twitter: socialTwitter.trim() || null,
        social_youtube: socialYoutube.trim() || null,
        social_tiktok: socialTiktok.trim() || null,
      });
      if (!result.success) throw new Error(result.error);
      toast.success('Pengaturan footer berhasil disimpan');
    } catch (err: any) {
      toast.error('Gagal menyimpan pengaturan footer: ' + err.message);
    } finally {
      setSavingFooter(false);
    }
  };

  const handleImageUpdate = async (field: 'logo_url' | 'hero_image_url' | 'mascot_image_url' | 'logo_mobile_url' | 'loading_logo_url' | 'footer_logo_url' | 'favicon_url', url: string) => {
    try {
      const result = await updateSiteSettingsAction({ [field]: url || null } as any);
      if (!result.success) throw new Error(result.error);
      
      setSettings(prev => prev ? { ...prev, [field]: url || null } : null);
      toast.success('Gambar berhasil disimpan');
    } catch (err: any) {
      toast.error('Gagal menyimpan perubahan: ' + err.message);
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map(i => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm h-64 animate-pulse" />
          ))}
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
              <AppIcon icon="LayoutTemplate" className="w-5 h-5 text-green-500" />
            </div>
            Pengaturan Branding
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola identitas visual, logo, dan gambar utama website</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm">
        <div className="max-w-2xl">
          <Label htmlFor="site_name" className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
            Nama Situs
          </Label>
          <p className="text-xs font-medium text-slate-500 mb-4">
            Nama yang ditampilkan di header dan title halaman website
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="site_name"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              placeholder="Taman Margasatwa Ragunan"
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-bold text-slate-700 shadow-sm"
            />
            <button 
              onClick={handleSaveSiteName} 
              disabled={saving} 
              className="h-11 sm:h-auto px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : <AppIcon icon="Save" className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan Nama'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ImageUploadCard
          title="Logo Desktop"
          description="Logo yang tampil di navbar (desktop/tablet)"
          currentImage={settings?.logo_url || null}
          defaultImage={defaultLogo.src}
          aspectRatio="aspect-square max-h-48"
          recommendedSize="200x200 px (1:1)"
          onUpload={url => handleImageUpdate('logo_url', url)}
          uploading={logoUploading}
          setUploading={setLogoUploading}
          bucket="branding"
          folder="logo"
        />

        <ImageUploadCard
          title="Logo Mobile"
          description="Logo yang tampil di navbar mode mobile"
          currentImage={settings?.logo_mobile_url || null}
          defaultImage={defaultLogo.src}
          aspectRatio="aspect-square max-h-48"
          recommendedSize="100x100 px (1:1)"
          onUpload={url => handleImageUpdate('logo_mobile_url', url)}
          uploading={logoMobileUploading}
          setUploading={setLogoMobileUploading}
          bucket="branding"
          folder="logo-mobile"
        />

        <ImageUploadCard
          title="Logo Footer"
          description="Logo khusus yang tampil di area footer bawah"
          currentImage={settings?.footer_logo_url || null}
          defaultImage={defaultLogo.src}
          aspectRatio="aspect-square max-h-48"
          recommendedSize="200x200 px (Transparan)"
          onUpload={url => handleImageUpdate('footer_logo_url', url)}
          uploading={footerLogoUploading}
          setUploading={setFooterLogoUploading}
          bucket="branding"
          folder="logo-footer"
        />

        <ImageUploadCard
          title="Favicon (Tab Browser)"
          description="Icon kecil pada tab browser & bookmark"
          currentImage={settings?.favicon_url || null}
          defaultImage={defaultLogo.src}
          aspectRatio="aspect-square max-h-48"
          recommendedSize="64x64 px / 128x128 px (PNG / ICO)"
          onUpload={url => handleImageUpdate('favicon_url', url)}
          uploading={faviconUploading}
          setUploading={setFaviconUploading}
          bucket="branding"
          folder="favicon"
        />

        <div className="lg:col-span-3 bg-white/60 backdrop-blur-xl rounded-[1.5rem] border border-white/80 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ImageUploadCard
                title="Logo Loading"
                description="Logo animasi yang tampil saat halaman sedang dimuat"
                currentImage={settings?.loading_logo_url || null}
                defaultImage={defaultLogo.src}
                aspectRatio="aspect-square max-h-48"
                recommendedSize="150x150 px (1:1, GIF/PNG transparan)"
                onUpload={url => handleImageUpdate('loading_logo_url', url)}
                uploading={loadingLogoUploading}
                setUploading={setLoadingLogoUploading}
                bucket="branding"
                folder="loading-logo"
              />
            </div>

            <div className="flex flex-col bg-slate-50/50 rounded-[1.5rem] p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <AppIcon icon="Eye" className="w-4 h-4 text-green-500" />
                </div>
                <h3 className="font-bold text-lg text-slate-800">Preview Animasi</h3>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-6">
                Tampilan animasi loading saat halaman dimuat
              </p>
              <div className="flex-1 bg-white rounded-xl border border-slate-200 min-h-[200px] flex items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                <LoadingScreen size="md" message="Memuat halaman..." />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <ImageUploadCard
            title="Hero Banner (Fallback)"
            description="Gambar latar belakang default di halaman utama"
            currentImage={settings?.hero_image_url || null}
            defaultImage={defaultHero.src}
            aspectRatio="aspect-video max-h-64"
            recommendedSize="1920x1080 px (16:9)"
            onUpload={url => handleImageUpdate('hero_image_url', url)}
            uploading={heroUploading}
            setUploading={setHeroUploading}
            bucket="branding"
            folder="hero"
          />
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Pengaturan Footer & Kontak</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Kelola teks deskripsi dan informasi kontak pada footer</p>
          </div>
          <button 
            onClick={handleSaveFooter} 
            disabled={savingFooter} 
            className="h-11 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {savingFooter ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : <AppIcon icon="Save" className="w-4 h-4" />}
            {savingFooter ? 'Menyimpan...' : 'Simpan Footer'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Deskripsi (ID & EN)</h4>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">Bahasa Indonesia</Label>
              <textarea
                value={footerDescriptionId}
                onChange={e => setFooterDescriptionId(e.target.value)}
                placeholder="Pusat konservasi kelas dunia..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-slate-700 h-24 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">Bahasa Inggris (English)</Label>
              <textarea
                value={footerDescriptionEn}
                onChange={e => setFooterDescriptionEn(e.target.value)}
                placeholder="A world-class conservation center..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-slate-700 h-24 resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Informasi Kontak</h4>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">Alamat Lengkap</Label>
              <textarea
                value={contactAddress}
                onChange={e => setContactAddress(e.target.value)}
                placeholder="Jl. Harsono RM No. 1, Ragunan..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-slate-700 h-20 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">Nomor Telepon</Label>
              <Input
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="(021) 7884 7114"
                className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600">Alamat Email</Label>
              <Input
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="info@ragunanzoo.jakarta.go.id"
                className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium"
              />
            </div>
            
            <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mt-6 pt-4 border-t border-slate-100">Sosial Media</h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Instagram</Label>
                <Input
                  value={socialInstagram}
                  onChange={e => setSocialInstagram(e.target.value)}
                  placeholder="https://instagram.com/ragunanzoo"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Facebook</Label>
                <Input
                  value={socialFacebook}
                  onChange={e => setSocialFacebook(e.target.value)}
                  placeholder="https://facebook.com/ragunanzoo"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">Twitter / X</Label>
                <Input
                  value={socialTwitter}
                  onChange={e => setSocialTwitter(e.target.value)}
                  placeholder="https://twitter.com/ragunanzoo"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">YouTube</Label>
                <Input
                  value={socialYoutube}
                  onChange={e => setSocialYoutube(e.target.value)}
                  placeholder="https://youtube.com/@ragunanzoo"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-600">TikTok</Label>
                <Input
                  value={socialTiktok}
                  onChange={e => setSocialTiktok(e.target.value)}
                  placeholder="https://tiktok.com/@ragunanzoo"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
        <p className="text-sm font-medium text-amber-800">
          <strong>Catatan:</strong> Perubahan gambar akan langsung diterapkan di halaman pengunjung. 
          Anda mungkin perlu melakukan refresh (Ctrl+R / Cmd+R) untuk melihat perubahannya jika browser masih menggunakan cache.
        </p>
      </div>
    </div>
  );
}
