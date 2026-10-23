"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { WhatsappTemplate } from '@/hooks/useWhatsappTemplates';

export async function createClient() {
  return await createMockServerClient();
}

export async function getWhatsappTemplatesServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching whatsapp templates:', error);
    return [];
  }
  
  return data as WhatsappTemplate[];
}

export async function upsertWhatsappTemplateAction(payload: any) {
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
    ? await supabase.from('whatsapp_templates').update(data).eq('id', id)
    : await supabase.from('whatsapp_templates').insert(data);

  if (error) {
    console.error('Error upserting whatsapp template:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/whatsapp-templates');
  return { success: true };
}

export async function deleteWhatsappTemplateAction(id: string) {
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
    .from('whatsapp_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting whatsapp template:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/whatsapp-templates');
  return { success: true };
}
