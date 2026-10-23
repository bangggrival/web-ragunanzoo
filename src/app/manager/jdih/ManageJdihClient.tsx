"use client";

import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, Filter, X, Scale, Download, ExternalLink, Globe, Loader2, Upload } from 'lucide-react';
import { JdihDocument, JDIH_TYPES, JDIH_STATUSES } from '@/hooks/useJdihDocuments';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { deleteJdihDocumentAction, upsertJdihDocumentAction } from './actions';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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

interface ManageJdihClientProps {
  initialDocuments: JdihDocument[];
}

export default function ManageJdihClient() {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<JdihDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<JdihDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<JdihDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('jdih_documents').select('*').order('created_at', { ascending: false });
        if (data) setDocuments(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'jdih_documents') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const filteredDocs = documents.filter(doc => {
    const query = debouncedSearchQuery.toLowerCase();
    const matchesSearch = !query || Object.values(doc).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(query)
    );
    const matchesType = !typeFilter || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredDocs, 10);

  const hasFilters = Boolean(searchQuery || typeFilter);

  const handleAdd = () => { setSelectedDoc(null); setShowModal(true); };
  const handleEdit = (doc: JdihDocument) => { setSelectedDoc(doc); setShowModal(true); };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    try {
      const result = await deleteJdihDocumentAction(deleteDoc.id);
      if (!result.success) throw new Error(result.error);
      toast.success(language === 'en' ? 'Document deleted successfully' : 'Dokumen berhasil dihapus');
      setDocuments(prev => prev.filter(d => d.id !== deleteDoc.id));
    } catch (err: any) {
      toast.error((language === 'en' ? 'Failed to delete document: ' : 'Gagal menghapus dokumen: ') + err.message);
    } finally {
      setDeleteDoc(null);
    }
  };

  const getTypeLabel = (type: string, lang: 'id' | 'en' = 'id') => {
    const t = JDIH_TYPES.find(t => t.value === type);
    if (!t) return type;
    return lang === 'en' ? t.label_en : t.label_id;
  };

  const getTypeIcon = (type: string) => {
    return JDIH_TYPES.find(t => t.value === type)?.icon || '📄';
  };

  const getStatusInfo = (status: string) => {
    return JDIH_STATUSES.find(s => s.value === status) || JDIH_STATUSES[0];
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
              <Scale className="w-5 h-5 text-green-500" />
            </div>
            JDIH
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">
            {language === 'en' ? 'Manage legal documents' : 'Kelola dokumen hukum dan peraturan'}
          </p>
        </div>
        <button 
          onClick={handleAdd} 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          {language === 'en' ? 'Add Document' : 'Tambah Dokumen'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/60 backdrop-blur-xl rounded-[1.5rem] border border-white/80 shadow-sm">
          <div className="relative flex-1 ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search documents...' : 'Cari dokumen...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="w-px h-8 bg-slate-200 hidden sm:block self-center"></div>
          <div className="relative sm:min-w-[200px] mr-2">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
            >
              <option value="">{language === 'en' ? 'All Types' : 'Semua Jenis'}</option>
              {JDIH_TYPES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.icon} {language === 'en' ? t.label_en : t.label_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'en' ? 'Filters:' : 'Filter:'}
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:bg-green-100 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {typeFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-xs font-bold border border-violet-100">
                {getTypeIcon(typeFilter)} {getTypeLabel(typeFilter, language)}
                <button onClick={() => setTypeFilter('')} className="hover:bg-violet-100 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button onClick={() => { setSearchQuery(''); setTypeFilter(''); }} className="text-xs text-rose-500 hover:text-rose-600 font-bold ml-2">
              {language === 'en' ? 'Clear all' : 'Hapus semua'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Dokumen</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{documents.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Scale className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Berlaku</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{documents.filter(d => d.status === 'berlaku').length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dipublikasi</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{documents.filter(d => d.is_published).length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Filter className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Dokumen</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{new Set(documents.map(d => d.type)).size}</p>
        </div>
      </div>

      <div className="manager-table-shell">
        {paginatedItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <Scale className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {hasFilters 
                ? (language === 'en' ? 'No documents found' : 'Tidak ada dokumen ditemukan')
                : (language === 'en' ? 'No documents yet' : 'Belum ada dokumen')}
            </h3>
          </div>
        ) : (
          <>
            <div className="hidden md:block manager-table-scroll">
              <table className="manager-table">
                <thead className="manager-table-head">
                  <tr>
                    <th className="manager-table-th rounded-tl-[1rem]">Dokumen</th>
                    <th className="manager-table-th">Jenis</th>
                    <th className="manager-table-th">Tahun</th>
                    <th className="manager-table-th">Status</th>
                    <th className="manager-table-th">File/Link</th>
                    <th className="manager-table-th manager-table-th-right rounded-tr-[1rem]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map(doc => {
                    const statusInfo = getStatusInfo(doc.status);
                    return (
                      <tr key={doc.id} className="manager-table-row">
                        <td className="manager-table-td">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">{doc.title_id}</p>
                            <p className="text-xs font-mono font-medium text-slate-400 truncate mt-0.5">{doc.document_number}</p>
                          </div>
                        </td>
                        <td className="manager-table-td">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200/60">
                            {getTypeIcon(doc.type)} {getTypeLabel(doc.type, language)}
                          </span>
                        </td>
                        <td className="manager-table-td">
                          <span className="font-bold text-slate-600">{doc.year}</span>
                        </td>
                        <td className="manager-table-td">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            doc.status === 'berlaku' ? 'bg-green-50 text-green-600 border-green-200/50' : 
                            doc.status === 'tidak_berlaku' ? 'bg-rose-50 text-rose-600 border-rose-200/50' : 
                            'bg-slate-100 text-slate-500 border-slate-200/50'
                          }`}>
                            {language === 'en' ? statusInfo.label_en : statusInfo.label_id}
                          </span>
                        </td>
                        <td className="manager-table-td">
                          <div className="flex gap-2">
                            {doc.file_url && (
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-500 hover:bg-green-100 transition-colors">
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                            {doc.source_url && (
                              <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="manager-table-td manager-table-td-right">
                          <div className="manager-table-actions justify-end">
                            <button onClick={() => handleEdit(doc)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteDoc(doc)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Fallback View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedItems.map(doc => {
                const statusInfo = getStatusInfo(doc.status);
                return (
                  <div key={doc.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-slate-800 line-clamp-2">{doc.title_id}</p>
                        <p className="text-xs font-mono font-medium text-slate-400 mt-1">{doc.document_number}</p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
                        doc.status === 'berlaku' ? 'bg-green-50 text-green-600 border-green-200' : 
                        doc.status === 'tidak_berlaku' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {language === 'en' ? statusInfo.label_en : statusInfo.label_id}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-bold border border-slate-200">
                        {getTypeIcon(doc.type)} {getTypeLabel(doc.type, language)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-bold border border-slate-200">
                        {doc.year}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
                      <div className="flex gap-2">
                        {doc.file_url && (
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-500 hover:bg-green-100 transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        {doc.source_url && (
                          <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(doc)} className="px-3 py-1.5 text-xs font-bold rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-1.5">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => setDeleteDoc(doc)} className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5">
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200/50 mt-2 pt-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        )}
      </div>

      {showModal && (
        <JdihFormModalClient
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          document={selectedDoc}
          onSuccess={(newDoc) => {
            if (selectedDoc) {
              setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, ...newDoc } : d));
            } else {
              setDocuments(prev => [newDoc, ...prev]);
            }
          }}
          language={language}
        />
      )}

      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent className="rounded-[2rem] p-6 border-white/60 bg-white/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">
              {language === 'en' ? 'Delete Document?' : 'Hapus Dokumen?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              {language === 'en' 
                ? `Are you sure you want to delete "${deleteDoc?.title_id}"? This action cannot be undone.` 
                : `Apakah Anda yakin ingin menghapus "${deleteDoc?.title_id}"? Tindakan ini tidak dapat dibatalkan.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">
              {language === 'en' ? 'Cancel' : 'Batal'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20">
              {language === 'en' ? 'Delete' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const initialFormData = {
  document_number: '',
  title_id: '',
  title_en: '',
  type: 'peraturan',
  year: new Date().getFullYear().toString(),
  date_enacted: '',
  date_promulgated: '',
  status: 'berlaku',
  description_id: '',
  description_en: '',
  file_url: '',
  source_url: '',
  is_published: true,
  order_index: 0,
};

function JdihFormModalClient({ isOpen, onClose, document, onSuccess, language }: any) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (document) {
      setFormData({
        document_number: document.document_number || '',
        title_id: document.title_id || '',
        title_en: document.title_en || '',
        type: document.type || 'peraturan',
        year: document.year?.toString() || new Date().getFullYear().toString(),
        date_enacted: document.date_enacted || '',
        date_promulgated: document.date_promulgated || '',
        status: document.status || 'berlaku',
        description_id: document.description_id || '',
        description_en: document.description_en || '',
        file_url: document.file_url || '',
        source_url: document.source_url || '',
        is_published: document.is_published ?? true,
        order_index: document.order_index || 0,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [document, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Hanya file PDF yang diperbolehkan');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 50MB');
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;

    try {
      const { data, error } = await supabase.storage
        .from('jdih-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('jdih-files')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, file_url: publicUrl.publicUrl }));
      toast.success('File berhasil diunggah');
    } catch (err: any) {
      toast.error('Gagal mengunggah file: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.document_number.trim() || !formData.title_id.trim()) {
      toast.error('Nomor dokumen dan judul wajib diisi');
      return;
    }

    setLoading(true);

    const payload = {
      id: document?.id,
      document_number: formData.document_number.trim(),
      title_id: formData.title_id.trim(),
      title_en: formData.title_en || null,
      type: formData.type,
      year: parseInt(formData.year) || new Date().getFullYear(),
      date_enacted: formData.date_enacted || null,
      date_promulgated: formData.date_promulgated || null,
      status: formData.status,
      description_id: formData.description_id || null,
      description_en: formData.description_en || null,
      file_url: formData.file_url || null,
      source_url: formData.source_url || null,
      is_published: formData.is_published,
      order_index: formData.order_index,
    };

    try {
      const result = await upsertJdihDocumentAction(payload);
      if (!result.success) throw new Error(result.error);
      
      onSuccess({ ...payload, id: document?.id || Date.now().toString() });
      onClose();
      toast.success(document ? 'Dokumen diperbarui' : 'Dokumen ditambahkan');
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-white/40 rounded-[2rem] p-0">
        <DialogHeader className="p-6 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <Scale className="w-5 h-5 text-green-500" />
            </div>
            {document ? 'Edit Dokumen JDIH' : 'Tambah Dokumen JDIH'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Lengkapi detail dokumen hukum untuk dipublikasikan di JDIH.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Informasi Dokumen</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nomor Dokumen *</label>
                <input type="text" value={formData.document_number} onChange={(e) => setFormData({ ...formData, document_number: e.target.value })} placeholder="Contoh: No. 123/KEP/2024" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jenis Dokumen</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-bold text-sm text-slate-700 cursor-pointer">
                  {JDIH_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label_id}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-bold text-sm text-slate-700 cursor-pointer">
                  {JDIH_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label_id}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tahun *</label>
                <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tanggal Ditetapkan</label>
                <input type="date" value={formData.date_enacted} onChange={(e) => setFormData({ ...formData, date_enacted: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tanggal Diundangkan</label>
                <input type="date" value={formData.date_promulgated} onChange={(e) => setFormData({ ...formData, date_promulgated: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" /> Konten Multibahasa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg inline-block">🇮🇩 Indonesia</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Judul Dokumen (ID) *</label>
                  <input type="text" value={formData.title_id} onChange={(e) => setFormData({ ...formData, title_id: e.target.value })} placeholder="Judul Dokumen..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deskripsi (ID)</label>
                  <textarea value={formData.description_id} onChange={(e) => setFormData({ ...formData, description_id: e.target.value })} rows={3} placeholder="Ringkasan..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg inline-block">🇬🇧 English</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Title (EN)</label>
                  <input type="text" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} placeholder="Document Title..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description (EN)</label>
                  <textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} rows={3} placeholder="Summary..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> File & Tautan</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-all group">
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-green-500" /> : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-green-500 mb-2" />
                    <span className="text-sm font-bold text-slate-600">Upload PDF (Maks 50MB)</span>
                  </>
                )}
              </label>

              {formData.file_url && (
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">{formData.file_url.split('/').pop()}</span>
                  </div>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, file_url: '' }))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">URL Sumber Eksternal (Opsional)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="url" value={formData.source_url} onChange={(e) => setFormData({ ...formData, source_url: e.target.value })} placeholder="https://..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-slate-800 text-sm">Publikasikan</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Dokumen dapat dilihat publik</p>
              </div>
              <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} className="data-[state=checked]:bg-green-500" />
            </div>
          </div>
        </form>

        <DialogFooter className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-[2rem]">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={loading || !formData.title_id.trim() || !formData.document_number.trim()} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold shadow-lg shadow-green-600/20 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {document ? 'Simpan Perubahan' : 'Tambah Dokumen'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
