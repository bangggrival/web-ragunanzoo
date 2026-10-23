"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { OrganizationMembership } from '@/hooks/useOrganizationMemberships';

export async function createClient() {
  return await createMockServerClient();
}

export async function getOrganizationsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('*')
    .order('order_index');

  if (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
  
  return data as OrganizationMembership[];
}

export async function upsertOrganizationAction(payload: any) {
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
      .from('organization_memberships')
      .update(data)
      .eq('id', id);
  } else {
    result = await supabase
      .from('organization_memberships')
      .insert(data);
  }

  if (result.error) {
    console.error('Error upserting organization:', result.error);
    return { success: false, error: result.error.message };
  }

  revalidatePath('/manager/organizations');
  return { success: true };
}

export async function deleteOrganizationAction(id: string) {
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
    .from('organization_memberships')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting organization:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/organizations');
  return { success: true };
}
