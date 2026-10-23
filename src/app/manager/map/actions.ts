"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function createClient() {
  return await createMockServerClient();
}

export async function getSiteSettingsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'main')
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching site settings:', error);
    return null;
  }
  
  return data;
}

export async function updateMapUrlAction(url: string | null) {
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
    .from('site_settings')
    .upsert({
      id: 'main',
      map_image_url: url,
      updated_by: session.user.id,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating map URL:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/map');
  return { success: true };
}
