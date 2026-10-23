"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ServiceAvailability } from '@/hooks/useServiceAvailability';

export async function createClient() {
  return await createMockServerClient();
}

export async function getServiceAvailabilityAction(monthStr: string) {
  const supabase = await createClient();
  const month = new Date(monthStr);
  
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from('service_availability')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching availability:', error);
    return [];
  }
  return data as ServiceAvailability[];
}

export async function updateAvailabilityAction(id: string, updates: Partial<ServiceAvailability>) {
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
    .from('service_availability')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating availability:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/service-availability');
  return { success: true };
}

export async function bulkUpdateAvailabilityAction(
  programType: string, 
  startDate: Date, 
  endDate: Date, 
  updates: Partial<Pick<ServiceAvailability, 'max_slots' | 'is_available' | 'notes'>>
) {
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
    .from('service_availability')
    .update(updates)
    .eq('program_type', programType)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error) {
    console.error('Error bulk updating availability:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/service-availability');
  return { success: true };
}
