"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface ZooHistory {
  id: string;
  title_id: string;
  title_en: string | null;
  content_id: string;
  content_en: string | null;
  year: number | null;
  image_url: string | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type ZooHistoryInput = Omit<ZooHistory, 'id' | 'created_at' | 'updated_at'>;

export async function createClient() {
  return await createMockServerClient();
}

export async function getHistoryServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('zoo_history')
    .select('*')
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }
  
  return data as ZooHistory[];
}

export async function deleteHistoryAction(id: string) {
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
    .from('zoo_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting history:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/history');
  return { success: true };
}

export async function upsertHistoryAction(itemData: ZooHistoryInput & { id?: string }) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { id, ...payload } = itemData;

  if (id) {
    // Update
    const { error } = await supabase
      .from('zoo_history')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error updating history:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Insert
    const { error } = await supabase
      .from('zoo_history')
      .insert(payload);

    if (error) {
      console.error('Error inserting history:', error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/manager/history');
  return { success: true };
}
