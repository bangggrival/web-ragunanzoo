"use client";

import { useState, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { Newspaper, Plus, Edit2, Trash2, X, Eye, EyeOff, Globe, Loader2 } from 'lucide-react';
import { News } from '@/hooks/useNews';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageInputWithGallery from '@/components/gallery/ImageInputWithGallery';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { deleteNewsAction, saveNewsAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

interface ManageNewsClientProps {
  initialNews: News[];
}

export default function ManageNewsClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [news, setNews] = useState<News[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    title_id: '',
    title_en: '',
    description: '',
    description_id: '',
    description_en: '',
    image_url: '',
    is_published: true
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
        if (data) setNews(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'news') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);


  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(news, 9);

  const resetForm = () => {
    setFormData({ 
      title: '', 
      title_id: '',
      title_en: '',
      description: '', 
      description_id: '',
      description_en: '',
      image_url: '', 
      is_published: true 
    });
    setSelectedNews(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: News) => {
    setSelectedNews(item);
    setFormData({
      title: item.title,
      title_id: item.title_id || item.title,
      title_en: item.title_en || '',
      description: item.description || '',
      description_id: item.description_id || item.description || '',
      description_en: item.description_en || '',
      image_url: item.image_url || '',
      is_published: item.is_published
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if ((await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus berita ini?'))) {
      try {
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) {
          toast.error('Gagal menghapus: ' + error.message);
        } else {
          toast.success('Berita berhasil dihapus');
          setNews(prev => prev.filter(n => n.id !== id));
        }
      } catch (error) {
        toast.error('Terjadi kesalahan sistem');
      }
    }
  };

  const handleTogglePublish = async (id: number, is_published: boolean) => {
    setNews(prev => prev.map(item => item.id === id ? { ...item, is_published } : item));
    try {
      const { error } = await supabase.from('news').update({ is_published }).eq('id', id);
      if (error) throw error;
      toast.success('Status tampil diperbarui');
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
      setNews(prev => prev.map(item => item.id === id ? { ...item, is_published: !is_published } : item));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.title_id.trim()) {
      toast.error('Judul berita (Indonesia) wajib diisi');
      return;
    }

    setSaving(true);
    
    const payload = {
      title: formData.title_id,
      title_id: formData.title_id,
      title_en: formData.title_en || null,
      description: formData.description_id || null,
      description_id: formData.description_id || null,
      description_en: formData.description_en || null,
      image_url: formData.image_url || null,
      is_published: formData.is_published
    };

    try {
      let error;
      if (selectedNews?.id) {
        ({ error } = await supabase.from('news').update(payload).eq('id', selectedNews.id));
      } else {
        ({ error } = await supabase.from('news').insert(payload));
      }

      if (error) {
        toast.error('Gagal menyimpan: ' + error.message);
      } else {
        toast.success(selectedNews ? 'Berita berhasil diperbarui' : 'Berita berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        // Refresh list
        const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
        if (data) setNews(data as any);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setSaving(false);
    }
  };
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Berita Terbaru</h1>
          <p className="text-slate-500 font-medium mt-1">Kelola berita dan pengumuman untuk pengunjung</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-[0_2px_15px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Tambah Berita
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Berita</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{news.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Dipublikasikan</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{news.filter(n => n.is_published).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedItems.map((item) => (
          <div key={item.id} className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[1.5rem] overflow-hidden hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 group flex flex-col">
            {item.image_url ? (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            ) : (
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                <Newspaper className="w-12 h-12 text-slate-300" />
              </div>
            )}
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <Switch
                  checked={item.is_published !== false}
                  onCheckedChange={(checked) => handleTogglePublish(item.id, checked)}
                  className="data-[state=checked]:bg-green-500 scale-90 origin-left"
                />
                <span className="text-xs font-medium text-slate-400">
                  {formatDate(item.created_at)}
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 leading-tight">{item.title}</h3>
              <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-4 flex-1">
                {item.description}
              </p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
                <button 
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalItems > 9 && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[1.5rem] border border-white/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[9, 18, 27, 36]}
          />
        </div>
      )}

      {news.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2rem]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Newspaper className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Belum ada berita</h3>
          <p className="text-slate-500 mt-1 mb-6">Mulai tambahkan berita untuk pengunjung kebun binatang.</p>
          <button onClick={handleAdd} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-green-500/20 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Berita
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal w-full max-w-lg sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden bg-white/95 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl border border-white/60">
            <div className="manager-modal-header shrink-0 bg-transparent border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between">
              <div className="manager-modal-title flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100 flex-shrink-0">
                  <Newspaper className="w-5 h-5 text-green-500" />
                </div>
                <span className="font-bold text-slate-800 text-base sm:text-lg">{selectedNews ? 'Edit Berita' : 'Tambah Berita Baru'}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="manager-modal-body flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              <div className="manager-form-section bg-transparent border-none p-0 shadow-none">
                <p className="manager-form-section-title flex items-center gap-2 border-none pb-2 text-sm text-slate-600 font-semibold">
                  <Globe className="w-4 h-4 text-green-600" />
                  Konten Multibahasa
                </p>
                
                <Tabs defaultValue="id" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="id" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-semibold text-xs sm:text-sm">
                      🇮🇩 Indonesia
                    </TabsTrigger>
                    <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-semibold text-xs sm:text-sm">
                      🇬🇧 English
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="id" className="space-y-4 mt-0">
                    <div>
                      <label className="manager-input-label text-xs sm:text-sm font-semibold">Judul Berita (Indonesia) *</label>
                      <input
                        type="text"
                        value={formData.title_id}
                        onChange={e => setFormData(prev => ({ ...prev, title_id: e.target.value }))}
                        placeholder="Masukkan judul berita"
                        className="manager-input text-sm"
                      />
                    </div>
                    <div>
                      <label className="manager-input-label text-xs sm:text-sm font-semibold">Deskripsi (Indonesia)</label>
                      <textarea
                        value={formData.description_id}
                        onChange={e => setFormData(prev => ({ ...prev, description_id: e.target.value }))}
                        placeholder="Masukkan deskripsi berita"
                        rows={3}
                        className="manager-textarea text-sm"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="en" className="space-y-4 mt-0">
                    <div>
                      <label className="manager-input-label text-xs sm:text-sm font-semibold">News Title (English)</label>
                      <input
                        type="text"
                        value={formData.title_en}
                        onChange={e => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                        placeholder="Enter news title"
                        className="manager-input text-sm"
                      />
                    </div>
                    <div>
                      <label className="manager-input-label text-xs sm:text-sm font-semibold">Description (English)</label>
                      <textarea
                        value={formData.description_en}
                        onChange={e => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                        placeholder="Enter news description"
                        rows={3}
                        className="manager-textarea text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="manager-form-section bg-transparent border-none p-0 shadow-none">
                <p className="manager-form-section-title border-none pb-2 text-sm text-slate-600 font-semibold">Gambar Berita</p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2">
                  <ImageInputWithGallery
                    value={formData.image_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    category="news"
                    showPreview={true}
                    previewClassName="h-32 rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-[1.25rem] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.is_published ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                    {formData.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Publikasikan</p>
                    <p className="text-xs font-medium text-slate-500">Tampilkan berita di explorer</p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, is_published: checked }))}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>

            <div className="manager-modal-footer shrink-0 bg-slate-50/80 border-t border-slate-100 p-4 sm:p-5 rounded-b-[1.5rem]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="manager-btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !formData.title_id}
                className="manager-btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  selectedNews ? 'Simpan Perubahan' : 'Tambah Berita'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    {ConfirmComponent}
    </div>
  );
}
