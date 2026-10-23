import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Plant {
  id: number;
  name: string;
  name_en?: string | null;
  latin_name: string | null;
  species: string | null;
  zone: string | null;
  category: string | null;
  category_en: string | null;
  category_id: string | null;
  location: string | null;
  habitat: string | null;
  habitat_en?: string | null;
  description: string | null;
  description_en?: string | null;
  status: string | null;
  health_status: string | null;
  image_url: string | null;
  is_featured: boolean | null;
  latitude: number | null;
  longitude: number | null;
  is_published: boolean | null;
  created_at: string;
}

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('name');

    if (!error && data) {
      setPlants(data as Plant[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlants();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'plants') {
        fetchPlants();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  const getPlantsByCategoryId = (categoryId: string) => {
    return plants.filter(plant => plant.category_id === categoryId);
  };

  const getFeaturedPlants = () => {
    return plants.filter(plant => plant.is_featured);
  };

  return { 
    plants, 
    loading, 
    fetchPlants,
    getPlantsByCategoryId,
    getFeaturedPlants
  };
}
