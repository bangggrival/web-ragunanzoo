import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WBSSubmission {
  id: string;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  is_anonymous: boolean;
  category: string;
  incident_date: string | null;
  incident_location: string | null;
  description: string;
  evidence_urls: string[];
  status: string;
  admin_notes: string | null;
  reported_person_name: string | null;
  reported_person_position: string | null;
  created_at: string;
  updated_at: string;
}

export interface WBSFormData {
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  is_anonymous: boolean;
  category: string;
  incident_date?: string;
  incident_location?: string;
  description: string;
  evidence_urls?: string[];
  reported_person_name?: string;
  reported_person_position?: string;
}

const WBS_CATEGORIES = [
  { value: 'korupsi', label: 'Korupsi' },
  { value: 'suap', label: 'Suap / Gratifikasi' },
  { value: 'penggelapan', label: 'Penggelapan' },
  { value: 'penyalahgunaan_asset', label: 'Penyalahgunaan Aset' },
  { value: 'penipuan', label: 'Penipuan' },
  { value: 'pelanggaran_etika', label: 'Pelanggaran Etika' },
  { value: 'penyalahgunaan_wewenang', label: 'Penyalahgunaan Wewenang' },
  { value: 'diskriminasi', label: 'Diskriminasi' },
  { value: 'pelecehan', label: 'Pelecehan' },
  { value: 'keselamatan_kerja', label: 'Keselamatan Kerja' },
  { value: 'lingkungan', label: 'Pelanggaran Lingkungan' },
  { value: 'lainnya', label: 'Lainnya' },
];

export function useWBSSubmissions() {
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading, error } = useQuery({
    queryKey: ['wbs-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wbs_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WBSSubmission[];
    },
  });

  const submitReport = useMutation({
    mutationFn: async (formData: WBSFormData) => {
      const { data, error } = await supabase
        .from('wbs_submissions')
        .insert([{
          reporter_name: formData.is_anonymous ? null : formData.reporter_name,
          reporter_email: formData.is_anonymous ? null : formData.reporter_email,
          reporter_phone: formData.is_anonymous ? null : formData.reporter_phone,
          is_anonymous: formData.is_anonymous,
          category: formData.category,
          incident_date: formData.incident_date || null,
          incident_location: formData.incident_location || null,
          description: formData.description,
          evidence_urls: formData.evidence_urls || [],
          reported_person_name: formData.reported_person_name || null,
          reported_person_position: formData.reported_person_position || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Laporan berhasil dikirim');
    },
    onError: (error) => {
      console.error('Error submitting WBS report:', error);
      toast.error('Gagal mengirim laporan');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { data, error } = await supabase
        .from('wbs_submissions')
        .update({ status, admin_notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wbs-submissions'] });
      toast.success('Status berhasil diperbarui');
    },
    onError: (error) => {
      console.error('Error updating WBS status:', error);
      toast.error('Gagal memperbarui status');
    },
  });

  const deleteSubmission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wbs_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wbs-submissions'] });
      toast.success('Laporan berhasil dihapus');
    },
    onError: (error) => {
      console.error('Error deleting WBS submission:', error);
      toast.error('Gagal menghapus laporan');
    },
  });

  return {
    submissions,
    isLoading,
    error,
    submitReport,
    updateStatus,
    deleteSubmission,
    WBS_CATEGORIES,
  };
}
