import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JdihDocument {
  id: string;
  document_number: string;
  title_id: string;
  title_en: string | null;
  type: string;
  year: number;
  date_enacted: string | null;
  date_promulgated: string | null;
  status: string;
  description_id: string | null;
  description_en: string | null;
  file_url: string | null;
  source_url: string | null;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type JdihInsert = Omit<JdihDocument, 'id' | 'created_at' | 'updated_at'>;
export type JdihUpdate = Partial<JdihInsert>;

export const JDIH_TYPES = [
  { value: 'peraturan', label_id: 'Peraturan', label_en: 'Regulation', icon: '📜' },
  { value: 'keputusan', label_id: 'Keputusan', label_en: 'Decree', icon: '📋' },
  { value: 'instruksi', label_id: 'Instruksi', label_en: 'Instruction', icon: '📌' },
  { value: 'surat_edaran', label_id: 'Surat Edaran', label_en: 'Circular Letter', icon: '✉️' },
  { value: 'pedoman', label_id: 'Pedoman', label_en: 'Guideline', icon: '📘' },
  { value: 'lainnya', label_id: 'Lainnya', label_en: 'Others', icon: '📄' },
];

export const JDIH_STATUSES = [
  { value: 'berlaku', label_id: 'Berlaku', label_en: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'tidak_berlaku', label_id: 'Tidak Berlaku', label_en: 'Inactive', color: 'bg-red-100 text-red-700' },
  { value: 'dicabut', label_id: 'Dicabut', label_en: 'Revoked', color: 'bg-muted text-muted-foreground' },
];

export function useJdihDocuments() {
  const [documents, setDocuments] = useState<JdihDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jdih_documents')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data as unknown as JdihDocument[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'jdih_documents') {
        fetchDocuments();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  const addDocument = async (doc: JdihInsert) => {
    const { data, error } = await supabase
      .from('jdih_documents')
      .insert(doc as any)
      .select()
      .single();

    if (error) {
      toast.error('Gagal menambahkan dokumen: ' + error.message);
      return null;
    }

    toast.success('Dokumen berhasil ditambahkan');
    fetchDocuments();
    return data;
  };

  const updateDocument = async (id: string, updates: JdihUpdate) => {
    const { error } = await supabase
      .from('jdih_documents')
      .update(updates as any)
      .eq('id', id);

    if (error) {
      toast.error('Gagal memperbarui dokumen: ' + error.message);
      return false;
    }

    toast.success('Dokumen berhasil diperbarui');
    fetchDocuments();
    return true;
  };

  const deleteDocument = async (id: string) => {
    const { error } = await supabase
      .from('jdih_documents')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus dokumen: ' + error.message);
      return false;
    }

    toast.success('Dokumen berhasil dihapus');
    fetchDocuments();
    return true;
  };

  const getPublished = () => documents.filter(d => d.is_published);

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

  return {
    documents,
    loading,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getPublished,
    getTypeLabel,
    getTypeIcon,
    getStatusInfo,
  };
}
