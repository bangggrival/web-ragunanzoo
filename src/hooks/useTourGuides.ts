import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Types
export interface TourGuide {
  id: string;
  name: string;
  photo_url: string | null;
  specialization: string[] | null;
  languages: string[] | null;
  bio_id: string | null;
  bio_en: string | null;
  hourly_rate: number;
  rating: number | null;
  total_reviews: number | null;
  is_active: boolean | null;
  phone: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TourPackage {
  id: string;
  name_id: string;
  name_en: string | null;
  description_id: string | null;
  description_en: string | null;
  duration_hours: number;
  min_participants: number | null;
  max_participants: number | null;
  icon: string | null;
  color_class: string | null;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TourGuideSchedule {
  id: string;
  guide_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean | null;
  created_at: string | null;
}

export interface TourBooking {
  id: string;
  booking_code: string;
  guide_id: string | null;
  package_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_date: string;
  start_time: string;
  duration_hours: number;
  participants: number | null;
  total_price: number;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  guide?: TourGuide;
  package?: TourPackage;
}

export interface TourGalleryItem {
  id: string;
  image_url: string;
  caption_id: string | null;
  caption_en: string | null;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
}

// Generate booking code
const generateBookingCode = (): string => {
  const date = format(new Date(), 'yyMMdd');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TUR-${date}-${random}`;
};

export const MOCK_GUIDES: TourGuide[] = [
  {
    id: 'd1111111-1111-4111-8111-111111111111',
    name: 'Budi Santoso, S.Si',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    specialization: ['satwa', 'primata', 'mamalia'],
    languages: ['id', 'en'],
    bio_id: 'Pemandu senior berlatar belakang Biologi dengan pengalaman 8+ tahun di Taman Margasatwa Ragunan.',
    bio_en: 'Senior tour guide with a Biology background and 8+ years of experience at Ragunan Zoo.',
    hourly_rate: 100000,
    rating: 4.9,
    total_reviews: 42,
    is_active: true,
    phone: '081234567890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd2222222-2222-4222-8222-222222222222',
    name: 'Dewi Lestari, S.Hut',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    specialization: ['flora', 'burung'],
    languages: ['id', 'en', 'ja'],
    bio_id: 'Spesialis flora tropis dan jenis unggas eksotis. Siap memandu dengan gaya edukatif dan interaktif.',
    bio_en: 'Specialist in tropical flora and exotic birds. Ready to guide with an educational and interactive style.',
    hourly_rate: 120000,
    rating: 5.0,
    total_reviews: 58,
    is_active: true,
    phone: '081298765432',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd3333333-3333-4333-8333-333333333333',
    name: 'Rahmat Hidayat',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    specialization: ['reptil', 'satwa'],
    languages: ['id', 'en', 'zh'],
    bio_id: 'Ahli edukasi reptil dan mamalia besar. Sangat disukai rombongan sekolah dan wisata keluarga.',
    bio_en: 'Expert in reptiles and large mammals. Highly favored by school groups and family tours.',
    hourly_rate: 95000,
    rating: 4.8,
    total_reviews: 31,
    is_active: true,
    phone: '081311223344',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const MOCK_PACKAGES: TourPackage[] = [
  {
    id: 'e1111111-1111-4111-8111-111111111111',
    name_id: 'Paket Edukasi Satwa Ragunan',
    name_en: 'Ragunan Educational Wildlife Tour',
    description_id: 'Jelajah area pusat primata, mamalia besar, dan sangkar burung raksasa bersama pemandu terlatih.',
    description_en: 'Explore primate centers, large mammals, and giant bird aviaries with professional guides.',
    duration_hours: 2,
    min_participants: 1,
    max_participants: 15,
    icon: 'Users',
    color_class: 'primary',
    is_active: true,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e2222222-2222-4222-8222-222222222222',
    name_id: 'Paket Jelajah Flora & Fauna Eksklusif',
    name_en: 'Exclusive Flora & Fauna Journey',
    description_id: 'Pengalaman privat mengelilingi koleksi tanaman langka dan satwa dilindungi dengan rute khusus.',
    description_en: 'Private experience exploring rare plant collections and protected wildlife with specialized routes.',
    duration_hours: 3,
    min_participants: 1,
    max_participants: 20,
    icon: 'GraduationCap',
    color_class: 'blue-500',
    is_active: true,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e3333333-3333-4333-8333-333333333333',
    name_id: 'Paket Safari & Fotografi Dokumentasi',
    name_en: 'Safari & Photography Documentation Tour',
    description_id: 'Pendampingan khusus untuk pemotretan, liputan media, dan rombongan studi lapangan.',
    description_en: 'Specialized assistance for photography, media coverage, and field study delegations.',
    duration_hours: 4,
    min_participants: 1,
    max_participants: 25,
    icon: 'Camera',
    color_class: 'orange-500',
    is_active: true,
    order_index: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const MOCK_GALLERY: TourGalleryItem[] = [
  {
    id: 'f1111111-1111-4111-8111-111111111111',
    image_url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&auto=format&fit=crop&q=80',
    caption_id: 'Wisata Edukasi Bersama Pemandu Ragunan',
    caption_en: 'Educational Tour with Ragunan Guides',
    is_active: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-2',
    image_url: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e0c?w=600&auto=format&fit=crop&q=80',
    caption_id: 'Pengenalan Satwa Eksotis',
    caption_en: 'Exotic Animals Introduction',
    is_active: true,
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-3',
    image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
    caption_id: 'Kunjungan Rombongan Sekolah',
    caption_en: 'School Delegation Visit',
    is_active: true,
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'gal-4',
    image_url: 'https://images.unsplash.com/photo-1503656142023-618e7d1f435a?w=600&auto=format&fit=crop&q=80',
    caption_id: 'Penjelajahan Taman Rindang',
    caption_en: 'Lush Park Exploration',
    is_active: true,
    order_index: 4,
    created_at: new Date().toISOString(),
  }
];

// ============ Tour Guides Hooks ============
export function useTourGuides(activeOnly = true) {
  return useQuery({
    queryKey: ['tour-guides', activeOnly],
    queryFn: async () => {
      try {
        let query = supabase
          .from('tour_guides')
          .select('*')
          .order('name');
        
        if (activeOnly) {
          query = query.eq('is_active', true);
        }
        
        const { data, error } = await query;
        if (error || !data) {
          return [];
        }
        return data as TourGuide[];
      } catch (err) {
        return [];
      }
    },
  });
}

export function useTourGuide(id: string | null) {
  return useQuery({
    queryKey: ['tour-guide', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('tour_guides')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as TourGuide;
    },
    enabled: !!id,
  });
}

export function useManageTourGuides() {
  const queryClient = useQueryClient();

  const createGuide = useMutation({
    mutationFn: async (guide: Omit<TourGuide, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews'>) => {
      const { data, error } = await supabase
        .from('tour_guides')
        .insert(guide)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-guides'] });
      toast.success('Pemandu berhasil ditambahkan');
    },
    onError: () => toast.error('Gagal menambahkan pemandu'),
  });

  const updateGuide = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TourGuide> & { id: string }) => {
      const { data, error } = await supabase
        .from('tour_guides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-guides'] });
      toast.success('Pemandu berhasil diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui pemandu'),
  });

  const deleteGuide = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tour_guides')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-guides'] });
      toast.success('Pemandu berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus pemandu'),
  });

  return { createGuide, updateGuide, deleteGuide };
}

// ============ Tour Packages Hooks ============
export function useTourPackages(activeOnly = true) {
  return useQuery({
    queryKey: ['tour-packages', activeOnly],
    queryFn: async () => {
      try {
        let query = supabase
          .from('tour_packages')
          .select('*')
          .order('order_index');
        
        if (activeOnly) {
          query = query.eq('is_active', true);
        }
        
        const { data, error } = await query;
        if (error || !data) {
          return [];
        }
        return data as TourPackage[];
      } catch (err) {
        return [];
      }
    },
  });
}

export function useManageTourPackages() {
  const queryClient = useQueryClient();

  const createPackage = useMutation({
    mutationFn: async (pkg: Omit<TourPackage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tour_packages')
        .insert(pkg)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-packages'] });
      toast.success('Paket tur berhasil ditambahkan');
    },
    onError: () => toast.error('Gagal menambahkan paket tur'),
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TourPackage> & { id: string }) => {
      const { data, error } = await supabase
        .from('tour_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-packages'] });
      toast.success('Paket tur berhasil diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui paket tur'),
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tour_packages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-packages'] });
      toast.success('Paket tur berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus paket tur'),
  });

  return { createPackage, updatePackage, deletePackage };
}

// ============ Tour Schedule Hooks ============
export function useTourGuideSchedules(guideId: string | null, startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['tour-schedules', guideId, startDate, endDate],
    queryFn: async () => {
      if (!guideId) return [];
      
      let query = supabase
        .from('tour_guide_schedules')
        .select('*')
        .eq('guide_id', guideId)
        .eq('is_available', true)
        .order('date')
        .order('start_time');
      
      if (startDate) {
        query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        query = query.lte('date', format(endDate, 'yyyy-MM-dd'));
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TourGuideSchedule[];
    },
    enabled: !!guideId,
  });
}

export function useManageSchedules() {
  const queryClient = useQueryClient();

  const createSchedule = useMutation({
    mutationFn: async (schedule: Omit<TourGuideSchedule, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tour_guide_schedules')
        .insert(schedule)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-schedules'] });
      toast.success('Jadwal berhasil ditambahkan');
    },
    onError: () => toast.error('Gagal menambahkan jadwal'),
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tour_guide_schedules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-schedules'] });
      toast.success('Jadwal berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus jadwal'),
  });

  return { createSchedule, deleteSchedule };
}

// ============ Tour Bookings Hooks ============
export function useTourBookings() {
  return useQuery({
    queryKey: ['tour-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_bookings')
        .select(`
          *,
          guide:tour_guides(*),
          package:tour_packages(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TourBooking[];
    },
  });
}

