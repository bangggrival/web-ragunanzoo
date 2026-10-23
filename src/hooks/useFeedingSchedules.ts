import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type FeedingSchedule = Database['public']['Tables']['feeding_schedules']['Row'];
export type InsertFeedingSchedule = Database['public']['Tables']['feeding_schedules']['Insert'];
export type UpdateFeedingSchedule = Database['public']['Tables']['feeding_schedules']['Update'];

export function useFeedingSchedules() {
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (publishedOnly = false) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('feeding_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSchedules(data || []);
      return data;
    } catch (err: any) {
      console.error('Error fetching feeding schedules:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();

    const handleRealtime = (e: any) => {
      if (!e.detail?.table || e.detail.table === 'feeding_schedules') {
        fetchSchedules();
      }
    };

    window.addEventListener('supabase-db-change', handleRealtime);
    return () => window.removeEventListener('supabase-db-change', handleRealtime);
  }, [fetchSchedules]);

  const getSchedule = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching schedule:', err);
      return null;
    }
  }, []);

  const createSchedule = useCallback(async (scheduleData: InsertFeedingSchedule) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .insert([scheduleData])
        .select()
        .single();

      if (error) throw error;
      
      setSchedules(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      console.error('Error creating schedule:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: UpdateFeedingSchedule) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('feeding_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSchedules(prev => prev.map(s => s.id === id ? data : s));
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating schedule:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('feeding_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSchedules(prev => prev.filter(s => s.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting schedule:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePublishStatus = useCallback(async (id: string, currentStatus: boolean) => {
    return updateSchedule(id, { is_published: !currentStatus });
  }, [updateSchedule]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    togglePublishStatus
  };
}
