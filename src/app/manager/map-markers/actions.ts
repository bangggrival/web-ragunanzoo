"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ZoneMarker } from '@/hooks/useZoneMarkers';

export async function createClient() {
  return await createMockServerClient();
}

export async function getZoneMarkersServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('zone_markers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching zone markers:', error);
    return [];
  }
  
  return data as ZoneMarker[];
}

export async function createMarkerAction(payload: any) {
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
    .from('zone_markers')
    .insert(payload);

  if (error) {
    console.error('Error creating marker:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/map-markers');
  return { success: true };
}

export async function updateMarkerAction(id: string, updates: Partial<ZoneMarker>) {
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
    .from('zone_markers')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating marker:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/map-markers');
  return { success: true };
}

export async function deleteMarkerAction(id: string) {
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
    .from('zone_markers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting marker:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/map-markers');
  return { success: true };
}
