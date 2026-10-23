import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Animal {
  id: number;
  name: string;
  name_en?: string | null;
  latin_name: string | null;
  species: string | null;
  zone: string | null;
  category: string | null;
  category_en: string | null;
  category_id: string | null;
  status: string | null;
  description: string | null;
  description_en?: string | null;
  image_url: string | null;
  health_status: string | null;
  habitat: string | null;
  habitat_en?: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean | null;
  is_published: boolean | null;
  audio_url?: string | null;
  model_url?: string | null;
  created_at: string;
}

export function useAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimals();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'animals') {
        fetchAnimals();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, []);

  const fetchAnimals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('name');
    
    if (error) {
      setError(error.message);
    } else {
      setAnimals(data || []);
    }
    setLoading(false);
  };

  const getAnimalById = async (id: number) => {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  };

  const getFeaturedAnimals = () => {
    return animals.filter(a => a.is_featured);
  };

  // Get unique categories from animals
  const getCategories = () => {
    const categories = new Set<string>();
    animals.forEach(animal => {
      if (animal.category) categories.add(animal.category);
    });
    return Array.from(categories).sort();
  };

  // Get animals by category (text-based - legacy)
  const getAnimalsByCategory = (category: string) => {
    return animals.filter(a => a.category === category);
  };

  // Get animals by category_id (new UUID-based)
  const getAnimalsByCategoryId = (categoryId: string) => {
    return animals.filter(a => a.category_id === categoryId);
  };

  return { 
    animals, 
    loading, 
    error, 
    fetchAnimals, 
    getAnimalById, 
    getFeaturedAnimals,
    getCategories,
    getAnimalsByCategory,
    getAnimalsByCategoryId
  };
}
