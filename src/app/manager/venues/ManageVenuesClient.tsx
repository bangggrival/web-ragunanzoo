"use client";

import { useState, useEffect } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Venue, deleteVenueAction, upsertVenueAction } from './actions';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VenueScheduleModal } from './VenueScheduleModal';
import { VenueHeroSettingsModal } from './VenueHeroSettingsModal';
import { useVenueBookings, VenueBooking } from '@/hooks/useVenueBookings';
import VenueBookingCalendar from '@/components/venues/VenueBookingCalendar';
import { useDebounce } from '@/hooks/useDebounce';
import { exportToExcel, exportToPdf } from '@/utils/exportManagerReports';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const placeholderImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop';

export default function ManageVenuesClient() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showModal, setShowModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [deleteVenue, setDeleteVenue] = useState<Venue | null>(null);
  const [scheduleVenue, setScheduleVenue] = useState<Venue | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedCalendarVenueId, setSelectedCalendarVenueId] = useState<number | null>(null);

  // Fetch all bookings for master calendar
  const { bookings: allBookings, deleteBooking } = useVenueBookings(undefined);

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('venues').select('*').order('name', { ascending: true });
      if (data) setVenues(data as any);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'venues') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    venue.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteVenue) return;
    try {
      const result = await deleteVenueAction(deleteVenue.id);
      if (!result.success) throw new Error(result.error);
      toast.success('Tempat berhasil dihapus');
      setVenues(prev => prev.filter(v => v.id !== deleteVenue.id));
    } catch (err: any) {
      toast.error('Gagal menghapus tempat: ' + err.message);
    } finally {
      setDeleteVenue(null);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Export Venues & Bookings
  const handleExport = (format: 'excel' | 'pdf') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'excel') {
        const data = venues.map(v => ({
          name: v.name,
          capacity: v.capacity ? `${v.capacity} Orang` : '-',
          price: v.price_per_day ? `Rp ${v.price_per_day.toLocaleString('id-ID')}/hari` : v.price_per_hour ? `Rp ${v.price_per_hour.toLocaleString('id-ID')}/jam` : 'Sesuai Pengajuan',
          status: v.is_available !== false ? 'Tersedia' : 'Ditutup / Nonaktif'
        }));

        exportToExcel({
          fileName: `Daftar_Sewa_Tempat_Ragunan_${timestamp}`,
          sheetName: 'Sewa Tempat',
          data,
          headerMapping: {
            name: 'Nama Lokasi / Venue',
            capacity: 'Kapasitas Peserta',
            price: 'Tarif Retribusi',
            status: 'Status Operasional'
          }
        });
        toast.success('Laporan Sewa Tempat (Excel) berhasil diunduh!');
      } else {
        const headers = ['No', 'Nama Lokasi / Venue', 'Kapasitas', 'Tarif Retribusi', 'Status'];
        const rows = venues.map((v, i) => [
          i + 1,
          v.name,
          v.capacity ? `${v.capacity} Orang` : '-',
          v.price_per_day ? `Rp ${v.price_per_day.toLocaleString('id-ID')}/hari` : v.price_per_hour ? `Rp ${v.price_per_hour.toLocaleString('id-ID')}/jam` : 'Sesuai Pengajuan',
          v.is_available !== false ? 'Tersedia' : 'Ditutup'
        ]);

        exportToPdf({
          title: 'DAFTAR RETRIBUSI & SEWA TEMPAT / VENUE TAMAN MARGASATWA RAGUNAN',
          fileName: `Daftar_Sewa_Tempat_Ragunan_${timestamp}`,
          headers,
          rows,
          orientation: 'portrait'
        });
        toast.success('Laporan Sewa Tempat (PDF) berhasil diunduh!');
      }
    } catch (err: any) {
      toast.error('Gagal mengekspor: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm p-8">
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
              <AppIcon icon="MapPin" className="w-5 h-5 text-emerald-600" />
            </div>
            Kelola Sewa Tempat & Venue
          </h1>
          <p className="text-slate-500 font-medium mt-1">Kelola daftar lokasi, tarif sewa, dan kalender okupansi acara.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AppIcon icon="LayoutGrid" className="w-3.5 h-3.5" />
              <span>Daftar Venue</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AppIcon icon="CalendarDays" className="w-3.5 h-3.5" />
              <span>Kalender Master</span>
            </button>
          </div>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold shadow-2xs btn-interactive text-xs sm:text-sm"
              >
                <AppIcon icon="Download" className="w-4 h-4 text-emerald-600" />
                <span>Ekspor</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl">
              <DropdownMenuItem 
                onClick={() => handleExport('excel')}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer"
              >
                <AppIcon icon="FileSpreadsheet" className="w-4 h-4 text-emerald-600" />
                <span>Ekspor ke Excel (.xlsx)</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer"
              >
                <AppIcon icon="FileText" className="w-4 h-4 text-rose-600" />
                <span>Cetak Dokumen PDF (.pdf)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            onClick={() => setHeroModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-2xs"
          >
            <AppIcon icon="Sparkles" className="w-4 h-4 text-amber-500" />
            Pengaturan Header
          </button>

          <button 
            onClick={() => {
              setSelectedVenue(null);
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            <AppIcon icon="Plus" className="w-4 h-4" />
            Tambah Tempat
          </button>
        </div>
      </div>

      {/* VIEW MODE: MASTER INTERACTIVE CALENDAR */}
      {viewMode === 'calendar' ? (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm">Kalender Okupansi Sewa Seluruh Tempat</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                Pantau ketersediaan seluruh panggung, gedung, dan lapangan terbuka di Ragunan dalam 1 kalender terpadu.
              </p>
            </div>
          </div>

          <VenueBookingCalendar
            bookings={allBookings}
            venues={venues}
            selectedVenueId={selectedCalendarVenueId}
            onSelectVenue={setSelectedCalendarVenueId}
            onAddBookingOnDate={(dateStr) => {
              if (venues.length > 0) {
                setScheduleVenue(venues[0]);
                setScheduleModalOpen(true);
              } else {
                toast.error('Belum ada tempat yang terdaftar');
              }
            }}
            onEditBooking={(booking) => {
              const venue = venues.find(v => v.id === booking.venue_id);
              if (venue) {
                setScheduleVenue(venue);
                setScheduleModalOpen(true);
              }
            }}
            onDeleteBooking={async (booking) => {
              if (confirm('Hapus booking ini?')) {
                await deleteBooking.mutateAsync({ id: booking.id, venue_id: booking.venue_id });
                toast.success('Booking dihapus');
              }
            }}
          />
        </div>
      ) : (
        /* VIEW MODE: VENUES GRID */
        <>
          {/* Search bar */}
          <div className="relative">
            <AppIcon icon="Search" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari tempat berdasarkan nama atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="manager-input pl-11"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div 
                key={venue.id} 
                className="bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img 
                      src={venue.image_url || placeholderImage} 
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        venue.is_available !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {venue.is_available !== false ? 'Tersedia' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{venue.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{venue.description || 'Tidak ada deskripsi.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <AppIcon icon="Users" className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{venue.capacity ? `${venue.capacity} Orang` : '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <AppIcon icon="MapPin" className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">Ragunan Zoo</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tarif Retribusi</p>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {venue.price_per_day 
                          ? `${formatPrice(venue.price_per_day)} / hari` 
                          : venue.price_per_hour 
                          ? `${formatPrice(venue.price_per_hour)} / jam` 
                          : 'Sesuai Pengajuan'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setScheduleVenue(venue);
                      setScheduleModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <AppIcon icon="Calendar" className="w-3.5 h-3.5" />
                    <span>Kalender & Jadwal</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(venue)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit Tempat"
                    >
                      <AppIcon icon="Edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteVenue(venue)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus Tempat"
                    >
                      <AppIcon icon="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {scheduleModalOpen && scheduleVenue && (
        <VenueScheduleModal
          venue={scheduleVenue}
          isOpen={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setScheduleVenue(null);
          }}
        />
      )}

      {heroModalOpen && (
        <VenueHeroSettingsModal
          isOpen={heroModalOpen}
          onClose={() => setHeroModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Alert */}
      {deleteVenue && (
        <AlertDialog open={!!deleteVenue} onOpenChange={() => setDeleteVenue(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus Tempat</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus <strong>{deleteVenue.name}</strong>? Data booking terkait tempat ini juga akan terhapus.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
