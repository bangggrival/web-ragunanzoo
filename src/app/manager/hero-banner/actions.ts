"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { HeroBanner } from '@/hooks/useHeroBanner';
import { SiteSettings } from '@/hooks/useSiteSettings';

export async function createClient() {
  return await createMockServerClient();
}

export async function getHeroBannersServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('hero_banner')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
  
  return data as HeroBanner[];
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

export async function deleteHeroBannerAction(id: number) {
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
    .from('hero_banner')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting banner:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/hero-banner');
  return { success: true };
}

export async function setActiveHeroBannerAction(id: number) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  // Deactivate all
  await supabase
    .from('hero_banner')
    .update({ is_active: false })
    .neq('id', 0);
  
  // Activate selected
  const { error } = await supabase
    .from('hero_banner')
    .update({ is_active: true })
    .eq('id', id);

  if (error) {
    console.error('Error activating banner:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/hero-banner');
  return { success: true };
}

export async function upsertHeroBannerAction(payload: any) {
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
    // Update
    result = await supabase
      .from('hero_banner')
      .update(data)
      .eq('id', id);
  } else {
    // Insert
    result = await supabase
      .from('hero_banner')
      .insert(data);
  }

  if (result.error) {
    console.error('Error upserting banner:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/manager/hero-banner');
  return { success: true };
}

export async function updateSiteSettingsAction(updates: Partial<SiteSettings>) {
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
      ...updates,
      updated_by: session.user.id,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/hero-banner');
  return { success: true };
}
