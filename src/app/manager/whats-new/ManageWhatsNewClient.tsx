"use client";

import { useState, useRef, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { Sparkles, Plus, Edit2, Trash2, X, Globe, PawPrint, Calendar, Newspaper, Building2, Upload, Loader2, Image as ImageIcon, LayoutTemplate } from 'lucide-react';
import { WhatsNewItem } from '@/hooks/useWhatsNewItems';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { deleteWhatsNewItemAction, upsertWhatsNewItemAction } from './actions';

const typeConfig = {
  animal: { icon: PawPrint, label: 'Satwa', color: 'bg-green-50 text-green-600 border-green-200' },
  event: { icon: Calendar, label: 'Event', color: 'bg-green-50 text-green-600 border-green-200' },
  news: { icon: Newspaper, label: 'Berita', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  venue: { icon: Building2, label: 'Venue', color: 'bg-amber-50 text-amber-600 border-amber-200' },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ManageWhatsNewClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [items, setItems] = useState<WhatsNewItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WhatsNewItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('whats_new_items')
          .select('*')
          .order('order_index', { ascending: true });
        if (!error && data) {
          setItems(data as WhatsNewItem[]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    item_type: 'news' as 'animal' | 'event' | 'news' | 'venue',
    item_id: '',
    title_id: '',
    title_en: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    is_active: true,
    order_index: 0
  });

  const resetForm = () => {
    setFormData({ 
      item_type: 'news',
      item_id: '',
      title_id: '', 
      title_en: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      is_active: true,
      order_index: items.length
    });
    setSelectedItem(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('whats-new-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('whats-new-images')
        .getPublicUrl(uploadData.path);

      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success('Gambar berhasil diupload');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Gagal mengupload gambar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: WhatsNewItem) => {
    setSelectedItem(item);
    setFormData({
      item_type: item.item_type,
      item_id: item.item_id,
      title_id: item.title_id,
      title_en: item.title_en || '',
      subtitle: item.subtitle || '',
      image_url: item.image_url || '',
      link_url: item.link_url,
      is_active: item.is_active,
      order_index: item.order_index
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if ((await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus item ini?'))) {
      try {
        const result = await deleteWhatsNewItemAction(id);
        if (!result.success) throw new Error(result.error);
        
        setItems(prev => prev.filter(i => i.id !== id));
        toast.success('Item berhasil dihapus');
      } catch (err: any) {
        toast.error('Gagal menghapus: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_id.trim()) {
      toast.error('Judul (Indonesia) wajib diisi');
      return;
    }
    if (!formData.link_url.trim()) {
      toast.error('Link URL wajib diisi');
      return;
    }

    setSaving(true);
    
    const payload = {
      id: selectedItem?.id,
      item_type: formData.item_type,
      item_id: formData.item_id || `custom-${Date.now()}`,
      title_id: formData.title_id,
      title_en: formData.title_en || null,
      subtitle: formData.subtitle || null,
      image_url: formData.image_url || null,
      link_url: formData.link_url,
      is_active: formData.is_active,
      order_index: formData.order_index
    };

    try {
      const result = await upsertWhatsNewItemAction(payload);
      if (!result.success) throw new Error(result.error);

      toast.success(selectedItem ? 'Item berhasil diperbarui' : 'Item berhasil ditambahkan');
      setShowModal(false);
      window.location.reload();
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
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
              <LayoutTemplate className="w-5 h-5 text-green-500" />
            </div>
            Yang Terbaru
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola konten yang tampil di carousel "Yang Terbaru"</p>
        </div>
        <button onClick={handleAdd} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Item</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-violet-50 rounded-[1.5rem] p-5 border border-green-100 flex gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
          <Sparkles className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="font-bold text-green-900 mb-1">Tentang Yang Terbaru</h3>
          <p className="text-sm font-medium text-green-800/80">
            Carousel "Yang Terbaru" menampilkan item-item yang Anda tambahkan di sini. Anda dapat menambahkan konten dari satwa, event, berita, atau venue yang ingin ditonjolkan ke pengunjung.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Item</p>
          <p className="text-3xl font-black text-slate-800">{items.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Aktif</p>
          <p className="text-3xl font-black text-green-500">{items.filter(i => i.is_active).length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Satwa</p>
          <p className="text-3xl font-black text-slate-800">{items.filter(i => i.item_type === 'animal').length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Berita</p>
          <p className="text-3xl font-black text-slate-800">{items.filter(i => i.item_type === 'news').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const config = typeConfig[item.item_type];
          const Icon = config.icon as any;
          
          return (
            <div key={item.id} className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title_id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <Icon className="w-16 h-16 mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-wider">Tanpa Gambar</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${config.color} shadow-sm backdrop-blur-md bg-opacity-90`}>
                    <div className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </div>
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant={item.is_active ? 'default' : 'secondary'} className={`text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${item.is_active ? 'bg-green-500/90 text-white border-0' : 'bg-slate-800/80 text-white border-0'}`}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">{item.title_id}</h3>
                {item.subtitle && <p className="text-sm font-medium text-slate-500 line-clamp-1 mb-4">{item.subtitle}</p>}
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button variant="outline" className="flex-1 rounded-xl h-10 border-slate-200 font-bold text-slate-600 bg-white hover:bg-slate-50 hover:text-green-600" onClick={() => handleEdit(item)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="w-10 h-10 rounded-xl border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 p-0 flex items-center justify-center transition-colors" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-bold text-slate-600 mb-1">Belum ada item</p>
          <p className="text-sm font-medium text-slate-500">Tambah item untuk ditampilkan di carousel "Yang Terbaru"</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-white/60">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedItem ? 'Edit Item' : 'Tambah Item Baru'}</h2>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipe Konten</Label>
                <Select value={formData.item_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, item_type: value }))}>
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-green-500 font-bold text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="animal" className="font-medium rounded-lg">
                      <div className="flex items-center gap-2">
                        <PawPrint className="w-4 h-4 text-emerald-600" />
                        <span>Satwa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="event" className="font-medium rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>Event</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="news" className="font-medium rounded-lg">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-blue-600" />
                        <span>Berita</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="venue" className="font-medium rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <span>Venue</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  Konten Multibahasa
                </div>
                
                <Tabs defaultValue="id" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="id" className="rounded-lg font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">Indonesia</TabsTrigger>
                    <TabsTrigger value="en" className="rounded-lg font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">English</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="id" className="space-y-3 mt-0 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Judul (Indonesia) <span className="text-rose-500">*</span></Label>
                      <Input value={formData.title_id} onChange={e => setFormData(prev => ({ ...prev, title_id: e.target.value }))} placeholder="Masukkan judul" className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold text-slate-800" required />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="en" className="space-y-3 mt-0 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Title (English)</Label>
                      <Input value={formData.title_en} onChange={e => setFormData(prev => ({ ...prev, title_en: e.target.value }))} placeholder="Enter title" className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold text-slate-800" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subtitle (opsional)</Label>
                <Input value={formData.subtitle} onChange={e => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Contoh: Nama latin, waktu event" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium text-slate-700" />
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gambar Utama</Label>
                
                {formData.image_url && (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))} className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 transition-transform hover:scale-110 shadow-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                
                {!formData.image_url && (
                  <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-green-600 font-bold border-dashed border-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2 text-green-500" /> : <Upload className="w-5 h-5 mr-2 text-slate-400" />}
                      {uploading ? 'Mengupload...' : 'Upload Gambar'}
                    </Button>
                    <Button type="button" variant="outline" className="w-12 h-12 rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 p-0 flex items-center justify-center" onClick={() => { const url = prompt('Masukkan URL gambar:'); if (url) setFormData(prev => ({ ...prev, image_url: url })); }} title="Masukkan URL gambar">
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    </Button>
                  </div>
                )}
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Format: JPG, PNG, WebP. Maksimal 5MB. Rasio 16:9 direkomendasikan.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Link URL <span className="text-rose-500">*</span></Label>
                <Input value={formData.link_url} onChange={e => setFormData(prev => ({ ...prev, link_url: e.target.value }))} placeholder="/animals/1 atau /events" className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium text-slate-700" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link tujuan saat item diklik</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Urutan</Label>
                  <Input type="number" min="0" value={formData.order_index} onChange={e => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))} className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-black text-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</Label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 h-11">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.is_active ? 'text-green-600' : 'text-slate-500'}`}>{formData.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    <Switch checked={formData.is_active} onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))} className="data-[state=checked]:bg-green-500" />
                  </div>
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/80">
              <Button type="button" variant="outline" className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 px-6" onClick={() => setShowModal(false)}>Batal</Button>
              <Button onClick={handleSubmit} disabled={saving || !formData.title_id || !formData.link_url} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    {ConfirmComponent}
    </div>
  );
}
