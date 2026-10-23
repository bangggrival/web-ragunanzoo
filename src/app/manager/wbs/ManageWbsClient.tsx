"use client";

import { useState, useMemo, useEffect } from 'react';
import { ShieldAlert, Download, Eye, Trash2, Search, Filter, MessageSquare, Calendar, MapPin, User, Mail, Phone, Paperclip, FileText, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { WBSTrendChart } from '@/components/wbs/WBSTrendChart';
import { WBSEvidenceViewer } from '@/components/wbs/WBSEvidenceViewer';
import { WBSExportDialog } from '@/components/wbs/WBSExportDialog';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { WBSSubmission } from '@/hooks/useWBSSubmissions';
import { deleteWBSSubmissionAction, updateWBSStatusAction } from './actions';
import { supabase } from '@/integrations/supabase/client';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'investigating', label: 'Investigasi', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'resolved', label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'dismissed', label: 'Ditolak', color: 'bg-slate-100 text-slate-800 border-slate-200' },
];

const WBS_CATEGORIES = [
  { value: 'korupsi', label: 'Korupsi' },
  { value: 'penipuan', label: 'Penipuan' },
  { value: 'pelanggaran_etika', label: 'Pelanggaran Etika' },
  { value: 'penyalahgunaan_wewenang', label: 'Penyalahgunaan Wewenang' },
  { value: 'diskriminasi', label: 'Diskriminasi' },
  { value: 'pelecehan', label: 'Pelecehan' },
  { value: 'keselamatan_kerja', label: 'Keselamatan Kerja' },
  { value: 'lingkungan', label: 'Pelanggaran Lingkungan' },
  { value: 'lainnya', label: 'Lainnya' },
];

