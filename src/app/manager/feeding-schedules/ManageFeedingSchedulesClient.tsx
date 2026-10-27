'use client';

import { useState, useEffect, useMemo } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { useFeedingSchedules, FeedingSchedule } from '@/hooks/useFeedingSchedules';
import { AppIcon } from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import FeedingScheduleFormModal from '@/components/modals/FeedingScheduleFormModal';
import { exportToExcel, exportToPdf } from '@/utils/exportManagerReports';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ManageFeedingSchedulesClient() {
  const { confirm, ConfirmComponent } = useConfirm();

  const { schedules, loading, fetchSchedules, createSchedule, updateSchedule, deleteSchedule, togglePublishStatus } = useFeedingSchedules();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<FeedingSchedule | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSchedules(false);
  }, [fetchSchedules]);

  // Conflict Detection Algorithm
  const conflicts = useMemo(() => {
    const timeMap: Record<string, { id: string; name_id: string }[]> = {};

    schedules.forEach(schedule => {
      if (schedule.is_published !== false && schedule.times) {
        schedule.times.forEach(time => {
          const cleanTime = time.trim();
          if (!timeMap[cleanTime]) timeMap[cleanTime] = [];
          timeMap[cleanTime].push({ id: schedule.id, name_id: schedule.name_id });
        });
      }
    });

    // Entries with > 1 schedule in same time slot
    return Object.entries(timeMap).filter(([_, items]) => items.length > 1);
  }, [schedules]);

  // Sorted timeline items for chronological timeline view
  const chronologicalItems = useMemo(() => {
    const items: { time: string; schedule: FeedingSchedule }[] = [];
    schedules.forEach(schedule => {
      if (schedule.times) {
        schedule.times.forEach(time => {
          items.push({ time: time.trim(), schedule });
        });
      }
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    if (!searchQuery) return schedules;
    const q = searchQuery.toLowerCase();
    return schedules.filter(s => 
      s.name_id.toLowerCase().includes(q) || 
      (s.name_en && s.name_en.toLowerCase().includes(q))
    );
  }, [schedules, searchQuery]);

  const handleAdd = () => {
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (schedule: FeedingSchedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if ((await confirm("Konfirmasi", 'Apakah Anda yakin ingin menghapus jadwal makan ini?'))) {
      const result = await deleteSchedule(id);
      if (result.success) {
        toast.success('Jadwal berhasil dihapus');
        fetchSchedules(false);
      } else {
        toast.error('Gagal menghapus jadwal');
      }
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const result = await togglePublishStatus(id, currentStatus);
    if (result.success) {
      toast.success(currentStatus ? 'Jadwal disembunyikan' : 'Jadwal dipublikasikan');
      fetchSchedules(false);
    } else {
      toast.error('Gagal mengubah status publikasi');
    }
  };

  const handleSave = async (data: any) => {
    if (selectedSchedule) {
      const result = await updateSchedule(selectedSchedule.id, data);
      if (result.success) {
        toast.success('Jadwal berhasil diperbarui');
        fetchSchedules(false);
      } else {
        toast.error('Gagal memperbarui jadwal');
      }
    } else {
      const result = await createSchedule(data);
      if (result.success) {
        toast.success('Jadwal berhasil ditambahkan');
        fetchSchedules(false);
      } else {
        toast.error('Gagal menambahkan jadwal');
      }
    }
  };

  // Export Feeding Schedules
  const handleExport = (format: 'excel' | 'pdf') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'excel') {
        const data = schedules.map(s => ({
          name_id: s.name_id,
          name_en: s.name_en || '-',
          times: s.times ? s.times.join(', ') : '-',
          is_published: s.is_published ? 'Aktif' : 'Nonaktif'
        }));

        exportToExcel({
          fileName: `Jadwal_Makan_Satwa_Ragunan_${timestamp}`,
          sheetName: 'Jadwal Makan',
          data,
          headerMapping: {
            name_id: 'Nama Satwa (ID)',
            name_en: 'Nama Satwa (EN)',
            times: 'Jam Makan (WIB)',
            is_published: 'Status Publikasi'
          }
        });
        toast.success('Laporan Jadwal Makan (Excel) berhasil diunduh!');
      } else {
        const headers = ['No', 'Nama Satwa', 'Nama Inggris', 'Jam Makan (WIB)', 'Status'];
        const rows = schedules.map((s, i) => [
          i + 1,
          s.name_id,
          s.name_en || '-',
          s.times ? s.times.join(', ') : '-',
          s.is_published ? 'Aktif / Tampil' : 'Nonaktif'
        ]);

        exportToPdf({
          title: 'JADWAL RESMI PEMBERIAN MAKAN SATWA (FEEDING SHOW)',
          fileName: `Jadwal_Makan_Satwa_Ragunan_${timestamp}`,
          headers,
          rows,
          orientation: 'portrait'
        });
        toast.success('Laporan Jadwal Makan (PDF) berhasil diunduh!');
      }
    } catch (err: any) {
      toast.error('Gagal mengekspor: ' + err.message);
    }
  };

  if (loading && schedules.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat data jadwal...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Manajemen Jadwal Makan Satwa
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Kelola jam feeding show dan monitor distribusi waktu atraksi satwa secara real-time.
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
                <span>Ekspor Jadwal</span>
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

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AppIcon icon="List" className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AppIcon icon="Clock" className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-md shadow-emerald-500/20 btn-interactive text-xs sm:text-sm"
          >
            <AppIcon icon="Plus" className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Conflict Detector Banner */}
      {conflicts.length > 0 ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 animate-slide-in-up">
          <AppIcon icon="AlertTriangle" className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
              Peringatan Deteksi Konflik Jam Makan ({conflicts.length} Slot Bersamaan)
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-1 leading-relaxed">
              Terdapat atraksi feeding show yang dijadwalkan pada jam yang persis sama. Hal ini dapat memecah kerumunan pengunjung atau menyulitkan staf:
            </p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {conflicts.map(([time, items]) => (
                <span
                  key={time}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-900 dark:text-amber-100"
                >
                  <AppIcon icon="Clock" className="w-3 h-3 text-amber-600" />
                  <span>Jam {time} WIB:</span>
                  <span className="font-normal">{items.map(i => i.name_id).join(' & ')}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-semibold">
          <AppIcon icon="CheckCircle2" className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Distribusi jadwal optimal • Tidak ada jam feeding show yang bertubrukan hari ini.</span>
        </div>
      )}

      {/* View Mode: Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="bg-card border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <AppIcon icon="Clock" className="w-5 h-5 text-emerald-600" />
              <span>Timeline Urutan Jam Makan Harian (09:00 - 16:00 WIB)</span>
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              Total {chronologicalItems.length} sesi feeding
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-500/30 space-y-6 ml-3 sm:ml-4">
            {chronologicalItems.map((item, idx) => {
              const isConflict = conflicts.some(([time]) => time === item.time);

              return (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-4 border-background flex items-center justify-center ${
                    isConflict ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-emerald-500 ring-4 ring-emerald-500/20'
                  }`} />

                  {/* Timeline Content Card */}
                  <div className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                        {item.schedule.image_url ? (
                          <img src={item.schedule.image_url} alt={item.schedule.name_id} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <AppIcon icon="Image" className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                            isConflict ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {item.time} WIB
                          </span>
                          {isConflict && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <AppIcon icon="AlertTriangle" className="w-3 h-3" />
                              Bersamaan
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-foreground mt-1">{item.schedule.name_id}</h4>
                        <p className="text-xs text-muted-foreground italic">{item.schedule.name_en || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleEdit(item.schedule)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-border text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1"
                      >
                        <AppIcon icon="Edit2" className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View Mode: Table View */
        <div className="bg-card border rounded-3xl shadow-sm overflow-hidden manager-table-shell">
          <div className="overflow-x-auto">
            <table className="manager-table">
              <thead className="manager-table-head">
                <tr>
                  <th className="manager-table-th">Satwa</th>
                  <th className="manager-table-th">Nama Inggris</th>
                  <th className="manager-table-th">Jam Makan</th>
                  <th className="manager-table-th text-center">Tampil di Web</th>
                  <th className="manager-table-th manager-table-th-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      Belum ada jadwal makan satwa yang ditambahkan.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="manager-table-row hover:bg-muted/30 transition-colors">
                      <td className="manager-table-td">
                        <div className="flex items-center gap-3">
                          {schedule.image_url ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                              <img src={schedule.image_url} alt={schedule.name_id} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                              <AppIcon icon="Image" className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-sm text-foreground">{schedule.name_id}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">ID: #{schedule.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="manager-table-td">
                        <span className="text-sm italic text-muted-foreground">{schedule.name_en || '-'}</span>
                      </td>
                      <td className="manager-table-td">
                        <div className="flex flex-wrap gap-1.5">
                          {schedule.times?.map((t, idx) => {
                            const isConflict = conflicts.some(([confTime]) => confTime === t.trim());

                            return (
                              <span 
                                key={idx} 
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                                  isConflict 
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' 
                                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                }`}
                              >
                                <AppIcon icon="Clock" className="w-3 h-3" />
                                <span>{t} WIB</span>
                                {isConflict && <AppIcon icon="AlertTriangle" className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="manager-table-td text-center">
                        <button
                          onClick={() => handleTogglePublish(schedule.id, schedule.is_published || false)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            schedule.is_published 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {schedule.is_published ? (
                            <>
                              <AppIcon icon="Eye" className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <AppIcon icon="EyeOff" className="w-3.5 h-3.5 text-slate-400" />
                              <span>Disembunyikan</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="manager-table-td manager-table-th-right">
                        <div className="manager-table-actions justify-end">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit Jadwal"
                          >
                            <AppIcon icon="Edit2" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Hapus Jadwal"
                          >
                            <AppIcon icon="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FeedingScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schedule={selectedSchedule}
        onSuccess={handleSave}
      />

      {ConfirmComponent}
    </div>
  );
}
