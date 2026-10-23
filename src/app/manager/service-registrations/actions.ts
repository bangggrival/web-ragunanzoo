"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ServiceRegistration } from '@/hooks/useServiceRegistrations';

export async function createClient() {
  return await createMockServerClient();
}

export async function getServiceRegistrationsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching service registrations:', error);
    return [];
  }
  
  return data as ServiceRegistration[];
}

export async function updateRegistrationStatusAction(id: string, status: ServiceRegistration['status'], admin_notes?: string) {
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
    .from('service_registrations')
    .update({ 
      status, 
      admin_notes,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating registration status:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/service-registrations');
  return { success: true };
}
