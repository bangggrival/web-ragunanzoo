"use client";

import { AppIcon } from '@/components/ui/AppIcon';
import { useConfirm } from '@/hooks/useConfirm';
import { Event } from '@/hooks/useEvents';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import EventFormModal from '@/components/modals/EventFormModal';
import { TablePagination, usePagination } from '@/components/ui/TablePagination';
import { Switch } from '@/components/ui/switch';
import { deleteEventAction } from './actions';
import { supabase } from '@/integrations/supabase/client';
import { exportToExcel, exportToPdf } from '@/utils/exportManagerReports';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ManageEventsClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false });
      if (data) setEvents(data as any);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'events') {
        fetchData();
      }
    };
    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        event.title.toLowerCase().includes(q) || 
        (event.title_en && event.title_en.toLowerCase().includes(q)) ||
        (event.location && event.location.toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [events, typeFilter, searchQuery]);

  // Conflict Detection for Events
  const conflicts = useMemo(() => {
    const slotMap: Record<string, Event[]> = {};

    events.forEach(e => {
      if (e.event_date && e.time && e.is_published !== false) {
        const slotKey = `${e.event_date}_${e.time.trim()}`;
        if (!slotMap[slotKey]) slotMap[slotKey] = [];
        slotMap[slotKey].push(e);
      }
    });

    return Object.entries(slotMap).filter(([_, items]) => items.length > 1);
  }, [events]);

  const handleDelete = async (id: number) => {
    if ((await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus event ini?'))) {
      try {
        const result = await deleteEventAction(id);
        if (!result.success) {
          toast.error('Gagal menghapus: ' + result.error);
        } else {
          toast.success('Event berhasil dihapus');
          setEvents(prev => prev.filter(e => e.id !== id));
        }
      } catch (error) {
        toast.error('Terjadi kesalahan sistem');
      }
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    fetchData();
    toast.success('Data event berhasil disimpan');
  };

  const handleTogglePublish = async (id: number, is_published: boolean) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, is_published } : e));
    try {
      const { error } = await supabase.from('events').update({ is_published }).eq('id', id);
      if (error) throw error;
      toast.success('Status tampil diperbarui');
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, is_published: !is_published } : e));
    }
  };

  const getEventTypeColor = (type: string | null) => {
    switch (type) {
      case 'feeding':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'education':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'show':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getEventTypeLabel = (type: string | null) => {
    switch (type) {
      case 'feeding': return 'Feeding Time';
      case 'education': return 'Edukasi';
      case 'show': return 'Pertunjukan';
      default: return type || 'Event';
    }
  };

  const getEventTimeStatus = (dateStr: string | null) => {
    if (!dateStr) return { label: 'TBA', color: 'bg-slate-100 text-slate-600' };
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return { label: 'Hari Ini', color: 'bg-emerald-500 text-white font-bold' };
    } else if (eventDate.getTime() > today.getTime()) {
      return { label: 'Akan Datang', color: 'bg-blue-100 text-blue-700 font-semibold' };
    } else {
      return { label: 'Selesai', color: 'bg-slate-100 text-slate-500' };
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Export Events
  const handleExport = (format: 'excel' | 'pdf') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'excel') {
        const data = filteredEvents.map(e => ({
          title: e.title,
          type: getEventTypeLabel(e.type),
          event_date: e.event_date || '-',
          time: e.time ? `${e.time} WIB` : '-',
          location: e.location || '-',
          is_published: e.is_published ? 'Aktif' : 'Nonaktif'
        }));

        exportToExcel({
          fileName: `Laporan_Agenda_Acara_Ragunan_${timestamp}`,
          sheetName: 'Agenda Acara',
          data,
          headerMapping: {
            title: 'Nama Acara / Event',
            type: 'Kategori',
            event_date: 'Tanggal Acara',
            time: 'Waktu Pelaksanaan',
            location: 'Lokasi / Panggung',
            is_published: 'Status Publikasi'
          }
        });
        toast.success('Laporan Agenda Acara (Excel) berhasil diunduh!');
      } else {
        const headers = ['No', 'Nama Acara', 'Kategori', 'Tanggal', 'Jam', 'Lokasi', 'Status'];
        const rows = filteredEvents.map((e, i) => [
          i + 1,
          e.title,
          getEventTypeLabel(e.type),
          e.event_date || '-',
          e.time ? `${e.time} WIB` : '-',
          e.location || '-',
          e.is_published ? 'Aktif' : 'Nonaktif'
        ]);

        exportToPdf({
          title: 'LAPORAN JADWAL & AGENDA ACARA RAGUNAN ZOO',
          fileName: `Laporan_Agenda_Acara_Ragunan_${timestamp}`,
          headers,
          rows,
          orientation: 'landscape'
        });
        toast.success('Laporan Agenda Acara (PDF) berhasil diunduh!');
      }
    } catch (err: any) {
      toast.error('Gagal mengekspor: ' + err.message);
    }
  };

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredEvents, 9);

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
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Jadwal & Acara Ragunan
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Kelola agenda pertunjukan, edukasi, dan event musiman kebun binatang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold shadow-2xs btn-interactive text-xs sm:text-sm"
                >
                  <AppIcon icon="Download" className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Agenda</span>
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

            {/* Tambah Event Button */}
            <button 
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all font-semibold shadow-md shadow-emerald-500/20 btn-interactive text-xs sm:text-sm"
            >
              <AppIcon icon="Plus" className="w-4 h-4" />
              Tambah Acara
            </button>
          </div>
        </div>

        {/* Conflict Alert Banner */}
        {conflicts.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 animate-slide-in-up">
            <AppIcon icon="AlertTriangle" className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
                Peringatan Bentrok Jadwal Acara ({conflicts.length} Slot Waktu)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-1 leading-relaxed">
                Terdapat 2 atau lebih acara yang dijadwalkan pada tanggal dan jam mulai yang sama:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {conflicts.map(([slotKey, items]) => {
                  const [date, time] = slotKey.split('_');
                  return (
                    <span
                      key={slotKey}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold"
                    >
                      <AppIcon icon="Clock" className="w-3 h-3 text-amber-600" />
                      <span>{date} @ {time} WIB:</span>
                      <span className="font-normal">{items.map(i => i.title).join(' & ')}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari nama acara, lokasi, atau panggung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="manager-input pl-4"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'show', 'education', 'feeding'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                  typeFilter === type
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {type === 'all' ? 'Semua Acara' : getEventTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((event) => {
            const timeStatus = getEventTimeStatus(event.event_date);
            const isConflicting = conflicts.some(([slotKey]) => slotKey === `${event.event_date}_${event.time?.trim()}`);

            return (
              <div 
                key={event.id}
                className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${timeStatus.color}`}>
                      {timeStatus.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2">
                      {event.title}
                    </h3>
                    {event.title_en && (
                      <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-1">{event.title_en}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <AppIcon icon="Calendar" className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <AppIcon icon="Clock" className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-mono font-medium">
                        {event.time || 'TBA'} WIB
                      </span>
                      {isConflicting && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                          <AppIcon icon="AlertTriangle" className="w-2.5 h-2.5 shrink-0" />
                          Bentrok
                        </span>
                      )}
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <AppIcon icon="MapPin" className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium">Tampil:</span>
                    <Switch
                      checked={event.is_published !== false}
                      onCheckedChange={(checked) => handleTogglePublish(event.id, checked)}
                      className="data-[state=checked]:bg-emerald-500 scale-90"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit Acara"
                    >
                      <AppIcon icon="Edit2" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus Acara"
                    >
                      <AppIcon icon="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalItems > 0 && (
          <div className="pt-4">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>

      <EventFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        event={selectedEvent}
        onSuccess={handleModalSuccess}
      />

      {ConfirmComponent}
    </>
  );
}
