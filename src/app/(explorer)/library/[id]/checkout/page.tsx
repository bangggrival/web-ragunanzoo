"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { AppIcon } from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { Book as BookType } from '@/hooks/useBooks';
import { usePurchases } from '@/hooks/usePurchases';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { buyBookMock, hasPurchasedBook } = usePurchases();
  
  const [book, setBook] = useState<BookType | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!params.id) return;
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/login');
        return;
      }
      setUser(userData.user);

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (data) {
        if (!data.is_premium) {
          // If the book isn't premium, they shouldn't be in checkout
          router.push(`/library/${data.id}`);
          return;
        }
        if (hasPurchasedBook(data.id)) {
          // If already purchased, go to my library
          router.push('/my-library');
          return;
        }
        setBook(data as BookType);
      }
      setLoading(false);
    }
    
    fetchData();
  }, [params.id, router, hasPurchasedBook]);

  const getTitle = (b: BookType) => language === 'en' && b.title_en ? b.title_en : b.title_id;

  const handleCheckout = async () => {
    if (!book || isProcessing) return;
    setIsProcessing(true);

    // Simulate 2 second loading delay for realism
    setTimeout(async () => {
      const success = await buyBookMock(book);
      if (success) {
        setIsSuccess(true);
        // Show success state for 2 seconds then redirect
        setTimeout(() => {
          router.push('/my-library');
        }, 2000);
      } else {
        setIsProcessing(false);
        alert(language === 'en' ? 'Checkout failed' : 'Gagal memproses pembayaran');
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-2xl" />
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-xl max-w-md w-full text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AppIcon icon="CheckCircle2" className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-slate-500 mb-8">E-Book telah ditambahkan ke Koleksi Anda.</p>
          <div className="w-full flex justify-center">
            <AppIcon icon="Loader2" className="w-6 h-6 text-green-500 animate-spin" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Mengarahkan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.push(`/library/${book.id}`)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <AppIcon icon="ChevronLeft" className="w-4 h-4" />
          {language === 'en' ? 'Back to Book Details' : 'Kembali ke Detail Buku'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                Rincian Pesanan
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 flex-shrink-0 relative">
                  <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden shadow-md">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={getTitle(book)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50">
                        <AppIcon icon="Book" className="w-8 h-8 text-amber-300" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-md shadow flex items-center">
                    <AppIcon icon="Star" className="w-2.5 h-2.5 text-white fill-white mr-1" />
                    <span className="text-[9px] font-bold text-white tracking-wider">PREMIUM</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2">{getTitle(book)}</h3>
                  {book.author && <p className="text-sm font-medium text-slate-500 mb-4">{book.author}</p>}
                  <p className="text-lg font-black text-slate-800">Rp {(book.price || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                Informasi Pembeli
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Metode Pembayaran
                </h2>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-200">
                  Simulasi
                </span>
              </div>
              <div className="p-4 border-2 border-primary bg-primary/5 rounded-2xl flex items-center gap-4 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full" />
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 flex-shrink-0">
                  <AppIcon icon="CreditCard" className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Ragunan Pay (Mockup)</p>
                  <p className="text-xs text-slate-500 font-medium">Pembayaran akan disimulasikan berhasil otomatis</p>
                </div>
                <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl sticky top-8 text-white">
              <h2 className="text-xl font-bold border-b border-white/10 pb-4 mb-6">
                Ringkasan Belanja
              </h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">Harga Buku</span>
                  <span className="font-bold text-white">Rp {(book.price || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">Biaya Layanan</span>
                  <span className="font-bold text-white">Rp 0</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">Pajak (PPN)</span>
                  <span className="font-bold text-white">Rp 0</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-8 flex justify-between items-center">
                <span className="font-bold">Total Pembayaran</span>
                <span className="text-2xl font-black text-amber-400">Rp {(book.price || 0).toLocaleString('id-ID')}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-900 rounded-xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <AppIcon icon="Loader2" className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <AppIcon icon="LockKeyhole" className="w-5 h-5" />
                    Bayar Sekarang
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 text-center">
                <AppIcon icon="LockKeyhole" className="w-3 h-3" />
                Pembayaran Anda aman dan terenkripsi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
