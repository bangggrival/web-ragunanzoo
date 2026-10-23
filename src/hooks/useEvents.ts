import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: number;
  title: string;
  title_id: string | null;
  title_en: string | null;
  description: string | null;
  description_id: string | null;
  description_en: string | null;
  event_date: string | null;
  time: string | null;
  zone: string | null;
  location: string | null;
  type: string | null;
  category?: string | null;
  image_url: string | null;
  is_published: boolean | null;
  created_at: string;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'events') {
        fetchEvents();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (error) {
      setError(error.message);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(e => e.event_date && e.event_date >= today);
  };

  return { events, loading, error, fetchEvents, getUpcomingEvents };
}
