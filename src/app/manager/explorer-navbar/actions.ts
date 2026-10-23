"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface NavbarItem {
  id: string;
  label_id: string;
  label_en: string | null;
  path: string;
  path_en: string | null;
  icon: string;
  order_index: number;
  show_in_top_nav: boolean;
  show_in_bottom_nav: boolean;
  is_active: boolean;
  is_system: boolean;
  is_dropdown: boolean;
  parent_id: string | null;
}

export async function createClient() {
  return await createMockServerClient();
}

export async function getNavbarItemsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('navbar_items')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching navbar items:', error);
    return [];
  }
  
  return data.map(item => ({
    ...item,
    is_dropdown: item.is_dropdown ?? false,
    parent_id: item.parent_id ?? null,
  })) as NavbarItem[];
}

export async function upsertNavbarItemAction(payload: any) {
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
      .from('navbar_items')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
  } else {
    // get max order index
    const { data: items } = await supabase.from('navbar_items').select('order_index');
    const maxOrder = items && items.length > 0 ? Math.max(...items.map(i => i.order_index)) : -1;

    result = await supabase
      .from('navbar_items')
      .insert({
        ...data,
        order_index: maxOrder + 1,
        show_in_top_nav: !data.parent_id,
        show_in_bottom_nav: false,
        is_active: true,
        is_system: false,
      });
  }

  if (result.error) {
    console.error('Error upserting navbar item:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/manager/explorer-navbar');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteNavbarItemAction(id: string) {
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
    .from('navbar_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting navbar item:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/explorer-navbar');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function toggleNavbarItemAction(id: string, field: string, value: boolean) {
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
    .from('navbar_items')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error toggling navbar item:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/explorer-navbar');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateNavbarOrderAction(updates: { id: string, order_index: number }[]) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  for (const update of updates) {
    const { error } = await supabase
      .from('navbar_items')
      .update({ order_index: update.order_index, updated_at: new Date().toISOString() })
      .eq('id', update.id);
    
    if (error) {
      console.error('Error updating order:', error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/manager/explorer-navbar');
  revalidatePath('/', 'layout');
  return { success: true };
}
