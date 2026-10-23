import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroBanner {
  id: number;
  title: string | null;
  title_id: string | null;
  title_en: string | null;
  subtitle: string | null;
  subtitle_id: string | null;
  subtitle_en: string | null;
  description_id: string | null;
  description_en: string | null;
  link_url: string | null;
  image_url: string | null;
  video_url: string | null;
  media_type: 'image' | 'video' | null;
  is_active: boolean;
  created_at: string;
}

export function useHeroBanner() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'hero_banner') {
        fetchBanners();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hero_banner')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError(error.message);
    } else {
      setBanners((data as HeroBanner[]) || []);
    }
    setLoading(false);
  };

  const getActiveBanner = () => {
    return banners.find(b => b.is_active) || null;
  };

  return { banners, loading, error, fetchBanners, getActiveBanner };
}
