import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  estimated_done: string | null; // ISO string or null
  background_image_url: string | null;
  contact_phone: string;
  contact_email: string;
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  title: 'Sedang dalam Pemeliharaan',
  subtitle: 'Kami sedang melakukan pembaruan sistem untuk meningkatkan layanan Anda. Mohon maaf atas ketidaknyamanan ini.',
  estimated_done: null,
  background_image_url: null,
  contact_phone: '(021) 7884-0233',
  contact_email: 'taman.margasatwa@jakarta.go.id',
};

export function useMaintenanceMode() {
  const [config, setConfig] = useState<MaintenanceConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        setConfig({ ...DEFAULT_CONFIG, ...data.value });
      } else {
        setConfig(DEFAULT_CONFIG);
      }
    } catch (err) {
      console.error('[useMaintenanceMode] Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = useCallback(async (updates: Partial<MaintenanceConfig>) => {
    setSaving(true);
    try {
      const newConfig = { ...config, ...updates };

      // Check if row already exists
      const { data: existing } = await supabase
        .from('system_configs')
        .select('key')
        .eq('key', 'maintenance_mode')
        .single();

      let error: any;

      if (existing) {
        // Row exists → UPDATE
        const { error: updateErr } = await supabase
          .from('system_configs')
          .update({
            value: newConfig,
            description: 'Pengaturan mode maintenance website',
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'maintenance_mode');
        error = updateErr;
      } else {
        // Row doesn't exist → INSERT
        const { error: insertErr } = await supabase
          .from('system_configs')
          .insert({
            key: 'maintenance_mode',
            value: newConfig,
            description: 'Pengaturan mode maintenance website',
            updated_at: new Date().toISOString(),
          });
        error = insertErr;
      }

      if (error) throw new Error(error.message || JSON.stringify(error));
      setConfig(newConfig);
      return { success: true };
    } catch (err: any) {
      console.error('[useMaintenanceMode] Error saving config:', err);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [config]);

  const toggleMaintenance = useCallback(async (enabled: boolean) => {
    const result = await saveConfig({ enabled });
    if (result.success) {
      toast.success(enabled ? '🔧 Mode Maintenance diaktifkan' : '✅ Mode Maintenance dinonaktifkan');
    } else {
      toast.error('Gagal mengubah status maintenance');
    }
    return result;
  }, [saveConfig]);

  const uploadBackgroundImage = useCallback(async (file: File) => {
    setUploadingBg(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `background-${Date.now()}.${ext}`;
      const filePath = `maintenance/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(uploadData.path);

      await saveConfig({ background_image_url: publicUrl });
      toast.success('Gambar background berhasil diupload');
      return { success: true, url: publicUrl };
    } catch (err: any) {
      console.error('[useMaintenanceMode] Error uploading background:', err);
      toast.error('Gagal mengupload gambar background');
      return { success: false, error: err.message };
    } finally {
      setUploadingBg(false);
    }
  }, [saveConfig]);

  const removeBackgroundImage = useCallback(async () => {
    await saveConfig({ background_image_url: null });
    toast.success('Background kustom dihapus, menggunakan desain default');
  }, [saveConfig]);

  return {
    config,
    loading,
    saving,
    uploadingBg,
    fetchConfig,
    saveConfig,
    toggleMaintenance,
    uploadBackgroundImage,
    removeBackgroundImage,
  };
}
