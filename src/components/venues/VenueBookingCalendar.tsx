"use client";

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Building2, 
  DollarSign, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText,
  Filter,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { VenueBooking } from '@/hooks/useVenueBookings';
import { Venue } from '@/app/manager/venues/actions';

interface VenueBookingCalendarProps {
  bookings: VenueBooking[];
  venues: Venue[];
  selectedVenueId?: number | null;
  onSelectVenue?: (venueId: number | null) => void;
  onAddBookingOnDate?: (dateStr: string) => void;
  onEditBooking?: (booking: VenueBooking) => void;
  onDeleteBooking?: (booking: VenueBooking) => void;
}

export default function VenueBookingCalendar({
  bookings,
  venues,
  selectedVenueId,
  onSelectVenue,
  onAddBookingOnDate,
  onEditBooking,
  onDeleteBooking
}: VenueBookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Venue ID to Venue Map
  const venueMap = useMemo(() => {
    const map = new Map<number, Venue>();
    venues.forEach(v => map.set(v.id, v));
    return map;
  }, [venues]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchVenue = !selectedVenueId || b.venue_id === selectedVenueId;
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchVenue && matchStatus;
    });
  }, [bookings, selectedVenueId, statusFilter]);

  // Calendar dates generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Map bookings to dates (YYYY-MM-DD)
  const bookingsByDate = useMemo(() => {
    const map: Record<string, VenueBooking[]> = {};

    filteredBookings.forEach(booking => {
      try {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        
        // Populate all days in the booking range
        const daysInRange = eachDayOfInterval({ start, end });
        daysInRange.forEach(day => {
          const key = format(day, 'yyyy-MM-dd');
          if (!map[key]) map[key] = [];
          if (!map[key].some(b => b.id === booking.id)) {
            map[key].push(booking);
          }
        });
      } catch (err) {
        // Fallback for single date string
        const key = booking.start_date.split('T')[0];
        if (!map[key]) map[key] = [];
        map[key].push(booking);
      }
    });

    return map;
  }, [filteredBookings]);

  // Bookings for the currently clicked date
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateBookings = bookingsByDate[selectedDateKey] || [];

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Terkonfirmasi', color: 'bg-emerald-500 text-white', dot: 'bg-emerald-500' };
      case 'cancelled':
        return { label: 'Dibatalkan', color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
      default:
        return { label: 'Menunggu', color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
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

  const generateWhatsAppConfirmationUrl = (booking: VenueBooking) => {
    const venue = venueMap.get(booking.venue_id);
    let cleanPhone = booking.contact_number.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

    const message = `Halo Bapak/Ibu *${booking.renter_name}*,\n\n` +
      `Kami dari *Unit Pengelola Taman Margasatwa Ragunan* ingin mengonfirmasi jadwal sewa lokasi acara Anda:\n\n` +
      `🏛️ *Lokasi*: ${venue?.name || 'Area Ragunan Zoo'}\n` +
      `🎪 *Nama Acara*: ${booking.event_name}\n` +
      `📅 *Tanggal*: ${format(new Date(booking.start_date), 'dd MMMM yyyy', { locale: idLocale })} s/d ${format(new Date(booking.end_date), 'dd MMMM yyyy', { locale: idLocale })}\n` +
      `📋 *Status*: ${booking.status === 'confirmed' ? 'TERKONFIRMASI / LUNAS' : 'MENUNGGU KONFIRMASI'}\n` +
      `💰 *Total Biaya*: ${formatPrice(booking.total_payment)}\n\n` +
      `Silakan hubungi kami kembali jika ada pertanyaan atau kebutuhan koordinasi teknis panggung/listrik.\n\n` +
      `Terima kasih.\n_Pengelola Ragunan Zoo_`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Controls & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border rounded-3xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-colors text-slate-700 dark:text-slate-200"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 px-3 min-w-[170px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-colors text-slate-700 dark:text-slate-200"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl transition-colors text-slate-700 dark:text-slate-200 shadow-2xs"
          >
            Hari Ini
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onSelectVenue && (
            <div className="relative min-w-[180px]">
              <select
                value={selectedVenueId || ''}
                onChange={(e) => onSelectVenue(e.target.value ? Number(e.target.value) : null)}
                className="manager-select text-xs py-2 h-10 font-semibold"
              >
                <option value="">Semua Lokasi / Venue</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="manager-select text-xs py-2 h-10 font-semibold"
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">🟢 Terkonfirmasi</option>
              <option value="pending">🟡 Menunggu</option>
              <option value="cancelled">🔴 Dibatalkan</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pl-2">
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Terisi</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on Left + Selected Date Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-card border rounded-3xl p-4 sm:p-6 shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
              <div key={day} className={`text-xs font-bold py-2 ${idx >= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayBookings = bookingsByDate[dayKey] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
              const hasPending = dayBookings.some(b => b.status === 'pending');

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[75px] sm:min-h-[90px] p-2 rounded-2xl flex flex-col justify-between text-left transition-all border relative overflow-hidden group ${
                    isSelected 
                      ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                      : isCurrentMonth 
                      ? 'bg-card border-border hover:border-emerald-300 hover:bg-muted/40' 
                      : 'bg-muted/20 border-border/40 opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isTodayDate 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : isSelected 
                        ? 'font-black text-emerald-700 dark:text-emerald-300' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {format(day, 'd')}
                    </span>

                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  {/* Booking Pill Summaries */}
                  <div className="space-y-1 w-full mt-1">
                    {dayBookings.slice(0, 2).map((booking) => {
                      const venue = venueMap.get(booking.venue_id);
                      return (
                        <div
                          key={booking.id}
                          className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md truncate ${
                            booking.status === 'confirmed' 
                              ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30' 
                              : 'bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30'
                          }`}
                          title={`${venue?.name || 'Venue'}: ${booking.event_name} (${booking.renter_name})`}
                        >
                          {booking.event_name || venue?.name || 'Sewa'}
                        </div>
                      );
                    })}

                    {dayBookings.length > 2 && (
                      <p className="text-[9px] font-bold text-slate-400 pl-1">
                        +{dayBookings.length - 2} acara lagi
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jadwal Tanggal</p>
                <h3 className="font-extrabold text-base text-foreground mt-0.5">
                  {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: idLocale })}
                </h3>
              </div>

              {onAddBookingOnDate && (
                <button
                  onClick={() => onAddBookingOnDate(selectedDateKey)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-xs"
                  title="Tambah Booking pada Tanggal Ini"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List of Bookings on this Date */}
            {selectedDateBookings.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">Lokasi Tersedia</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                    Belum ada jadwal penyewaan tempat pada tanggal ini.
                  </p>
                </div>
                {onAddBookingOnDate && (
                  <button
                    onClick={() => onAddBookingOnDate(selectedDateKey)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Booking Tanggal Ini</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateBookings.map((booking) => {
                  const venue = venueMap.get(booking.venue_id);
                  const badge = getStatusBadge(booking.status);

                  return (
                    <div 
                      key={booking.id}
                      className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3 transition-all hover:bg-muted/70"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                          <h4 className="font-bold text-sm text-foreground mt-1.5 leading-snug">
                            {booking.event_name}
                          </h4>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{venue?.name || 'Lokasi Sewa'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-foreground">{booking.renter_name}</span>
                          {booking.institution_name && (
                            <span className="text-slate-400">({booking.institution_name})</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-bold text-foreground">{formatPrice(booking.total_payment)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>
                            {format(new Date(booking.start_date), 'dd MMM')} s/d {format(new Date(booking.end_date), 'dd MMM yyyy')}
                          </span>
                        </div>

                        {booking.special_notes && (
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 mt-2 italic">
                            "{booking.special_notes}"
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                        {booking.contact_number && (
                          <a
                            href={generateWhatsAppConfirmationUrl(booking)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Konfirmasi WA</span>
                          </a>
                        )}

                        <div className="flex items-center gap-1 ml-auto">
                          {onEditBooking && (
                            <button
                              onClick={() => onEditBooking(booking)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Booking"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteBooking && (
                            <button
                              onClick={() => onDeleteBooking(booking)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
