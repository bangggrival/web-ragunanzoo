"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CustomPage, uploadCustomPageImage, deleteCustomPageImage } from '@/hooks/useCustomPages';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { AppIcon } from '@/components/ui/AppIcon';
import { createCustomPageAction, updateCustomPageAction, deleteCustomPageAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

const availableIcons = [
  'FileText', 'Home', 'MapPin', 'PawPrint', 'Ticket', 'Calendar', 'QrCode', 'Newspaper', 'Heart', 'Building2', 'View',
  'Link', 'Info', 'Star', 'Gift', 'Camera', 'Music', 'Coffee', 'ShoppingBag', 'Phone', 'Mail', 'Globe',
];

interface ManageCustomPagesClientProps {
  initialPages: CustomPage[];
}

export default function ManageCustomPagesClient() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [pageToDelete, setPageToDelete] = useState<CustomPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: '',
    title_id: '',
    title_en: '',
    content_id: '',
    content_en: '',
    is_published: true,
    show_in_navbar: false,
    navbar_icon: 'FileText',
    image_urls: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('custom_pages').select('*').order('created_at', { ascending: false });
        if (data) setPages(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'custom_pages') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const openAddDialog = () => {
    setEditingPage(null);
    setFormData({
      slug: '', title_id: '', title_en: '', content_id: '', content_en: '',
      is_published: true, show_in_navbar: false, navbar_icon: 'FileText', image_urls: [],
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (page: CustomPage) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title_id: page.title_id,
      title_en: page.title_en || '',
      content_id: page.content_id || '',
      content_en: page.content_en || '',
      is_published: page.is_published,
      show_in_navbar: page.show_in_navbar,
      navbar_icon: page.navbar_icon || 'FileText',
      image_urls: page.image_urls || [],
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title_id: value,
      slug: editingPage ? prev.slug : generateSlug(value),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} bukan file gambar`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} melebihi ukuran maksimum 5MB`);
          continue;
        }

        const url = await uploadCustomPageImage(file);
        newUrls.push(url);
      }

      if (newUrls.length > 0) {
        setFormData(prev => ({ ...prev, image_urls: [...prev.image_urls, ...newUrls] }));
        toast.success(`${newUrls.length} gambar berhasil diupload`);
      }
    } catch (error) {
      toast.error('Gagal mengupload gambar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const url = formData.image_urls[index];
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
    deleteCustomPageImage(url);
  };

  const validateForm = () => {
    const errors: Record<string, any> = {};
    if (!formData.title_id.trim()) errors.title_id = 'Judul Indonesia wajib diisi';
    if (!formData.slug.trim()) errors.slug = 'Slug URL wajib diisi';
    else if (!/^[a-z0-9-]+$/.test(formData.slug)) errors.slug = 'Slug hanya boleh huruf kecil, angka, dan tanda hubung';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    
    try {
      const pageData = {
        slug: formData.slug.trim(),
        title_id: formData.title_id.trim(),
        title_en: formData.title_en.trim() || null,
        content_id: formData.content_id.trim() || null,
        content_en: formData.content_en.trim() || null,
        is_published: formData.is_published,
        show_in_navbar: formData.show_in_navbar,
        navbar_icon: formData.navbar_icon,
        order_index: pages.length || 0,
        image_urls: formData.image_urls,
      };

      if (editingPage) {
        const result = await updateCustomPageAction(editingPage.id, pageData);
        if (!result.success) throw new Error(result.error);
        toast.success('Halaman berhasil diperbarui');
        setPages(prev => prev.map(p => p.id === editingPage.id ? { ...p, ...pageData } as CustomPage : p));
      } else {
        const result = await createCustomPageAction(pageData as any);
        if (!result.success) throw new Error(result.error);
        toast.success('Halaman baru berhasil dibuat');
        setPages(prev => [...prev, result.data!]);
      }
      setDialogOpen(false);
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        setFormErrors({ slug: 'Slug sudah digunakan, gunakan yang lain' });
      } else {
        toast.error('Gagal menyimpan halaman: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (page: CustomPage) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      if (pageToDelete.image_urls && pageToDelete.image_urls.length > 0) {
        for (const url of pageToDelete.image_urls) {
          await deleteCustomPageImage(url);
        }
      }
      const result = await deleteCustomPageAction(pageToDelete.id);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Halaman berhasil dihapus');
      setPages(prev => prev.filter(p => p.id !== pageToDelete.id));
    } catch (error: any) {
      toast.error('Gagal menghapus halaman: ' + error.message);
    } finally {
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    }
  };

  const togglePublish = async (page: CustomPage) => {
    try {
      const result = await updateCustomPageAction(page.id, { is_published: !page.is_published });
      if (!result.success) throw new Error(result.error);
      toast.success(page.is_published ? 'Halaman disembunyikan' : 'Halaman dipublikasikan');
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, is_published: !p.is_published } : p));
    } catch (error: any) {
      toast.error('Gagal mengubah status publikasi');
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
              <AppIcon icon="FileText" className="w-5 h-5 text-rose-500" />
            </div>
            Halaman Kustom
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">
            Buat dan kelola halaman statis seperti Tentang, Visi Misi, Sejarah, dll.
          </p>
        </div>
        <button 
          onClick={openAddDialog} 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-[0_2px_15px_-3px_rgba(244,63,94,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(244,63,94,0.5)] hover:-translate-y-0.5"
        >
          <AppIcon icon="Plus" className="w-5 h-5" />
          Buat Halaman Baru
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 p-5 rounded-[1.5rem] backdrop-blur-xl">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center border border-white/80 shadow-sm flex-shrink-0">
            <AppIcon icon="Info" className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-slate-800 mb-2">Cara Menggunakan:</p>
            <ul className="space-y-1.5 text-sm font-medium text-slate-600">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Buat halaman baru dengan judul dan konten yang diinginkan</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Slug URL akan otomatis dibuat dari judul (contoh: "tentang-kami" → /page/tentang-kami)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Upload gambar untuk memperkaya konten halaman (max 5MB per gambar)</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Untuk menambahkan ke menu navigasi, buka <strong>Pengaturan Menu</strong></li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Gunakan format Markdown sederhana: ## untuk heading, - untuk list</li>
            </ul>
          </div>
        </div>
      </div>

      {pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => {
            
            const hasImages = page.image_urls && page.image_urls.length > 0;
            return (
              <div 
                key={page.id}
                className={`bg-white/70 backdrop-blur-xl border border-white/60 rounded-[1.5rem] overflow-hidden flex flex-col hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 ${!page.is_published ? 'opacity-70 grayscale-[30%]' : ''}`}
              >
                {hasImages && (
                  <div className="aspect-video bg-slate-100 relative group">
                    <img 
                      src={page.image_urls![0]} 
                      alt={page.title_id}
                      className="w-full h-full object-cover"
                    />
                    {page.image_urls!.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-bold border border-white/20">
                        +{page.image_urls!.length - 1} Gambar
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${page.is_published ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-100 text-slate-400'}`}>
                      <AppIcon icon={page.navbar_icon || "FileText"} className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-slate-800 text-lg truncate leading-tight">{page.title_id}</h3>
                        {!page.is_published && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">Draft</span>
                        )}
                      </div>
                      <code className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 truncate block">/page/{page.slug}</code>
                    </div>
                  </div>
                  
                  {page.content_id && (
                    <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-4 flex-1">
                      {page.content_id}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100/60">
                    <button
                      onClick={() => togglePublish(page)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${page.is_published ? 'text-slate-500 hover:bg-slate-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                    >
                      {page.is_published ? (
                        <><AppIcon icon="EyeOff" className="w-4 h-4" /><span>Sembunyikan</span></>
                      ) : (
                        <><AppIcon icon="Eye" className="w-4 h-4" /><span>Publikasi</span></>
                      )}
                    </button>
                    <a
                      href={`/page/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <AppIcon icon="ExternalLink" className="w-4 h-4" />
                      <span>Lihat</span>
                    </a>
                    <div className="flex-1" />
                    <button
                      onClick={() => openEditDialog(page)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <AppIcon icon="Edit2" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(page)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <AppIcon icon="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-[2rem]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <AppIcon icon="FileText" className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Belum Ada Halaman</h3>
          <p className="text-slate-500 mt-1 mb-6">Mulai buat halaman statis pertama Anda seperti "Tentang Kami", "Visi Misi", dll.</p>
          <button onClick={openAddDialog} className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-rose-500/20 inline-flex items-center gap-2">
            <AppIcon icon="Plus" className="w-4 h-4" />
            Buat Halaman Pertama
          </button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-white/40 rounded-[2rem] p-0">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                {editingPage ? <AppIcon icon="Edit2" className="w-5 h-5 text-rose-500" /> : <AppIcon icon="Plus" className="w-5 h-5 text-rose-500" />}
              </div>
              {editingPage ? 'Edit Halaman' : 'Buat Halaman Baru'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              {editingPage ? 'Perbarui konten halaman' : 'Buat halaman statis baru dengan konten yang dapat diedit'}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="title_id" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Judul (Indonesia) <span className="text-rose-500">*</span>
                </Label>
                <input
                  id="title_id"
                  value={formData.title_id}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: Tentang Kami"
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${formErrors.title_id ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-green-500 focus:ring-green-500/20'} rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-sm`}
                />
                {formErrors.title_id && (
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <AppIcon icon="AlertCircle" className="w-3 h-3" />
                    {formErrors.title_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Slug URL <span className="text-rose-500">*</span>
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm font-bold">
                    /page/
                  </span>
                  <input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="tentang-kami"
                    className={`w-full px-4 py-2.5 bg-slate-50 border ${formErrors.slug ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:border-green-500 focus:ring-green-500/20'} rounded-r-xl focus:outline-none focus:ring-2 transition-all font-medium text-sm`}
                  />
                </div>
                {formErrors.slug && (
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                    <AppIcon icon="AlertCircle" className="w-3 h-3" />
                    {formErrors.slug}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_en" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Judul (English)</Label>
              <input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                placeholder="Contoh: About Us"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-sm"
              />
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <Label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <AppIcon icon="ImageIcon" className="w-4 h-4 text-slate-500" />
                Gambar Halaman
              </Label>
              
              {formData.image_urls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="relative group aspect-video bg-slate-200 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img 
                        src={url} 
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-600"
                      >
                        <AppIcon icon="X" className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 rounded-full">
                          Utama
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all font-bold text-sm disabled:opacity-50"
                >
                  {uploading ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : <AppIcon icon="Upload" className="w-4 h-4" />}
                  {uploading ? 'Mengupload...' : 'Upload Gambar'}
                </button>
                <span className="text-xs font-medium text-slate-400">
                  Max 5MB per gambar. Format: JPG, PNG, WebP
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AppIcon icon="FileText" className="w-4 h-4 text-slate-500" />
                Konten Halaman
              </Label>
              <Tabs defaultValue="id" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl mb-3">
                  <TabsTrigger value="id" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-bold text-xs">🇮🇩 Indonesia</TabsTrigger>
                  <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-bold text-xs">🇬🇧 English</TabsTrigger>
                </TabsList>
                <TabsContent value="id" className="mt-0">
                  <textarea
                    value={formData.content_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_id: e.target.value }))}
                    placeholder="Tulis konten halaman di sini... Gunakan Markdown."
                    rows={12}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono text-sm leading-relaxed"
                  />
                </TabsContent>
                <TabsContent value="en" className="mt-0">
                  <textarea
                    value={formData.content_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                    placeholder="Write page content here... Use Markdown."
                    rows={12}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono text-sm leading-relaxed"
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-800">Icon Halaman</Label>
              <div className="grid grid-cols-8 gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl max-h-40 overflow-y-auto custom-scrollbar">
                {availableIcons.map((iconName) => {
                  
                  const isSelected = formData.navbar_icon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, navbar_icon: iconName }))}
                      className={`
                        p-2 rounded-xl border-2 transition-all flex items-center justify-center
                        ${isSelected 
                          ? 'border-green-500 bg-green-50 text-green-600 shadow-sm' 
                          : 'border-transparent bg-white text-slate-400 hover:border-slate-200 hover:text-slate-600'
                        }
                      `}
                      title={iconName}
                    >
                      <AppIcon icon={iconName} className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <Label className="font-bold text-slate-800">Publikasikan Halaman</Label>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Halaman dapat diakses oleh pengunjung publik</p>
              </div>
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>

          <DialogFooter className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-[2rem]">
            <button onClick={() => setDialogOpen(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors">
              Batal
            </button>
            <button onClick={handleSave} disabled={saving || uploading} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold shadow-lg shadow-green-600/20 transition-all">
              {saving ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : <AppIcon icon="Save" className="w-4 h-4" />}
              {editingPage ? 'Simpan Perubahan' : 'Buat Halaman'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] p-6 border-white/60 bg-white/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                <AppIcon icon="AlertCircle" className="w-5 h-5 text-rose-500" />
              </div>
              Hapus Halaman?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium pt-2">
              Anda akan menghapus halaman <strong>"{pageToDelete?.title_id}"</strong>. 
              Tindakan ini tidak dapat dibatalkan.
              {pageToDelete?.image_urls && pageToDelete.image_urls.length > 0 && (
                <span className="block mt-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm font-bold flex items-center gap-2">
                  <AppIcon icon="AlertCircle" className="w-4 h-4" />
                  {pageToDelete.image_urls.length} gambar juga akan dihapus permanen.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
