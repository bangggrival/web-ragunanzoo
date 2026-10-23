"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Plant } from '@/hooks/usePlants';

export async function createClient() {
  return await createMockServerClient();
}

export async function getPlantsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching plants:', error);
    return [];
  }
  
  return data as Plant[];
}

export async function deletePlantAction(id: number) {
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
    .from('plants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting plant:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/plants');
  return { success: true };
}
