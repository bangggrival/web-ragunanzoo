'use client';

import { useState, useEffect, useCallback } from 'react';
import PermissionGuard from '@/components/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ExternalLink, MapPin, Search, QrCode, Printer } from 'lucide-react';
import QRCodeBulkGenerator from '@/components/qr/QRCodeBulkGenerator';
import { Input } from '@/components/ui/input';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { TablePagination } from '@/components/ui/TablePagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

function ManageFacilityReportsClient() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  // Dialog State
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [statusInput, setStatusInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('facility_reports').select('*');
      
      if (search) {
        query = query.ilike('ticket_number', `%${search}%`);
      }
      
      if (dateFilter) {
        query = query.gte('created_at', `${dateFilter}T00:00:00.000Z`).lte('created_at', `${dateFilter}T23:59:59.999Z`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allData = data || [];
      setTotalItems(allData.length);
      
      // Client-side pagination slicing since backend shim doesn't support .range()
      const paginatedData = allData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
      setReports(paginatedData);
    } catch (err: any) {
      toast.error('Gagal mengambil data laporan: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchReports();

    // Listen for Server-Sent Events (SSE) updates from backend
    const handleRealtimeUpdate = (e: any) => {
      if (e.detail?.table === 'facility_reports') {
        fetchReports();
        // Hanya tampilkan notifikasi jika itu laporan baru (bukan sekadar update status oleh admin ini sendiri)
        if (e.detail?.type === 'INSERT') {
          toast.info('Ada laporan fasilitas baru masuk! Data telah diperbarui otomatis.');
        }
      }
    };

    window.addEventListener('supabase-db-change', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('supabase-db-change', handleRealtimeUpdate);
    };
  }, [fetchReports]);

  const openUpdateDialog = (report: any) => {
    setSelectedReport(report);
    setStatusInput(report.status);
    setNotesInput(report.admin_notes || '');
  };

  const handleUpdate = async () => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('facility_reports')
        .update({
          status: statusInput,
          admin_notes: notesInput,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id);

      if (error) throw error;
      
      toast.success(`Tiket ${selectedReport.ticket_number} berhasil diupdate.`);
      setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error('Gagal update laporan: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatedSection>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lapor Fasilitas</h1>
          <p className="text-muted-foreground">Kelola laporan kerusakan fasilitas dari pengunjung.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowQRGenerator(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Cetak Label QR Fasilitas</span>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari nomor tiket..." 
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white h-10",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <Search className="mr-2 h-4 w-4 opacity-0" /> 
                    {/* Just using a placeholder icon space if needed, or import CalendarIcon. Wait, I didn't import Calendar from lucide. Let's just use text or add it */}
                    {dateFilter ? format(new Date(dateFilter), "PPP", { locale: localeId }) : <span>Filter Tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter ? new Date(dateFilter) : undefined}
                    onSelect={(date) => {
                      setDateFilter(date ? format(date, 'yyyy-MM-dd') : '');
                      setCurrentPage(1);
                    }}
                    initialFocus
                    locale={localeId}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {(search || dateFilter) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearch('');
                  setDateFilter('');
                  setCurrentPage(1);
                }}
                className="shrink-0"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tiket</CardTitle>
          <CardDescription>Menampilkan {reports.length} dari total {totalItems} tiket laporan.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">Tidak ada tiket laporan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Tiket</th>
                    <th className="py-3 px-4 text-left font-medium">Tanggal</th>
                    <th className="py-3 px-4 text-left font-medium">Kategori</th>
                    <th className="py-3 px-4 text-left font-medium">Pelapor</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-semibold">{report.ticket_number}</td>
                      <td className="py-3 px-4">{new Date(report.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4">{report.category}</td>
                      <td className="py-3 px-4">{report.is_anonymous ? 'Anonim' : (report.reporter_name || '-')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${report.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' : 
                            report.status === 'Diproses' ? 'bg-blue-100 text-blue-700' : 
                            report.status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                            'bg-gray-100 text-gray-700'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => openUpdateDialog(report)}>
                          Proses
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalItems > itemsPerPage && (
            <div className="mt-6">
              <TablePagination 
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / itemsPerPage)}
                onPageChange={setCurrentPage}
                pageSize={itemsPerPage}
                totalItems={totalItems}
                onPageSizeChange={() => {}}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Laporan: {selectedReport?.ticket_number}</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Pelapor</span>
                  <strong>{selectedReport.is_anonymous ? 'Anonim' : (selectedReport.reporter_name || 'Tanpa Nama')}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Tanggal Masuk</span>
                  <strong>{new Date(selectedReport.created_at).toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Lokasi</span>
                  <strong>{selectedReport.location_name || '-'}</strong>
                  {selectedReport.latitude && (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.latitude},${selectedReport.longitude}`} target="_blank" rel="noreferrer" className="text-primary flex items-center mt-1 hover:underline">
                      <MapPin className="w-4 h-4 mr-1" /> Buka Peta
                    </a>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Kategori</span>
                  <strong>{selectedReport.category}</strong>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1 text-sm">Deskripsi</span>
                <p className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">{selectedReport.description}</p>
              </div>

              {selectedReport.image_url && (
                <div>
                  <span className="text-muted-foreground block mb-1 text-sm">Bukti Foto</span>
                  <a href={selectedReport.image_url} target="_blank" rel="noreferrer">
                    <img src={selectedReport.image_url} alt="Bukti" className="w-full max-w-sm h-auto rounded-lg border cursor-pointer hover:opacity-90" />
                  </a>
                </div>
              )}

              <hr />

              <div className="space-y-4">
                <h4 className="font-semibold">Tindak Lanjut Admin</h4>
                
                <div className="space-y-2">
                  <label className="text-sm">Ubah Status</label>
                  <Select value={statusInput} onValueChange={setStatusInput}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Menunggu">Menunggu</SelectItem>
                      <SelectItem value="Diproses">Diproses</SelectItem>
                      <SelectItem value="Selesai">Selesai</SelectItem>
                      <SelectItem value="Ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Catatan Tindak Lanjut (Bisa dilihat pelapor)</label>
                  <Textarea 
                    value={notesInput} 
                    onChange={(e) => setNotesInput(e.target.value)} 
                    placeholder="Catatan dari petugas yang menangani..."
                  />
                </div>
              </div>

            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>Tutup</Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk QR Generator Modal for Zoo Facilities */}
      {showQRGenerator && (
        <QRCodeBulkGenerator
          defaultTab="facilities"
          onClose={() => setShowQRGenerator(false)}
        />
      )}
    </AnimatedSection>
  );
}

export default function ManageFacilityReportsPage() {
  return (
    <PermissionGuard permissionKey="facility-reports">
      <ManageFacilityReportsClient />
    </PermissionGuard>
  );
}