export default function ManageWbsClient() {
  const [submissions, setSubmissions] = useState<WBSSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<WBSSubmission | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter submissions
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: submissionsData } = await supabase.from('wbs_submissions').select('*').order('created_at', { ascending: false });
        if (submissionsData) setSubmissions(submissionsData as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const query = debouncedSearchQuery.toLowerCase();
      const matchesSearch = !query || Object.values(sub).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      );
      
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
      
      let matchesDate = true;
      if (dateFilter) {
        const subDate = new Date(sub.created_at).toISOString().split('T')[0];
        matchesDate = subDate === dateFilter;
      }
      
      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [submissions, debouncedSearchQuery, statusFilter, categoryFilter, dateFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    investigating: submissions.filter(s => s.status === 'investigating').length,
    resolved: submissions.filter(s => s.status === 'resolved').length,
  }), [submissions]);

  const handleView = (submission: WBSSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes || '');
    setSelectedStatus(submission.status);
    setViewModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedSubmission) return;
    
    setSaving(true);
    try {
      const result = await updateWBSStatusAction(selectedSubmission.id, selectedStatus, adminNotes);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Status berhasil diperbarui');
      setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? { ...s, status: selectedStatus, admin_notes: adminNotes } : s));
      setViewModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteWBSSubmissionAction(id);
      if (!result.success) throw new Error(result.error);
      
      toast.success('Laporan berhasil dihapus');
      setSubmissions(prev => prev.filter(s => s.id !== id));
      if (selectedSubmission?.id === id) setViewModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal menghapus laporan: ' + err.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Tanggal Laporan', 'Kategori', 'Status', 'Anonim', 'Nama Pelapor', 'Email', 'Telepon', 'Nama Terlapor', 'Jabatan Terlapor', 'Tanggal Kejadian', 'Lokasi', 'Deskripsi', 'Catatan Admin'];
    
    const rows = filteredSubmissions.map(sub => [
      sub.id,
      format(new Date(sub.created_at), 'dd/MM/yyyy HH:mm'),
      WBS_CATEGORIES.find(c => c.value === sub.category)?.label || sub.category,
      STATUS_OPTIONS.find(s => s.value === sub.status)?.label || sub.status,
      sub.is_anonymous ? 'Ya' : 'Tidak',
      sub.reporter_name || '-',
      sub.reporter_email || '-',
      sub.reporter_phone || '-',
      sub.reported_person_name || '-',
      sub.reported_person_position || '-',
      sub.incident_date ? format(new Date(sub.incident_date), 'dd/MM/yyyy') : '-',
      sub.incident_location || '-',
      `"${sub.description.replace(/"/g, '""')}"`,
      sub.admin_notes ? `"${sub.admin_notes.replace(/"/g, '""')}"` : '-',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `WBS_Report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge variant="outline" className={`font-bold border ${statusOption?.color || 'bg-slate-100 text-slate-800'}`}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    return WBS_CATEGORIES.find(c => c.value === category)?.label || category;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            Whistleblowing System
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola laporan pengaduan dari publik</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 shadow-sm" 
            onClick={() => setExportDialogOpen(true)}
            disabled={submissions.length === 0}
          >
            <FileText className="w-4 h-4 mr-2 text-green-500" />
            Export PDF
          </Button>
          <Button onClick={exportToCSV} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Laporan</p>
          <div className="text-3xl font-black text-slate-800">{stats.total}</div>
        </div>
        <div className="bg-amber-50/60 backdrop-blur-xl border border-amber-100/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-100/50 rounded-full blur-xl"></div>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 relative z-10">Menunggu</p>
          <div className="text-3xl font-black text-amber-700 relative z-10">{stats.pending}</div>
        </div>
        <div className="bg-green-50/60 backdrop-blur-xl border border-green-100/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-100/50 rounded-full blur-xl"></div>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1 relative z-10">Investigasi</p>
          <div className="text-3xl font-black text-green-700 relative z-10">{stats.investigating}</div>
        </div>
        <div className="bg-green-50/60 backdrop-blur-xl border border-green-100/80 p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-100/50 rounded-full blur-xl"></div>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1 relative z-10">Selesai</p>
          <div className="text-3xl font-black text-green-700 relative z-10">{stats.resolved}</div>
        </div>
      </div>

      {/* Trend Chart */}
      <WBSTrendChart submissions={submissions} />

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-green-500" />
          Filter & Pencarian
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari deskripsi, nama pelapor, lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-green-500 font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Status</SelectItem>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-56 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-green-500 font-bold">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Kategori</SelectItem>
              {WBS_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-full md:w-48">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-slate-50 h-11 border-slate-200 rounded-xl hover:bg-slate-100",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateFilter ? format(new Date(dateFilter), "PPP", { locale: localeId }) : <span>Filter Tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateFilter ? new Date(dateFilter) : undefined}
                  onSelect={(date) => setDateFilter(date ? format(date, 'yyyy-MM-dd') : '')}
                  initialFocus
                  locale={localeId}
                />
              </PopoverContent>
            </Popover>
          </div>
          {(searchQuery || dateFilter || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery('');
                setDateFilter('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="shrink-0 h-11 rounded-xl text-slate-500 hover:text-slate-800 font-bold"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="manager-table-shell">
        <div className="hidden md:block manager-table-scroll">
          <table className="manager-table">
            <thead className="manager-table-head">
              <tr>
                <th className="manager-table-th rounded-tl-[1rem]">Tanggal</th>
                <th className="manager-table-th">Kategori</th>
                <th className="manager-table-th">Pelapor</th>
                <th className="manager-table-th">Terlapor</th>
                <th className="manager-table-th max-w-[200px]">Deskripsi</th>
                <th className="manager-table-th">Status</th>
                <th className="manager-table-th manager-table-th-right rounded-tr-[1rem]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="manager-table-td text-center py-12">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">Tidak ada laporan ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="manager-table-row">
                    <td className="manager-table-td whitespace-nowrap font-medium text-slate-700">
                      {format(new Date(submission.created_at), 'dd MMM yyyy', { locale: localeId })}
                    </td>
                    <td className="manager-table-td whitespace-nowrap">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">{getCategoryLabel(submission.category)}</Badge>
                    </td>
                    <td className="manager-table-td whitespace-nowrap">
                      {submission.is_anonymous ? (
                        <span className="text-rose-500 font-bold flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Anonim</span>
                      ) : (
                        <span className="font-bold text-slate-800">{submission.reporter_name || '-'}</span>
                      )}
                    </td>
                    <td className="manager-table-td whitespace-nowrap">
                      {submission.reported_person_name ? (
                        <div>
                          <p className="font-bold text-slate-800">{submission.reported_person_name}</p>
                          {submission.reported_person_position && (
                            <p className="text-xs font-medium text-slate-500">{submission.reported_person_position}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-medium">-</span>
                      )}
                    </td>
                    <td className="manager-table-td max-w-[200px]">
                      <p className="truncate text-slate-600 font-medium">{submission.description}</p>
                    </td>
                    <td className="manager-table-td whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="manager-table-td manager-table-td-right whitespace-nowrap">
                      <div className="manager-table-actions">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-50" onClick={() => handleView(submission)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2rem]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Laporan pengaduan ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                              <AlertDialogAction className="rounded-xl bg-rose-500 hover:bg-rose-600" onClick={() => handleDelete(submission.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Fallback View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">Tidak ada laporan ditemukan.</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="font-bold text-slate-800 text-sm">{format(new Date(submission.created_at), 'dd MMM yyyy', { locale: localeId })}</span>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
                
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Pelapor</p>
                      {submission.is_anonymous ? (
                        <p className="text-rose-500 font-bold text-sm flex items-center gap-1 mt-0.5"><ShieldAlert className="w-3 h-3" /> Anonim</p>
                      ) : (
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{submission.reporter_name || '-'}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Terlapor</p>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{submission.reported_person_name || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold mb-2">{getCategoryLabel(submission.category)}</Badge>
                  <p className="text-xs text-slate-600 font-medium line-clamp-2">{submission.description}</p>
                </div>
                
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100/80">
                  <Button variant="outline" size="sm" className="h-8 rounded-lg text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleView(submission)}>
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Lihat
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-rose-500 border-rose-200 hover:bg-rose-50">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Laporan pengaduan ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                        <AlertDialogAction className="rounded-xl bg-rose-500 hover:bg-rose-600" onClick={() => handleDelete(submission.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View/Edit Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl custom-scrollbar">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              </div>
              Detail Laporan WBS
            </DialogTitle>
            <DialogDescription className="px-14">
              Laporan diterima pada {selectedSubmission && format(new Date(selectedSubmission.created_at), 'dd MMMM yyyy HH:mm', { locale: localeId })}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="p-6 space-y-6">
              {/* Reporter Info */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-green-500" />
                  Informasi Pelapor
                </h4>
                {selectedSubmission.is_anonymous ? (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-bold">
                    <ShieldAlert className="w-5 h-5" />
                    Laporan Anonim (Identitas Dirahasiakan)
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Pelapor</p>
                      <p className="font-bold text-slate-800">{selectedSubmission.reporter_name || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</p>
                      <p className="font-bold text-slate-800">{selectedSubmission.reporter_email || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Telepon</p>
                      <p className="font-bold text-slate-800">{selectedSubmission.reporter_phone || '-'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reported Person Info */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
                <h4 className="font-bold text-sm text-rose-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <UserX className="w-4 h-4 text-rose-500" />
                  Identitas Yang Dilaporkan
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-rose-700/70 uppercase tracking-wider">Nama Terlapor</Label>
                    <p className="font-bold text-rose-950">{selectedSubmission.reported_person_name || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-rose-700/70 uppercase tracking-wider">Jabatan/Posisi</Label>
                    <p className="font-bold text-rose-950">{selectedSubmission.reported_person_position || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Incident Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Detail Kejadian</h4>
                <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori Pelanggaran</Label>
                    <p className="font-bold text-slate-800">{getCategoryLabel(selectedSubmission.category)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Tanggal Kejadian
                    </Label>
                    <p className="font-bold text-slate-800">
                      {selectedSubmission.incident_date 
                        ? format(new Date(selectedSubmission.incident_date), 'dd MMMM yyyy', { locale: localeId })
                        : '-'}
                    </p>
                  </div>
                  <div className="sm:col-span-2 space-y-1 pt-2 border-t border-slate-200">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Lokasi Kejadian
                    </Label>
                    <p className="font-bold text-slate-800">{selectedSubmission.incident_location || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi Laporan</Label>
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 whitespace-pre-wrap font-medium text-amber-900 text-sm leading-relaxed">
                  {selectedSubmission.description}
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-green-500" />
                  Bukti Pendukung
                </Label>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <WBSEvidenceViewer evidenceUrls={selectedSubmission.evidence_urls || []} />
                </div>
              </div>

              {/* Status & Admin Notes */}
              <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100 space-y-5">
                <h4 className="font-bold text-sm text-green-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  Tindak Lanjut & Status
                </h4>
                
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-green-700/70 uppercase tracking-wider">Status Laporan</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-11 bg-white border-green-200 rounded-xl focus:ring-green-500 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status.value} value={status.value} className="font-bold">
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-green-700/70 uppercase tracking-wider">Catatan Admin (Internal)</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tambahkan catatan hasil investigasi, tindak lanjut, dll..."
                    className="bg-white border-green-200 rounded-xl focus-visible:ring-green-500 font-medium text-sm resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex flex-wrap sm:flex-nowrap gap-3">
            <Button variant="outline" onClick={() => setViewModalOpen(false)} className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 px-6 flex-1 sm:flex-none">
              Tutup
            </Button>
            {selectedSubmission?.reporter_phone && (
              <a
                href={`https://wa.me/${selectedSubmission.reporter_phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${selectedSubmission.reporter_name || 'Bapak/Ibu'},\n\nKami dari Tim Pengelola / Satgas WBS Taman Margasatwa Ragunan ingin menindaklanjuti laporan pengaduan Anda terkait "${selectedSubmission.reported_person_name ? `Laporan: ${selectedSubmission.reported_person_name}` : 'Laporan WBS'}"...\n\nTerima kasih.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-sm transition-all flex-1 sm:flex-none"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hubungi via WA</span>
              </a>
            )}
            <Button onClick={handleUpdateStatus} disabled={saving} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6 flex-1 sm:flex-none">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <WBSExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        submissions={submissions}
      />
    </div>
  );
}
