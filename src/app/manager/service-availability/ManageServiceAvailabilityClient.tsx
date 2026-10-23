"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CalendarDays, 
  Settings2, 
  Users, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  FlaskConical,
  Stethoscope,
  Mic,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ServiceAvailability } from '@/hooks/useServiceAvailability';
import { getServiceAvailabilityAction, updateAvailabilityAction, bulkUpdateAvailabilityAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

type ProgramType = 'pkl' | 'research' | 'koas' | 'interview';

const programConfig: Record<ProgramType, { label: string; icon: React.ElementType; color: string; border: string }> = {
  pkl: { label: 'PKL / Magang', icon: GraduationCap, color: 'text-blue-600 bg-blue-100', border: 'border-blue-200' },
  research: { label: 'Penelitian', icon: FlaskConical, color: 'text-purple-600 bg-purple-100', border: 'border-purple-200' },
  koas: { label: 'Koas / Klinis', icon: Stethoscope, color: 'text-orange-600 bg-orange-100', border: 'border-orange-200' },
  interview: { label: 'Wawancara', icon: Mic, color: 'text-green-600 bg-green-100', border: 'border-green-200' },
};

export default function ManageServiceAvailabilityClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState<ProgramType>('pkl');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingAvailability, setEditingAvailability] = useState<ServiceAvailability | null>(null);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditRange, setBulkEditRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined, 
    end: undefined 
  });

  const [bulkEditValues, setBulkEditValues] = useState({ maxSlots: 5, isAvailable: true });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Fetch data when month changes
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const data = await getServiceAvailabilityAction(currentMonth.toISOString());
        setAvailability(data);
      } catch (error) {
        console.error('Failed to fetch availability', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [currentMonth]);

  // Filter availability by selected program
  const programAvailability = availability.filter(a => a.program_type === selectedProgram);

  // Create a map for quick lookup
  const availabilityMap: Record<string, ServiceAvailability> = {};
  programAvailability.forEach(a => {
    availabilityMap[a.date] = a;
  });

  // Get all days in current month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const avail = availabilityMap[dateStr];
    if (avail) {
      setEditingAvailability(avail);
    } else {
      setEditingAvailability(null);
    }
    setSelectedDate(date);
  };

  const handleSaveAvailability = async () => {
    if (!editingAvailability) return;

    setSaving(true);
    try {
      const result = await updateAvailabilityAction(editingAvailability.id, {
        max_slots: editingAvailability.max_slots,
        is_available: editingAvailability.is_available,
        notes: editingAvailability.notes,
      });
      
      if (!result.success) throw new Error(result.error);
      
      toast.success('Ketersediaan berhasil diperbarui');
      
      // Update local state to avoid refetching
      setAvailability(prev => prev.map(a => a.id === editingAvailability.id ? editingAvailability : a));
      setEditingAvailability(null);
    } catch (error: any) {
      toast.error('Gagal memperbarui ketersediaan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkEditRange.start || !bulkEditRange.end) {
      toast.error('Pilih rentang tanggal');
      return;
    }

    setBulkSaving(true);
    try {
      const result = await bulkUpdateAvailabilityAction(
        selectedProgram,
        bulkEditRange.start,
        bulkEditRange.end,
        {
          max_slots: bulkEditValues.maxSlots,
          is_available: bulkEditValues.isAvailable,
        }
      );
      
      if (!result.success) throw new Error(result.error);
      
      toast.success('Ketersediaan berhasil diperbarui');
      setBulkEditOpen(false);
      setBulkEditRange({ start: undefined, end: undefined });
      
      // Refetch the data to show updates
      const data = await getServiceAvailabilityAction(currentMonth.toISOString());
      setAvailability(data);
    } catch (error: any) {
      toast.error('Gagal memperbarui ketersediaan: ' + error.message);
    } finally {
      setBulkSaving(false);
    }
  };

  const getStatusBadge = (avail: ServiceAvailability | undefined) => {
    if (!avail) return <Badge variant="outline" className="text-slate-400 bg-slate-50 border-slate-200">-</Badge>;
    
    if (!avail.is_available) {
      return <Badge variant="destructive" className="text-[10px] uppercase tracking-wider py-0 rounded bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100">Tutup</Badge>;
    }

    const remaining = avail.max_slots - avail.booked_slots;
    
    if (remaining <= 0) {
      return <Badge variant="destructive" className="text-[10px] uppercase tracking-wider py-0 rounded bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100">Penuh</Badge>;
    }
    
    if (remaining <= Math.ceil(avail.max_slots * 0.3)) {
      return <Badge className="text-[10px] uppercase tracking-wider py-0 rounded bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100">{remaining}/{avail.max_slots}</Badge>;
    }

    return <Badge className="text-[10px] uppercase tracking-wider py-0 rounded bg-green-50 text-green-600 border-green-200 hover:bg-green-100">{remaining}/{avail.max_slots}</Badge>;
  };

  const ProgramIcon = programConfig[selectedProgram].icon;
  const programColor = programConfig[selectedProgram].color;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <CalendarDays className="w-5 h-5 text-green-500" />
            </div>
            Kelola Ketersediaan
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">
            Atur slot dan ketersediaan layanan PKL, Penelitian, Koas, dan Wawancara
          </p>
        </div>
        <Button onClick={() => setBulkEditOpen(true)} className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-lg shadow-slate-800/20 px-6">
          <Settings2 className="w-4 h-4 mr-2" />
          Edit Massal
        </Button>
      </div>

      {/* Program Tabs */}
      <Tabs value={selectedProgram} onValueChange={(v) => setSelectedProgram(v as ProgramType)}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
          {Object.entries(programConfig).map(([key, config]) => {
            const Icon = config.icon as any;
            return (
              <TabsTrigger 
                key={key} 
                value={key} 
                className="flex items-center gap-2 py-2.5 rounded-xl font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm data-[state=active]:border-white"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedProgram} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar View */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm overflow-hidden p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${programColor}`}>
                    {React.createElement(programConfig[selectedProgram].icon as any, { className: "w-4 h-4" })}
                  </div>
                  {programConfig[selectedProgram].label}
                </h3>
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="w-8 h-8 rounded-lg hover:bg-white hover:text-green-600 hover:shadow-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="font-bold text-slate-700 min-w-[140px] text-center text-sm">
                    {format(currentMonth, 'MMMM yyyy', { locale: idLocale })}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth} className="w-8 h-8 rounded-lg hover:bg-white hover:text-green-600 hover:shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                      <div key={day} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-2">
                        {day}
                      </div>
                    ))}

                    {/* Empty cells for days before month start */}
                    {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Day cells */}
                    {daysInMonth.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const avail = availabilityMap[dateStr];
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <button
                          key={dateStr}
                          onClick={() => !isPast && handleDayClick(day)}
                          disabled={isPast}
                          className={cn(
                            "aspect-[4/3] p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all",
                            isPast && "opacity-40 cursor-not-allowed bg-slate-50 border-transparent",
                            !isPast && "hover:border-green-300 hover:shadow-sm cursor-pointer bg-white",
                            isSelected && "ring-2 ring-green-500 border-green-500 bg-green-50/30",
                            !isSelected && avail && !avail.is_available && "bg-rose-50 border-rose-200",
                            !isSelected && avail && avail.is_available && avail.booked_slots >= avail.max_slots && "bg-rose-50 border-rose-200",
                            !isSelected && avail && avail.is_available && avail.booked_slots < avail.max_slots && avail.booked_slots > avail.max_slots * 0.7 && "bg-orange-50 border-orange-200",
                            !isSelected && avail && avail.is_available && avail.booked_slots <= avail.max_slots * 0.7 && "bg-green-50 border-green-200",
                            !isSelected && !avail && !isPast && "border-slate-100 text-slate-600"
                          )}
                        >
                          <span className={cn(
                            "text-sm font-bold",
                            isPast ? "text-slate-400" : "text-slate-700"
                          )}>
                            {format(day, 'd')}
                          </span>
                          {avail && (
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded",
                              !avail.is_available || avail.booked_slots >= avail.max_slots ? "bg-rose-100 text-rose-700" : 
                              avail.booked_slots > avail.max_slots * 0.7 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                            )}>
                              {avail.is_available ? `${avail.max_slots - avail.booked_slots}/${avail.max_slots}` : 'X'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
                    <span className="text-xs font-bold text-slate-600">Tersedia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400 shadow-sm shadow-orange-400/50" />
                    <span className="text-xs font-bold text-slate-600">Terbatas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
                    <span className="text-xs font-bold text-slate-600">Penuh/Tutup</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-[100px] -z-10" />
              
              <div className="pb-5 border-b border-slate-100 mb-5">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-green-500" />
                  Detail Tanggal
                </h3>
                {selectedDate ? (
                  <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                    <p className="text-green-900 font-bold text-sm text-center">
                      {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale })}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500 mt-2">Pilih tanggal pada kalender</p>
                )}
              </div>
              
              <div>
                {editingAvailability ? (
                  <div className="space-y-6">
                    {/* Slot Configuration */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3 h-3 text-green-500" />
                        Maksimal Slot
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={editingAvailability.max_slots}
                        onChange={(e) => setEditingAvailability({
                          ...editingAvailability,
                          max_slots: parseInt(e.target.value) || 1
                        })}
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    {/* Slot Status */}
                    <div className="p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Slot</Label>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 bg-white rounded-full h-3 border border-slate-200 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all rounded-full",
                              editingAvailability.booked_slots >= editingAvailability.max_slots 
                                ? "bg-rose-500" 
                                : editingAvailability.booked_slots > editingAvailability.max_slots * 0.7 
                                  ? "bg-orange-500" 
                                  : "bg-green-500"
                            )}
                            style={{ 
                              width: `${Math.min((editingAvailability.booked_slots / editingAvailability.max_slots) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <Badge variant="outline" className="text-sm font-bold px-3 py-1 bg-white border-slate-200 text-slate-700">
                          {editingAvailability.booked_slots}/{editingAvailability.max_slots}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mt-3 text-center">
                        {editingAvailability.max_slots - editingAvailability.booked_slots} slot tersisa
                      </p>
                    </div>

                    {/* Availability Toggle */}
                    <div className={cn(
                      "flex items-center justify-between p-4 rounded-[1.5rem] border transition-colors",
                      editingAvailability.is_available 
                        ? "bg-green-50 border-green-200" 
                        : "bg-rose-50 border-rose-200"
                    )}>
                      <div className="flex items-center gap-3">
                        {editingAvailability.is_available ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-rose-600" />
                          </div>
                        )}
                        <Label className={cn(
                          "font-bold text-sm",
                          editingAvailability.is_available ? "text-green-700" : "text-rose-700"
                        )}>
                          {editingAvailability.is_available ? 'Buka Pendaftaran' : 'Tutup Pendaftaran'}
                        </Label>
                      </div>
                      <Switch
                        checked={editingAvailability.is_available}
                        onCheckedChange={(checked) => setEditingAvailability({
                          ...editingAvailability,
                          is_available: checked
                        })}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Catatan Tambahan</Label>
                      <Input
                        value={editingAvailability.notes || ''}
                        onChange={(e) => setEditingAvailability({
                          ...editingAvailability,
                          notes: e.target.value || null
                        })}
                        placeholder="Contoh: Libur nasional"
                        className="h-11 bg-slate-50 border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    {/* Save Button */}
                    <Button 
                      className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20" 
                      onClick={handleSaveAvailability}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Simpan Perubahan
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <CalendarDays className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-700">Tidak ada data</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">Pilih tanggal yang tersedia untuk diedit</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table View for smaller details */}
          <div className="mt-6 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm overflow-hidden p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Daftar Ketersediaan Bulan Ini</h3>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-11">Tanggal</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-11">Hari</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-11 text-center">Status</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-11 text-center">Slot Terisi</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-11">Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programAvailability.length > 0 ? programAvailability.map(avail => (
                      <TableRow key={avail.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => {
                        setSelectedDate(new Date(avail.date));
                        setEditingAvailability(avail);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}>
                        <TableCell className="font-bold text-slate-700">
                          {format(new Date(avail.date), 'd MMM yyyy', { locale: idLocale })}
                        </TableCell>
                        <TableCell className="font-medium text-slate-500">
                          {format(new Date(avail.date), 'EEEE', { locale: idLocale })}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(avail)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-slate-700">{avail.booked_slots}</span>
                          <span className="text-slate-400 text-xs">/{avail.max_slots}</span>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm font-medium">
                          {avail.notes || '-'}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <p className="font-bold text-slate-400">Belum ada ketersediaan bulan ini</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <Settings2 className="w-5 h-5 text-green-500" />
              </div>
              Edit Ketersediaan Massal
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            {/* Program Type Display */}
            <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${programConfig[selectedProgram].color}`}>
                {React.createElement(programConfig[selectedProgram].icon as any, { className: "w-6 h-6" })}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Program Terpilih</p>
                <p className="font-bold text-slate-800">{programConfig[selectedProgram].label}</p>
              </div>
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Tanggal Mulai</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start text-left font-bold h-11 rounded-xl bg-white",
                        !bulkEditRange.start ? "text-slate-400 border-slate-200" : "text-green-700 border-green-200 bg-green-50/50"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {bulkEditRange.start 
                        ? format(bulkEditRange.start, 'd MMM yyyy', { locale: idLocale })
                        : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={bulkEditRange.start}
                      onSelect={(date) => setBulkEditRange(prev => ({ ...prev, start: date }))}
                      className="pointer-events-auto"
                      locale={idLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Tanggal Akhir</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full justify-start text-left font-bold h-11 rounded-xl bg-white",
                        !bulkEditRange.end ? "text-slate-400 border-slate-200" : "text-green-700 border-green-200 bg-green-50/50"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {bulkEditRange.end 
                        ? format(bulkEditRange.end, 'd MMM yyyy', { locale: idLocale })
                        : 'Pilih tanggal'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="end">
                    <Calendar
                      mode="single"
                      selected={bulkEditRange.end}
                      onSelect={(date) => setBulkEditRange(prev => ({ ...prev, end: date }))}
                      disabled={(date) => bulkEditRange.start ? date < bulkEditRange.start : false}
                      className="pointer-events-auto"
                      locale={idLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Slot Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Maks. Slot/Hari</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={bulkEditValues.maxSlots}
                    onChange={(e) => setBulkEditValues(prev => ({ 
                      ...prev, 
                      maxSlots: parseInt(e.target.value) || 1 
                    }))}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Status Pendaftaran</Label>
                <div className={cn(
                  "flex items-center justify-between px-4 rounded-xl border h-11 transition-colors",
                  bulkEditValues.isAvailable 
                    ? "bg-green-50 border-green-200" 
                    : "bg-rose-50 border-rose-200"
                )}>
                  <span className={cn(
                    "text-sm font-bold",
                    bulkEditValues.isAvailable ? "text-green-700" : "text-rose-700"
                  )}>
                    {bulkEditValues.isAvailable ? 'Buka' : 'Tutup'}
                  </span>
                  <Switch
                    checked={bulkEditValues.isAvailable}
                    onCheckedChange={(checked) => setBulkEditValues(prev => ({ 
                      ...prev, 
                      isAvailable: checked 
                    }))}
                    className={bulkEditValues.isAvailable ? "data-[state=checked]:bg-green-500" : ""}
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            {bulkEditRange.start && bulkEditRange.end && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-sm font-medium text-blue-800 leading-relaxed">
                  Perubahan akan diterapkan pada semua tanggal mulai{' '}
                  <strong className="font-bold text-blue-900">{format(bulkEditRange.start, 'd MMMM', { locale: idLocale })}</strong> hingga{' '}
                  <strong className="font-bold text-blue-900">{format(bulkEditRange.end, 'd MMMM yyyy', { locale: idLocale })}</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 gap-3">
            <Button variant="outline" onClick={() => setBulkEditOpen(false)} className="flex-1 rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50">
              Batal
            </Button>
            <Button 
              onClick={handleBulkUpdate} 
              disabled={bulkSaving || !bulkEditRange.start || !bulkEditRange.end}
              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20"
            >
              {bulkSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Terapkan Massal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
