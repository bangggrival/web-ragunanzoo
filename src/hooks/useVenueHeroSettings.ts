import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VenueHeroSettings {
  badge_text: string;
  title_text: string;
  subtitle_text: string;
  highlight_1: string;
  highlight_2: string;
  highlight_3: string;
  info_title: string;
  info_desc: string;
  // Event Types Section fields
  events_badge: string;
  events_title: string;
  events_subtitle: string;
  event_1_title: string;
  event_1_desc: string;
  event_2_title: string;
  event_2_desc: string;
  event_3_title: string;
  event_3_desc: string;
  event_4_title: string;
  event_4_desc: string;
  // Category Pills Filter Labels
  cat_all_label: string;
  cat_pendopo_label: string;
  cat_outdoor_label: string;
  cat_indoor_label: string;
}

export const defaultVenueHeroSettings: VenueHeroSettings = {
  badge_text: 'Fasilitas Penyewaan Lokasi Terbuka',
  title_text: 'Penyewaan Tempat & Area Kegiatan',
  subtitle_text: 'Pilihan pendopo, area terbuka hijau, dan lokasi kegiatan di kawasan Taman Margasatwa Ragunan untuk acara instansi, komunitas, maupun acara keluarga.',
  highlight_1: 'Kapasitas s/d 1.000 Pengunjung',
  highlight_2: 'Area Hijau Rindang',
  highlight_3: 'Akses Parkir & Lokasi Strategis',
  info_title: 'Informasi & Layanan Sewa',
  info_desc: 'Hubungi unit pengelola untuk cek jadwal, pengajuan izin tempat, atau survei lokasi.',
  // Event Showcase defaults
  events_badge: 'Ragam Kegiatan',
  events_title: 'Penggunaan Area Acara',
  events_subtitle: 'Area di Taman Margasatwa Ragunan dapat dimanfaatkan untuk berbagai aktivitas resmi maupun publik',
  event_1_title: 'Gathering & Outing',
  event_1_desc: 'Kegiatan kebersamaan instansi, sekolah, atau organisasi.',
  event_2_title: 'Acara Keluarga',
  event_2_desc: 'Syukuran, reuni, dan pertemuan keluarga besar.',
  event_3_title: 'Edukasi & Komunitas',
  event_3_desc: 'Studi lapangan, pameran outdoor, dan kumpul komunitas.',
  event_4_title: 'Dokumentasi & Media',
  event_4_desc: 'Pemotretan komersial, liputan media, dan pembuatan video.',
  // Category Pills defaults
  cat_all_label: 'Semua Tempat',
  cat_pendopo_label: 'Pendopo',
  cat_outdoor_label: 'Area Open Space',
  cat_indoor_label: 'Gedung / Serbaguna'
};

export function useVenueHeroSettings() {
  const [heroSettings, setHeroSettings] = useState<VenueHeroSettings>(defaultVenueHeroSettings);
  const [loading, setLoading] = useState(true);

  const fetchHeroSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'venue_hero_settings')
        .single();

      if (data && data.value) {
        setHeroSettings({
          ...defaultVenueHeroSettings,
          ...(typeof data.value === 'object' ? data.value : JSON.parse(data.value))
        });
      }
    } catch (err) {
      console.error('Error fetching venue hero settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroSettings();

    const handleRealtime = (e: any) => {
      if (e.detail?.table === 'system_configs') {
        fetchHeroSettings();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, [fetchHeroSettings]);

  const updateHeroSettings = async (newSettings: Partial<VenueHeroSettings>) => {
    try {
      const merged = { ...heroSettings, ...newSettings };
      const { error } = await supabase
        .from('system_configs')
        .upsert({
          key: 'venue_hero_settings',
          value: merged,
          description: 'Pengaturan Header, Tagline, Category Pills & Ragam Kegiatan Halaman Sewa Tempat',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setHeroSettings(merged);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating venue hero settings:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    heroSettings,
    loading,
    updateHeroSettings,
    refreshHeroSettings: fetchHeroSettings
  };
}
