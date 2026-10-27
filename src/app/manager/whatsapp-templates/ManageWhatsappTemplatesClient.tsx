"use client";

import { useState, useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { WhatsappTemplate } from '@/hooks/useWhatsappTemplates';
import { upsertWhatsappTemplateAction, deleteWhatsappTemplateAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

export default function ManageWhatsappTemplatesClient() {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    message_id: '',
    message_en: '',
    is_active: true,
    order_index: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: templatesData } = await supabase.from('whatsapp_templates').select('*').order('created_at', { ascending: false });
        if (templatesData) setTemplates(templatesData as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'whatsapp_templates') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);


  const resetForm = () => {
    setFormData({ 
      message_id: '', 
      message_en: '',
      is_active: true,
      order_index: templates.length
    });
    setSelectedTemplate(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: WhatsappTemplate) => {
    setSelectedTemplate(item);
    setFormData({
      message_id: item.message_id,
      message_en: item.message_en || '',
      is_active: item.is_active,
      order_index: item.order_index
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteWhatsappTemplateAction(id);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Template berhasil dihapus');
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      toast.error('Gagal menghapus: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message_id.trim()) {
      toast.error('Pesan template (Indonesia) wajib diisi');
      return;
    }

    setSaving(true);
    
    try {
      const payload = {
        id: selectedTemplate?.id,
        message_id: formData.message_id,
        message_en: formData.message_en || null,
        is_active: formData.is_active,
        order_index: formData.order_index
      };

      const result = await upsertWhatsappTemplateAction(payload);
      if (!result.success) throw new Error(result.error);
      
      toast.success(selectedTemplate ? 'Template berhasil diperbarui' : 'Template berhasil ditambahkan');
      setShowModal(false);
      resetForm();
      window.location.reload(); // Reload to get the latest sorted templates
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="MessageCircle" className="w-5 h-5 text-green-500" />
            </div>
            Template WhatsApp
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola template pesan untuk tombol chat WhatsApp</p>
        </div>
        <Button onClick={handleAdd} className="rounded-xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold shadow-lg shadow-green-500/20 px-6">
          <AppIcon icon="Plus" className="w-5 h-5 mr-2" />
          Tambah Template
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-green-50/50 border border-green-100 p-5 rounded-[1.5rem] shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AppIcon icon="MessageCircle" className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-green-900">Cara Kerja Template</h3>
          <p className="text-sm font-medium text-green-700/80 mt-1">
            Template pesan akan muncul sebagai pilihan saat pengunjung mengklik tombol Chat WhatsApp. 
            Pengunjung dapat memilih template yang sesuai sebelum diarahkan ke WhatsApp.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Template</p>
          <div className="text-3xl font-black text-slate-800">{templates.length}</div>
        </div>
        <div className="bg-green-50/60 backdrop-blur-xl border border-green-100/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-100/50 rounded-full blur-xl"></div>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1 relative z-10">Template Aktif</p>
          <div className="text-3xl font-black text-green-700 relative z-10">{templates.filter(t => t.is_active).length}</div>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((item, index) => (
          <div 
            key={item.id} 
            className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mt-1">
                <AppIcon icon="GripVertical" className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    item.is_active 
                      ? 'bg-green-50 border-green-200 text-green-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">Urutan: {item.order_index}</span>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 mt-3">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{item.message_id}</p>
                </div>
                {item.message_en && (
                  <div className="bg-green-50/30 p-4 rounded-xl border border-green-50 mt-2">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">English</p>
                    <p className="text-sm font-medium text-green-900/80 leading-relaxed whitespace-pre-wrap">{item.message_en}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-9 h-9 rounded-xl border-slate-200 text-slate-600 hover:text-green-600 hover:bg-green-50 hover:border-green-200"
                  onClick={() => handleEdit(item)}
                >
                  <AppIcon icon="Edit2" className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="w-9 h-9 rounded-xl border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                    >
                      <AppIcon icon="Trash2" className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Template?</AlertDialogTitle>
                      <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                      <AlertDialogAction className="rounded-xl bg-rose-500 hover:bg-rose-600" onClick={() => handleDelete(item.id)}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="text-center py-16 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <AppIcon icon="MessageCircle" className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Belum ada template pesan.</p>
            <p className="text-sm text-slate-400 mt-1">
              Tambah template untuk memudahkan pengunjung menghubungi Anda.
            </p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <AppIcon icon="MessageCircle" className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedTemplate ? 'Edit Template' : 'Tambah Template Baru'}
                  </h2>
                  <p className="text-sm font-medium text-slate-500">
                    {selectedTemplate ? 'Perbarui pesan template WhatsApp' : 'Buat pesan template baru'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <AppIcon icon="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              <form id="templateForm" onSubmit={handleSubmit} className="space-y-6">
                {/* Bilingual Content Section */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <AppIcon icon="Globe" className="w-4 h-4 text-green-500" />
                    Konten Multibahasa
                  </h3>
                  
                  <Tabs defaultValue="id" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                      <TabsTrigger value="id" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
                        🇮🇩 Indonesia
                      </TabsTrigger>
                      <TabsTrigger value="en" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
                        🇬🇧 English
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="id" className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="message_id" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          Pesan Template (Indonesia) <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                          id="message_id"
                          value={formData.message_id}
                          onChange={e => setFormData(prev => ({ ...prev, message_id: e.target.value }))}
                          placeholder="Contoh: Halo, saya ingin bertanya tentang tiket masuk kebun binatang..."
                          rows={4}
                          className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium text-sm resize-none"
                          required
                        />
                        <p className="text-[11px] font-medium text-slate-500">
                          Pesan ini akan dikirim ke WhatsApp saat pengunjung memilih template
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="en" className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="message_en" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          Message Template (English)
                        </Label>
                        <Textarea
                          id="message_en"
                          value={formData.message_en}
                          onChange={e => setFormData(prev => ({ ...prev, message_en: e.target.value }))}
                          placeholder="Example: Hello, I would like to ask about zoo entrance tickets..."
                          rows={4}
                          className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium text-sm resize-none"
                        />
                        <p className="text-[11px] font-medium text-slate-500">
                          Opsional - akan ditampilkan saat pengunjung memilih bahasa Inggris
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Settings Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <AppIcon icon="MessageCircle" className="w-4 h-4 text-green-500" />
                    Pengaturan
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Label htmlFor="order_index" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Urutan Tampil
                      </Label>
                      <Input
                        id="order_index"
                        type="number"
                        min="0"
                        value={formData.order_index}
                        onChange={e => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                        className="h-11 bg-white border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold"
                      />
                      <p className="text-[11px] font-medium text-slate-500 mt-2">
                        Angka lebih kecil = tampil lebih dulu
                      </p>
                    </div>

                    <div className="space-y-1.5 p-4 bg-green-50/50 rounded-2xl border border-green-100 flex flex-col justify-between">
                      <Label className="text-[10px] font-bold text-green-900 uppercase tracking-wider">Status Template</Label>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-green-700">
                          {formData.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <Switch
                          id="active"
                          checked={formData.is_active}
                          onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                      <p className="text-[11px] font-medium text-green-600/80 mt-2">
                        Template nonaktif tidak akan ditampilkan
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50"
                onClick={() => setShowModal(false)}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                form="templateForm"
                className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Template'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
