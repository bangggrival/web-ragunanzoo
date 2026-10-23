"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CustomPage } from '@/hooks/useCustomPages';

export async function createClient() {
  return await createMockServerClient();
}

export async function getCustomPagesServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('custom_pages')
    .select('*')
    .order('order_index', { ascending: true });
  
  if (error) {
    console.error('Error fetching custom pages:', error);
    return [];
  }
  
  return data as CustomPage[];
}

export async function createCustomPageAction(page: Omit<CustomPage, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('custom_pages')
    .insert(page)
    .select()
    .single();

  if (error) {
    console.error('Error creating page:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/custom-pages');
  return { success: true, data: data as CustomPage };
}

export async function updateCustomPageAction(id: string, updates: Partial<CustomPage>) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('custom_pages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating page:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/custom-pages');
  return { success: true, data: data as CustomPage };
}

export async function deleteCustomPageAction(id: string) {
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
    .from('custom_pages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting page:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/custom-pages');
  return { success: true };
}
