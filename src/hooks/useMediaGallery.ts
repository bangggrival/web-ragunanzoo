import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  alt_text: string | null;
  category: string;
  tags: string[];
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export const MEDIA_CATEGORIES = [
  { value: 'general', label: 'Umum' },
  { value: 'animals', label: 'Satwa' },
  { value: 'plants', label: 'Tanaman' },
  { value: 'events', label: 'Event' },
  { value: 'news', label: 'Berita' },
  { value: 'venues', label: 'Venue' },
  { value: 'banners', label: 'Banner' },
  { value: 'icons', label: 'Ikon' },
] as const;

export function useMediaGallery(category?: string) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('media_gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching media:', error);
      toast.error('Gagal memuat galeri');
    } else {
      setMedia(data as MediaItem[]);
    }
    
    setLoading(false);
  }, [category]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const uploadMedia = async (
    file: File, 
    options?: { 
      category?: string; 
      altText?: string;
      tags?: string[];
    }
  ): Promise<MediaItem | null> => {
    try {
      // Validate file
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 50MB');
        return null;
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/quicktime'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung (harus berupa gambar atau video)');
        return null;
      }

      // Generate unique filename
      const ext = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}-${randomStr}.${ext}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media-gallery')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL using the path/url returned by backend
      const uploadedPath = uploadData?.path || filename;
      const fileUrl = uploadData?.url || supabase.storage.from('media-gallery').getPublicUrl(uploadedPath).data.publicUrl;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Insert to database
      const { data: mediaData, error: dbError } = await supabase
        .from('media_gallery')
        .insert({
          filename: uploadedPath,
          original_name: file.name,
          file_url: fileUrl,
          file_size: file.size,
          mime_type: file.type,
          alt_text: options?.altText || null,
          category: options?.category || 'general',
          tags: options?.tags || [],
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('File berhasil diupload');
      await fetchMedia();
      return mediaData as MediaItem;

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Gagal mengupload file: ' + error.message);
      return null;
    }
  };

  const deleteMedia = async (id: string, filename: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media-gallery')
        .remove([filename]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_gallery')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success('File berhasil dihapus');
      await fetchMedia();
      return true;

    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Gagal menghapus file: ' + error.message);
      return false;
    }
  };

  const updateMedia = async (
    id: string, 
    updates: { alt_text?: string; category?: string; tags?: string[] }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('media_gallery')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Data berhasil diperbarui');
      await fetchMedia();
      return true;

    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Gagal memperbarui data: ' + error.message);
      return false;
    }
  };

  return {
    media,
    loading,
    uploadMedia,
    deleteMedia,
    updateMedia,
    refetch: fetchMedia,
  };
}