export function useCheckBookingStatus(bookingCode: string | null) {
  return useQuery({
    queryKey: ['tour-booking-status', bookingCode],
    queryFn: async () => {
      if (!bookingCode) return null;
      const { data, error } = await supabase
        .from('tour_bookings')
        .select(`
          *,
          guide:tour_guides(name, photo_url, phone),
          package:tour_packages(name_id, name_en)
        `)
        .eq('booking_code', bookingCode.toUpperCase().trim())
        .maybeSingle();
      if (error) throw error;
      return data as TourBooking | null;
    },
    enabled: !!bookingCode,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Omit<TourBooking, 'id' | 'booking_code' | 'created_at' | 'updated_at' | 'status' | 'admin_notes' | 'guide' | 'package'>) => {
      const bookingCode = generateBookingCode();
      const { data, error } = await supabase
        .from('tour_bookings')
        .insert({ ...booking, booking_code: bookingCode })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-bookings'] });
    },
    onError: () => toast.error('Gagal membuat booking'),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: TourBooking['status']; admin_notes?: string }) => {
      const { data, error } = await supabase
        .from('tour_bookings')
        .update({ status, admin_notes })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-bookings'] });
      toast.success('Status booking berhasil diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui status'),
  });
}

// ============ Tour Gallery Hooks ============
export function useTourGallery(activeOnly = true) {
  return useQuery({
    queryKey: ['tour-gallery', activeOnly],
    queryFn: async () => {
      try {
        let query = supabase
          .from('tour_gallery')
          .select('*')
          .order('order_index');
        
        if (activeOnly) {
          query = query.eq('is_active', true);
        }
        
        const { data, error } = await query;
        if (error || !data) {
          return [];
        }
        return data as TourGalleryItem[];
      } catch (err) {
        return [];
      }
    },
  });
}

export function useManageTourGallery() {
  const queryClient = useQueryClient();

  const addImage = useMutation({
    mutationFn: async (item: Omit<TourGalleryItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tour_gallery')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-gallery'] });
      toast.success('Gambar berhasil ditambahkan');
    },
    onError: () => toast.error('Gagal menambahkan gambar'),
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tour_gallery')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-gallery'] });
      toast.success('Gambar berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus gambar'),
  });

  return { addImage, deleteImage };
}

// Upload tour guide photo
export async function uploadTourGuidePhoto(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('tour-guide-images')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('tour-guide-images')
    .getPublicUrl(data.path);
  
  return publicUrl;
}
