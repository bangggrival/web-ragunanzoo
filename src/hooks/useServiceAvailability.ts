import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceAvailability {
  id: string;
  date: string;
  program_type: 'pkl' | 'research' | 'koas' | 'interview';
  max_slots: number;
  booked_slots: number;
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityByDate {
  [date: string]: {
    [programType: string]: ServiceAvailability;
  };
}

// Fetch availability for a date range
export function useServiceAvailability(programType?: string, startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['service-availability', programType, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('service_availability')
        .select('*')
        .order('date', { ascending: true });

      if (programType) {
        query = query.eq('program_type', programType);
      }

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ServiceAvailability[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch availability grouped by date for calendar display
export function useAvailabilityCalendar(programType: string, month: Date) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  return useQuery({
    queryKey: ['availability-calendar', programType, startDate.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .eq('program_type', programType)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      // Group by date for easy lookup
      const byDate: { [date: string]: ServiceAvailability } = {};
      (data as ServiceAvailability[]).forEach(item => {
        byDate[item.date] = item;
      });

      return byDate;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Fetch all availability for manager view
export function useAllServiceAvailability(month?: Date) {
  const startDate = month 
    ? new Date(month.getFullYear(), month.getMonth(), 1)
    : new Date();
  const endDate = month
    ? new Date(month.getFullYear(), month.getMonth() + 1, 0)
    : new Date(new Date().setMonth(new Date().getMonth() + 3));

  return useQuery({
    queryKey: ['all-service-availability', startDate.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data as ServiceAvailability[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Update availability
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<ServiceAvailability> & { id: string }) => {
      const { id, ...data } = updates;
      const { error } = await supabase
        .from('service_availability')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-availability'] });
      queryClient.invalidateQueries({ queryKey: ['availability-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['all-service-availability'] });
    },
  });
}

// Bulk update availability for date range
export function useBulkUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      programType, 
      startDate, 
      endDate, 
      updates 
    }: { 
      programType: string;
      startDate: Date;
      endDate: Date;
      updates: Partial<Pick<ServiceAvailability, 'max_slots' | 'is_available' | 'notes'>>;
    }) => {
      const { error } = await supabase
        .from('service_availability')
        .update(updates)
        .eq('program_type', programType)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-availability'] });
      queryClient.invalidateQueries({ queryKey: ['availability-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['all-service-availability'] });
    },
  });
}

// Create availability for dates that don't exist yet
export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ServiceAvailability, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('service_availability')
        .upsert(data, { onConflict: 'date,program_type' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-availability'] });
      queryClient.invalidateQueries({ queryKey: ['availability-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['all-service-availability'] });
    },
  });
}
