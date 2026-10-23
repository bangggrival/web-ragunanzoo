import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSystemConfigs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getConfig = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
      return data?.value || null;
    } catch (err: any) {
      console.error(`Error fetching config ${key}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (key: string, value: any, description?: string) => {
    setLoading(true);
    try {
      // Upsert logic
      const { error } = await supabase
        .from('system_configs')
        .upsert({ key, value, description, updated_at: new Date().toISOString() });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error(`Error updating config ${key}:`, err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getConfig,
    updateConfig
  };
}
