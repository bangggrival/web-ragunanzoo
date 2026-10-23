"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Announcement } from '@/hooks/useAnnouncements';

export async function createClient() {
  return await createMockServerClient();
}

export async function getAnnouncementsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
  
  return data as Announcement[];
}

export async function deleteAnnouncementAction(id: number) {
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
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting announcement:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/announcements');
  return { success: true };
}

export async function saveAnnouncementAction(payload: Partial<Announcement>, id?: number) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  // If setting this to active, deactivate others
  if (payload.is_active) {
    await supabase
      .from('announcements')
      .update({ is_active: false })
      .neq('id', id || 0); // Need to deactivate all others
  }

  let error;
  if (id) {
    ({ error } = await supabase
      .from('announcements')
      .update(payload)
      .eq('id', id));
  } else {
    ({ error } = await supabase
      .from('announcements')
      .insert(payload));
  }

  if (error) {
    console.error('Error saving announcement:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/announcements');
  return { success: true };
}
