"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import { ZooHistory, deleteHistoryAction, upsertHistoryAction } from './actions';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ManageHistoryClientProps {
  initialItems: ZooHistory[];
}

export default function ManageHistoryClient() {
  const [historyItems, setHistoryItems] = useState<ZooHistory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('zoo_history').select('*').order('year', { ascending: false });
        if (data) setHistoryItems(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'zoo_history') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);

  const defaultFormData = {
    title_id: '',
    title_en: '',
    content_id: '',
    content_en: '',
    year: '',
    image_url: '',
    order_index: 0,
    is_published: true,
  };
  const [formData, setFormData] = useState(defaultFormData);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: ZooHistory) => {
    setEditingId(item.id);
    setFormData({
      title_id: item.title_id || '',
      title_en: item.title_en || '',
      content_id: item.content_id || '',
      content_en: item.content_en || '',
      year: item.year?.toString() || '',
      image_url: item.image_url || '',
      order_index: item.order_index || 0,
      is_published: item.is_published ?? true,
    });

    setIsDialogOpen(true);
  };

  
  const handleTogglePublish = async (id: string, is_published: boolean) => {
    setHistoryItems(prev => prev.map(item => item.id === id ? { ...item, is_published } : item));
    try {
      const { error } = await supabase.from('zoo_history').update({ is_published }).eq('id', id);
      if (error) throw error;
      toast.success('Status tampil diperbarui');
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
      setHistoryItems(prev => prev.map(item => item.id === id ? { ...item, is_published: !is_published } : item));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      id: editingId || undefined,
      title_id: formData.title_id,
      title_en: formData.title_en || null,
      content_id: formData.content_id,
      content_en: formData.content_en || null,
      year: formData.year ? parseInt(formData.year) : null,
      image_url: formData.image_url || null,
      order_index: formData.order_index,
      is_published: formData.is_published,
    };

    try {
      const result = await upsertHistoryAction(payload);
      if (!result.success) throw new Error(result.error);

      // Optimistic update locally
      if (editingId) {
        setHistoryItems(prev => prev.map(item => item.id === editingId ? { ...item, ...payload } as ZooHistory : item).sort((a, b) => a.order_index - b.order_index));
      } else {
        setHistoryItems(prev => [...prev, { ...payload, id: Date.now().toString(), created_at: '', updated_at: '' } as ZooHistory].sort((a, b) => a.order_index - b.order_index));
      }

      toast.success(editingId ? 'Sejarah diperbarui' : 'Sejarah ditambahkan');
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const result = await deleteHistoryAction(deleteId);
      if (!result.success) throw new Error(result.error);

      setHistoryItems(prev => prev.filter(item => item.id !== deleteId));
      toast.success('Sejarah dihapus');
    } catch (err: any) {
      toast.error('Gagal menghapus: ' + err.message);
    } finally {
      setLoading(false);
      setDeleteId(null);
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
    <div className="animate-fade-in space-y-6 relative min-h-[calc(100vh-8rem)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-64 h-64 opacity-5"><AppIcon icon="TreePine" className="w-full h-full text-green-600" /></div>
        <div className="absolute top-20 right-10 w-48 h-48 opacity-5"><AppIcon icon="TreeDeciduous" className="w-full h-full text-green-600" /></div>
        <div className="absolute bottom-10 left-1/4 w-56 h-56 opacity-5"><AppIcon icon="Leaf" className="w-full h-full text-green-600" /></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 opacity-5"><AppIcon icon="TreePine" className="w-full h-full text-green-600" /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 via-transparent to-green-50/50" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="History" className="w-5 h-5 text-green-500" />
            </div>
            Sejarah Kebun Binatang
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola timeline perjalanan sejarah kebun binatang</p>
        </div>
        
        <button onClick={handleOpenCreate} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(16,185,129,0.5)] hover:-translate-y-0.5">
          <AppIcon icon="Plus" className="w-5 h-5" />
          Tambah Sejarah
        </button>
      </div>

      {historyItems.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-2xl border border-white/80 p-12 text-center rounded-[2rem] shadow-sm mt-8">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
            <AppIcon icon="History" className="w-10 h-10 text-green-300" />
          </div>
          <h3 className="font-bold text-xl text-slate-800 mb-2">Belum ada sejarah</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">Mulai catat perjalanan sejarah kebun binatang dengan menambahkan timeline pertama Anda.</p>
          <button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 inline-flex items-center gap-2 transition-all">
            <AppIcon icon="Plus" className="w-5 h-5" />
            Tambah Sejarah Pertama
          </button>
        </div>
      ) : (
        <div className="relative mt-8">
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-green-500 via-green-300 to-transparent hidden sm:block rounded-full" />
          
          <div className="space-y-8">
            {historyItems.map((item, index) => (
              <div key={item.id} className={cn("relative flex flex-col sm:flex-row gap-6", index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse")}>
                <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-6 w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-md z-10" />
                
                <div className={cn("w-full sm:w-[calc(50%-2rem)]", index % 2 === 0 ? "sm:pr-8" : "sm:pl-8")}>
                  <div className={cn(
                    "bg-white/80 backdrop-blur-xl rounded-[1.5rem] overflow-hidden border transition-all duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 relative group",
                    item.is_published ? "border-green-200/60" : "border-slate-200/60 opacity-80"
                  )}>
                    <div className="relative bg-gradient-to-br from-green-50/50 to-transparent p-5">
                      <div className="absolute top-2 right-2 opacity-5 text-green-800 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                        <AppIcon icon="TreePine" className="w-16 h-16" />
                      </div>
                      <div className="flex items-center gap-3 relative z-10">
                        {item.year && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-100 text-green-700 font-bold text-sm border border-green-200/50 shadow-sm">
                            <AppIcon icon="Calendar" className="w-3.5 h-3.5" />
                            {item.year}
                          </span>
                        )}
                        {!item.is_published && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold uppercase tracking-wider border border-slate-200">Draft</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mt-3 text-slate-800 relative z-10">{item.title_id}</h3>
                      {item.title_en && <p className="text-sm font-medium text-slate-500 mt-0.5 relative z-10">{item.title_en}</p>}
                    </div>

                    {item.image_url && (
                      <div className="w-full h-40 sm:h-48 overflow-hidden">
                        <img src={item.image_url} alt={item.title_id} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    )}
                    
                    <div className="p-5">
                      <p className="text-sm font-medium text-slate-600 line-clamp-3 leading-relaxed">{item.content_id}</p>
                      
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100/60">
                        <div>
                          <Switch
                            checked={item.is_published !== false}
                            onCheckedChange={(checked) => handleTogglePublish(item.id, checked)}
                            className="data-[state=checked]:bg-green-500 scale-90"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenEdit(item)} className="flex-1 h-9 px-3 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                            <AppIcon icon="Edit" className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => setDeleteId(item.id)} className="w-9 h-9 text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl flex items-center justify-center transition-colors">
                            <AppIcon icon="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-white/40 rounded-[2rem] p-0">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <AppIcon icon="History" className="w-5 h-5 text-green-500" />
              </div>
              {editingId ? 'Edit Sejarah' : 'Tambah Sejarah Baru'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><AppIcon icon="Calendar" className="w-3.5 h-3.5" /> Tahun</Label>
                <Input type="number" placeholder="1864" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><AppIcon icon="GripVertical" className="w-3.5 h-3.5" /> Urutan Tampil</Label>
                <Input type="number" placeholder="0" value={formData.order_index} onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg inline-block uppercase tracking-wider">🇮🇩 Indonesia</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Judul *</Label>
                  <Input placeholder="Judul sejarah..." value={formData.title_id} onChange={(e) => setFormData({ ...formData, title_id: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Konten *</Label>
                  <Textarea placeholder="Deskripsi..." value={formData.content_id} onChange={(e) => setFormData({ ...formData, content_id: e.target.value })} className="min-h-[100px] bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg inline-block uppercase tracking-wider">🇬🇧 English</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Title</Label>
                  <Input placeholder="History title..." value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Content</Label>
                  <Textarea placeholder="Description..." value={formData.content_en} onChange={(e) => setFormData({ ...formData, content_en: e.target.value })} className="min-h-[100px] bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><AppIcon icon="ImageIcon" className="w-3.5 h-3.5" /> URL Gambar</Label>
              <Input type="url" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
              {formData.image_url && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 max-w-xs shadow-sm">
                  <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl mt-4">
              <div>
                <p className="font-bold text-slate-800 text-sm">Publikasikan</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Tampilkan di timeline publik</p>
              </div>
              <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} className="data-[state=checked]:bg-green-500" />
            </div>
          </div>

          <DialogFooter className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-[2rem]">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50">Batal</Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.title_id || !formData.content_id} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
              {loading ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingId ? 'Simpan Perubahan' : 'Tambah Sejarah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem] p-6 border-white/60 bg-white/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">Hapus Sejarah?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">Tindakan ini tidak dapat dibatalkan. Data sejarah ini akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20">
              {loading ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin mr-2" /> : null} Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
