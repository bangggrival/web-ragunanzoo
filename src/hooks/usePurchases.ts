import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Book } from './useBooks';

export interface UserPurchase {
  id: string;
  user_id: string;
  book_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  payment_url: string | null;
  created_at: string;
  updated_at: string;
  book?: Book;
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    setLoading(true);
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_purchases')
      .select('*, book:books(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPurchases(data as UserPurchase[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const hasPurchasedBook = (bookId: string) => {
    return purchases.some(p => p.book_id === bookId && p.status === 'success');
  };

  const buyBookMock = async (book: Book) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Silakan login terlebih dahulu untuk membeli e-book');
      return false;
    }

    // Mock payment processing
    const toastId = toast.loading('Memproses pembayaran...');
    
    try {
      // Create a pending purchase first
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: session.user.id,
          book_id: book.id,
          amount: book.price || 0,
          status: 'pending', // Securely insert as pending
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Simulate a payment gateway processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate Payment Gateway Webhook calling our backend RPC
      // In production, this would be a real webhook endpoint in Express/Supabase Edge Functions
      const { data: isSuccess, error: webhookError } = await supabase
        .rpc('simulate_payment_webhook', {
          p_purchase_id: purchaseData.id,
          p_amount: book.price || 0
        });
        
      if (webhookError) throw webhookError;
      
      if (isSuccess) {
        toast.success('Pembayaran berhasil! E-book telah ditambahkan ke Koleksi Anda.', { id: toastId });
      } else {
        toast.error('Pembayaran ditolak karena data tidak valid atau dicurangi.', { id: toastId });
        return false;
      }
      
      // Refresh purchases
      await fetchPurchases();
      return isSuccess;
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error('Gagal memproses pembayaran: ' + error.message, { id: toastId });
      return false;
    }
  };

  const getSignedUrl = async (bookPath: string | null) => {
    if (!bookPath) return null;
    
    try {
      // Create a signed URL valid for 60 minutes
      const { data, error } = await supabase.storage
        .from('premium-book-files')
        .createSignedUrl(bookPath, 3600);
        
      if (error) {
        // If it's not in premium, try public bucket
        const { data: publicData } = supabase.storage
          .from('book-files')
          .getPublicUrl(bookPath);
        return publicData?.publicUrl;
      }
      
      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  return {
    purchases,
    loading,
    fetchPurchases,
    hasPurchasedBook,
    buyBookMock,
    getSignedUrl
  };
}
