"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { WhatsNewItem } from '@/hooks/useWhatsNewItems';

export async function createClient() {
  return await createMockServerClient();
}

export async function getWhatsNewItemsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('whats_new_items')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching whats new items:', error);
    return [];
  }
  
  return data as WhatsNewItem[];
}

export async function upsertWhatsNewItemAction(payload: any) {
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
  let result;
  
  if (id) {
    result = await supabase
      .from('whats_new_items')
      .update(data)
      .eq('id', id);
  } else {
    result = await supabase
      .from('whats_new_items')
      .insert(data);
  }

  if (result.error) {
    console.error('Error upserting whats new item:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/manager/whats-new');
  return { success: true };
}

export async function deleteWhatsNewItemAction(id: string) {
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
    .from('whats_new_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting whats new item:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/whats-new');
  return { success: true };
}
