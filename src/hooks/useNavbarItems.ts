import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NavbarItem {
  id: string;
  label_id: string;
  label_en: string | null;
  path: string;
  path_en: string | null;
  icon: string;
  order_index: number;
  show_in_top_nav: boolean;
  show_in_bottom_nav: boolean;
  is_active: boolean;
  is_system: boolean;
  is_dropdown: boolean;
  parent_id: string | null;
  children?: NavbarItem[];
}

export function useNavbarItems() {
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('navbar_items')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (fetchError) throw fetchError;
        
        // Cast data to include new columns
        const allItems = (data || []).map(item => ({
          ...item,
          is_dropdown: (item as any).is_dropdown ?? false,
          parent_id: (item as any).parent_id ?? null,
        })) as NavbarItem[];
        
        // Build hierarchical structure
        const parentItems = allItems.filter(item => !item.parent_id);
        const childItems = allItems.filter(item => item.parent_id);
        
        // Attach children to their parents
        const itemsWithChildren = parentItems.map(parent => ({
          ...parent,
          children: childItems.filter(child => child.parent_id === parent.id)
        }));
        
        setItems(itemsWithChildren);
      } catch (err) {
        console.error('Error fetching navbar items:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch navbar items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const topNavItems = items.filter(item => item.show_in_top_nav);
  const bottomNavItems = items.filter(item => item.show_in_bottom_nav);

  return { items, topNavItems, bottomNavItems, loading, error, isReady: !loading && !error };
}
