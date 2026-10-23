import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setVenues(data || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'venues') {
        fetchVenues();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, [fetchVenues]);

  return { venues, loading, error, fetchVenues };
}
