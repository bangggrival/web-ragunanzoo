import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlags {
  ar_enabled: boolean;
  audio_enabled: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  ar_enabled: true,
  audio_enabled: true,
};

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'feature_flags')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching feature flags:', error);
      }

      if (data?.value) {
        setFlags({
          ar_enabled: data.value.ar_enabled ?? true,
          audio_enabled: data.value.audio_enabled ?? true,
        });
      } else {
        setFlags(DEFAULT_FLAGS);
      }
    } catch (err) {
      console.error('Failed to fetch feature flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const updateFeatureFlags = useCallback(async (updates: Partial<FeatureFlags>) => {
    setSaving(true);
    try {
      const newFlags = { ...flags, ...updates };

      // Check if existing row exists
      const { data: existing } = await supabase
        .from('system_configs')
        .select('key')
        .eq('key', 'feature_flags')
        .single();

      let error: any;
      if (existing) {
        const { error: updateErr } = await supabase
          .from('system_configs')
          .update({
            value: newFlags,
            description: 'Pengaturan aktif/nonaktif fitur AR dan Suara Satwa',
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'feature_flags');
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('system_configs')
          .insert({
            key: 'feature_flags',
            value: newFlags,
            description: 'Pengaturan aktif/nonaktif fitur AR dan Suara Satwa',
            updated_at: new Date().toISOString(),
          });
        error = insertErr;
      }

      if (error) throw error;

      setFlags(newFlags);
      return { success: true };
    } catch (err: any) {
      console.error('Error saving feature flags:', err);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [flags]);

  return {
    arEnabled: flags.ar_enabled,
    audioEnabled: flags.audio_enabled,
    flags,
    loading,
    saving,
    fetchFlags,
    updateFeatureFlags,
  };
}
