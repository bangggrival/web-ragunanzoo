import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export interface ServiceRegistration {
  id: string;
  tracking_code: string;
  program_type: 'pkl' | 'research' | 'koas' | 'interview';
  institution_name: string;
  institution_address: string | null;
  institution_phone: string | null;
  institution_email: string | null;
  participant_name: string;
  participant_nim: string | null;
  participant_phone: string;
  participant_email: string;
  study_program: string | null;
  start_date: string;
  end_date: string;
  research_title: string | null;
  participant_count: number;
  cover_letter_url: string | null;
  proposal_url: string | null;
  student_id_url: string | null;
  // Koas specific fields
  faculty: string | null;
  rotation_department: string | null;
  supervisor_name: string | null;
  supervisor_phone: string | null;
  recommendation_letter_url: string | null;
  // Interview specific fields
  media_organization: string | null;
  interview_topic: string | null;
  target_interviewee: string | null;
  equipment_used: string | null;
  interview_date: string | null;
  interview_time: string | null;
  journalist_id_url: string | null;
  // Common fields
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRegistrationData {
  program_type: 'pkl' | 'research' | 'koas' | 'interview';
  institution_name: string;
  institution_address?: string;
  institution_phone?: string;
  institution_email?: string;
  participant_name: string;
  participant_nim?: string;
  participant_phone: string;
  participant_email: string;
  study_program?: string;
  start_date: string;
  end_date: string;
  research_title?: string;
  participant_count?: number;
  cover_letter_url?: string;
  proposal_url?: string;
  student_id_url?: string;
  // Koas specific fields
  faculty?: string;
  rotation_department?: string;
  supervisor_name?: string;
  supervisor_phone?: string;
  recommendation_letter_url?: string;
  // Interview specific fields
  media_organization?: string;
  interview_topic?: string;
  target_interviewee?: string;
  equipment_used?: string;
  interview_date?: string;
  interview_time?: string;
  journalist_id_url?: string;
}

// Generate unique tracking code
const generateTrackingCode = (programType: 'pkl' | 'research' | 'koas' | 'interview'): string => {
  const prefixMap = {
    pkl: 'PKL',
    research: 'RES',
    koas: 'KOA',
    interview: 'INT'
  };
  const prefix = prefixMap[programType];
  const date = format(new Date(), 'yyMMdd');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
};

// Upload document to storage
export const uploadDocument = async (file: File, trackingCode: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${trackingCode}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('service-documents')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('service-documents')
    .getPublicUrl(data.path);
  
  return publicUrl;
};

// Create new registration
export const useCreateRegistration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateRegistrationData & { documents?: File[] }) => {
      const trackingCode = generateTrackingCode(data.program_type);
      
      // Upload documents if provided
      let coverLetterUrl: string | undefined;
      let proposalUrl: string | undefined;
      let studentIdUrl: string | undefined;
      
      if (data.documents && data.documents.length > 0) {
        // Upload all documents - we'll store them as cover letter for simplicity
        const uploadPromises = data.documents.map(file => 
          uploadDocument(file, trackingCode)
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Assign first 3 documents to respective fields
        if (uploadedUrls[0]) coverLetterUrl = uploadedUrls[0];
        if (uploadedUrls[1]) proposalUrl = uploadedUrls[1];
        if (uploadedUrls[2]) studentIdUrl = uploadedUrls[2];
      }
      
      const { documents, ...registrationData } = data;
      
      const { data: result, error } = await supabase
        .from('service_registrations')
        .insert({
          ...registrationData,
          tracking_code: trackingCode,
          cover_letter_url: coverLetterUrl,
          proposal_url: proposalUrl,
          student_id_url: studentIdUrl,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result || { tracking_code: trackingCode };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-registrations'] });
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
      toast.error('Gagal menyimpan pendaftaran');
    }
  });
};

// Check registration status by tracking code
export const useCheckRegistrationStatus = (trackingCode: string | null) => {
  return useQuery({
    queryKey: ['service-registration-status', trackingCode],
    queryFn: async () => {
      if (!trackingCode) return null;
      
      const { data, error } = await supabase
        .from('service_registrations')
        .select('*')
        .eq('tracking_code', trackingCode.toUpperCase().trim())
        .maybeSingle();
      
      if (error) throw error;
      return data as ServiceRegistration | null;
    },
    enabled: !!trackingCode,
  });
};

// Fetch all registrations (for admin)
export const useServiceRegistrations = () => {
  return useQuery({
    queryKey: ['service-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ServiceRegistration[];
    },
  });
};

// Update registration status (for admin)
export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      admin_notes 
    }: { 
      id: string; 
      status: ServiceRegistration['status']; 
      admin_notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('service_registrations')
        .update({ 
          status, 
          admin_notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-registrations'] });
      toast.success('Status berhasil diperbarui');
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      toast.error('Gagal memperbarui status');
    }
  });
};
