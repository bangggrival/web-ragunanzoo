import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomPage {
  id: string;
  slug: string;
  title_id: string;
  title_en: string | null;
  content_id: string | null;
  content_en: string | null;
  is_published: boolean;
  show_in_navbar: boolean;
  navbar_icon: string | null;
  order_index: number;
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useCustomPages() {
  return useQuery({
    queryKey: ['custom-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages' as any)
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as CustomPage[];
    },
  });
}

export function useCustomPage(slug: string) {
  return useQuery({
    queryKey: ['custom-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages' as any)
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as CustomPage | null;
    },
    enabled: !!slug,
  });
}

export function useCustomPageMutations() {
  const queryClient = useQueryClient();

  const createPage = useMutation({
    mutationFn: async (page: Omit<CustomPage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('custom_pages' as any)
        .insert(page)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as CustomPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
    },
  });

  const updatePage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('custom_pages' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as CustomPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_pages' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pages'] });
    },
  });

  return { createPage, updatePage, deletePage };
}

// Helper function to upload image to custom-page-images bucket
export async function uploadCustomPageImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `page-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('custom-page-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('custom-page-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Helper function to delete image from custom-page-images bucket
export async function deleteCustomPageImage(url: string): Promise<void> {
  const path = url.split('/custom-page-images/').pop();
  if (!path) return;

  const { error } = await supabase.storage
    .from('custom-page-images')
    .remove([path]);

  if (error) console.error('Failed to delete image:', error);
}
