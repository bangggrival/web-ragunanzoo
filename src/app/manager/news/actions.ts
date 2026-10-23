"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { News } from '@/hooks/useNews';

export async function createClient() {
  return await createMockServerClient();
}

export async function getNewsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  
  return data as News[];
}

export async function deleteNewsAction(id: number) {
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
    .from('news')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting news:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/news');
  return { success: true };
}

export async function saveNewsAction(payload: Partial<News>, id?: number) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  let error;
  if (id) {
    ({ error } = await supabase
      .from('news')
      .update(payload)
      .eq('id', id));
  } else {
    ({ error } = await supabase
      .from('news')
      .insert(payload));
  }

  if (error) {
    console.error('Error saving news:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/news');
  return { success: true };
}
