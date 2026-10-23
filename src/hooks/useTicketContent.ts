import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TicketContent {
  id: string;
  title_id: string;
  title_en: string | null;
  description_id: string | null;
  description_en: string | null;
  image_url: string | null;
  content_type: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdditionalTariffItem {
  id: string;
  name_id: string;
  name_en: string;
  price: number;
  unit_id: string;
  unit_en: string;
  category: string;
}

export interface TicketSettings {
  id: string;
  hero_image_url: string | null;
  hero_title_id: string | null;
  hero_title_en: string | null;
  hero_subtitle_id: string | null;
  hero_subtitle_en: string | null;
  show_pricing: boolean;
  regular_price: number;
  vip_price: number;
  child_discount: number;
  external_ticket_url: string | null;
  updated_at: string;
  // Customizable fields
  regular_title_id: string | null;
  regular_title_en: string | null;
  regular_description_id: string | null;
  regular_description_en: string | null;
  regular_link: string | null;
  regular_image_url: string | null;
  vip_title_id: string | null;
  vip_title_en: string | null;
  vip_description_id: string | null;
  vip_description_en: string | null;
  vip_link: string | null;
  vip_image_url: string | null;
  section_title_id: string | null;
  section_title_en: string | null;

  // Tariff Configuration Fields
  adult_price?: number;
  child_price?: number;
  schmutzer_weekday_price?: number;
  schmutzer_weekend_price?: number;
  parking_bike?: number;
  parking_motor?: number;
  parking_car?: number;
  parking_bus?: number;
  jakcard_card_price?: number;
  jakcard_tier_1_balance?: number;
  jakcard_tier_1_total?: number;
  jakcard_tier_2_balance?: number;
  jakcard_tier_2_total?: number;
  additional_tariffs?: AdditionalTariffItem[];
  legal_basis_text?: string | null;
  tariff_notes_id?: string | null;
  tariff_notes_en?: string | null;
}

export function useTicketContent() {
  const [contents, setContents] = useState<TicketContent[]>([]);
  const [settings, setSettings] = useState<TicketSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('ticket_content')
        .select('*')
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;
      setContents((data as TicketContent[]) || []);
    } catch (err) {
      console.error('Error fetching ticket content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket content');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('ticket_settings')
        .select('*')
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      if (data) {
        let additional_tariffs = data.additional_tariffs;
        if (typeof additional_tariffs === 'string') {
          try {
            additional_tariffs = JSON.parse(additional_tariffs);
          } catch {
            additional_tariffs = [];
          }
        }
        setSettings({
          ...data,
          additional_tariffs: Array.isArray(additional_tariffs) ? additional_tariffs : []
        } as TicketSettings);
      } else {
        setSettings(null);
      }
    } catch (err) {
      console.error('Error fetching ticket settings:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchContents(), fetchSettings()]);
      setLoading(false);
    };
    loadData();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'ticket_content' || e.detail.table === 'ticket_settings') {
        fetchContents();
        fetchSettings();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  const createContent = async (content: Omit<TicketContent, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('ticket_content')
      .insert(content)
      .select()
      .single();

    if (!error) {
      await fetchContents();
    }
    return { data, error: error?.message };
  };

  const updateContent = async (id: string, updates: Partial<TicketContent>) => {
    const { data, error } = await supabase
      .from('ticket_content')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await fetchContents();
    }
    return { data, error: error?.message };
  };

  const deleteContent = async (id: string) => {
    const { error } = await supabase
      .from('ticket_content')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchContents();
    }
    return { error: error?.message };
  };

  const updateSettings = async (updates: Partial<TicketSettings>) => {
    if (!settings?.id) {
      // Insert new settings
      const { data, error } = await supabase
        .from('ticket_settings')
        .insert(updates)
        .select()
        .single();

      if (!error) {
        setSettings(data as TicketSettings);
      }
      return { data, error: error?.message };
    }

    const { data, error } = await supabase
      .from('ticket_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single();

    if (!error) {
      setSettings(data as TicketSettings);
    }
    return { data, error: error?.message };
  };

  return {
    contents,
    settings,
    loading,
    error,
    fetchContents,
    fetchSettings,
    createContent,
    updateContent,
    deleteContent,
    updateSettings,
  };
}
