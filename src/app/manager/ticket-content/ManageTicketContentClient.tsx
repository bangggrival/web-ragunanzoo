"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useConfirm } from '@/hooks/useConfirm';
import { Plus, Pencil, Trash2, Image as ImageIcon, FileText, Tag, Settings, GripVertical, ArrowRight, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { TicketContent, TicketSettings } from '@/hooks/useTicketContent';
import ImageInputWithGallery from '@/components/gallery/ImageInputWithGallery';
import { 
  upsertTicketContentAction, 
  deleteTicketContentAction, 
  updateTicketSettingsAction 
} from './actions';
import { supabase } from '@/integrations/supabase/client';

const contentTypes = [
  { value: 'info', label: 'Informasi', icon: FileText },
  { value: 'promo', label: 'Promo', icon: Tag },
  { value: 'payment_method', label: 'Metode Pembayaran', icon: Settings },
  { value: 'rule', label: 'Peraturan', icon: FileText },
];

export default function ManageTicketContentClient() {
  const { confirm, ConfirmComponent } = useConfirm();
  const [contents, setContents] = useState<TicketContent[]>([]);
  const [settings, setSettings] = useState<TicketSettings | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<TicketContent | null>(null);
  const [savingContent, setSavingContent] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    description_id: '',
    description_en: '',
    image_url: '',
    content_type: 'info',
    order_index: 0,
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: contentsData } = await supabase.from('ticket_content').select('*').order('display_order', { ascending: true });
        if (contentsData) setContents(contentsData as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'ticket_content') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);


  const [settingsForm, setSettingsForm] = useState({
    id: settings?.id,
    hero_image_url: settings?.hero_image_url || '',
    hero_title_id: settings?.hero_title_id || 'Tarif Masuk & Simulasi Tiket',
    hero_title_en: settings?.hero_title_en || 'Admission Rates & Ticket Simulation',
    hero_subtitle_id: settings?.hero_subtitle_id || 'Kalkulator estimasi biaya kunjungan, panduan saldo JakCard, dan simulasi alur masuk Ragunan Zoo',
    hero_subtitle_en: settings?.hero_subtitle_en || 'Visit cost calculator, JakCard balance guide, and entry procedure simulation for Ragunan Zoo',
    show_pricing: settings?.show_pricing ?? true,
    regular_price: settings?.regular_price || 25000,
    vip_price: settings?.vip_price || 50000,
    child_discount: settings?.child_discount || 0.5,
    external_ticket_url: settings?.external_ticket_url || '',
    section_title_id: settings?.section_title_id || 'Pilih Jenis Pembelian Tiket',
    section_title_en: settings?.section_title_en || 'Select Ticket Purchase Type',
    regular_title_id: settings?.regular_title_id || 'Tiket Luring (Di Tempat)',
    regular_title_en: settings?.regular_title_en || 'Offline Ticket (On-site)',
    regular_description_id: settings?.regular_description_id || 'Akses standar ke semua zona',
    regular_description_en: settings?.regular_description_en || 'Standard access to all zones',
    regular_link: settings?.regular_link || '',
    regular_image_url: settings?.regular_image_url || '',
    vip_title_id: settings?.vip_title_id || 'Tiket Daring',
    vip_title_en: settings?.vip_title_en || 'Online Ticket',
    vip_description_id: settings?.vip_description_id || 'Akses prioritas + feeding time',
    vip_description_en: settings?.vip_description_en || 'Priority access + feeding time',
    vip_link: settings?.vip_link || '',
    vip_image_url: settings?.vip_image_url || '',
  });

  const resetForm = () => {
    setFormData({
      title_id: '',
      title_en: '',
      description_id: '',
      description_en: '',
      image_url: '',
      content_type: 'info',
      order_index: contents.length,
      is_active: true,
    });
    setEditingContent(null);
  };

  const handleOpenDialog = (content?: TicketContent) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        title_id: content.title_id,
        title_en: content.title_en || '',
        description_id: content.description_id || '',
        description_en: content.description_en || '',
        image_url: content.image_url || '',
        content_type: content.content_type || 'info',
        order_index: content.order_index,
        is_active: content.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title_id.trim()) {
      toast.error('Judul (ID) wajib diisi');
      return;
    }

    setSavingContent(true);
    try {
      const payload = {
        id: editingContent?.id,
        ...formData,
        title_en: formData.title_en || null,
        description_id: formData.description_id || null,
        description_en: formData.description_en || null,
        image_url: formData.image_url || null,
      };

      const result = await upsertTicketContentAction(payload);
      if (!result.success) throw new Error(result.error);

      toast.success(editingContent ? 'Konten berhasil diupdate' : 'Konten berhasil ditambahkan');
      setIsDialogOpen(false);
      resetForm();
      window.location.reload();
    } catch (err: any) {
      toast.error('Gagal menyimpan konten: ' + err.message);
    } finally {
      setSavingContent(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus konten ini?'))) return;
    
    try {
      const result = await deleteTicketContentAction(id);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Konten berhasil dihapus');
      setContents(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      toast.error('Gagal menghapus konten: ' + err.message);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const result = await updateTicketSettingsAction(settingsForm);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Pengaturan berhasil disimpan');
    } catch (err: any) {
      toast.error('Gagal menyimpan pengaturan: ' + err.message);
    } finally {
      setSavingSettings(false);
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
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            Kelola Halaman Tiket
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Atur konten dan pengaturan halaman tiket</p>
        </div>

        <Link
          href="/manager/tariffs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all font-bold text-xs shadow-2xs self-start sm:self-auto"
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Atur Tarif & Harga Tiket</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
            Rp
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800">Pengaturan Nominal Tarif Masuk & Parkir</p>
            <p className="text-xs text-slate-600">
              Ubah harga tiket pengunjung dewasa (Rp 4.000), anak-anak (Rp 3.000), retribusi parkir, dan Schmutzer secara terpusat.
            </p>
          </div>
        </div>
        <Link
          href="/manager/tariffs"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm self-start sm:self-auto flex-shrink-0"
        >
          <span>Buka Panel Tarif</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <TabsTrigger value="content" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">Konten</TabsTrigger>
          <TabsTrigger value="settings" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl border border-white/80 p-4 rounded-[1.5rem] shadow-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" /> Daftar Konten Tiket
            </h2>
            <Button onClick={() => handleOpenDialog()} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Konten
            </Button>
          </div>

          <div className="grid gap-4">
            {contents.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm p-12 text-center">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Belum ada konten tiket.</p>
                <Button className="mt-4 rounded-xl" onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Konten Pertama
                </Button>
              </div>
            ) : (
              contents.map((content) => (
                <div key={content.id} className={`bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all ${!content.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 mt-1 cursor-move">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    {content.image_url ? (
                      <img
                        src={content.image_url}
                        alt={content.title_id}
                        className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2.5 py-1 bg-green-50 border border-green-200 text-green-600 font-bold rounded-lg">
                          {contentTypes.find((t) => t.value === content.content_type)?.label || content.content_type}
                        </span>
                        {!content.is_active && (
                          <span className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-lg">
                            Nonaktif
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">Urutan: {content.order_index}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg truncate">{content.title_id}</h3>
                      {content.description_id && (
                        <p className="text-sm text-slate-500 font-medium line-clamp-2 mt-1">
                          {content.description_id}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl border-slate-200 text-slate-600 hover:text-green-600 hover:bg-green-50" onClick={() => handleOpenDialog(content)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(content.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <ImageIcon className="w-5 h-5 text-green-500" /> Pengaturan Hero
            </h3>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Gambar Hero</Label>
              <ImageInputWithGallery
                value={settingsForm.hero_image_url}
                onChange={(url) => setSettingsForm({ ...settingsForm, hero_image_url: url })}
                category="ticket-hero"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Judul Hero (Indonesia)</Label>
                <Input
                  value={settingsForm.hero_title_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_title_id: e.target.value })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Judul Hero (English)</Label>
                <Input
                  value={settingsForm.hero_title_en}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_title_en: e.target.value })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Subtitle (Indonesia)</Label>
                <Input
                  value={settingsForm.hero_subtitle_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle_id: e.target.value })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Subtitle (English)</Label>
                <Input
                  value={settingsForm.hero_subtitle_en}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle_en: e.target.value })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Settings className="w-5 h-5 text-green-500" /> Judul Section Tiket
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Judul Section (Indonesia)</Label>
                <Input
                  value={settingsForm.section_title_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, section_title_id: e.target.value })}
                  placeholder="Pilih Jenis Pembelian Tiket"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Judul Section (English)</Label>
                <Input
                  value={settingsForm.section_title_en}
                  onChange={(e) => setSettingsForm({ ...settingsForm, section_title_en: e.target.value })}
                  placeholder="Select Ticket Purchase Type"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50/50 backdrop-blur-xl border border-green-100/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-green-900 flex items-center gap-2 border-b border-green-200 pb-4">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Pengaturan Tiket Luring (Di Tempat)
            </h3>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Gambar Tiket</Label>
              <div className="bg-white p-2 rounded-2xl border border-green-100">
                <ImageInputWithGallery
                  value={settingsForm.regular_image_url}
                  onChange={(url) => setSettingsForm({ ...settingsForm, regular_image_url: url })}
                  category="ticket-type"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Judul (Indonesia)</Label>
                <Input
                  value={settingsForm.regular_title_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, regular_title_id: e.target.value })}
                  className="h-11 bg-white border-green-200 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Judul (English)</Label>
                <Input
                  value={settingsForm.regular_title_en}
                  onChange={(e) => setSettingsForm({ ...settingsForm, regular_title_en: e.target.value })}
                  className="h-11 bg-white border-green-200 rounded-xl font-bold"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Deskripsi (Indonesia)</Label>
                <Textarea
                  value={settingsForm.regular_description_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, regular_description_id: e.target.value })}
                  rows={2}
                  className="bg-white border-green-200 rounded-xl font-medium text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Deskripsi (English)</Label>
                <Textarea
                  value={settingsForm.regular_description_en}
                  onChange={(e) => setSettingsForm({ ...settingsForm, regular_description_en: e.target.value })}
                  rows={2}
                  className="bg-white border-green-200 rounded-xl font-medium text-sm resize-none"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Link Pembelian</Label>
              <Input
                value={settingsForm.regular_link}
                onChange={(e) => setSettingsForm({ ...settingsForm, regular_link: e.target.value })}
                placeholder="https://example.com/buy-regular"
                className="h-11 bg-white border-green-200 rounded-xl font-medium text-sm"
              />
              <p className="text-[11px] text-green-600/80 font-medium">Klik gambar akan mengarahkan ke link ini</p>
            </div>
          </div>

          <div className="bg-amber-50/50 backdrop-blur-xl border border-amber-100/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-amber-900 flex items-center gap-2 border-b border-amber-200 pb-4">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              Pengaturan Tiket Daring
            </h3>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Gambar Tiket</Label>
              <div className="bg-white p-2 rounded-2xl border border-amber-100">
                <ImageInputWithGallery
                  value={settingsForm.vip_image_url}
                  onChange={(url) => setSettingsForm({ ...settingsForm, vip_image_url: url })}
                  category="ticket-type"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Judul (Indonesia)</Label>
                <Input
                  value={settingsForm.vip_title_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, vip_title_id: e.target.value })}
                  className="h-11 bg-white border-amber-200 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Judul (English)</Label>
                <Input
                  value={settingsForm.vip_title_en}
                  onChange={(e) => setSettingsForm({ ...settingsForm, vip_title_en: e.target.value })}
                  className="h-11 bg-white border-amber-200 rounded-xl font-bold"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Deskripsi (Indonesia)</Label>
                <Textarea
                  value={settingsForm.vip_description_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, vip_description_id: e.target.value })}
                  rows={2}
                  className="bg-white border-amber-200 rounded-xl font-medium text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Deskripsi (English)</Label>
                <Textarea
                  value={settingsForm.vip_description_en}
                  onChange={(e) => setSettingsForm({ ...settingsForm, vip_description_en: e.target.value })}
                  rows={2}
                  className="bg-white border-amber-200 rounded-xl font-medium text-sm resize-none"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Link Pembelian</Label>
              <Input
                value={settingsForm.vip_link}
                onChange={(e) => setSettingsForm({ ...settingsForm, vip_link: e.target.value })}
                placeholder="https://example.com/buy-vip"
                className="h-11 bg-white border-amber-200 rounded-xl font-medium text-sm"
              />
              <p className="text-[11px] text-amber-600/80 font-medium">Klik gambar akan mengarahkan ke link ini</p>
            </div>
          </div>

          <div className="bg-slate-50/50 backdrop-blur-xl border border-slate-200/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-4">
              <Settings className="w-5 h-5 text-slate-500" /> Pengaturan Umum
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-slate-800">Tampilkan Opsi Pembelian Tiket</Label>
                <p className="text-[11px] font-medium text-slate-500">Jika dimatikan, opsi pembelian tidak akan tampil di website</p>
              </div>
              <Switch
                checked={settingsForm.show_pricing}
                onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, show_pricing: checked })}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Diskon Anak (0-1)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={settingsForm.child_discount}
                  onChange={(e) => setSettingsForm({ ...settingsForm, child_discount: parseFloat(e.target.value) || 0 })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
                <p className="text-[11px] text-slate-500 font-medium mt-2">Contoh: 0.5 = diskon 50%</p>
              </div>

              <div className="space-y-1.5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">URL Tiket Eksternal</Label>
                <Input
                  value={settingsForm.external_ticket_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, external_ticket_url: e.target.value })}
                  placeholder="https://example.com/buy-ticket"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium text-sm"
                />
                <p className="text-[11px] text-slate-500 font-medium mt-2">Digunakan jika form pricing disembunyikan</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveSettings} disabled={savingSettings} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-8 py-6 h-auto text-lg">
              {savingSettings ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Konten */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl custom-scrollbar">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              {editingContent ? 'Edit Konten' : 'Tambah Konten Baru'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Judul (Indonesia) <span className="text-rose-500">*</span></Label>
                <Input
                  value={formData.title_id}
                  onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                  placeholder="Judul dalam Bahasa Indonesia"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Judul (English)</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="Title in English"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Deskripsi (Indonesia)</Label>
                <Textarea
                  value={formData.description_id}
                  onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                  placeholder="Deskripsi dalam Bahasa Indonesia"
                  rows={4}
                  className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Deskripsi (English)</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Description in English"
                  rows={4}
                  className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Gambar Konten</Label>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <ImageInputWithGallery
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  category="ticket-content"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Tipe Konten</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                >
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="font-bold">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Urutan Tampil</Label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-green-900">Status Aktif</Label>
                <p className="text-[11px] font-medium text-green-600/80">Konten aktif akan ditampilkan di halaman publik</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>

          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50">
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={savingContent} className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20">
              {savingContent ? 'Menyimpan...' : (editingContent ? 'Simpan Perubahan' : 'Tambah Konten')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    {ConfirmComponent}
    </div>
  );
}
