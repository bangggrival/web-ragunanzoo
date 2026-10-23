"use client";

import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Upload, Trash2, Search, Grid3X3, List, 
  Edit2, X, Save, Loader2, Copy, Check, FolderOpen,
  Filter
} from 'lucide-react';
import { MediaItem, MEDIA_CATEGORIES } from '@/hooks/useMediaGallery';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { deleteMediaAction, updateMediaAction } from './actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ManageGalleryClientProps {
  initialMedia: MediaItem[];
}

export default function ManageGalleryClient() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('media_gallery').select('*').order('created_at', { ascending: false });
        if (data) setMedia(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'media_gallery') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const filteredMedia = media.filter(item => 
    item.original_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  ).filter(item => selectedCategory === 'all' ? true : item.category === selectedCategory);

  const uploadMediaClient = async (file: File, options?: { category?: string }) => {
    try {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung');


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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      await uploadMediaClient(file, { 
        category: selectedCategory === 'all' ? 'general' : selectedCategory 
      });
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const result = await deleteMediaAction(deleteItem.id, deleteItem.filename);
      if (!result.success) {
        toast.error('Gagal menghapus file: ' + result.error);
      } else {
        toast.success('File berhasil dihapus');
        setMedia(prev => prev.filter(m => m.id !== deleteItem.id));
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setDeleteItem(null);
    }
  };

  const handleUpdate = async (updates: { alt_text?: string; category?: string; tags?: string[] }) => {
    if (!editingItem) return;
    try {
      const result = await updateMediaAction(editingItem.id, updates);
      if (!result.success) {
        toast.error('Gagal memperbarui data: ' + result.error);
      } else {
        toast.success('Data berhasil diperbarui');
        setMedia(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...updates } : m));
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setEditingItem(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL berhasil disalin');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
        return;
      }

      const ext = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}-${randomStr}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media-gallery')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media-gallery')
        .getPublicUrl(uploadData.path);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: mediaData, error: dbError } = await supabase
        .from('media_gallery')
        .insert({
          filename: uploadData.path, // save the server-generated filename/path
          original_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          alt_text: null,
          category: options?.category || 'general',
          tags: [],
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('File berhasil diupload');
      setMedia(prev => [mediaData as MediaItem, ...prev]);
    } catch (error: any) {
      toast.error('Gagal mengupload file: ' + error.message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      await uploadMediaClient(file, { 
        category: selectedCategory === 'all' ? 'general' : selectedCategory 
      });
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const result = await deleteMediaAction(deleteItem.id, deleteItem.filename);
      if (!result.success) {
        toast.error('Gagal menghapus file: ' + result.error);
      } else {
        toast.success('File berhasil dihapus');
        setMedia(prev => prev.filter(m => m.id !== deleteItem.id));
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setDeleteItem(null);
    }
  };

  const handleUpdate = async (updates: { alt_text?: string; category?: string; tags?: string[] }) => {
    if (!editingItem) return;
    try {
      const result = await updateMediaAction(editingItem.id, updates);
      if (!result.success) {
        toast.error('Gagal memperbarui data: ' + result.error);
      } else {
        toast.success('Data berhasil diperbarui');
        setMedia(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...updates } : m));
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setEditingItem(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL berhasil disalin');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <FolderOpen className="w-5 h-5 text-green-500" />
            </div>
            Galeri Media
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola semua gambar yang digunakan di website</p>
        </div>
        <label className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-all duration-300 font-semibold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span>Upload Gambar</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card p-5">
          <p className="text-3xl font-black text-green-500">{media.length}</p>
          <p className="text-sm font-semibold text-slate-500 mt-1">Total Gambar</p>
        </div>
        {MEDIA_CATEGORIES.slice(0, 3).map(cat => (
          <div key={cat.value} className="stat-card p-5">
            <p className="text-3xl font-black text-slate-800">
              {media.filter(m => m.category === cat.value).length}
            </p>
            <p className="text-sm font-semibold text-slate-500 mt-1">{cat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 p-2 bg-white/60 backdrop-blur-xl rounded-[1.5rem] border border-white/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
        <div className="relative flex-1 min-w-[200px] ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari gambar..."
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-slate-400 font-medium text-slate-700"
          />
        </div>

        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2 pr-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="all">Semua Kategori</option>
            {MEDIA_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl mr-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="text-center py-20 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2rem]">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
            <ImageIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada gambar</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload gambar untuk mulai mengisi galeri media. Mendukung JPG, PNG, WEBP, GIF, dan SVG.</p>
          <label className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-slate-700 transition-all font-semibold shadow-lg shadow-slate-800/20">
            <Upload className="w-4 h-4" />
            <span>Upload Sekarang</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filteredMedia.map(item => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-100 border border-slate-200 hover:border-green-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={item.file_url}
                alt={item.alt_text || item.original_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-bold truncate mb-3 drop-shadow-md">
                    {item.original_name}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyUrl(item.file_url)}
                      className="flex-1 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg transition-colors flex items-center justify-center"
                      title="Salin URL"
                    >
                      {copiedUrl === item.file_url ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="flex-1 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg transition-colors flex items-center justify-center"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="flex-1 py-1.5 bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md rounded-lg transition-colors flex items-center justify-center"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase rounded-full border border-white/20">
                  {MEDIA_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="manager-table-shell">
          <div className="hidden md:block manager-table-scroll">
            <table className="manager-table">
              <thead className="manager-table-head">
              <tr>
                <th className="manager-table-th rounded-tl-[1rem]">Gambar</th>
                <th className="manager-table-th">Nama</th>
                <th className="manager-table-th">Kategori</th>
                <th className="manager-table-th">Ukuran</th>
                <th className="manager-table-th">Tanggal</th>
                <th className="manager-table-th manager-table-th-right rounded-tr-[1rem]">Aksi</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {filteredMedia.map(item => (
                <tr key={item.id} className="manager-table-row">
                  <td className="manager-table-td">
                    <img
                      src={item.file_url}
                      alt={item.alt_text || item.original_name}
                      className="w-14 h-14 object-cover rounded-xl shadow-sm border border-slate-200/60"
                      loading="lazy"
                    />
                  </td>
                  <td className="manager-table-td">
                    <p className="font-bold text-sm text-slate-800 truncate max-w-[200px]">{item.original_name}</p>
                    {item.alt_text && (
                      <p className="text-xs font-medium text-slate-500 truncate max-w-[200px] mt-0.5">{item.alt_text}</p>
                    )}
                  </td>
                  <td className="manager-table-td">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                      {MEDIA_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                    </span>
                  </td>
                  <td className="manager-table-td text-sm font-medium text-slate-500">
                    {formatFileSize(item.file_size)}
                  </td>
                  <td className="manager-table-td text-sm font-medium text-slate-500">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="manager-table-td manager-table-td-right">
                    <div className="manager-table-actions justify-end">
                      <button
                        onClick={() => handleCopyUrl(item.file_url)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Salin URL"
                      >
                        {copiedUrl === item.file_url ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Fallback View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredMedia.map(item => (
              <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-4">
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.original_name}
                    className="w-20 h-20 object-cover rounded-xl shadow-sm border border-slate-200/60 flex-shrink-0"
                    loading="lazy"
                  />
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-800 line-clamp-2">{item.original_name}</p>
                      {item.alt_text && (
                        <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{item.alt_text}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200">
                        {MEDIA_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {formatFileSize(item.file_size)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/80">
                  <span className="text-xs font-medium text-slate-500">{formatDate(item.created_at)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyUrl(item.file_url)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                      title="Salin URL"
                    >
                      {copiedUrl === item.file_url ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      Salin
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingItem && (
        <EditMediaModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdate}
        />
      )}

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="rounded-[2rem] p-6 border-white/60 bg-white/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">Hapus Gambar?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Gambar "{deleteItem?.original_name}" akan dihapus permanen dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditMediaModal({ 
  item, 
  onClose, 
  onSave 
}: { 
  item: MediaItem; 
  onClose: () => void;
  onSave: (updates: { alt_text?: string; category?: string; tags?: string[] }) => Promise<void>;
}) {
  const [altText, setAltText] = useState(item.alt_text || '');
  const [category, setCategory] = useState(item.category);
  const [tagsInput, setTagsInput] = useState(item.tags?.join(', ') || '');
  const [saving, setSaving] = useState(false);


  const handleSave = async () => {
    setSaving(true);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    await onSave({ alt_text: altText, category, tags });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-white/20">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Edit Detail Gambar</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img src={item.file_url} alt={item.alt_text || item.original_name} className="w-full h-full object-contain" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama File</label>
            <p className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{item.original_name}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Alt Text (SEO)</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Deskripsi gambar untuk SEO"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-sm cursor-pointer"
            >
              {MEDIA_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tags (pisahkan dengan koma)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="harimau, satwa, langka"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-[2rem]">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors">
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold shadow-lg shadow-green-600/20 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
