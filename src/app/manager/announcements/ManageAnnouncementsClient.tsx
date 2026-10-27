"use client";

import { useState, useRef, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { AppIcon } from '@/components/ui/AppIcon';
import { Announcement } from '@/hooks/useAnnouncements';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { supabase } from '@/integrations/supabase/client';
import { deleteAnnouncementAction, saveAnnouncementAction } from './actions';

export default function ManageAnnouncementsClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    content_id: '',
    content_en: '',
    image_url: '',
    is_active: false
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (data) setAnnouncements(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'announcements') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(announcements, 10);

  const resetForm = () => {
    setFormData({ title_id: '', title_en: '', content_id: '', content_en: '', image_url: '', is_active: false });
    setSelectedAnnouncement(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: Announcement) => {
    setSelectedAnnouncement(item);
    setFormData({
      title_id: item.title_id || item.title || '',
      title_en: item.title_en || '',
      content_id: item.content_id || item.content || '',
      content_en: item.content_en || '',
      image_url: item.image_url || '',
      is_active: item.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if ((await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus pengumuman ini?'))) {
      try {
        const result = await deleteAnnouncementAction(id);
        if (!result.success) {
          toast.error('Gagal menghapus: ' + result.error);
        } else {
          toast.success('Pengumuman berhasil dihapus');
          setAnnouncements(prev => prev.filter(a => a.id !== id));
        }
      } catch (error) {
        toast.error('Terjadi kesalahan sistem');
      }
    }
  };

  const handleToggleActive = async (item: Announcement) => {
    try {
      const payload = { is_active: !item.is_active };
      const result = await saveAnnouncementAction(payload, item.id);
      if (!result.success) {
        toast.error('Gagal mengubah status: ' + result.error);
      } else {
        toast.success(item.is_active ? 'Pengumuman dinonaktifkan' : 'Pengumuman diaktifkan');
        setAnnouncements(prev => prev.map(a => {
          if (a.id === item.id) return { ...a, is_active: !a.is_active };
          if (!item.is_active) return { ...a, is_active: false };
          return a;
        }));
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `announcement-${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error } = await supabase.storage.from('announcement-images').upload(fileName, file, { upsert: true });
    if (error) { 
      toast.error('Gagal upload: ' + error.message); 
      setUploading(false); 
      return; 
    }
    const { data } = supabase.storage.from('announcement-images').getPublicUrl(uploadData.path);
    setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
    toast.success('Gambar berhasil diupload');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.title_id.trim() || !formData.content_id.trim()) {
      toast.error('Judul dan isi (Indonesia) wajib diisi');
      return;
    }
    setSaving(true);
    
    const payload = {
      title: formData.title_id,
      title_id: formData.title_id,
      title_en: formData.title_en || null,
      content: formData.content_id,
      content_id: formData.content_id,
      content_en: formData.content_en || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active
    };

    try {
      const result = await saveAnnouncementAction(payload, selectedAnnouncement?.id);
      if (!result.success) {
        toast.error('Gagal menyimpan: ' + result.error);
      } else {
        toast.success('Pengumuman berhasil disimpan');
        setShowModal(false);
        resetForm();
        window.location.reload();
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setSaving(false);
    }
  };

  const activeAnnouncement = announcements.find(a => a.is_active);

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
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pengumuman</h1>
          <p className="text-slate-500 font-medium mt-1">Kelola popup pengumuman (dua bahasa)</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-[0_2px_15px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(16,185,129,0.5)] hover:-translate-y-0.5"
        >
          <AppIcon icon="Plus" className="w-5 h-5" />
          Tambah Pengumuman
        </button>
      </div>

      {activeAnnouncement && (
        <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 p-5 rounded-[1.5rem] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <AppIcon icon="Bell" className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-bold text-blue-600">Pengumuman Aktif Saat Ini</span>
          </div>
          <div className="flex gap-4 items-center">
            {activeAnnouncement.image_url && (
              <img src={activeAnnouncement.image_url} alt="" className="w-24 h-16 object-cover rounded-xl shadow-sm border border-white/50" />
            )}
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{activeAnnouncement.title_id || activeAnnouncement.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mt-1">{activeAnnouncement.content_id || activeAnnouncement.content}</p>
            </div>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2rem]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <AppIcon icon="Bell" className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Belum ada pengumuman</h3>
          <p className="text-slate-500 mt-1 mb-6">Mulai tambahkan pengumuman baru.</p>
        </div>
      ) : (
        <div className="manager-table-shell">
          <div className="hidden md:block manager-table-scroll">
            <table className="manager-table">
              <thead className="manager-table-head">
                <tr>
                  <th className="manager-table-th rounded-tl-[1rem]">Pengumuman</th>
                  <th className="manager-table-th">Konten</th>
                  <th className="manager-table-th">Status</th>
                  <th className="manager-table-th manager-table-th-right rounded-tr-[1rem]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {paginatedItems.map(item => (
                  <tr key={item.id} className={`manager-table-row ${item.is_active ? 'bg-blue-50/30' : ''}`}>
                    <td className="manager-table-td">
                      <div className="flex items-center gap-4">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-14 h-14 object-cover rounded-xl shadow-sm border border-slate-200/60 flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AppIcon icon="Bell" className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.title_id || item.title}</p>
                          {item.title_en && (
                            <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-0.5">{item.title_en}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="manager-table-td">
                      <p className="text-sm font-medium text-slate-500 line-clamp-2 max-w-xs">{item.content_id || item.content}</p>
                    </td>
                    <td className="manager-table-td">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.is_active ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="manager-table-td manager-table-td-right">
                      <div className="manager-table-actions">
                        <button 
                          onClick={() => handleToggleActive(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                        >
                          {item.is_active ? <AppIcon icon="ToggleRight" className="w-6 h-6 text-blue-500" /> : <AppIcon icon="ToggleLeft" className="w-6 h-6 text-slate-300 hover:text-slate-400" />}
                        </button>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <AppIcon icon="Edit2" className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <AppIcon icon="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {paginatedItems.map(item => (
              <div key={item.id} className={`p-4 hover:bg-slate-50/50 transition-colors ${item.is_active ? 'bg-blue-50/30' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-14 h-14 object-cover rounded-xl shadow-sm border border-slate-200/60 flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AppIcon icon="Bell" className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-slate-800 text-sm truncate">{item.title_id || item.title}</h3>
                        {item.is_active && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] rounded-full font-bold flex-shrink-0">Aktif</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500 line-clamp-2">{item.content_id || item.content}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button onClick={() => handleToggleActive(item)}>
                      {item.is_active ? <AppIcon icon="ToggleRight" className="w-6 h-6 text-blue-500" /> : <AppIcon icon="ToggleLeft" className="w-6 h-6 text-slate-300" />}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1 text-slate-400 hover:text-blue-500">
                        <AppIcon icon="Edit2" className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 text-slate-400 hover:text-rose-500">
                        <AppIcon icon="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalItems > 10 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      )}

      {showModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal w-full max-w-lg sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden bg-white/95 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl border border-white/60">
            <div className="manager-modal-header shrink-0 bg-transparent border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between">
              <div className="manager-modal-title flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 flex-shrink-0">
                  <AppIcon icon="Bell" className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-bold text-slate-800 text-base sm:text-lg">{selectedAnnouncement ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors flex-shrink-0">
                <AppIcon icon="X" className="w-5 h-5" />
              </button>
            </div>
            
            <div className="manager-modal-body flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700">Gambar Pengumuman</p>
                <div className="flex items-center gap-4">
                  {formData.image_url ? (
                    <div className="relative group">
                      <img src={formData.image_url} alt="" className="w-24 h-16 object-cover rounded-xl border border-slate-200 shadow-sm" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-colors"
                      >
                        <AppIcon icon="X" className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-24 h-16 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-50 hover:text-green-600 transition-all disabled:opacity-50 text-slate-400 group"
                    >
                      {uploading ? (
                        <AppIcon icon="Loader2" className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <AppIcon icon="Upload" className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                        </>
                      )}
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              </div>

              <div className="bg-transparent border-none p-0 shadow-none">
                <p className="flex items-center gap-2 border-none pb-3 text-sm font-bold text-slate-700">
                  <AppIcon icon="Globe" className="w-4 h-4" />
                  Konten Multibahasa
                </p>
                
                <Tabs defaultValue="id" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="id" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-semibold text-xs">
                      🇮🇩 Indonesia
                    </TabsTrigger>
                    <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-semibold text-xs">
                      🇬🇧 English
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="id" className="space-y-4 mt-0">
                    <div>
                      <label className="manager-input-label">Judul (Indonesia) *</label>
                      <input
                        type="text"
                        value={formData.title_id}
                        onChange={e => setFormData(p => ({ ...p, title_id: e.target.value }))}
                        placeholder="Masukkan judul pengumuman"
                        className="manager-input"
                      />
                    </div>
                    <div>
                      <label className="manager-input-label">Isi (Indonesia) *</label>
                      <textarea
                        value={formData.content_id}
                        onChange={e => setFormData(p => ({ ...p, content_id: e.target.value }))}
                        placeholder="Masukkan isi pengumuman"
                        className="manager-textarea"
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="en" className="space-y-4 mt-0">
                    <div>
                      <label className="manager-input-label">Title (English)</label>
                      <input
                        type="text"
                        value={formData.title_en}
                        onChange={e => setFormData(p => ({ ...p, title_en: e.target.value }))}
                        placeholder="Enter announcement title"
                        className="manager-input"
                      />
                    </div>
                    <div>
                      <label className="manager-input-label">Content (English)</label>
                      <textarea
                        value={formData.content_en}
                        onChange={e => setFormData(p => ({ ...p, content_en: e.target.value }))}
                        placeholder="Enter announcement content"
                        className="manager-textarea"
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-[1.25rem] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.is_active ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    <AppIcon icon="Bell" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Aktifkan Pengumuman</p>
                    <p className="text-xs font-medium text-slate-500">Tampilkan popup di halaman explorer</p>
                  </div>
                </div>
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={c => setFormData(p => ({ ...p, is_active: c }))} 
                  className="data-[state=checked]:bg-blue-500"
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
                disabled={saving || !formData.title_id || !formData.content_id}
                className="manager-btn-primary"
              >
                {saving ? (
                  <>
                    <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  selectedAnnouncement ? 'Simpan Perubahan' : 'Tambah Pengumuman'
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
