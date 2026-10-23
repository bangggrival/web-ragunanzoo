"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ServiceSettings, ServiceFaq } from '@/hooks/useServiceSettings';

export async function createClient() {
  return await createMockServerClient();
}

export async function getServiceSettingsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_settings')
    .select('*')
    .eq('id', 'main')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching service settings:', error);
    return null;
  }
  
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
}

export async function getServiceFaqsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_faqs')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching service FAQs:', error);
    return [];
  }
  
  return data as ServiceFaq[];
}

export async function getRegistrationCountsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_registrations')
    .select('program_type, status');

  const counts = {
    pkl: 0,
    research: 0,
    koas: 0,
    interview: 0,
  };

  if (!error && data) {
    data.forEach(reg => {
      if (reg.status !== 'rejected' && reg.status !== 'completed') {
        const type = reg.program_type as keyof typeof counts;
        if (type in counts) {
          counts[type]++;
        }
      }
    });
  }

  return counts;
}

export async function updateServiceSettingsAction(payload: Partial<ServiceSettings>) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('service_settings')
    .upsert({
      id: 'main',
      ...payload,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating service settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/service-settings');
  return { success: true };
}

export async function upsertServiceFaqAction(payload: any) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { id, ...data } = payload;
  const { error } = id
    ? await supabase.from('service_faqs').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
    : await supabase.from('service_faqs').insert(data);

  if (error) {
    console.error('Error upserting service FAQ:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/service-settings');
  return { success: true };
}

export async function deleteServiceFaqAction(id: string) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('service_faqs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service FAQ:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/service-settings');
  return { success: true };
}
