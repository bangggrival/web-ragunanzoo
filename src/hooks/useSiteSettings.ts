import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  logo_mobile_url: string | null;
  footer_logo_url: string | null;
  loading_logo_url: string | null;
  favicon_url: string | null;
  hero_image_url: string | null;
  mascot_image_url: string | null;
  map_image_url: string | null;
  site_name: string | null;
  updated_at: string;
  updated_by: string | null;
  // Floating ticket button settings
  floating_ticket_enabled: boolean | null;
  floating_ticket_text_id: string | null;
  floating_ticket_text_en: string | null;
  floating_ticket_position: 'left' | 'center' | 'right' | null;
  footer_description_id: string | null;
  footer_description_en: string | null;
  contact_address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  floating_ticket_use_schedule: boolean | null;
  floating_ticket_start_time: string | null;
  floating_ticket_end_time: string | null;
  floating_ticket_icon: string | null;
  floating_ticket_custom_icon_url: string | null;
  floating_ticket_icon_size: 'small' | 'medium' | 'large' | null;
  // External ticket URL
  ticket_external_url: string | null;
  // WhatsApp settings (legacy - for backward compatibility)
  whatsapp_number: string | null;
  // Chat Us button settings
  chat_us_enabled: boolean | null;
  chat_us_number: string | null;
  chat_us_position: 'left' | 'center' | 'right' | null;
  chat_us_icon_url: string | null;
  chat_us_start_time: string | null;
  chat_us_end_time: string | null;
  chat_us_timezone: string | null;
  chat_us_use_schedule: boolean | null;
  // Venue contact settings
  venue_whatsapp_number: string | null;
  venue_phone_number: string | null;
  // Navbar visibility settings
  navbar_show_map: boolean | null;
  navbar_show_animals: boolean | null;
  navbar_show_tickets: boolean | null;
  navbar_show_events: boolean | null;
  navbar_show_qr_scan: boolean | null;
  navbar_show_profile: boolean | null;
  navbar_show_venues: boolean | null;
  navbar_show_news: boolean | null;
  navbar_show_gallery3d: boolean | null;
  // Carousel settings
  carousel_autoplay_duration: number | null;
  // Hero ticket button settings
  hero_ticket_enabled: boolean | null;
  hero_ticket_use_schedule: boolean | null;
  hero_ticket_start_time: string | null;
  hero_ticket_end_time: string | null;
  // Social Media
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_youtube: string | null;
  social_tiktok: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setSettings(data as SiteSettings);
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({
          id: 'main',
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;
      await fetchSettings();
      return true;
    } catch (err) {
      console.error('Error updating site settings:', err);
      throw err;
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'site_settings') {
        fetchSettings();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, [fetchSettings]);

  return { settings, loading, error, fetchSettings, updateSettings };
}
