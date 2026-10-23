"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface Venue {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  price_per_hour: number | null;
  price_per_day: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  facilities: string[] | null;
  is_available: boolean | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  panorama_url: string | null;
  has_panorama: boolean | null;
  created_at: string;
  updated_at: string;
}

export async function createClient() {
  return await createMockServerClient();
}

export async function getVenuesServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
  
  return data as Venue[];
}

export async function deleteVenueAction(id: number) {
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
    .from('venues')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting venue:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/venues');
  return { success: true };
}

export async function upsertVenueAction(venueData: Partial<Venue>) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  if (venueData.id) {
    // Update
    const { error } = await supabase
      .from('venues')
      .update(venueData)
      .eq('id', venueData.id);

    if (error) {
      console.error('Error updating venue:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Insert
    const { error } = await supabase
      .from('venues')
      .insert(venueData);

    if (error) {
      console.error('Error inserting venue:', error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/manager/venues');
  return { success: true };
}
