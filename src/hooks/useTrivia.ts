import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type TriviaQuestion = Database['public']['Tables']['trivia_questions']['Row'];
export type InsertTrivia = Database['public']['Tables']['trivia_questions']['Insert'];
export type UpdateTrivia = Database['public']['Tables']['trivia_questions']['Update'];

export function useTrivia() {
  const [trivia, setTrivia] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrivia = useCallback(async (type?: 'animal' | 'plant') => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('trivia_questions').select('*').order('created_at', { ascending: false });
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setTrivia(data || []);
      return data;
    } catch (err: any) {
      console.error('Error fetching trivia:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrivia = useCallback(async (triviaData: InsertTrivia) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trivia_questions')
        .insert([triviaData])
        .select()
        .single();

      if (error) throw error;
      setTrivia(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTrivia = useCallback(async (id: string, updates: UpdateTrivia) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trivia_questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTrivia(prev => prev.map(t => t.id === id ? data : t));
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTrivia = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('trivia_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTrivia(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trivia,
    loading,
    error,
    fetchTrivia,
    createTrivia,
    updateTrivia,
    deleteTrivia
  };
}
