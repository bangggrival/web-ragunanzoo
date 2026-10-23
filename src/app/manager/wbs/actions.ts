"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { WBSSubmission } from '@/hooks/useWBSSubmissions';

export async function createClient() {
  return await createMockServerClient();
}

export async function getWBSSubmissionsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wbs_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching WBS submissions:', error);
    return [];
  }
  
  return data as WBSSubmission[];
}

export async function updateWBSStatusAction(id: string, status: string, adminNotes?: string) {
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
    .from('wbs_submissions')
    .update({ status, admin_notes: adminNotes })
    .eq('id', id);

  if (error) {
    console.error('Error updating WBS status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/wbs');
  return { success: true };
}

export async function deleteWBSSubmissionAction(id: string) {
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
    .from('wbs_submissions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting WBS submission:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/wbs');
  return { success: true };
}
