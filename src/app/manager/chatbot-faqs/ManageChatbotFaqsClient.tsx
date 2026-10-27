"use client";

import { useState, useEffect } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { AppIcon } from '@/components/ui/AppIcon';
import { ChatbotFaq } from '@/hooks/useChatbotFaqs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { deleteChatbotFaqAction, upsertChatbotFaqAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

export default function ManageChatbotFaqsClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [faqs, setFaqs] = useState<ChatbotFaq[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<ChatbotFaq | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [keywordInput, setKeywordInput] = useState('');
  
  const [formData, setFormData] = useState({
    question_id: '',
    question_en: '',
    answer_id: '',
    answer_en: '',
    keywords: [] as string[],
    category: 'umum',
    is_active: true,
    order_index: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: faqsData } = await supabase.from('chatbot_faqs').select('*').order('display_order', { ascending: true });
        if (faqsData) setFaqs(faqsData as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'chatbot_faqs') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question_id.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    faq.answer_id.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    faq.keywords.some(k => k.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
  );

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems: paginatedFaqs,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredFaqs, 10);

  const resetForm = () => {
    setFormData({ 
      question_id: '', 
      question_en: '',
      answer_id: '',
      answer_en: '',
      keywords: [],
      category: 'umum',
      is_active: true,
      order_index: faqs.length
    });
    setSelectedFaq(null);
    setKeywordInput('');
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item: ChatbotFaq) => {
    setSelectedFaq(item);
    setFormData({
      question_id: item.question_id,
      question_en: item.question_en || '',
      answer_id: item.answer_id,
      answer_en: item.answer_en || '',
      keywords: item.keywords || [],
      category: item.category || 'umum',
      is_active: item.is_active,
      order_index: item.order_index
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if ((await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus FAQ ini?'))) {
      try {
        const result = await deleteChatbotFaqAction(id);
        if (!result.success) throw new Error(result.error);
        
        setFaqs(prev => prev.filter(f => f.id !== id));
        toast.success('FAQ berhasil dihapus');
      } catch (err: any) {
        toast.error('Gagal menghapus: ' + err.message);
      }
    }
  };

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_id.trim() || !formData.answer_id.trim()) {
      toast.error('Pertanyaan dan jawaban (Indonesia) wajib diisi');
      return;
    }

    setSaving(true);
    
    const payload = {
      id: selectedFaq?.id,
      question_id: formData.question_id,
      question_en: formData.question_en || null,
      answer_id: formData.answer_id,
      answer_en: formData.answer_en || null,
      keywords: formData.keywords,
      category: formData.category,
      is_active: formData.is_active,
      order_index: formData.order_index
    };

    try {
      const result = await upsertChatbotFaqAction(payload);
      if (!result.success) throw new Error(result.error);

      toast.success(selectedFaq ? 'FAQ berhasil diperbarui' : 'FAQ berhasil ditambahkan');
      setShowModal(false);
      
      // Update local state, ideally we should refresh from server to get correct IDs on create
      window.location.reload(); 
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = [
    { value: 'umum', label: 'Umum' },
    { value: 'tiket', label: 'Tiket' },
    { value: 'fasilitas', label: 'Fasilitas' },
    { value: 'hewan', label: 'Hewan' },
    { value: 'lokasi', label: 'Lokasi' },
    { value: 'event', label: 'Event' },
    { value: 'info', label: 'Informasi' },
  ];

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
              <AppIcon icon="Bot" className="w-5 h-5 text-green-500" />
            </div>
            FAQ Chatbot
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola pertanyaan & jawaban untuk asisten virtual</p>
        </div>
        <button onClick={handleAdd} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5">
          <AppIcon icon="Plus" className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah FAQ</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-violet-50 rounded-[1.5rem] p-5 border border-green-100 flex gap-4">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
          <AppIcon icon="Bot" className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h3 className="font-bold text-green-900 mb-1">Cara Kerja FAQ Chatbot</h3>
          <p className="text-sm font-medium text-green-800/80">
            Chatbot akan mencocokkan pertanyaan pengunjung dengan <strong>keywords</strong> yang Anda tentukan. Semakin banyak keyword yang relevan, semakin akurat chatbot menjawab pertanyaan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total FAQ</p>
          <p className="text-3xl font-black text-slate-800">{faqs.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">FAQ Aktif</p>
          <p className="text-3xl font-black text-green-500">{faqs.filter(f => f.is_active).length}</p>
        </div>
        <div className="md:col-span-2 bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm">
          <div className="relative h-full flex flex-col justify-end">
            <AppIcon icon="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan pertanyaan, jawaban, atau keyword..."
              className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-slate-700 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="manager-table-shell">
        {paginatedFaqs.length > 0 ? (
          <>
            <div className="hidden md:block manager-table-scroll">
              <table className="manager-table">
                <thead className="manager-table-head">
                  <tr>
                    <th className="manager-table-th w-14 rounded-tl-[1rem]">#</th>
                    <th className="manager-table-th min-w-[280px]">Pertanyaan & Jawaban</th>
                    <th className="manager-table-th w-32">Kategori</th>
                    <th className="manager-table-th w-48">Keywords</th>
                    <th className="manager-table-th manager-table-th-center w-24">Status</th>
                    <th className="manager-table-th manager-table-th-right w-28 rounded-tr-[1rem]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedFaqs.map((item, index) => (
                    <tr key={item.id} className="manager-table-row">
                      <td className="manager-table-td text-slate-400 align-top">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="manager-table-td align-top">
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AppIcon icon="HelpCircle" className="w-3.5 h-3.5 text-green-500" />
                            </div>
                            <p className="font-bold text-slate-800 leading-snug">{item.question_id}</p>
                          </div>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed ml-9 line-clamp-2">{item.answer_id}</p>
                        </div>
                      </td>
                      <td className="manager-table-td align-top">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border-slate-200">{item.category}</Badge>
                      </td>
                      <td className="manager-table-td align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {item.keywords.slice(0, 3).map(k => (
                            <span key={k} className="text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 px-2 py-1 rounded-lg">{k}</span>
                          ))}
                          {item.keywords.length > 3 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">+{item.keywords.length - 3}</span>
                          )}
                          {item.keywords.length === 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 italic bg-slate-50 px-2 py-1 rounded-lg">Kosong</span>
                          )}
                        </div>
                      </td>
                      <td className="manager-table-td manager-table-td-center align-top">
                        <Badge variant={item.is_active ? 'default' : 'secondary'} className={`text-[10px] font-bold uppercase tracking-wider ${item.is_active ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="manager-table-td manager-table-td-right align-top">
                        <div className="manager-table-actions justify-end">
                          <button onClick={() => handleEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                            <AppIcon icon="Edit2" className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                            <AppIcon icon="Trash2" className="w-4 h-4" />
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
              {paginatedFaqs.map((item, index) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AppIcon icon="HelpCircle" className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm leading-snug">{item.question_id}</p>
                    </div>
                    <Badge variant={item.is_active ? 'default' : 'secondary'} className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider ${item.is_active ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-100 text-slate-500'}`}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 ml-8">
                    <p className="text-xs font-medium text-slate-600 line-clamp-3">{item.answer_id}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3 ml-8">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white text-slate-600 border-slate-200">{item.category}</Badge>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.slice(0, 2).map(k => (
                        <span key={k} className="text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 px-1.5 py-0.5 rounded-md">{k}</span>
                      ))}
                      {item.keywords.length > 2 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">+{item.keywords.length - 2}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100/80 ml-8">
                    <button onClick={() => handleEdit(item)} className="px-3 py-1.5 text-xs font-bold rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-1.5">
                      <AppIcon icon="Edit2" className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5">
                      <AppIcon icon="Trash2" className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 25, 50]}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <AppIcon icon="Bot" className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 mb-1">{searchQuery ? 'Tidak ada FAQ yang cocok' : 'Belum ada FAQ'}</p>
            <p className="text-sm font-medium text-slate-500">Tambahkan FAQ baru untuk membantu chatbot menjawab pertanyaan</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/60">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                  {selectedFaq ? <AppIcon icon="Edit2" className="w-5 h-5 text-green-500" /> : <AppIcon icon="Plus" className="w-5 h-5 text-green-500" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}</h2>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <AppIcon icon="X" className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100"><AppIcon icon="Globe" className="w-4 h-4 text-blue-500" /></div>
                  Pertanyaan & Jawaban (Bilingual)
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                      <span className="text-xl">🇮🇩</span>
                      <span className="text-sm font-bold text-slate-800">Indonesia</span>
                      <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider ml-auto bg-rose-100 text-rose-600 hover:bg-rose-200 border-0">Wajib</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pertanyaan</Label>
                      <Input value={formData.question_id} onChange={e => setFormData(prev => ({ ...prev, question_id: e.target.value }))} placeholder="Contoh: Berapa harga tiket masuk?" className="bg-white border-slate-200 rounded-xl focus-visible:ring-green-500" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jawaban</Label>
                      <Textarea value={formData.answer_id} onChange={e => setFormData(prev => ({ ...prev, answer_id: e.target.value }))} placeholder="Contoh: Harga tiket masuk Rp 3.000 untuk dewasa..." rows={5} className="bg-white border-slate-200 rounded-xl focus-visible:ring-green-500 resize-none" required />
                    </div>
                  </div>
                  
                  <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                      <span className="text-xl">🇬🇧</span>
                      <span className="text-sm font-bold text-slate-800">English</span>
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider ml-auto bg-slate-200 text-slate-600 hover:bg-slate-300 border-0">Opsional</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Question</Label>
                      <Input value={formData.question_en} onChange={e => setFormData(prev => ({ ...prev, question_en: e.target.value }))} placeholder="Example: What is the entrance fee?" className="bg-white border-slate-200 rounded-xl focus-visible:ring-green-500" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Answer</Label>
                      <Textarea value={formData.answer_en} onChange={e => setFormData(prev => ({ ...prev, answer_en: e.target.value }))} placeholder="Example: The entrance fee is Rp 3,000 for adults..." rows={5} className="bg-white border-slate-200 rounded-xl focus-visible:ring-green-500 resize-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5 bg-green-50/50 rounded-2xl border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-green-900">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center border border-green-200"><AppIcon icon="Tag" className="w-4 h-4 text-green-600" /></div>
                    Keywords (Kata Kunci)
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white border-green-200 text-green-600">{formData.keywords.length} keyword</Badge>
                </div>
                <p className="text-xs font-medium text-green-800/70">Tambahkan kata kunci yang mungkin diketik pengunjung untuk menemukan FAQ ini</p>
                
                <div className="flex gap-2">
                  <input value={keywordInput} onChange={e => setKeywordInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())} placeholder="Ketik keyword lalu Enter..." className="flex-1 px-4 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none font-medium text-sm text-slate-700" />
                  <button type="button" onClick={handleAddKeyword} className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-colors shadow-sm">
                    <AppIcon icon="Plus" className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 min-h-[32px] bg-white rounded-xl p-3 border border-green-100">
                  {formData.keywords.length > 0 ? (
                    formData.keywords.map(keyword => (
                      <div key={keyword} className="pl-3 pr-1 py-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded-lg">
                        {keyword}
                        <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="w-5 h-5 hover:bg-green-200 rounded flex items-center justify-center transition-colors"><AppIcon icon="X" className="w-3 h-3" /></button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs font-bold text-slate-400 italic flex items-center gap-1"><AppIcon icon="Tag" className="w-3 h-3" /> Belum ada keyword</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kategori</Label>
                  <select value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none font-medium text-sm text-slate-700">
                    {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Urutan Tampil</Label>
                  <Input type="number" min="0" value={formData.order_index} onChange={e => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))} className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status FAQ</Label>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 h-11">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${formData.is_active ? 'text-green-600' : 'text-slate-500'}`}>{formData.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    <Switch checked={formData.is_active} onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))} className="data-[state=checked]:bg-green-500" />
                  </div>
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/80">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 px-6">Batal</Button>
              <Button onClick={handleSubmit} disabled={saving} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
                {saving ? 'Menyimpan...' : selectedFaq ? 'Simpan Perubahan' : 'Tambah FAQ'}
              </Button>
            </div>
          </div>
        </div>
      )}
    {ConfirmComponent}
    </div>
  );
}
