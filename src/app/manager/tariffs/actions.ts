"use server";

import { createServerClient as createMockServerClient } from '@/lib/serverSupabase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { TicketSettings } from '@/hooks/useTicketContent';

export async function createClient(customToken?: string) {
  return await createMockServerClient(customToken);
}

export async function getTariffSettingsServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ticket_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching tariff settings:', error);
    return null;
  }
  
  if (data && typeof data.additional_tariffs === 'string') {
    try {
      data.additional_tariffs = JSON.parse(data.additional_tariffs);
    } catch {
      data.additional_tariffs = [];
    }
  }

  return data as TicketSettings;
}

export async function updateTariffSettingsAction(payload: any) {
  let token = payload?.token;
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('sb-token')?.value;
    } catch {
      // ignore
    }
  }

  const supabase = await createClient(token);

  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return { success: false, error: 'Unauthorized: Sesi tidak valid atau telah berakhir. Silakan login kembali.' };
    }
  } else {
    return { success: false, error: 'Unauthorized: Sesi tidak ditemukan. Silakan login kembali.' };
  }

  const { id, token: _t, ...data } = payload;
  
  // Format and isolate valid ticket_settings columns
  const sanitizedData: Record<string, any> = {
    adult_price: Number(data.adult_price) || 4000,
    child_price: Number(data.child_price) || 3000,
    schmutzer_weekday_price: Number(data.schmutzer_weekday_price) || 6000,
    schmutzer_weekend_price: Number(data.schmutzer_weekend_price) || 7500,
    parking_bike: Number(data.parking_bike) || 1000,
    parking_motor: Number(data.parking_motor) || 5000,
    parking_car: Number(data.parking_car) || 10000,
    parking_bus: Number(data.parking_bus) || 15000,
    jakcard_card_price: Number(data.jakcard_card_price) || 25000,
    jakcard_tier_1_balance: Number(data.jakcard_tier_1_balance) || 20000,
    jakcard_tier_1_total: Number(data.jakcard_tier_1_total) || 45000,
    jakcard_tier_2_balance: Number(data.jakcard_tier_2_balance) || 50000,
    jakcard_tier_2_total: Number(data.jakcard_tier_2_total) || 75000,
    legal_basis_text: data.legal_basis_text || 'Peraturan Daerah Provinsi DKI Jakarta No. 1 Tahun 2024 tentang Pajak Daerah dan Retribusi Daerah',
    tariff_notes_id: data.tariff_notes_id || '',
    tariff_notes_en: data.tariff_notes_en || '',
    additional_tariffs: typeof data.additional_tariffs === 'string'
      ? data.additional_tariffs
      : JSON.stringify(data.additional_tariffs || []),
    updated_at: new Date().toISOString()
  };

  const { error } = id
    ? await supabase.from('ticket_settings').update(sanitizedData).eq('id', id)
    : await supabase.from('ticket_settings').insert(sanitizedData);

  if (error) {
    console.error('Error updating tariff settings:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/manager/tariffs');
  revalidatePath('/manager/ticket-content');
  revalidatePath('/tickets');
  return { success: true };
}
