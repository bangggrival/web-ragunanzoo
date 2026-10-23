"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';

export interface TicketData {
  id: number;
  user_id: string;
  visit_date: string;
  quantity: number;
  ticket_type: string | null;
  price: number;
  total: number;
  status: string | null;
  code: string | null;
  created_at: string;
}

export async function createClient() {
  return await createMockServerClient();
}

export async function getTicketsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
  
  return data as TicketData[];
}
