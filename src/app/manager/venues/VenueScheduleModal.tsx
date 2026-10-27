"use client";

import { useState } from 'react';
import { useConfirm } from '@/hooks/useConfirm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVenueBookings, VenueBooking } from '@/hooks/useVenueBookings';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { AppIcon } from '@/components/ui/AppIcon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import VenueBookingCalendar from '@/components/venues/VenueBookingCalendar';

interface VenueScheduleModalProps {
  venue: any;
  isOpen: boolean;
  onClose: () => void;
}

export function VenueScheduleModal({ venue, isOpen, onClose }: VenueScheduleModalProps) {
  const { confirm, ConfirmComponent } = useConfirm();

  const { bookings, isLoading, addBooking, updateBookingStatus, updateBooking, deleteBooking } = useVenueBookings(isOpen ? venue?.id : undefined);
  const [view, setView] = useState<'calendar' | 'list' | 'form'>('calendar');
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    renter_name: '',
    event_name: '',
    institution_name: '',
    contact_number: '',
    start_date: '',
    end_date: '',
    total_payment: '',
    special_notes: '',
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled'
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      renter_name: '',
      event_name: '',
      institution_name: '',
      contact_number: '',
      start_date: '',
      end_date: '',
      total_payment: '',
      special_notes: '',
      status: 'pending'
    });
    setReceiptFile(null);
    setEditingBookingId(null);
  };

  const handleEdit = (booking: VenueBooking) => {
    setFormData({
      renter_name: booking.renter_name,
      event_name: booking.event_name,
      institution_name: booking.institution_name || '',
      contact_number: booking.contact_number,
      start_date: booking.start_date,
      end_date: booking.end_date,
      total_payment: booking.total_payment ? String(booking.total_payment) : '',
      special_notes: booking.special_notes || '',
      status: booking.status
    });
    setEditingBookingId(booking.id);
    setView('form');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setTimeout(() => {
        setView('calendar');
        resetForm();
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue?.id) return;
    
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai');
      return;
    }

    try {
      setIsSubmitting(true);
      let receiptUrl: string | null = null;

      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `receipt_${venue.id}_${Date.now()}.${fileExt}`;
        const filePath = `venue_receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath);

        receiptUrl = publicUrlData.publicUrl;
      }

      if (editingBookingId) {
        const updateData: any = {
          renter_name: formData.renter_name,
          event_name: formData.event_name,
          institution_name: formData.institution_name || null,
          contact_number: formData.contact_number,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_payment: formData.total_payment ? Number(formData.total_payment) : null,
          special_notes: formData.special_notes || null,
          status: formData.status,
        };

        if (receiptUrl) {
          updateData.transfer_receipt_url = receiptUrl;
        }

        await updateBooking.mutateAsync({
          id: editingBookingId,
          venue_id: venue.id,
          ...updateData
        });

        toast.success('Data penyewaan berhasil diperbarui');
      } else {
        await addBooking.mutateAsync({
          venue_id: venue.id,
          renter_name: formData.renter_name,
          event_name: formData.event_name,
          institution_name: formData.institution_name || null,
          contact_number: formData.contact_number,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_payment: formData.total_payment ? Number(formData.total_payment) : null,
          special_notes: formData.special_notes || null,
          transfer_receipt_url: receiptUrl,
          status: formData.status
        });

        toast.success('Penyewaan berhasil ditambahkan');
      }

      resetForm();
      setView('calendar');
    } catch (error: any) {
      toast.error('Gagal memproses penyewaan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (booking: VenueBooking) => {
    if ((await confirm("Konfirmasi", `Apakah Anda yakin ingin menghapus penyewaan untuk ${booking.renter_name}?`))) {
      try {
        await deleteBooking.mutateAsync({ id: booking.id, venue_id: venue.id });
        toast.success('Data penyewaan berhasil dihapus');
      } catch (error: any) {
        toast.error('Gagal menghapus data: ' + error.message);
      }
    }
  };

  const toggleStatus = async (booking: VenueBooking) => {
    const nextStatus = booking.status === 'pending' ? 'confirmed' : booking.status === 'confirmed' ? 'cancelled' : 'pending';
    try {
      await updateBookingStatus.mutateAsync({ id: booking.id, status: nextStatus, venue_id: venue.id });
      toast.success('Status berhasil diperbarui');
    } catch (error: any) {
      toast.error('Gagal memperbarui status');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto p-6 rounded-[2rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <AppIcon icon="CalendarDays" className="w-5 h-5 text-emerald-600" />
                Kelola Sewa & Jadwal: {venue?.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Pantau ketersediaan tanggal dan jadwal booking khusus lokasi ini.
              </DialogDescription>
            </div>

            {/* View switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setView('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    view === 'calendar'
                      ? 'bg-white dark:bg-slate-900 text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AppIcon icon="Calendar" className="w-3.5 h-3.5" />
                  <span>Kalender</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    view === 'list'
                      ? 'bg-white dark:bg-slate-900 text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AppIcon icon="List" className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
              </div>

              {view !== 'form' && (
                <button
                  onClick={() => setView('form')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                >
                  <AppIcon icon="Plus" className="w-4 h-4" />
                  <span>Tambah Booking</span>
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <AppIcon icon="Loader2" className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm text-muted-foreground">Memuat data penyewaan...</p>
            </div>
          ) : view === 'calendar' ? (
            <VenueBookingCalendar
              bookings={bookings}
              venues={venue ? [venue] : []}
              onAddBookingOnDate={(dateStr) => {
                setFormData(prev => ({ ...prev, start_date: dateStr, end_date: dateStr }));
                setView('form');
              }}
              onEditBooking={handleEdit}
              onDeleteBooking={handleDelete}
            />
          ) : view === 'list' ? (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                  <p className="text-muted-foreground text-sm">Belum ada data penyewaan untuk tempat ini.</p>
                </div>
              ) : (
                <div className="border rounded-2xl overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Penyewa</TableHead>
                        <TableHead>Acara</TableHead>
                        <TableHead>Rentang Tanggal</TableHead>
                        <TableHead>Total Biaya</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{booking.renter_name}</div>
                            {booking.institution_name && (
                              <div className="text-xs text-muted-foreground">{booking.institution_name}</div>
                            )}
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">{booking.contact_number}</div>
                          </TableCell>
                          <TableCell className="font-semibold">{booking.event_name}</TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold">
                              {format(new Date(booking.start_date), 'dd MMM yyyy', { locale: idLocale })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              s/d {format(new Date(booking.end_date), 'dd MMM yyyy', { locale: idLocale })}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-600">
                            {booking.total_payment ? `Rp ${booking.total_payment.toLocaleString('id-ID')}` : '-'}
                            {booking.transfer_receipt_url && (
                              <div className="mt-1">
                                <a 
                                  href={booking.transfer_receipt_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded-md"
                                >
                                  <AppIcon icon="FileText" className="w-3 h-3" />
                                  Bukti Transfer
                                </a>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`cursor-pointer ${
                                booking.status === 'confirmed' 
                                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                                  : booking.status === 'cancelled' 
                                  ? 'bg-rose-500 hover:bg-rose-600' 
                                  : 'bg-amber-500 hover:bg-amber-600'
                              }`}
                              onClick={() => toggleStatus(booking)}
                            >
                              {booking.status === 'confirmed' ? 'Lunas / Diterima' : booking.status === 'cancelled' ? 'Dibatalkan' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(booking)}
                                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                              >
                                <AppIcon icon="Edit2" className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(booking)}
                                className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                              >
                                <AppIcon icon="Trash2" className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Penyewa / Penanggung Jawab *</Label>
                  <Input
                    required
                    value={formData.renter_name}
                    onChange={(e) => setFormData({ ...formData, renter_name: e.target.value })}
                    placeholder="Contoh: Bpk. Ahmad Hidayat"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Acara *</Label>
                  <Input
                    required
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    placeholder="Contoh: Family Gathering Bank DKI"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Instansi / Perusahaan (Opsional)</Label>
                  <Input
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    placeholder="Contoh: PT Telekomunikasi Indonesia"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomor WhatsApp / Telepon *</Label>
                  <Input
                    required
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Biaya Sewa (Rp)</Label>
                  <Input
                    type="number"
                    value={formData.total_payment}
                    onChange={(e) => setFormData({ ...formData, total_payment: e.target.value })}
                    placeholder="Contoh: 5000000"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status Pembayaran & Booking</Label>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="manager-select text-sm h-10"
                  >
                    <option value="pending">🟡 Menunggu Pembayaran (Pending)</option>
                    <option value="confirmed">🟢 Terkonfirmasi / Lunas</option>
                    <option value="cancelled">🔴 Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Catatan Khusus (Kebutuhan Panggung/Listrik/dsb)</Label>
                <Textarea
                  value={formData.special_notes}
                  onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                  placeholder="Contoh: Memerlukan daya listrik 5000 watt dan 50 kursi tambahan..."
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setView('calendar');
                  }}
                  className="rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
                >
                  {isSubmitting ? 'Menyimpan...' : editingBookingId ? 'Perbarui Data' : 'Simpan Booking'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
      {ConfirmComponent}
    </Dialog>
  );
}
