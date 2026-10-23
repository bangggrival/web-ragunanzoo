"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { MediaItem } from '@/hooks/useMediaGallery';

export async function createClient() {
  return await createMockServerClient();
}

export async function getMediaServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('media_gallery')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching media:', error);
    return [];
  }
  
  return data as MediaItem[];
}

export async function deleteMediaAction(id: string, filename: string) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('media-gallery')
    .remove([filename]);

  if (storageError) {
    console.error('Storage delete error:', storageError);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('media_gallery')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error('Error deleting media db record:', dbError);
    return { success: false, error: dbError.message };
  }

  revalidatePath('/manager/gallery');
  return { success: true };
}

export async function updateMediaAction(id: string, updates: { alt_text?: string; category?: string; tags?: string[] }) {
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
    .from('media_gallery')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Update error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/gallery');
  return { success: true };
}
