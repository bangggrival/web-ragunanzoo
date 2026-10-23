"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { TourGuide, TourPackage, TourBooking, TourGalleryItem, MOCK_GUIDES, MOCK_PACKAGES, MOCK_GALLERY } from '@/hooks/useTourGuides';

export async function createClient() {
  return await createMockServerClient();
}

const isValidUUID = (str: string | null | undefined) => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

async function ensureSeeded(supabase: any) {
  try {
    const { data: gData } = await supabase.from('tour_guides').select('id');
    if (!gData || gData.length === 0) {
      const cleanGuides = MOCK_GUIDES.map(({ id, created_at, updated_at, ...rest }) => rest);
      await supabase.from('tour_guides').insert(cleanGuides);
    }
    const { data: pData } = await supabase.from('tour_packages').select('id');
    if (!pData || pData.length === 0) {
      const cleanPackages = MOCK_PACKAGES.map(({ id, created_at, updated_at, ...rest }) => rest);
      await supabase.from('tour_packages').insert(cleanPackages);
    }
    const { data: galData } = await supabase.from('tour_gallery').select('id');
    if (!galData || galData.length === 0) {
      const cleanGallery = MOCK_GALLERY.map(({ id, created_at, ...rest }) => rest);
      await supabase.from('tour_gallery').insert(cleanGallery);
    }
  } catch (err) {
    console.error('Error auto-seeding tour_guides:', err);
  }
}

// ---- Fetchers ----

export async function getTourGuidesServer() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tour_guides').select('*').order('name');
  if (error) { console.error('Error fetching tour guides:', error); return []; }
  return data as TourGuide[];
}

export async function getTourPackagesServer() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tour_packages').select('*').order('order_index');
  if (error) { console.error('Error fetching tour packages:', error); return []; }
  return data as TourPackage[];
}

export async function getTourBookingsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tour_bookings').select(`
    *,
    guide:tour_guides(*),
    package:tour_packages(*)
  `).order('created_at', { ascending: false });
  if (error) { console.error('Error fetching tour bookings:', error); return []; }
  return data as TourBooking[];
}

export async function getTourGalleryServer() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tour_gallery').select('*').order('order_index');
  if (error) { console.error('Error fetching tour gallery:', error); return []; }
  return data as TourGalleryItem[];
}

// ---- Actions ----

export async function upsertGuideAction(payload: any) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-token')?.value;
  if (!token) return { success: false, error: 'Unauthorized' };
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  const session = user ? { user } : null;
  if (!session) return { success: false, error: 'Unauthorized' };

  await ensureSeeded(supabase);

  const { id, ...data } = payload;
  const isRealUUID = isValidUUID(id);

  const { error } = isRealUUID
    ? await supabase.from('tour_guides').update(data).eq('id', id)
    : await supabase.from('tour_guides').insert(data);

  if (error) return { success: false, error: error.message };
  revalidatePath('/manager/tour-guides');
  revalidatePath('/tour-guide');
  return { success: true };
}

export async function deleteGuideAction(id: string) {
  const supabase = await createClient();
  await ensureSeeded(supabase);

  if (isValidUUID(id)) {
    const { error } = await supabase.from('tour_guides').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/manager/tour-guides');
  revalidatePath('/tour-guide');
  return { success: true };
}

export async function upsertPackageAction(payload: any) {
  const supabase = await createClient();
  await ensureSeeded(supabase);

  const { id, ...data } = payload;
  const isRealUUID = isValidUUID(id);

  const { error } = isRealUUID
    ? await supabase.from('tour_packages').update(data).eq('id', id)
    : await supabase.from('tour_packages').insert(data);

  if (error) return { success: false, error: error.message };
  revalidatePath('/manager/tour-guides');
  revalidatePath('/tour-guide');
  return { success: true };
}

export async function deletePackageAction(id: string) {
  const supabase = await createClient();
  await ensureSeeded(supabase);

  if (isValidUUID(id)) {
    const { error } = await supabase.from('tour_packages').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/manager/tour-guides');
  revalidatePath('/tour-guide');
  return { success: true };
}

export async function updateBookingStatusAction(id: string, status: string, adminNotes?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('tour_bookings').update({ status, admin_notes: adminNotes }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/manager/tour-guides');
  return { success: true };
}

export async function createGalleryImageAction(payload: any) {
  const supabase = await createClient();
  await ensureSeeded(supabase);

  const { error } = await supabase.from('tour_gallery').insert(payload);
  if (error) return { success: false, error: error.message };
  revalidatePath('/manager/tour-guides');
  revalidatePath('/tour-guide');
  return { success: true };
}

export async function deleteGalleryImageAction(id: string) {
  const supabase = await createClient();
  await ensureSeeded(supabase);

  if (isValidUUID(id)) {
    const { error } = await supabase.from('tour_gallery').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath('/manager/tour-guides');
  revalidatePath('/tour-guide');
  return { success: true };
}
