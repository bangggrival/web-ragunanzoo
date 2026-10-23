import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Announcement {
  id: number;
  title: string;
  title_id: string | null;
  title_en: string | null;
  content: string;
  content_id: string | null;
  content_en: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'announcements') {
        fetchAnnouncements();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError(error.message);
    } else {
      setAnnouncements((data as Announcement[]) || []);
    }
    setLoading(false);
  };

  const getActiveAnnouncement = () => {
    return announcements.find(a => a.is_active) || null;
  };

  return { announcements, loading, error, fetchAnnouncements, getActiveAnnouncement };
}
