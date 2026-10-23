import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Book {
  id: string;
  title_id: string;
  title_en: string | null;
  author: string | null;
  publisher: string | null;
  publish_year: string | null;
  description_id: string | null;
  description_en: string | null;
  category: string;
  cover_url: string | null;
  file_url: string | null;
  file_type: string | null;
  page_count: number | null;
  year_published: number | null;
  is_featured: boolean;
  is_published: boolean;
  is_premium: boolean;
  price: number;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export type BookInsert = Omit<Book, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'download_count'>;
export type BookUpdate = Partial<BookInsert>;

export const BOOK_CATEGORIES = [
  { value: 'flora', label_id: 'Flora & Tumbuhan', label_en: 'Flora & Plants', icon: '🌿' },
  { value: 'fauna', label_id: 'Fauna & Satwa', label_en: 'Fauna & Animals', icon: '🦁' },
  { value: 'konservasi', label_id: 'Konservasi', label_en: 'Conservation', icon: '🌍' },
  { value: 'edukasi', label_id: 'Edukasi Anak', label_en: 'Kids Education', icon: '🎨' },
  { value: 'panduan', label_id: 'Panduan Pengunjung', label_en: 'Visitor Guide', icon: '🗺️' },
  { value: 'sejarah', label_id: 'Sejarah', label_en: 'History', icon: '📜' },
  { value: 'umum', label_id: 'Umum', label_en: 'General', icon: '📚' },
];

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBooks(data as Book[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const addBook = async (book: BookInsert) => {
    const { data, error } = await supabase
      .from('books')
      .insert(book)
      .select()
      .single();

    if (error) {
      toast.error('Gagal menambahkan buku: ' + error.message);
      return null;
    }
    
    toast.success('Buku berhasil ditambahkan');
    fetchBooks();
    return data;
  };

  const updateBook = async (id: string, updates: BookUpdate) => {
    const { error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Gagal memperbarui buku: ' + error.message);
      return false;
    }
    
    toast.success('Buku berhasil diperbarui');
    fetchBooks();
    return true;
  };

  const deleteBook = async (id: string) => {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Gagal menghapus buku: ' + error.message);
      return false;
    }
    
    toast.success('Buku berhasil dihapus');
    fetchBooks();
    return true;
  };

  const incrementViewCount = async (id: string) => {
    await supabase.rpc('increment_book_view_count', { book_id: id });
  };

  const incrementDownloadCount = async (id: string) => {
    await supabase.rpc('increment_book_download_count', { book_id: id });
  };

  // Helper functions
  const getPublishedBooks = () => books.filter(b => b.is_published);
  const getFeaturedBooks = () => books.filter(b => b.is_featured && b.is_published);
  const getBooksByCategory = (category: string) => books.filter(b => b.category === category && b.is_published);

  const getCategoryLabel = (categoryValue: string, language: 'id' | 'en' = 'id') => {
    const cat = BOOK_CATEGORIES.find(c => c.value === categoryValue);
    if (!cat) return categoryValue;
    return language === 'en' ? cat.label_en : cat.label_id;
  };

  const getCategoryIcon = (categoryValue: string) => {
    return BOOK_CATEGORIES.find(c => c.value === categoryValue)?.icon || '📚';
  };

  return {
    books,
    loading,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    incrementViewCount,
    incrementDownloadCount,
    getPublishedBooks,
    getFeaturedBooks,
    getBooksByCategory,
    getCategoryLabel,
    getCategoryIcon,
  };
}
