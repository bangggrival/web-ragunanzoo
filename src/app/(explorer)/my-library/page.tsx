"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book, ChevronRight, LockKeyhole, Star, FileText, History, Library, CheckCircle2 } from 'lucide-react';
import { usePurchases } from '@/hooks/usePurchases';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

export default function MyLibraryPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { purchases, loading, fetchPurchases } = usePurchases();
  const [activeTab, setActiveTab] = useState<'koleksi' | 'riwayat'>('koleksi');

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        fetchPurchases();
      }
    });
  }, [router, fetchPurchases]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const successPurchases = purchases.filter(p => p.status === 'success' && p.book);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              {language === 'en' ? 'My Library' : 'Koleksi Saya'}
            </h1>
            <p className="text-slate-500 font-medium">
              {language === 'en' ? 'Your premium e-books and transaction history' : 'E-book premium dan riwayat transaksi Anda'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-max mb-8">
          <button
            onClick={() => setActiveTab('koleksi')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'koleksi'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Library className="w-4 h-4" />
            {language === 'en' ? 'My Collection' : 'Koleksi Buku'}
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'riwayat'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <History className="w-4 h-4" />
            {language === 'en' ? 'Transaction History' : 'Riwayat Transaksi'}
          </button>
        </div>

        {activeTab === 'koleksi' && (
          <>
            {successPurchases.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LockKeyhole className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {language === 'en' ? 'No Premium Books Yet' : 'Belum Ada Buku Premium'}
                </h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  {language === 'en' 
                    ? "You haven't purchased any premium e-books yet. Explore our library to find exclusive content."
                    : "Anda belum membeli e-book premium satupun. Jelajahi perpustakaan kami untuk menemukan konten eksklusif."}
                </p>
                <button 
                  onClick={() => router.push('/library')}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  {language === 'en' ? 'Explore Library' : 'Jelajahi Perpustakaan'}
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {successPurchases.map(purchase => {
                  const book = purchase.book!;
                  const title = language === 'en' && book.title_en ? book.title_en : book.title_id;
                  
                  return (
                    <div 
                      key={purchase.id}
                      onClick={() => router.push(`/library/${book.id}`)}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-6 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-16 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50">
                            <Book className="w-6 h-6 text-amber-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold border border-amber-200">
                            PREMIUM
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(purchase.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {title}
                        </h3>
                        {book.author && <p className="text-sm font-medium text-slate-500 truncate">{book.author}</p>}
                      </div>
                      
                      <div className="hidden sm:flex flex-col items-end gap-2 pr-4">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'riwayat' && (
          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            {purchases.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {language === 'en' ? 'No Transactions Found' : 'Belum Ada Riwayat Transaksi'}
                </h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item (Buku)</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.map(purchase => {
                      const book = purchase.book;
                      const title = book 
                        ? (language === 'en' && book.title_en ? book.title_en : book.title_id) 
                        : 'Buku Tidak Diketahui';
                      
                      return (
                        <tr key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                            {new Date(purchase.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="p-4 text-sm font-bold text-slate-400 whitespace-nowrap uppercase">
                            INV-{purchase.id.split('-')[0]}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {book?.cover_url && (
                                <img src={book.cover_url} alt={title} className="w-8 h-12 object-cover rounded shadow-sm hidden sm:block" />
                              )}
                              <p className="text-sm font-bold text-slate-800 line-clamp-2">{title}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-black text-slate-800 whitespace-nowrap">
                            Rp {(purchase.amount || book?.price || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {purchase.status === 'success' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Lunas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-200">
                                Tertunda
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
