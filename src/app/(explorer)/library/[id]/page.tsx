"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { Book as BookType, useBooks } from '@/hooks/useBooks';
import { usePurchases } from '@/hooks/usePurchases';
import { Skeleton } from '@/components/ui/skeleton';
import { incrementBookViewAction } from '@/app/manager/library/actions';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { getCategoryLabel, getCategoryIcon, incrementViewCount } = useBooks();
  const { purchases, hasPurchasedBook, buyBookMock, getSignedUrl } = usePurchases();
  
  const [book, setBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    async function fetchBook() {
      if (!params.id) return;
      
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (data) {
        setBook(data as BookType);
        // Increment view count in Supabase local
        incrementViewCount(data.id);
        // Increment view count in custom express backend (ragunan_zoo)
        incrementBookViewAction(data.id);
      }
      setLoading(false);
    }
    
    fetchBook();
  }, [params.id, incrementViewCount]);

  const getTitle = (b: BookType) => language === 'en' && b.title_en ? b.title_en : b.title_id;
  const getDescription = (b: BookType) => language === 'en' && b.description_en ? b.description_en : b.description_id;

  useEffect(() => {
    if (book) {
      const displayTitle = language === 'en' && book.title_en ? book.title_en : book.title_id;
      document.title = `${displayTitle} - ${language === 'en' ? 'Digital Library' : 'Perpustakaan Digital Ragunan'}`;
    }
  }, [book, language]);

  const isPurchased = book ? hasPurchasedBook(book.id) : false;

  const handleRead = async () => {
    if (!book) return;
    setReading(true);
    
    try {
      if (!book.is_premium) {
        if (book.file_url) window.open(book.file_url, '_blank');
        return;
      }
      
      if (isPurchased) {
        // Find purchase to get path if not stored in file_url?
        // Actually for premium, file_url holds the storage path, not the public URL.
        const url = await getSignedUrl(book.file_url);
        if (url) {
          window.open(url, '_blank');
        } else {
          alert('Gagal mendapatkan akses file. Silakan coba lagi nanti.');
        }
      }
    } finally {
      setReading(false);
    }
  };

  const handleBuy = () => {
    if (!book) return;
    router.push(`/library/${book.id}/checkout`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-8 w-32" />
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-1/3 aspect-[3/4] rounded-2xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AppIcon icon="Book" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Buku Tidak Ditemukan</h1>
          <button onClick={() => router.push('/library')} className="text-primary hover:underline">
            Kembali ke Perpustakaan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/library')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <AppIcon icon="ChevronLeft" className="w-4 h-4" />
          {language === 'en' ? 'Back to Library' : 'Kembali ke Perpustakaan'}
        </button>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Left: Cover */}
            <div className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-100 group">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={getTitle(book)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <AppIcon icon="Book" className="w-20 h-20 text-primary/30" />
                  </div>
                )}
                
                {book.is_premium && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center shadow-lg border border-amber-300">
                    <AppIcon icon="Star" className="w-4 h-4 text-white fill-white mr-1.5" />
                    <span className="text-xs font-bold text-white tracking-wider">PREMIUM</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                  {getCategoryIcon(book.category)} {getCategoryLabel(book.category, language)}
                </span>
                {book.is_featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-bold border border-secondary/20">
                    <AppIcon icon="Star" className="w-3.5 h-3.5 fill-secondary" /> 
                    {language === 'en' ? 'Featured' : 'Unggulan'}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight mb-2">
                {getTitle(book)}
              </h1>
              
              {book.author && (
                <p className="text-lg text-slate-500 font-medium mb-6">
                  {language === 'en' ? 'by' : 'oleh'} <span className="text-slate-700">{book.author}</span>
                </p>
              )}

              <div className="flex flex-wrap gap-6 mb-8 py-6 border-y border-slate-100">
                {book.page_count && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <AppIcon icon="FileText" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Pages' : 'Halaman'}</p>
                      <p className="font-bold text-slate-700">{book.page_count}</p>
                    </div>
                  </div>
                )}
                {book.year_published && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                      <AppIcon icon="Clock" className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Published' : 'Terbit'}</p>
                      <p className="font-bold text-slate-700">{book.year_published}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <AppIcon icon="Eye" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Views</p>
                    <p className="font-bold text-slate-700">{book.view_count || 0}</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate prose-sm max-w-none mb-10 text-slate-600">
                <p className="whitespace-pre-wrap">{getDescription(book) || (language === 'en' ? 'No description available.' : 'Tidak ada deskripsi.')}</p>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                {book.is_premium ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-1">E-Book Premium</p>
                      {isPurchased ? (
                        <p className="text-2xl font-black text-slate-800">Telah Dibeli</p>
                      ) : (
                        <p className="text-3xl font-black text-slate-800">
                          Rp {(book.price || 0).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                    
                    {isPurchased ? (
                      <button 
                        onClick={handleRead}
                        disabled={reading || !book.file_url}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                      >
                        <AppIcon icon="BookOpen" className="w-5 h-5" />
                        {reading ? 'Membuka...' : 'Baca Buku Premium'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleBuy}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto group"
                      >
                        <AppIcon icon="LockKeyhole" className="w-5 h-5 group-hover:hidden" />
                        <AppIcon icon="ShoppingCart" className="w-5 h-5 hidden group-hover:block" />
                        Beli E-Book
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-6 bg-green-50 border border-green-100 rounded-2xl">
                    <div>
                      <p className="text-sm font-bold text-green-700 uppercase tracking-wider mb-1">E-Book Gratis</p>
                      <p className="text-2xl font-black text-slate-800">Akses Terbuka</p>
                    </div>
                    <button 
                      onClick={handleRead}
                      disabled={reading || !book.file_url}
                      className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                    >
                      <AppIcon icon="BookOpen" className="w-5 h-5" />
                      {language === 'en' ? 'Read Now' : 'Baca Sekarang'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
