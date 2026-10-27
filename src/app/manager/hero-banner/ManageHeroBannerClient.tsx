"use client";

import { useState, useRef, useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { HeroBanner } from '@/hooks/useHeroBanner';
import { SiteSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  deleteHeroBannerAction,
  setActiveHeroBannerAction,
  upsertHeroBannerAction,
  updateSiteSettingsAction
} from './actions';



export default function ManageHeroBannerClient() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [savingDuration, setSavingDuration] = useState(false);
  const [autoplayDuration, setAutoplayDuration] = useState(6000);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: bannersData } = await supabase.from('hero_banner').select('*').order('created_at', { ascending: false });
        if (bannersData) setBanners(bannersData as any);
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
      if (e.detail?.table === 'hero_banner') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);

  useEffect(() => {
    if (settings?.carousel_autoplay_duration) {
      setAutoplayDuration(settings.carousel_autoplay_duration);
    }
  }, [settings]);

  const handleAdd = () => {
    setSelectedBanner(null);
    setShowModal(true);
  };

  const handleEdit = (item: HeroBanner) => {
    setSelectedBanner(item);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const result = await deleteHeroBannerAction(deleteId);
      if (!result.success) throw new Error(result.error);
      toast.success('Hero banner berhasil dihapus');
      setBanners(prev => prev.filter(b => b.id !== deleteId));
    } catch (err: any) {
      toast.error('Gagal menghapus: ' + err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      const result = await setActiveHeroBannerAction(id);
      if (!result.success) throw new Error(result.error);
      toast.success('Hero banner berhasil diaktifkan');
      setBanners(prev => prev.map(b => ({ ...b, is_active: b.id === id })));
    } catch (err: any) {
      toast.error('Gagal mengaktifkan: ' + err.message);
    }
  };

  const activeBanner = banners.find(b => b.is_active);

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
    <div className="animate-fade-in space-y-6 relative min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="ImageIcon" className="w-5 h-5 text-green-500" />
            </div>
            Hero Banner
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola banner dan video untuk halaman utama website</p>
        </div>
        <button onClick={handleAdd} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5">
          <AppIcon icon="Plus" className="w-5 h-5" />
          Tambah Banner
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <AppIcon icon="Image" className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Banner</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{banners.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <AppIcon icon="Star" className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banner Aktif</span>
          </div>
          <p className="text-3xl font-black text-green-500">{activeBanner ? 1 : 0}</p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <AppIcon icon="Timer" className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Durasi Autoplay Carousel</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Atur berapa lama setiap slide ditampilkan sebelum berganti (2-15 detik)</p>
          </div>
        </div>
        
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center gap-6">
            <Slider
              value={[autoplayDuration]}
              onValueChange={([value]) => setAutoplayDuration(value)}
              min={2000}
              max={15000}
              step={500}
              className="flex-1"
            />
            <div className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl text-sm border border-blue-100 min-w-[100px] text-center">
              {(autoplayDuration / 1000).toFixed(1)} detik
            </div>
          </div>
          <button 
            onClick={async () => {
              setSavingDuration(true);
              try {
                const result = await updateSiteSettingsAction({ carousel_autoplay_duration: autoplayDuration });
                if (!result.success) throw new Error(result.error);
                toast.success('Durasi autoplay berhasil disimpan');
              } catch (error: any) {
                toast.error('Gagal menyimpan durasi: ' + error.message);
              } finally {
                setSavingDuration(false);
              }
            }}
            disabled={savingDuration}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            {savingDuration ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : null}
            {savingDuration ? 'Menyimpan...' : 'Simpan Durasi'}
          </button>
        </div>
      </div>

      {activeBanner && (
        <div className="bg-gradient-to-r from-green-50/80 to-green-50/80 rounded-[1.5rem] p-6 border border-green-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <AppIcon icon="Star" className="w-32 h-32 text-green-500 fill-green-500" />
          </div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center border border-green-200">
              <AppIcon icon="Star" className="w-4 h-4 text-green-600 fill-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Banner Utama Aktif</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang tayang di beranda pengunjung</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 relative z-10">
            <div className="w-full md:w-80 h-44 rounded-xl overflow-hidden border border-white shadow-md flex-shrink-0 bg-slate-100">
              {activeBanner.media_type === 'video' ? (
                <video src={activeBanner.video_url || ''} className="w-full h-full object-cover" muted loop autoPlay />
              ) : activeBanner.image_url ? (
                <img src={activeBanner.image_url} alt="Active Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <AppIcon icon="Image" className="w-10 h-10 text-slate-300" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/60 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 shadow-sm backdrop-blur-sm">
                {activeBanner.media_type === 'video' ? <AppIcon icon="Video" className="w-3.5 h-3.5" /> : <AppIcon icon="ImageIcon" className="w-3.5 h-3.5" />}
                {activeBanner.media_type === 'video' ? 'Video' : 'Gambar'}
              </span>
              <div>
                <h3 className="font-black text-2xl text-slate-800 leading-tight">{activeBanner.title_id || activeBanner.title}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{activeBanner.subtitle_id || activeBanner.subtitle}</p>
              </div>
              {activeBanner.description_id && (
                <p className="text-sm text-slate-600 line-clamp-2 bg-white/40 p-3 rounded-lg border border-white/60">{activeBanner.description_id}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-12 text-center rounded-[2rem] shadow-sm">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
            <AppIcon icon="Image" className="w-10 h-10 text-green-300" />
          </div>
          <h3 className="font-bold text-xl text-slate-800 mb-2">Belum ada hero banner</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">Tambahkan banner atau video pertama Anda untuk ditampilkan di halaman utama website.</p>
          <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 inline-flex items-center gap-2 transition-all">
            <AppIcon icon="Plus" className="w-5 h-5" />
            Tambah Banner Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map((item) => (
            <div key={item.id} className={`bg-white/60 backdrop-blur-xl rounded-[1.5rem] border overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col ${item.is_active ? 'border-green-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] ring-1 ring-green-500' : 'border-white/80 shadow-sm'}`}>
              <div className="relative h-48 bg-slate-100">
                {item.media_type === 'video' ? (
                  <div className="w-full h-full relative group">
                    <video src={item.video_url || ''} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <AppIcon icon="Video" className="w-12 h-12 text-white/70" />
                    </div>
                  </div>
                ) : item.image_url ? (
                  <img src={item.image_url} alt={item.title_id || 'Banner'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <AppIcon icon="Image" className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm backdrop-blur-md ${item.is_active ? 'bg-green-500 text-white border border-green-400' : 'bg-white/80 text-slate-600 border border-slate-200'}`}>
                    {item.is_active ? (
                      <><AppIcon icon="Star" className="w-3.5 h-3.5 fill-white" /> Aktif</>
                    ) : (
                      <><AppIcon icon="StarOff" className="w-3.5 h-3.5" /> Tidak Aktif</>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1 mb-1">{item.title_id || item.title || 'Tanpa Judul'}</h3>
                  <p className="text-sm font-medium text-slate-500 line-clamp-1 mb-3">{item.subtitle_id || item.subtitle || 'Tanpa subtitle'}</p>
                  
                  {item.link_url && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 inline-block truncate max-w-full">
                      <AppIcon icon="Link" className="w-3 h-3 inline mr-1" />
                      {item.link_url}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                  {!item.is_active && (
                    <button onClick={() => handleSetActive(item.id)} className="flex-1 h-10 text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                      <AppIcon icon="Star" className="w-4 h-4" /> Aktifkan
                    </button>
                  )}
                  <button onClick={() => handleEdit(item)} className={`${item.is_active ? 'flex-1' : 'px-4'} h-10 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors`}>
                    <AppIcon icon="Edit2" className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => setDeleteId(item.id)} className="w-10 h-10 text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl flex items-center justify-center transition-colors">
                    <AppIcon icon="Trash2" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <HeroBannerFormModalClient
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          banner={selectedBanner}
          onSuccess={(newBanner) => {
            if (selectedBanner) {
              setBanners(prev => prev.map(b => b.id === newBanner.id ? { ...b, ...newBanner } : b));
            } else {
              setBanners(prev => [newBanner, ...prev]);
            }
          }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem] p-6 border-white/60 bg-white/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">Hapus Banner?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">Tindakan ini tidak dapat dibatalkan. Data banner ini akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const initialFormData = {
  title_id: '',
  title_en: '',
  subtitle_id: '',
  subtitle_en: '',
  description_id: '',
  description_en: '',
  link_url: '',
  image_url: '',
  video_url: '',
  media_type: 'image' as 'image' | 'video',
  is_active: false
};

function HeroBannerFormModalClient({ isOpen, onClose, banner, onSuccess }: any) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (banner) {
      setFormData({
        title_id: banner.title_id || banner.title || '',
        title_en: banner.title_en || '',
        subtitle_id: banner.subtitle_id || banner.subtitle || '',
        subtitle_en: banner.subtitle_en || '',
        description_id: banner.description_id || '',
        description_en: banner.description_en || '',
        link_url: banner.link_url || '',
        image_url: banner.image_url || '',
        video_url: banner.video_url || '',
        media_type: (banner.media_type as 'image' | 'video') || 'image',
        is_active: banner.is_active || false
      });
    } else {
      setFormData(initialFormData);
    }
  }, [banner, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `hero-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { data, error } = await supabase.storage.from('hero-images').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from('hero-images').getPublicUrl(data.path);
      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success('Gambar berhasil diupload');
    } catch (err: any) {
      toast.error('Gagal upload gambar: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran video maksimal 50MB');
      return;
    }

    setUploading(true);
    const fileName = `hero-video-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { data, error } = await supabase.storage.from('hero-images').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('hero-images').getPublicUrl(data.path);
      setFormData(prev => ({ ...prev, video_url: urlData.publicUrl }));
      toast.success('Video berhasil diupload');
    } catch (err: any) {
      toast.error('Gagal upload video: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_id.trim()) {
      toast.error('Judul (Indonesia) wajib diisi');
      return;
    }

    setLoading(true);
    
    const payload = {
      id: banner?.id,
      title: formData.title_id,
      title_id: formData.title_id,
      title_en: formData.title_en || null,
      subtitle: formData.subtitle_id || null,
      subtitle_id: formData.subtitle_id || null,
      subtitle_en: formData.subtitle_en || null,
      description_id: formData.description_id || null,
      description_en: formData.description_en || null,
      link_url: formData.link_url || null,
      image_url: formData.image_url || null,
      video_url: formData.video_url || null,
      media_type: formData.media_type,
      is_active: formData.is_active
    };

    try {
      const result = await upsertHeroBannerAction(payload);
      if (!result.success) throw new Error(result.error);
      
      onSuccess({ ...payload, id: banner?.id || Date.now() });
      onClose();
      toast.success(banner ? 'Banner diperbarui' : 'Banner ditambahkan');
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-white/40 rounded-[2rem] p-0">
        <DialogHeader className="p-6 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="ImageIcon" className="w-5 h-5 text-green-500" />
            </div>
            {banner ? 'Edit Hero Banner' : 'Tambah Hero Banner'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">Lengkapi detail banner untuk halaman utama website.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><AppIcon icon="ImageIcon" className="w-4 h-4 text-slate-400" /> Tipe Media</h3>
            <RadioGroup value={formData.media_type} onValueChange={(value: 'image' | 'video') => setFormData(prev => ({ ...prev, media_type: value }))} className="flex gap-4">
              <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                <RadioGroupItem value="image" id="media-image" />
                <label htmlFor="media-image" className="cursor-pointer font-bold text-sm text-slate-700 flex items-center gap-1.5"><AppIcon icon="ImageIcon" className="w-4 h-4 text-slate-500" /> Gambar</label>
              </div>
              <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                <RadioGroupItem value="video" id="media-video" />
                <label htmlFor="media-video" className="cursor-pointer font-bold text-sm text-slate-700 flex items-center gap-1.5"><AppIcon icon="Video" className="w-4 h-4 text-slate-500" /> Video</label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><AppIcon icon="Upload" className="w-4 h-4 text-slate-400" /> File Banner</h3>
            {formData.media_type === 'image' ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {formData.image_url ? (
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-colors">
                      <AppIcon icon="X" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-50/50 transition-all group">
                    {uploading ? <AppIcon icon="Loader2" className="w-6 h-6 animate-spin text-green-500" /> : (
                      <>
                        <AppIcon icon="Upload" className="w-6 h-6 text-slate-400 group-hover:text-green-500" />
                        <span className="text-sm font-bold text-slate-600">Klik untuk upload gambar (1920x600)</span>
                      </>
                    )}
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                {formData.video_url ? (
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <video src={formData.video_url} className="w-full h-40 object-cover" controls muted />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))} className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-colors">
                      <AppIcon icon="X" className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploading} className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-50/50 transition-all group">
                    {uploading ? <AppIcon icon="Loader2" className="w-6 h-6 animate-spin text-green-500" /> : (
                      <>
                        <AppIcon icon="Video" className="w-6 h-6 text-slate-400 group-hover:text-green-500" />
                        <span className="text-sm font-bold text-slate-600">Klik untuk upload MP4 (Max 50MB)</span>
                      </>
                    )}
                  </button>
                )}
                <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/ogg" onChange={handleVideoUpload} className="hidden" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-3">Video akan diputar otomatis tanpa suara.</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><AppIcon icon="Globe" className="w-4 h-4 text-slate-400" /> Konten Multibahasa</h3>
            <Tabs defaultValue="id" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl mb-3">
                <TabsTrigger value="id" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-bold text-xs">Indonesia</TabsTrigger>
                <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-bold text-xs">English</TabsTrigger>
              </TabsList>
              <TabsContent value="id" className="space-y-3 mt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Judul (ID) *</label>
                  <input type="text" value={formData.title_id} onChange={e => setFormData(prev => ({ ...prev, title_id: e.target.value }))} placeholder="Judul Banner..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subtitle (ID)</label>
                  <input type="text" value={formData.subtitle_id} onChange={e => setFormData(prev => ({ ...prev, subtitle_id: e.target.value }))} placeholder="Subtitle Banner..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deskripsi (ID)</label>
                  <textarea value={formData.description_id} onChange={e => setFormData(prev => ({ ...prev, description_id: e.target.value }))} rows={3} placeholder="Deskripsi..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm leading-relaxed" />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-3 mt-0">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Title (EN)</label>
                  <input type="text" value={formData.title_en} onChange={e => setFormData(prev => ({ ...prev, title_en: e.target.value }))} placeholder="Banner Title..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subtitle (EN)</label>
                  <input type="text" value={formData.subtitle_en} onChange={e => setFormData(prev => ({ ...prev, subtitle_en: e.target.value }))} placeholder="Banner Subtitle..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description (EN)</label>
                  <textarea value={formData.description_en} onChange={e => setFormData(prev => ({ ...prev, description_en: e.target.value }))} rows={3} placeholder="Description..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm leading-relaxed" />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><AppIcon icon="Link" className="w-4 h-4 text-slate-400" /> Tautan</h3>
            <input type="text" value={formData.link_url} onChange={e => setFormData(prev => ({ ...prev, link_url: e.target.value }))} placeholder="https://..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm mt-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Banner akan bisa diklik jika tautan diisi.</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl mt-4">
            <div className="flex items-center gap-3">
              <AppIcon icon="Star" className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-bold text-slate-800 text-sm">Aktifkan Banner</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Banner ini akan langsung tayang di halaman utama</p>
              </div>
            </div>
            <Switch checked={formData.is_active} onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))} className="data-[state=checked]:bg-green-500" />
          </div>
        </form>

        <DialogFooter className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-[2rem]">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={loading || !formData.title_id.trim()} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold shadow-lg shadow-green-600/20 transition-all">
            {loading ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : null}
            {banner ? 'Simpan Perubahan' : 'Tambah Banner'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
