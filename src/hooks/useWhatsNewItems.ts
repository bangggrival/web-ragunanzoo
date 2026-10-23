import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WhatsNewItem {
  id: string;
  item_type: 'animal' | 'event' | 'news' | 'venue';
  item_id: string;
  title_id: string;
  title_en: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export function useWhatsNewItems() {
  const [items, setItems] = useState<WhatsNewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('whats_new_items')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      setItems(data as WhatsNewItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'whats_new_items') {
        fetchItems();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, [fetchItems]);

  return { items, loading, fetchItems };
}
