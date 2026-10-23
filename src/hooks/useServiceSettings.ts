import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceSettings {
  id: string;
  admin_whatsapp: string | null;
  admin_email: string | null;
  cover_letter_template_url: string | null;
  proposal_template_url: string | null;
  required_documents_pkl: string[];
  required_documents_research: string[];
  required_documents_koas: string[];
  required_documents_interview: string[];
  limit_pkl: number | null;
  limit_research: number | null;
  limit_koas: number | null;
  limit_interview: number | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceFaq {
  id: string;
  category: 'general' | 'pkl' | 'research' | 'koas' | 'interview';
  question_id: string;
  question_en: string | null;
  answer_id: string;
  answer_en: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hook for service settings
export function useServiceSettings() {
  return useQuery({
    queryKey: ['service-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Parse JSON fields
      if (data) {
        return {
          ...data,
          required_documents_pkl: data.required_documents_pkl || [],
          required_documents_research: data.required_documents_research || [],
          required_documents_koas: data.required_documents_koas || [],
          required_documents_interview: data.required_documents_interview || [],
        } as ServiceSettings;
      }
      return null;
    },
  });
}

// Hook for updating service settings
export function useUpdateServiceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<ServiceSettings>) => {
      const { data, error } = await supabase
        .from('service_settings')
        .upsert({
          id: 'main',
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-settings'] });
    },
  });
}

export const MOCK_FAQS: ServiceFaq[] = [
  {
    id: 'faq-1',
    category: 'pkl',
    question_id: 'Berapa lama durasi maksimal untuk kegiatan PKL/Magang di TMR?',
    question_en: 'What is the maximum duration for PKL/Internship at TMR?',
    answer_id: 'Durasi PKL/Magang di TMR umumnya berlangsung antara 1 hingga 3 bulan sesuai dengan surat permohonan resmi dari kampus/sekolah.',
    answer_en: 'Internship/PKL duration at TMR typically ranges from 1 to 3 months according to the official letter from school/university.',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-2',
    category: 'research',
    question_id: 'Apakah penelitian di Ragunan memerlukan persetujuan etika satwa?',
    question_en: 'Does research at Ragunan require animal ethics approval?',
    answer_id: 'Ya, untuk penelitian yang melibatkan interaksi atau observasi langsung satwa dilindungi, peneliti wajib menandatangani lembar komitmen etika satwa.',
    answer_en: 'Yes, for research involving direct interaction or observation of protected animals, researchers must sign the animal ethics commitment form.',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-3',
    category: 'koas',
    question_id: 'Bagaimana prosedur pendaftaran KOAS Kedokteran Hewan?',
    question_en: 'What is the registration procedure for Veterinary KOAS?',
    answer_id: 'Pendaftaran KOAS dilakukan melalui fakultas yang mengajukan rotasi resmi minimal 2 minggu sebelum stase dimulai.',
    answer_en: 'KOAS registration is conducted via the faculty submitting an official rotation request at least 2 weeks before the clinical block begins.',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-4',
    category: 'interview',
    question_id: 'Berapa hari sebelum kegiatan wawancara/peliputan permohonan harus diajukan?',
    question_en: 'How many days in advance should an interview/filming request be submitted?',
    answer_id: 'Permohonan wawancara atau peliputan media diajukan paling lambat 3 hari kerja sebelum jadwal yang direncanakan.',
    answer_en: 'Interview or media coverage requests should be submitted at least 3 working days prior to the planned schedule.',
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Hook for service FAQs
export function useServiceFaqs(category?: string) {
  return useQuery({
    queryKey: ['service-faqs', category],
    queryFn: async () => {
      try {
        let query = supabase
          .from('service_faqs')
          .select('*')
          .order('order_index', { ascending: true });

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error || !data) {
          return [];
        }
        return data as ServiceFaq[];
      } catch (err) {
        return [];
      }
    },
  });
}

// Hook for managing FAQs (CRUD)
export function useManageServiceFaqs() {
  const queryClient = useQueryClient();

  const createFaq = useMutation({
    mutationFn: async (faq: Omit<ServiceFaq, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('service_faqs')
        .insert(faq)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-faqs'] });
    },
  });

  const updateFaq = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceFaq> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_faqs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-faqs'] });
    },
  });

  const deleteFaq = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-faqs'] });
    },
  });

  return { createFaq, updateFaq, deleteFaq };
}

// Hook for getting registration counts per category (for limit checking)
export function useRegistrationCounts() {
  return useQuery({
    queryKey: ['service-registration-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_registrations')
        .select('program_type, status');

      if (error) throw error;

      // Count active registrations (not rejected or completed) per category
      const counts = {
        pkl: 0,
        research: 0,
        koas: 0,
        interview: 0,
      };

      data?.forEach(reg => {
        if (reg.status !== 'rejected' && reg.status !== 'completed') {
          const type = reg.program_type as keyof typeof counts;
          if (type in counts) {
            counts[type]++;
          }
        }
      });

      return counts;
    },
  });
}

// Upload template file
export async function uploadTemplateFile(file: File, type: 'cover_letter' | 'proposal'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${type}-template-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('service-templates')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('service-templates')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
