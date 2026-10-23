"use client";

import { useState, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { 
  Settings, 
  FileText, 
  Users, 
  MessageCircle, 
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Download,
  Phone,
  Mail,
  AlertCircle,
  GraduationCap,
  FlaskConical,
  Stethoscope,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { ServiceSettings, ServiceFaq, uploadTemplateFile } from '@/hooks/useServiceSettings';
import { 
  updateServiceSettingsAction,
  upsertServiceFaqAction,
  deleteServiceFaqAction
} from './actions';
import { supabase } from '@/integrations/supabase/client';

const categoryConfig = {
  pkl: { label: 'PKL / Magang', icon: GraduationCap, color: 'text-blue-600 bg-blue-100', border: 'border-blue-200' },
  research: { label: 'Penelitian', icon: FlaskConical, color: 'text-purple-600 bg-purple-100', border: 'border-purple-200' },
  koas: { label: 'Koas', icon: Stethoscope, color: 'text-orange-600 bg-orange-100', border: 'border-orange-200' },
  interview: { label: 'Wawancara', icon: Mic, color: 'text-green-600 bg-green-100', border: 'border-green-200' },
  general: { label: 'Umum', icon: HelpCircle, color: 'text-slate-600 bg-slate-100', border: 'border-slate-200' },
};

export default function ManageServiceSettingsClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [settings, setSettings] = useState<ServiceSettings | null>(null);
  const [faqs, setFaqs] = useState<ServiceFaq[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingFaq, setSavingFaq] = useState(false);

  // Form states
  const [adminWhatsapp, setAdminWhatsapp] = useState(settings?.admin_whatsapp || '');
  const [adminEmail, setAdminEmail] = useState(settings?.admin_email || '');
  const [limits, setLimits] = useState({
    pkl: settings?.limit_pkl?.toString() || '',
    research: settings?.limit_research?.toString() || '',
    koas: settings?.limit_koas?.toString() || '',
    interview: settings?.limit_interview?.toString() || '',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: settingsData } = await supabase.from('service_settings').select('*').single();
        if (settingsData) {
          setSettings(settingsData as any);
          setAdminWhatsapp(settingsData.admin_whatsapp || '');
          setAdminEmail(settingsData.admin_email || '');
          setLimits({
            pkl: settingsData.limit_pkl?.toString() || '',
            research: settingsData.limit_research?.toString() || '',
            koas: settingsData.limit_koas?.toString() || '',
            interview: settingsData.limit_interview?.toString() || '',
          });
          setRequiredDocs({
            pkl: settingsData.required_documents_pkl || [],
            research: settingsData.required_documents_research || [],
            koas: settingsData.required_documents_koas || [],
            interview: settingsData.required_documents_interview || [],
          });
        }

        const { data: faqsData } = await supabase.from('service_faqs').select('*').order('order_index', { ascending: true });
        if (faqsData) setFaqs(faqsData as any);

        const { data: regsData } = await supabase.from('service_registrations').select('program_type, status');
        if (regsData) {
          const newCounts = { pkl: 0, research: 0, koas: 0, interview: 0 };
          regsData.forEach((reg: any) => {
            if (reg.status !== 'rejected' && reg.status !== 'completed') {
              const type = reg.program_type as keyof typeof newCounts;
              if (type in newCounts) {
                newCounts[type]++;
              }
            }
          });
          setCounts(newCounts);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'service_settings') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }
  , []);

  
  const [requiredDocs, setRequiredDocs] = useState<Record<string, string[]>>({
    pkl: settings?.required_documents_pkl || [],
    research: settings?.required_documents_research || [],
    koas: settings?.required_documents_koas || [],
    interview: settings?.required_documents_interview || [],
  });

  // FAQ Modal
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ServiceFaq | null>(null);
  const [faqForm, setFaqForm] = useState({
    category: 'general' as ServiceFaq['category'],
    question_id: '',
    question_en: '',
    answer_id: '',
    answer_en: '',
    is_active: true,
  });

  // Document input states
  const [newDocInputs, setNewDocInputs] = useState<Record<string, string>>({
    pkl: '',
    research: '',
    koas: '',
    interview: '',
  });

  const handleSaveContact = async () => {
    setSavingSettings(true);
    try {
      const result = await updateServiceSettingsAction({
        admin_whatsapp: adminWhatsapp || null,
        admin_email: adminEmail || null,
      });
      if (!result.success) throw new Error(result.error);
      toast.success('Kontak admin berhasil disimpan');
    } catch (error: any) {
      toast.error('Gagal menyimpan kontak admin: ' + error.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveLimits = async () => {
    setSavingSettings(true);
    try {
      const result = await updateServiceSettingsAction({
        limit_pkl: limits.pkl ? parseInt(limits.pkl) : null,
        limit_research: limits.research ? parseInt(limits.research) : null,
        limit_koas: limits.koas ? parseInt(limits.koas) : null,
        limit_interview: limits.interview ? parseInt(limits.interview) : null,
      });
      if (!result.success) throw new Error(result.error);
      toast.success('Limit penerimaan berhasil disimpan');
    } catch (error: any) {
      toast.error('Gagal menyimpan limit: ' + error.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveDocuments = async (category: string) => {
    setSavingSettings(true);
    try {
      const updateData: Record<string, string[]> = {};
      updateData[`required_documents_${category}`] = requiredDocs[category];
      const result = await updateServiceSettingsAction(updateData as any);
      if (!result.success) throw new Error(result.error);
      toast.success('Dokumen persyaratan berhasil disimpan');
    } catch (error: any) {
      toast.error('Gagal menyimpan dokumen: ' + error.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const addDocument = (category: string) => {
    const newDoc = newDocInputs[category].trim();
    if (newDoc && !requiredDocs[category].includes(newDoc)) {
      setRequiredDocs(prev => ({
        ...prev,
        [category]: [...prev[category], newDoc],
      }));
      setNewDocInputs(prev => ({ ...prev, [category]: '' }));
    }
  };

  const removeDocument = (category: string, index: number) => {
    setRequiredDocs(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const handleUploadTemplate = async (type: 'cover_letter' | 'proposal', file: File) => {
    try {
      toast.loading('Mengupload template...', { id: 'upload' });
      const url = await uploadTemplateFile(file, type);
      const result = await updateServiceSettingsAction({
        [type === 'cover_letter' ? 'cover_letter_template_url' : 'proposal_template_url']: url,
      });
      if (!result.success) throw new Error(result.error);
      
      setSettings(prev => prev ? {
        ...prev,
        [type === 'cover_letter' ? 'cover_letter_template_url' : 'proposal_template_url']: url
      } : null);
      
      toast.success('Template berhasil diupload', { id: 'upload' });
    } catch (error: any) {
      toast.error('Gagal mengupload template: ' + error.message, { id: 'upload' });
    }
  };

  const handleSaveFaq = async () => {
    setSavingFaq(true);
    try {
      const payload = {
        id: editingFaq?.id,
        ...faqForm,
        order_index: editingFaq ? editingFaq.order_index : (faqs.length + 1),
      };
      
      const result = await upsertServiceFaqAction(payload);
      if (!result.success) throw new Error(result.error);
      
      toast.success(editingFaq ? 'FAQ berhasil diperbarui' : 'FAQ berhasil ditambahkan');
      setFaqModalOpen(false);
      resetFaqForm();
      window.location.reload();
    } catch (error: any) {
      toast.error('Gagal menyimpan FAQ: ' + error.message);
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!(await confirm("Konfirmasi", 'Yakin ingin menghapus FAQ ini?'))) return;
    try {
      const result = await deleteServiceFaqAction(id);
      if (!result.success) throw new Error(result.error);
      
      toast.success('FAQ berhasil dihapus');
      setFaqs(prev => prev.filter(f => f.id !== id));
    } catch (error: any) {
      toast.error('Gagal menghapus FAQ: ' + error.message);
    }
  };

  const resetFaqForm = () => {
    setEditingFaq(null);
    setFaqForm({
      category: 'general',
      question_id: '',
      question_en: '',
      answer_id: '',
      answer_en: '',
      is_active: true,
    });
  };

  const openEditFaq = (faq: ServiceFaq) => {
    setEditingFaq(faq);
    setFaqForm({
      category: faq.category,
      question_id: faq.question_id,
      question_en: faq.question_en || '',
      answer_id: faq.answer_id,
      answer_en: faq.answer_en || '',
      is_active: faq.is_active,
    });
    setFaqModalOpen(true);
  };

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, ServiceFaq[]>) || {};

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
              <Settings className="w-5 h-5 text-green-500" />
            </div>
            Pengaturan Layanan
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">
            Kelola dokumen, limit, kontak, dan FAQ layanan pendaftaran
          </p>
        </div>
      </div>

      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList className="grid w-full md:w-[500px] grid-cols-4 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <TabsTrigger value="contact" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
            <Phone className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Kontak</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Dokumen</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
            <Users className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Limit</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
            <HelpCircle className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">FAQ</span>
          </TabsTrigger>
        </TabsList>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <MessageCircle className="w-5 h-5 text-green-500" /> Kontak Admin
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Informasi kontak yang akan ditampilkan di halaman layanan
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-3 h-3 text-green-500" />
                  Nomor WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="628123456789"
                  value={adminWhatsapp}
                  onChange={(e) => setAdminWhatsapp(e.target.value)}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
                <p className="text-[11px] font-medium text-slate-500">
                  Format: 628xxx (tanpa + atau 0)
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3 h-3 text-rose-500" />
                  Email Admin
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleSaveContact} 
                disabled={savingSettings}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingSettings ? 'Menyimpan...' : 'Simpan Kontak'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {/* Template Files */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Download className="w-5 h-5 text-green-500" /> Template Dokumen
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Upload template yang bisa diunduh pengunjung
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Letter Template */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-[1.5rem] p-5 space-y-4">
                <Label className="text-sm font-bold text-slate-800">Template Surat Pengantar</Label>
                {settings?.cover_letter_template_url ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-green-900">Template Tersedia</span>
                    <a 
                      href={settings.cover_letter_template_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold bg-white border border-green-200 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Unduh
                    </a>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                    <p className="text-sm font-medium text-rose-600">Belum ada template</p>
                  </div>
                )}
                <div className="pt-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadTemplate('cover_letter', file);
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer h-auto py-2 bg-white"
                  />
                </div>
              </div>

              {/* Proposal Template */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-[1.5rem] p-5 space-y-4">
                <Label className="text-sm font-bold text-slate-800">Template Proposal</Label>
                {settings?.proposal_template_url ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-green-900">Template Tersedia</span>
                    <a 
                      href={settings.proposal_template_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold bg-white border border-green-200 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Unduh
                    </a>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                    <p className="text-sm font-medium text-rose-600">Belum ada template</p>
                  </div>
                )}
                <div className="pt-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadTemplate('proposal', file);
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer h-auto py-2 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents per Category */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <FileText className="w-5 h-5 text-green-500" /> Dokumen yang Diperlukan
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Atur daftar dokumen yang harus disiapkan per kategori
            </p>
            
            <Accordion type="multiple" className="space-y-3">
              {(['pkl', 'research', 'koas', 'interview'] as const).map((category) => {
                const config = categoryConfig[category];
                const Icon = config.icon as any;
                return (
                  <AccordionItem key={category} value={category} className={`bg-white border rounded-[1.5rem] px-5 ${config.border} overflow-hidden data-[state=open]:shadow-sm transition-all`}>
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800">{config.label}</span>
                        <Badge variant="secondary" className="ml-3 bg-slate-100 text-slate-600 font-bold px-2.5 py-1">
                          {requiredDocs[category]?.length || 0} dokumen
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-5 space-y-5">
                      {/* Document List */}
                      <div className="space-y-2">
                        {requiredDocs[category]?.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 group">
                            <span className="text-sm font-medium text-slate-700">{doc}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => removeDocument(category, index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(!requiredDocs[category] || requiredDocs[category].length === 0) && (
                          <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                            <p className="text-sm font-medium text-slate-400">Belum ada dokumen yang disyaratkan</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Add New Document */}
                      <div className="flex gap-3">
                        <Input
                          placeholder="Nama dokumen baru..."
                          value={newDocInputs[category]}
                          onChange={(e) => setNewDocInputs(prev => ({ ...prev, [category]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && addDocument(category)}
                          className="h-11 bg-slate-50 border-slate-200 rounded-xl"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => addDocument(category)}
                          className="h-11 w-11 p-0 rounded-xl border-slate-200 text-green-600 hover:bg-green-50 flex-shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button 
                          onClick={() => handleSaveDocuments(category)}
                          disabled={savingSettings}
                          size="sm"
                          className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold px-5"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits" className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Users className="w-5 h-5 text-green-500" /> Limit Penerimaan
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Batasi jumlah pendaftaran aktif per kategori (kosongkan untuk tidak terbatas)
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              {(['pkl', 'research', 'koas', 'interview'] as const).map((category) => {
                const config = categoryConfig[category];
                const Icon = config.icon as any;
                const currentCount = counts?.[category] || 0;
                const limit = limits[category] ? parseInt(limits[category]) : null;
                const isNearLimit = limit && currentCount >= limit * 0.8;
                const isAtLimit = limit && currentCount >= limit;

                return (
                  <div key={category} className={`bg-white border rounded-[1.5rem] p-5 space-y-4 ${config.border}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <Label className="font-bold text-slate-800 text-base">{config.label}</Label>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          Aktif: <span className={isAtLimit ? 'text-rose-500' : 'text-green-600'}>{currentCount}</span>{limit ? ` / ${limit}` : ''}
                        </p>
                      </div>
                      {isAtLimit && (
                        <Badge variant="destructive" className="ml-auto rounded-lg px-2.5 py-1">Penuh</Badge>
                      )}
                      {isNearLimit && !isAtLimit && (
                        <Badge variant="outline" className="ml-auto text-orange-600 border-orange-200 bg-orange-50 rounded-lg px-2.5 py-1">
                          Hampir Penuh
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Batas Maksimal</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Tidak terbatas"
                        value={limits[category]}
                        onChange={(e) => setLimits(prev => ({ ...prev, [category]: e.target.value }))}
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-2">
              <Button 
                onClick={handleSaveLimits} 
                disabled={savingSettings}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingSettings ? 'Menyimpan...' : 'Simpan Limit'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[1.5rem] shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-green-500" /> FAQ Layanan
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Pertanyaan yang sering diajukan, dikelompokkan per kategori
                </p>
              </div>
              <Button onClick={() => { resetFaqForm(); setFaqModalOpen(true); }} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20">
                <Plus className="w-4 h-4 mr-2" />
                Tambah FAQ
              </Button>
            </div>
            
            <Accordion type="multiple" defaultValue={['general']} className="space-y-3">
              {(['general', 'pkl', 'research', 'koas', 'interview'] as const).map((category) => {
                const config = categoryConfig[category];
                const Icon = config.icon as any;
                const categoryFaqs = groupedFaqs[category] || [];

                return (
                  <AccordionItem key={category} value={category} className={`bg-white border rounded-[1.5rem] px-5 ${config.border} overflow-hidden data-[state=open]:shadow-sm transition-all`}>
                    <AccordionTrigger className="hover:no-underline py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800">{config.label}</span>
                        <Badge variant="secondary" className="ml-3 bg-slate-100 text-slate-600 font-bold px-2.5 py-1">
                          {categoryFaqs.length} FAQ
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-5 space-y-3">
                      {categoryFaqs.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                          <p className="text-sm font-medium text-slate-400">Belum ada FAQ untuk kategori ini</p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {categoryFaqs.map((faq) => (
                            <div key={faq.id} className={`bg-white border ${faq.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60'} rounded-xl p-4 shadow-sm group`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      {!faq.is_active && (
                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 rounded bg-slate-50 text-slate-500">Nonaktif</Badge>
                                      )}
                                    </div>
                                    <p className="font-bold text-slate-800 text-sm leading-relaxed">{faq.question_id}</p>
                                    {faq.question_en && (
                                      <p className="text-[11px] text-green-500 font-bold mt-1 uppercase tracking-wider">EN: <span className="normal-case text-slate-500 font-medium">{faq.question_en}</span></p>
                                    )}
                                  </div>
                                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{faq.answer_id}</p>
                                    {faq.answer_en && (
                                      <p className="text-[11px] text-green-500 font-bold mt-2 pt-2 border-t border-slate-200 uppercase tracking-wider">EN: <span className="normal-case text-slate-500 font-medium">{faq.answer_en}</span></p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50"
                                    onClick={() => openEditFaq(faq)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={() => handleDeleteFaq(faq.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>

      {/* FAQ Modal */}
      <Dialog open={faqModalOpen} onOpenChange={setFaqModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl custom-scrollbar">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <HelpCircle className="w-5 h-5 text-green-500" />
              </div>
              {editingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Kategori</Label>
              <Select 
                value={faqForm.category} 
                onValueChange={(v) => setFaqForm(prev => ({ ...prev, category: v as ServiceFaq['category'] }))}
              >
                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="font-bold">
                      <span className="flex items-center gap-2">
                        <config.icon className="w-4 h-4 text-slate-400" />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Pertanyaan (Indonesia) <span className="text-rose-500">*</span></Label>
                <Input
                  value={faqForm.question_id}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, question_id: e.target.value }))}
                  placeholder="Pertanyaan dalam Bahasa Indonesia"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Pertanyaan (English)</Label>
                <Input
                  value={faqForm.question_en}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, question_en: e.target.value }))}
                  placeholder="Question in English (optional)"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Jawaban (Indonesia) <span className="text-rose-500">*</span></Label>
              <Textarea
                value={faqForm.answer_id}
                onChange={(e) => setFaqForm(prev => ({ ...prev, answer_id: e.target.value }))}
                placeholder="Jawaban dalam Bahasa Indonesia"
                rows={3}
                className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Jawaban (English)</Label>
              <Textarea
                value={faqForm.answer_en}
                onChange={(e) => setFaqForm(prev => ({ ...prev, answer_en: e.target.value }))}
                placeholder="Answer in English (optional)"
                rows={3}
                className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-green-900">Status Aktif</Label>
                <p className="text-[11px] font-medium text-green-600/80">FAQ aktif akan ditampilkan di halaman publik</p>
              </div>
              <Switch
                checked={faqForm.is_active}
                onCheckedChange={(v) => setFaqForm(prev => ({ ...prev, is_active: v }))}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
          <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setFaqModalOpen(false)} className="flex-1 rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50">
              Batal
            </Button>
            <Button 
              onClick={handleSaveFaq}
              disabled={!faqForm.question_id || !faqForm.answer_id || savingFaq}
              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20"
            >
              {savingFaq ? 'Menyimpan...' : (editingFaq ? 'Simpan Perubahan' : 'Tambah FAQ')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    {ConfirmComponent}
    </div>
  );
}
