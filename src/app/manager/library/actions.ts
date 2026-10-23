"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Book, BookInsert, BookUpdate } from '@/hooks/useBooks';

export async function createClient() {
  return await createMockServerClient();
}

export async function getBooksServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }
  
  return data as Book[];
}

export async function deleteBookAction(id: string) {
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
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting book:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/library');
  return { success: true };
}

export async function upsertBookAction(bookData: BookInsert & { id?: string }) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const { id, ...payload } = bookData;

  if (id) {
    // Update
    const { error } = await supabase
      .from('books')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error updating book:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Insert
    const { error } = await supabase
      .from('books')
      .insert(payload);

    if (error) {
      console.error('Error inserting book:', error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/manager/library');
  return { success: true };
}

export async function incrementBookViewAction(id: string) {
  const supabase = await createClient();
  
  const { data: book } = await supabase
    .from('books')
    .select('view_count')
    .eq('id', id)
    .single();
    
  if (book) {
    const newCount = (book.view_count || 0) + 1;
    await supabase
      .from('books')
      .update({ view_count: newCount })
      .eq('id', id);
      
    revalidatePath('/manager/library');
  }
}
