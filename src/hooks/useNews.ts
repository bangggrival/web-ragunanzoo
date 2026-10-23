import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface News {
  id: number;
  title: string;
  title_id: string | null;
  title_en: string | null;
  description: string | null;
  description_id: string | null;
  description_en: string | null;
  image_url: string | null;
  is_published: boolean;
  category?: string;
  read_time?: string;
  views_count?: number;
  created_at: string;
  updated_at: string;
}

export const MOCK_NEWS: News[] = [
  {
    id: 101,
    title: 'Seekor Bayi Harimau Sumatera Lahir Selamat di Ragunan',
    title_id: 'Seekor Bayi Harimau Sumatera Lahir Selamat di Ragunan',
    title_en: 'Healthy Sumatran Tiger Cub Born Safely at Ragunan Zoo',
    description: 'Koleksi satwa dilindungi di Ragunan kembali bertambah. Tim medis mengonfirmasi kelahiran seekor anak harimau Sumatera jantan yang sehat. Saat ini, induk dan bayi masih dalam masa observasi serta perawatan intensif oleh tim keeper.',
    description_id: 'Koleksi satwa dilindungi di Ragunan kembali bertambah. Tim medis mengonfirmasi kelahiran seekor anak harimau Sumatera jantan yang sehat. Saat ini, induk dan bayi masih dalam masa observasi serta perawatan intensif oleh tim keeper.',
    description_en: 'Ragunan Zoo welcomes a new addition to its protected wildlife. Veterinarians confirmed the birth of a healthy male Sumatran Tiger cub, currently undergoing care under dedicated keepers.',
    image_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&auto=format&fit=crop&q=80',
    is_published: true,
    category: 'Konservasi',
    read_time: '3 min',
    views_count: 1420,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 102,
    title: 'Tips Hindari Antrean Tiket Ragunan Jelang Akhir Pekan',
    title_id: 'Tips Hindari Antrean Tiket Ragunan Jelang Akhir Pekan',
    title_en: 'Tips to Avoid Ticket Queues at Ragunan This Weekend',
    description: 'Untuk kenyamanan pengunjung saat liburan, pengelola mengimbau masyarakat untuk memanfaatkan pemesanan tiket online dan datang lebih awal. Simak rincian jam operasional serta rute kantong parkir terbaru.',
    description_id: 'Untuk kenyamanan pengunjung saat liburan, pengelola mengimbau masyarakat untuk memanfaatkan pemesanan tiket online dan datang lebih awal. Simak rincian jam operasional serta rute kantong parkir terbaru.',
    description_en: 'To ensure a smooth holiday visit, management advises guests to book tickets online and arrive early. Check out updated opening hours and parking routes.',
    image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80',
    is_published: true,
    category: 'Pengumuman',
    read_time: '2 min',
    views_count: 980,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 103,
    title: 'Melihat Dari Dekat Kehidupan Primata di Pusat Schmutzer',
    title_id: 'Melihat Dari Dekat Kehidupan Primata di Pusat Schmutzer',
    title_en: 'A Closer Look at Primate Life at Schmutzer Center',
    description: 'Pusat Primata Schmutzer melengkapi area pamerannya dengan papan edukasi interaktif. Pengunjung kini bisa mempelajari perilaku, pakan, dan habitat alami gorila serta simpanse secara lebih jelas dan menarik.',
    description_id: 'Pusat Primata Schmutzer melengkapi area pamerannya dengan papan edukasi interaktif. Pengunjung kini bisa mempelajari perilaku, pakan, dan habitat alami gorila serta simpanse secara lebih jelas dan menarik.',
    description_en: 'Schmutzer Primate Center enhances its exhibit with interactive educational displays, allowing visitors to learn about gorilla and chimpanzee behaviors and natural habitats.',
    image_url: 'https://images.unsplash.com/photo-1503656142023-618e7d1f435a?w=800&auto=format&fit=crop&q=80',
    is_published: true,
    category: 'Edukasi',
    read_time: '4 min',
    views_count: 1150,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 104,
    title: 'Serunya Momen Feeding Time Gajah dan Komodo Setiap Akhir Pekan',
    title_id: 'Serunya Momen Feeding Time Gajah dan Komodo Setiap Akhir Pekan',
    title_en: 'Exciting Weekend Elephant & Komodo Dragon Feeding Sessions',
    description: 'Salah satu momen favorit pengunjung adalah menyaksikan tim keeper memberi makan satwa secara langsung. Agenda ini rutin hadir setiap hari Sabtu dan Minggu pagi mulai pukul 10.00 WIB.',
    description_id: 'Salah satu momen favorit pengunjung adalah menyaksikan tim keeper memberi makan satwa secara langsung. Agenda ini rutin hadir setiap hari Sabtu dan Minggu pagi mulai pukul 10.00 WIB.',
    description_en: 'A favorite visitor attraction is watching live feeding sessions by experienced keepers, held every Saturday and Sunday starting at 10:00 AM.',
    image_url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&auto=format&fit=crop&q=80',
    is_published: true,
    category: 'Kegiatan',
    read_time: '3 min',
    views_count: 890,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 105,
    title: 'Ragunan Tambah 500 Pohon Rindang untuk Kelestarian Burung Liar',
    title_id: 'Ragunan Tambah 500 Pohon Rindang untuk Kelestarian Burung Liar',
    title_en: 'Ragunan Plants 500 Shade Trees for Wild Bird Conservation',
    description: 'Guna menjaga kesejukan area hijau dan area hinggap burung liar, pengelola bekerjasama dengan relawan menanam ratusan bibit pohon tropis di kawasan hutan kota Ragunan.',
    description_id: 'Guna menjaga kesejukan area hijau dan area hinggap burung liar, pengelola bekerjasama dengan relawan menanam ratusan bibit pohon tropis di kawasan hutan kota Ragunan.',
    description_en: 'To preserve cool green canopies and nesting spots for wild birds, management and volunteers planted hundreds of tropical saplings across the urban forest.',
    image_url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
    is_published: true,
    category: 'Konservasi',
    read_time: '3 min',
    views_count: 670,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  }
];

export function useNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();

    // Listen for Realtime database changes via SSE
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'news') {
        fetchNews();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching news from DB:', error);
        setNews([]);
      } else {
        setNews((data as News[]) || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (id: number, currentViews: number = 0) => {
    try {
      const newViews = currentViews + 1;
      // Optimistic update
      setNews(prev => prev.map(n => n.id === id ? { ...n, views_count: newViews } : n));
      // Update database
      await supabase.from('news').update({ views_count: newViews }).eq('id', id);
    } catch (err) {
      console.error('Failed to increment views_count:', err);
    }
  };

  const getPublishedNews = (limit?: number) => {
    const published = news.filter(n => n.is_published);
    return limit ? published.slice(0, limit) : published;
  };

  return { news, loading, error, fetchNews, incrementViews, getPublishedNews };
}
