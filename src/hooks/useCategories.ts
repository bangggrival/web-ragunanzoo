import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name_id: string;
  name_en: string | null;
  type: 'flora' | 'fauna';
  icon: string | null;
  description_id: string | null;
  description_en: string | null;
  image_url: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: loading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
  });

  const addCategory = useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori berhasil ditambahkan');
    },
    onError: (error) => {
      toast.error('Gagal menambahkan kategori: ' + error.message);
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CategoryUpdate }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori berhasil diperbarui');
    },
    onError: (error) => {
      toast.error('Gagal memperbarui kategori: ' + error.message);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori berhasil dihapus');
    },
    onError: (error) => {
      toast.error('Gagal menghapus kategori: ' + error.message);
    },
  });

  // Helper functions
  const getActiveCategories = (type?: 'flora' | 'fauna') => {
    return categories.filter(c => c.is_active && (!type || c.type === type));
  };

  const getFloraCategories = () => getActiveCategories('flora');
  const getFaunaCategories = () => getActiveCategories('fauna');

  // Get category name based on language
  const getCategoryName = (category: Category, language: 'id' | 'en' = 'id') => {
    if (language === 'en' && category.name_en) {
      return category.name_en;
    }
    return category.name_id;
  };

  // Get category display text with icon
  const getCategoryDisplay = (category: Category, language: 'id' | 'en' = 'id') => {
    const name = getCategoryName(category, language);
    return category.icon ? `${category.icon} ${name}` : name;
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getActiveCategories,
    getFloraCategories,
    getFaunaCategories,
    getCategoryName,
    getCategoryDisplay,
  };
}
