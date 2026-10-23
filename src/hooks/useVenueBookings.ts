import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VenueBooking {
  id: string;
  venue_id: number;
  renter_name: string;
  event_name: string;
  institution_name: string | null;
  contact_number: string;
  start_date: string;
  end_date: string;
  total_payment: number | null;
  special_notes: string | null;
  transfer_receipt_url: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export function useVenueBookings(venueId?: number) {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['venue-bookings', venueId],
    queryFn: async () => {
      let query = supabase.from('venue_bookings').select('*').order('created_at', { ascending: false });
      if (venueId) {
        query = query.eq('venue_id', venueId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as VenueBooking[];
    },
    enabled: true,
  });

  const addBooking = useMutation({
    mutationFn: async (newBooking: Omit<VenueBooking, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('venue_bookings')
        .insert(newBooking)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venue-bookings', variables.venue_id] });
      queryClient.invalidateQueries({ queryKey: ['venue-bookings', undefined] });
    }
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status, venue_id }: { id: string, status: string, venue_id: number }) => {
      const { data, error } = await supabase
        .from('venue_bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venue-bookings', variables.venue_id] });
      queryClient.invalidateQueries({ queryKey: ['venue-bookings', undefined] });
    }
  });

  const updateBooking = useMutation({
    mutationFn: async (updates: Partial<Omit<VenueBooking, 'id' | 'created_at'>> & { id: string, venue_id: number }) => {
      const { id, venue_id, ...updateData } = updates;
      const { data, error } = await supabase
        .from('venue_bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venue-bookings', variables.venue_id] });
      queryClient.invalidateQueries({ queryKey: ['venue-bookings', undefined] });
    }
  });

  const deleteBooking = useMutation({
    mutationFn: async ({ id, venue_id }: { id: string, venue_id: number }) => {
      const { error } = await supabase
        .from('venue_bookings')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venue-bookings', variables.venue_id] });
      queryClient.invalidateQueries({ queryKey: ['venue-bookings', undefined] });
    }
  });

  return { bookings, isLoading, addBooking, updateBookingStatus, updateBooking, deleteBooking };
}
