"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SiteSettings } from '@/hooks/useSiteSettings';

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

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  return data as SiteSettings;
}

export async function updateSiteSettingsAction(updates: Partial<SiteSettings>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  
  if (!token) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert({
      id: 'main',
      ...updates,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
