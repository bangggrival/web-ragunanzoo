"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Animal } from '@/hooks/useAnimals';

export async function createClient() {
  return await createMockServerClient();
}

export async function getAnimalsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching animals:', error);
    return [];
  }
  
  return data as Animal[];
}

export async function deleteAnimalAction(id: number) {
  const supabase = await createClient();
  
  // Periksa otentikasi
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting animal:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/animals');
  return { success: true };
}
