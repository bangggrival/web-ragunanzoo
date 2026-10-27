"use client";

import { useState, useRef, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { AppIcon } from '@/components/ui/AppIcon';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateMapUrlAction } from './actions';

interface ManageMapClientProps {
  initialMapUrl: string | null;
}

export default function ManageMapClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [uploading, setUploading] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('site_settings').select('zoo_map_image_url').single();
        if (data) setMapUrl(data.zoo_map_image_url);
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
  }
  , []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    const fileName = `map-${Date.now()}.${file.name.split('.').pop()}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('map-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('map-images')
        .getPublicUrl(data.path);
      
      const result = await updateMapUrlAction(urlData.publicUrl);
      
      if (!result.success) throw new Error(result.error);

      setMapUrl(urlData.publicUrl);
      toast.success('Peta berhasil diupload');
    } catch (error: any) {
      toast.error('Gagal upload gambar: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteMap = async () => {
    if (!(await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus peta ini?'))) return;

    try {
      const result = await updateMapUrlAction(null);
      if (!result.success) throw new Error(result.error);
      
      setMapUrl(null);
      toast.success('Peta berhasil dihapus');
    } catch (error: any) {
      toast.error('Gagal menghapus peta: ' + error.message);
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
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="Map" className="w-5 h-5 text-green-500" />
            </div>
            Upload Peta
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola gambar peta kebun binatang</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-[1.5rem] p-5 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center border border-white/80 shadow-sm flex-shrink-0 mt-0.5">
            <AppIcon icon="Map" className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">Tentang Peta</h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              Upload gambar peta kebun binatang yang akan ditampilkan di halaman Explorer. 
              Gunakan gambar dengan resolusi tinggi dan format JPG/PNG untuk hasil terbaik.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-5">Gambar Peta Saat Ini</h2>
        
        {mapUrl ? (
          <div className="space-y-5">
            <div className="relative bg-slate-100 rounded-[1.5rem] overflow-hidden border border-slate-200">
              <img 
                src={mapUrl} 
                alt="Peta Ragunan"
                className="w-full max-h-[500px] object-contain bg-grid-slate-200/[0.04]"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-md text-slate-700 font-bold text-sm rounded-xl hover:bg-white transition-colors shadow-sm disabled:opacity-50"
                >
                  {uploading ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : <AppIcon icon="Upload" className="w-4 h-4" />}
                  Ganti
                </button>
                <button 
                  onClick={handleDeleteMap}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/90 backdrop-blur-md text-white font-bold text-sm rounded-xl hover:bg-rose-500 transition-colors shadow-sm"
                >
                  <AppIcon icon="Trash2" className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-100 w-fit">
              <AppIcon icon="Check" className="w-4 h-4" />
              <span>Peta aktif dan tampil di halaman Explorer</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-72 border-2 border-dashed border-slate-300 rounded-[1.5rem] flex flex-col items-center justify-center gap-4 hover:border-green-500 hover:bg-green-50/50 transition-all group disabled:opacity-50"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300">
              {uploading ? <AppIcon icon="Loader2" className="w-8 h-8 text-green-500 animate-spin" /> : <AppIcon icon="Map" className="w-8 h-8 text-slate-400 group-hover:text-green-500" />}
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-700 text-lg">
                {uploading ? 'Mengupload...' : 'Klik untuk upload gambar peta'}
              </p>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Format: JPG, PNG, WebP (Maks. 10MB)
              </p>
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6">
        <h3 className="font-bold text-slate-800 mb-4">Tips Upload Peta</h3>
        <ul className="space-y-3 text-sm font-medium text-slate-600">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>Gunakan gambar dengan resolusi minimal <strong>1920x1080 piksel</strong> untuk tampilan optimal</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>Pastikan legenda peta mudah dibaca dan kontras dengan background</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <span>Tandai zona-zona penting dengan warna yang berbeda</span>
          </li>
        </ul>
      </div>
    {ConfirmComponent}
    </div>
  );
}
