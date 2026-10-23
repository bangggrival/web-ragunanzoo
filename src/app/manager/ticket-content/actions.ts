"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { TicketContent, TicketSettings } from '@/hooks/useTicketContent';

export async function createClient() {
  return await createMockServerClient();
}

export async function getTicketContentServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ticket_content')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching ticket content:', error);
    return [];
  }
  
  return data as TicketContent[];
}

export async function getTicketSettingsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ticket_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching ticket settings:', error);
    return null;
  }
  
  return data as TicketSettings;
}

export async function upsertTicketContentAction(payload: any) {
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
    ? await supabase.from('ticket_content').update(data).eq('id', id)
    : await supabase.from('ticket_content').insert(data);

  if (error) {
    console.error('Error upserting ticket content:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/ticket-content');
  return { success: true };
}

export async function deleteTicketContentAction(id: string) {
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
    .from('ticket_content')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ticket content:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/ticket-content');
  return { success: true };
}

export async function updateTicketSettingsAction(payload: any) {
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
    ? await supabase.from('ticket_settings').update(data).eq('id', id)
    : await supabase.from('ticket_settings').insert(data);

  if (error) {
    console.error('Error updating ticket settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/ticket-content');
  return { success: true };
}
