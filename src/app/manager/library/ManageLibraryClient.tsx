// FULL FILE CONTENT
"use client";

import { useState, useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { BOOK_CATEGORIES, Book as BookType } from '@/hooks/useBooks';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { deleteBookAction, upsertBookAction } from './actions';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ImageInputWithGallery from '@/components/gallery/ImageInputWithGallery';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ManageLibraryClientProps {
  initialBooks: BookType[];
}

export default function ManageLibraryClient() {
  const { language } = useLanguage();
  const [books, setBooks] = useState<BookType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [deleteBook, setDeleteBook] = useState<BookType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
        if (data) setBooks(data as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'books') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const filteredBooks = books.filter(book => {
    const query = debouncedSearchQuery.toLowerCase();
    const matchesSearch = !query || Object.values(book).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(query)
    );
    const matchesCategory = !categoryFilter || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredBooks, 10);

  const hasFilters = Boolean(searchQuery || categoryFilter);

  const handleAdd = () => {
    setSelectedBook(null);
    setShowModal(true);
  };

  const handleEdit = (book: BookType) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteBook) return;
    try {
      const result = await deleteBookAction(deleteBook.id);
      if (!result.success) throw new Error(result.error);
      toast.success(language === 'en' ? 'Book deleted successfully' : 'Buku berhasil dihapus');
      setBooks(prev => prev.filter(b => b.id !== deleteBook.id));
    } catch (err: any) {
      toast.error((language === 'en' ? 'Failed to delete book: ' : 'Gagal menghapus buku: ') + err.message);
    } finally {
      setDeleteBook(null);
    }
  };

  const handleTogglePublish = async (id: string, is_published: boolean) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, is_published } : b));
    try {
      const { error } = await supabase.from('books').update({ is_published }).eq('id', id);
      if (error) throw error;
      toast.success(language === 'en' ? 'Visibility updated' : 'Status tampil diperbarui');
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
      setBooks(prev => prev.map(b => b.id === id ? { ...b, is_published: !is_published } : b));
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
  };

  const getCategoryLabel = (categoryValue: string, lang: 'id' | 'en' = 'id') => {
    const cat = BOOK_CATEGORIES.find(c => c.value === categoryValue);
    if (!cat) return categoryValue;
    return lang === 'en' ? cat.label_en : cat.label_id;
  };

  const getCategoryIcon = (categoryValue: string) => {
    return BOOK_CATEGORIES.find(c => c.value === categoryValue)?.icon || '📚';
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm p-8">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="BookOpen" className="w-5 h-5 text-green-500" />
            </div>
            {language === 'en' ? 'Digital Library' : 'Perpustakaan Digital'}
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">
            {language === 'en' ? 'Manage digital book collection' : 'Kelola koleksi buku digital'}
          </p>
        </div>
        <button 
          onClick={handleAdd} 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_20px_-3px_rgba(99,102,241,0.5)] hover:-translate-y-0.5"
        >
          <AppIcon icon="Plus" className="w-5 h-5" />
          {language === 'en' ? 'Add Book' : 'Tambah Buku'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/60 backdrop-blur-xl rounded-[1.5rem] border border-white/80 shadow-sm">
          <div className="relative flex-1 ml-2">
            <AppIcon icon="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search books...' : 'Cari buku...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="w-px h-8 bg-slate-200 hidden sm:block self-center"></div>
          <div className="relative sm:min-w-[200px] mr-2">
            <AppIcon icon="Filter" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
            >
              <option value="">{language === 'en' ? 'All Categories' : 'Semua Kategori'}</option>
              {BOOK_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {language === 'en' ? cat.label_en : cat.label_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'en' ? 'Filters:' : 'Filter:'}
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:bg-green-100 rounded-full p-0.5">
                  <AppIcon icon="X" className="w-3 h-3" />
                </button>
              </span>
            )}
            {categoryFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-xs font-bold border border-violet-100">
                {getCategoryIcon(categoryFilter)} {getCategoryLabel(categoryFilter, language)}
                <button onClick={() => setCategoryFilter('')} className="hover:bg-violet-100 rounded-full p-0.5">
                  <AppIcon icon="X" className="w-3 h-3" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-rose-500 hover:text-rose-600 font-bold ml-2">
              {language === 'en' ? 'Clear all' : 'Hapus semua'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <AppIcon icon="Book" className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Buku</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{books.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <AppIcon icon="Star" className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dipublikasi</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{books.filter(b => b.is_published).length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <AppIcon icon="Eye" className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Views</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{books.reduce((sum, b) => sum + (b.view_count || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <AppIcon icon="Download" className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Unduhan</span>
          </div>
          <p className="text-3xl font-black text-slate-800">{books.reduce((sum, b) => sum + (b.download_count || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="manager-table-shell">
        {paginatedItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <AppIcon icon="Book" className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {hasFilters 
                ? (language === 'en' ? 'No books found' : 'Tidak ada buku ditemukan')
                : (language === 'en' ? 'No books yet' : 'Belum ada buku')}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {language === 'en'
                ? 'Add your first book using the "Add Book" button.'
                : 'Tambahkan buku pertama lewat tombol "Tambah Buku".'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block manager-table-scroll">
              <table className="manager-table">
                <thead className="manager-table-head">
                  <tr>
                    <th className="manager-table-th rounded-tl-[1rem]">{language === 'en' ? 'Book' : 'Buku'}</th>
                    <th className="manager-table-th">{language === 'en' ? 'Category' : 'Kategori'}</th>
                    <th className="manager-table-th">{language === 'en' ? 'Stats' : 'Statistik'}</th>
                    <th className="manager-table-th">{language === 'en' ? 'Status' : 'Status'}</th>
                    <th className="manager-table-th manager-table-th-right rounded-tr-[1rem]">{language === 'en' ? 'Actions' : 'Aksi'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map(book => (
                    <tr key={book.id} className="manager-table-row">
                      <td className="manager-table-td">
                        <div className="flex items-center gap-4">
                          {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title_id} className="w-12 h-16 rounded-xl object-cover border border-slate-200/60 shadow-sm" />
                          ) : (
                            <div className="w-12 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-sm">
                              <AppIcon icon="Book" className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-slate-800 flex items-center gap-1.5 truncate">
                              {book.title_id}
                              {book.is_featured && <AppIcon icon="Star" className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                            </p>
                            {book.author && <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{book.author}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="manager-table-td">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200/60">
                          {getCategoryIcon(book.category)} {getCategoryLabel(book.category, language)}
                        </span>
                      </td>
                      <td className="manager-table-td">
                        <div className="flex flex-col gap-1.5">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><AppIcon icon="Eye" className="w-3.5 h-3.5 text-slate-400" /> {book.view_count || 0}</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><AppIcon icon="Download" className="w-3.5 h-3.5 text-slate-400" /> {book.download_count || 0}</span>
                        </div>
                      </td>
                      <td className="manager-table-td">
                        <Switch 
                          checked={book.is_published !== false}
                          onCheckedChange={(checked) => handleTogglePublish(book.id, checked)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </td>
                      <td className="manager-table-td manager-table-td-right">
                        <div className="manager-table-actions justify-end">
                          <button onClick={() => handleEdit(book)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                            <AppIcon icon="Edit2" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteBook(book)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                            <AppIcon icon="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Fallback View */}
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedItems.map(book => (
                <div key={book.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex gap-4">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title_id} className="w-16 h-20 rounded-xl object-cover border border-slate-200/60 shadow-sm flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-20 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-sm flex-shrink-0">
                        <AppIcon icon="Book" className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm text-slate-800 line-clamp-2">
                            {book.title_id}
                            {book.is_featured && <AppIcon icon="Star" className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline ml-1.5" />}
                          </p>
                        </div>
                        {book.author && <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{book.author}</p>}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[10px] font-bold border border-slate-200">
                          {getCategoryIcon(book.category)} {getCategoryLabel(book.category, language)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/80">
                    <span className="text-xs font-semibold text-slate-500">Tampil di Web:</span>
                    <Switch 
                      checked={book.is_published !== false}
                      onCheckedChange={(checked) => handleTogglePublish(book.id, checked)}
                      className="data-[state=checked]:bg-green-500 scale-90 origin-right"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/80">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><AppIcon icon="Eye" className="w-3.5 h-3.5 text-slate-400" /> {book.view_count || 0}</span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><AppIcon icon="Download" className="w-3.5 h-3.5 text-slate-400" /> {book.download_count || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(book)} className="px-3 py-1.5 text-xs font-bold rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-1.5">
                        <AppIcon icon="Edit2" className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => setDeleteBook(book)} className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5">
                        <AppIcon icon="Trash2" className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200/50 mt-2 pt-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        )}
      </div>

      {showModal && (
        <BookFormModalClient
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          book={selectedBook}
          onSuccess={(newBook) => {
            if (selectedBook) {
              setBooks(prev => prev.map(b => b.id === newBook.id ? { ...b, ...newBook } : b));
            } else {
              setBooks(prev => [newBook, ...prev]);
            }
          }}
          language={language}
        />
      )}

      <AlertDialog open={!!deleteBook} onOpenChange={() => setDeleteBook(null)}>
        <AlertDialogContent className="rounded-[2rem] p-6 border-white/60 bg-white/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">
              {language === 'en' ? 'Delete Book?' : 'Hapus Buku?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              {language === 'en' 
                ? `Are you sure you want to delete "${deleteBook?.title_id}"? This action cannot be undone.` 
                : `Apakah Anda yakin ingin menghapus "${deleteBook?.title_id}"? Tindakan ini tidak dapat dibatalkan.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">
              {language === 'en' ? 'Cancel' : 'Batal'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20">
              {language === 'en' ? 'Delete' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const initialFormData = {
  title_id: '',
  title_en: '',
  author: '',
  description_id: '',
  description_en: '',
  category: 'umum',
  cover_url: '',
  file_url: '',
  file_type: 'pdf',
  page_count: '',
  year_published: '',
  is_featured: false,
  is_published: true,
  is_premium: false,
  price: '',
};

function BookFormModalClient({ isOpen, onClose, book, onSuccess, language }: any) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (book) {
      setFormData({
        title_id: book.title_id || '',
        title_en: book.title_en || '',
        author: book.author || '',
        description_id: book.description_id || '',
        description_en: book.description_en || '',
        category: book.category || 'umum',
        cover_url: book.cover_url || '',
        file_url: book.file_url || '',
        file_type: book.file_type || 'pdf',
        page_count: book.page_count?.toString() || '',
        year_published: book.year_published?.toString() || '',
        is_featured: book.is_featured || false,
        is_published: book.is_published ?? true,
        is_premium: book.is_premium || false,
        price: book.price?.toString() || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [book, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/epub+zip'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file PDF atau EPUB yang diperbolehkan');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 50MB');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const targetBucket = formData.is_premium ? 'premium-book-files' : 'book-files';

    try {
      const { data, error } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, file);

      if (error) throw error;

      let publicUrlStr = '';
      if (formData.is_premium) {
        // For premium, we don't use public URL, just store the path
        publicUrlStr = data.path;
      } else {
        const { data: publicUrl } = supabase.storage
          .from('book-files')
          .getPublicUrl(data.path);
        publicUrlStr = publicUrl.publicUrl;
      }

      setFormData(prev => ({
        ...prev,
        file_url: publicUrlStr,
        file_type: fileExt,
      }));
      
      toast.success('File berhasil diunggah');
    } catch (err: any) {
      toast.error('Gagal mengunggah file: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_id.trim()) {
      toast.error('Judul buku wajib diisi');
      return;
    }

    setLoading(true);

    const payload = {
      id: book?.id,
      title_id: formData.title_id.trim(),
      title_en: formData.title_en || null,
      author: formData.author || null,
      description_id: formData.description_id || null,
      description_en: formData.description_en || null,
      category: formData.category,
      cover_url: formData.cover_url || null,
      file_url: formData.file_url || null,
      file_type: formData.file_type || 'pdf',
      page_count: formData.page_count ? parseInt(formData.page_count) : null,
      publish_year: formData.year_published ? parseInt(formData.year_published) : null,
      publisher: null,
      is_featured: formData.is_featured,
      is_published: formData.is_published,
      is_premium: formData.is_premium,
      price: formData.is_premium && formData.price ? parseInt(formData.price) : 0,
    } as any;

    try {
      const result = await upsertBookAction(payload);
      if (!result.success) throw new Error(result.error);
      
      onSuccess({ ...payload, id: book?.id || Date.now().toString(), view_count: book?.view_count || 0, download_count: book?.download_count || 0 });
      onClose();
      toast.success(book ? 'Buku diperbarui' : 'Buku ditambahkan');
    } catch (err: any) {
      toast.error('Gagal menyimpan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-white/40 rounded-[2rem] p-0">
        <DialogHeader className="p-6 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <AppIcon icon="Book" className="w-5 h-5 text-green-500" />
            </div>
            {book ? 'Edit Buku' : 'Tambah Buku'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Lengkapi detail buku untuk perpustakaan digital.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-1/3">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Cover Buku</h3>
              <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <ImageInputWithGallery
                  value={formData.cover_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, cover_url: url }))}
                  category="books"
                  showPreview={true}
                  previewClassName="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><AppIcon icon="Globe" className="w-4 h-4 text-slate-400" /> Konten Multibahasa</h3>
                <Tabs defaultValue="id" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl mb-3">
                    <TabsTrigger value="id" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-bold text-xs">Indonesia</TabsTrigger>
                    <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 font-bold text-xs">English</TabsTrigger>
                  </TabsList>
                  <TabsContent value="id" className="space-y-3 mt-0">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Judul Buku (ID) *</label>
                      <input type="text" value={formData.title_id} onChange={(e) => setFormData({...formData, title_id: e.target.value})} placeholder="Contoh: Flora Langka Indonesia" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deskripsi (ID)</label>
                      <textarea value={formData.description_id} onChange={(e) => setFormData({...formData, description_id: e.target.value})} rows={3} placeholder="Deskripsi buku..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm leading-relaxed" />
                    </div>
                  </TabsContent>
                  <TabsContent value="en" className="space-y-3 mt-0">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Book Title (EN)</label>
                      <input type="text" value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} placeholder="Example: Rare Flora of Indonesia" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description (EN)</label>
                      <textarea value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} rows={3} placeholder="Book description..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm leading-relaxed" />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Penulis</label>
                  <input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} placeholder="Dr. Penulis" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kategori</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-bold text-sm text-slate-700 cursor-pointer">
                    {BOOK_CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label_id}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jml Halaman</label>
                  <input type="number" value={formData.page_count} onChange={(e) => setFormData({...formData, page_count: e.target.value})} placeholder="120" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tahun Terbit</label>
                  <input type="number" value={formData.year_published} onChange={(e) => setFormData({...formData, year_published: e.target.value})} placeholder="2024" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 font-medium text-sm" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Buku Premium (Berbayar)</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Jual buku ini</p>
                  </div>
                  <Switch 
                    checked={formData.is_premium} 
                    onCheckedChange={(checked) => {
                      setFormData({...formData, is_premium: checked, file_url: ''}); 
                    }} 
                    className="data-[state=checked]:bg-amber-500" 
                  />
                </div>

                {formData.is_premium && (
                  <div className="space-y-1.5 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <label className="text-xs font-bold text-amber-700 uppercase tracking-wider">Harga (Rp) *</label>
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: e.target.value})} 
                      placeholder="Contoh: 35000" 
                      className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-sm text-slate-800" 
                      required={formData.is_premium}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AppIcon icon="Star" className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Buku Unggulan</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Tampilkan di bagian depan</p>
                    </div>
                  </div>
                  <Switch checked={formData.is_featured} onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})} className="data-[state=checked]:bg-green-500" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Publikasikan</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Buku dapat dilihat publik</p>
                  </div>
                  <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({...formData, is_published: checked})} className="data-[state=checked]:bg-green-500" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><AppIcon icon="FileText" className="w-4 h-4 text-slate-400" /> File Buku</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-all group mb-3">
                    <input type="file" accept=".pdf,.epub" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    {uploading ? <AppIcon icon="Loader2" className="w-6 h-6 animate-spin text-green-500" /> : (
                      <>
                        <AppIcon icon="Upload" className="w-6 h-6 text-slate-400 group-hover:text-green-500 mb-2" />
                        <span className="text-sm font-bold text-slate-600">Upload PDF/EPUB (Maks 50MB)</span>
                      </>
                    )}
                  </label>

                  {formData.file_url && (
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <AppIcon icon="FileText" className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">{formData.file_url.split('/').pop()}</span>
                      </div>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, file_url: '' }))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex-shrink-0">
                        <AppIcon icon="X" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="p-5 border-t border-slate-100 bg-slate-50/80 rounded-b-[2rem]">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors">Batal</button>
          <button onClick={handleSubmit} disabled={loading || !formData.title_id.trim()} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold shadow-lg shadow-green-600/20 transition-all">
            {loading ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : null}
            {book ? 'Simpan Perubahan' : 'Tambah Buku'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
