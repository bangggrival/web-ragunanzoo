import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ZoneMarker {
  id: string;
  name: string;
  name_en: string | null;
  color: string;
  position_x: number;
  position_y: number;
  description: string | null;
  description_en: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useZoneMarkers() {
  const [markers, setMarkers] = useState<ZoneMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('zone_markers')
        .select('*')
        .order('name');

      if (error) {
        setError(error.message);
      } else {
        setMarkers(data || []);
      }
    } catch (err) {
      setError('Failed to fetch zone markers');
    } finally {
      setLoading(false);
    }
  };

  const updateMarker = async (id: string, updates: Partial<ZoneMarker>) => {
    try {
      const { error } = await supabase
        .from('zone_markers')
        .update(updates)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await fetchMarkers();
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Failed to update marker' };
    }
  };

  const createMarker = async (marker: Omit<ZoneMarker, 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('zone_markers')
        .insert(marker);

      if (error) {
        return { success: false, error: error.message };
      }

      await fetchMarkers();
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Failed to create marker' };
    }
  };

  const deleteMarker = async (id: string) => {
    try {
      const { error } = await supabase
        .from('zone_markers')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      await fetchMarkers();
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: 'Failed to delete marker' };
    }
  };

  useEffect(() => {
    fetchMarkers();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'zone_markers') {
        fetchMarkers();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  return {
    markers,
    loading,
    error,
    fetchMarkers,
    updateMarker,
    createMarker,
    deleteMarker,
  };
}
