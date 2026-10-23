"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ServiceStandard, MOCK_SERVICE_STANDARDS } from '@/hooks/useServiceStandards';

export async function createClient() {
  return await createMockServerClient();
}

async function ensureSeeded(supabase: any) {
  try {
    const { data } = await supabase.from('service_standards').select('id');
    if (!data || data.length === 0) {
      const cleanMocks = MOCK_SERVICE_STANDARDS.map(({ id, created_at, updated_at, ...rest }) => rest);
      await supabase.from('service_standards').insert(cleanMocks);
    }
  } catch (err) {
    console.error('Error auto-seeding service_standards:', err);
  }
}

export async function getServiceStandardsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_standards')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching service standards:', error);
    return [];
  }
  
  return data as ServiceStandard[];
}

const isValidUUID = (str: string | null | undefined) => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export async function upsertServiceStandardAction(payload: any) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  await ensureSeeded(supabase);

  const { id, ...data } = payload;
  const isRealUUID = isValidUUID(id);

  const { error } = isRealUUID
    ? await supabase.from('service_standards').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
    : await supabase.from('service_standards').insert(data);

  if (error) {
    console.error('Error upserting service standard:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/service-standards');
  revalidatePath('/standar-pelayanan');
  return { success: true };
}

export async function deleteServiceStandardAction(id: string) {
  const supabase = await createClient();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  await ensureSeeded(supabase);

  const isRealUUID = isValidUUID(id);

  if (isRealUUID) {
    const { error } = await supabase
      .from('service_standards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service standard:', error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath('/manager/service-standards');
  revalidatePath('/standar-pelayanan');
  return { success: true };
}
