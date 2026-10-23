"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ChatbotFaq } from '@/hooks/useChatbotFaqs';

export async function createClient() {
  return await createMockServerClient();
}

export async function getChatbotFaqsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chatbot_faqs')
    .select('*')
    .order('order_index');

  if (error) {
    console.error('Error fetching chatbot FAQs:', error);
    return [];
  }
  
  return data as ChatbotFaq[];
}

export async function upsertChatbotFaqAction(payload: any) {
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
    result = await supabase
      .from('chatbot_faqs')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
  } else {
    result = await supabase
      .from('chatbot_faqs')
      .insert({ ...data });
  }

  if (result.error) {
    console.error('Error upserting chatbot FAQ:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/manager/chatbot-faqs');
  return { success: true };
}

export async function deleteChatbotFaqAction(id: string) {
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
    .from('chatbot_faqs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting chatbot FAQ:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/chatbot-faqs');
  return { success: true };
}
