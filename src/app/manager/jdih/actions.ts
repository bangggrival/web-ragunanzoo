"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { JdihDocument, JdihInsert } from '@/hooks/useJdihDocuments';

export async function createClient() {
  return await createMockServerClient();
}

export async function getJdihDocumentsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('jdih_documents')
    .select('*')
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching jdih:', error);
    return [];
  }
  
  return data as JdihDocument[];
}

export async function deleteJdihDocumentAction(id: string) {
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
    .from('jdih_documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting jdih:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/jdih');
  return { success: true };
}

export async function upsertJdihDocumentAction(docData: JdihInsert & { id?: string }) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { id, ...payload } = docData;

  if (id) {
    // Update
    const { error } = await supabase
      .from('jdih_documents')
      .update(payload as any)
      .eq('id', id);

    if (error) {
      console.error('Error updating jdih:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Insert
    const { error } = await supabase
      .from('jdih_documents')
      .insert(payload as any);

    if (error) {
      console.error('Error inserting jdih:', error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/manager/jdih');
  return { success: true };
}
