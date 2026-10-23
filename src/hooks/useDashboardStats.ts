import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalAnimals: number;
  healthyAnimals: number;
  totalPlants: number;
  totalEvents: number;
  totalNews: number;
  totalTickets: number;
  totalVenues: number;
  totalTourGuides: number;
  totalBooks: number;
  totalJdih: number;
  totalPageViews: number;
  totalRegistrations: number;
  totalWbs: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    healthyAnimals: 0,
    totalPlants: 0,
    totalEvents: 0,
    totalNews: 0,
    totalTickets: 0,
    totalVenues: 0,
    totalTourGuides: 0,
    totalBooks: 0,
    totalJdih: 0,
    totalPageViews: 0,
    totalRegistrations: 0,
    totalWbs: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    try {
      const [
        animalsRes,
        plantsRes,
        eventsRes,
        newsRes,
        ticketsRes,
        venuesRes,
        guidesRes,
        booksRes,
        jdihRes,
        viewsRes,
        regRes,
        wbsRes,
      ] = await Promise.allSettled([
        supabase.from('animals').select('health_status'),
        supabase.from('plants').select('id'),
        supabase.from('events').select('id'),
        supabase.from('news').select('id'),
        supabase.from('tickets').select('id'),
        supabase.from('venues').select('id'),
        supabase.from('tour_guides').select('id'),
        supabase.from('books').select('id'),
        supabase.from('jdih_documents').select('id'),
        supabase.from('page_views').select('id'),
        supabase.from('service_registrations').select('id'),
        supabase.from('wbs_submissions').select('id'),
      ]);

      const animals = animalsRes.status === 'fulfilled' ? (animalsRes.value.data || []) : [];
      const healthyAnimals = animals.filter((a: any) => a.health_status === 'Sehat' || !a.health_status).length;
      
      const plants = plantsRes.status === 'fulfilled' ? (plantsRes.value.data || []) : [];
      const events = eventsRes.status === 'fulfilled' ? (eventsRes.value.data || []) : [];
      const news = newsRes.status === 'fulfilled' ? (newsRes.value.data || []) : [];
      const tickets = ticketsRes.status === 'fulfilled' ? (ticketsRes.value.data || []) : [];
      const venues = venuesRes.status === 'fulfilled' ? (venuesRes.value.data || []) : [];
      const guides = guidesRes.status === 'fulfilled' ? (guidesRes.value.data || []) : [];
      const books = booksRes.status === 'fulfilled' ? (booksRes.value.data || []) : [];
      const jdih = jdihRes.status === 'fulfilled' ? (jdihRes.value.data || []) : [];
      const views = viewsRes.status === 'fulfilled' ? (viewsRes.value.data || []) : [];
      const reg = regRes.status === 'fulfilled' ? (regRes.value.data || []) : [];
      const wbs = wbsRes.status === 'fulfilled' ? (wbsRes.value.data || []) : [];

      setStats({
        totalAnimals: animals.length,
        healthyAnimals,
        totalPlants: plants.length,
        totalEvents: events.length,
        totalNews: news.length,
        totalTickets: tickets.length,
        totalVenues: venues.length,
        totalTourGuides: guides.length,
        totalBooks: books.length,
        totalJdih: jdih.length,
        totalPageViews: views.length,
        totalRegistrations: reg.length,
        totalWbs: wbs.length,
      });
    } catch (error) {
      console.error('Error fetching comprehensive dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
