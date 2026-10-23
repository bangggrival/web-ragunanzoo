"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceRegistrationTrendChart } from '@/components/services/ServiceRegistrationTrendChart';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { exportServiceRegistrationsToPDF } from '@/utils/serviceRegistrationPdfExport';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  GraduationCap, 
  FlaskConical, 
  Search, 
  Download, 
  Eye, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Calendar as CalendarIcon,
  Mail,
  Phone,
  Building2,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileDown,
  Stethoscope,
  Mic,
  FileArchive,
  Link,
  Save,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { ServiceRegistration } from '@/hooks/useServiceRegistrations';
import { updateRegistrationStatusAction } from './actions';
import { supabase } from '@/integrations/supabase/client';
import { generateServiceDispositionPdf, generateWhatsAppMessageUrl } from '@/utils/serviceDispositionPdf';

// Status configuration
const statusConfig: Record<ServiceRegistration['status'], { 
  label: string; 
  icon: typeof Clock; 
  className: string;
  bgClass: string;
}> = {
  pending: { 
    label: 'Menunggu', 
    icon: Clock, 
    className: 'text-amber-700',
    bgClass: 'bg-amber-100 border-amber-200 hover:bg-amber-200'
  },
  reviewing: { 
    label: 'Ditinjau', 
    icon: Eye, 
    className: 'text-blue-700',
    bgClass: 'bg-blue-100 border-blue-200 hover:bg-blue-200'
  },
  approved: { 
    label: 'Disetujui', 
    icon: CheckCircle, 
    className: 'text-green-700',
    bgClass: 'bg-green-100 border-green-200 hover:bg-green-200'
  },
  rejected: { 
    label: 'Ditolak', 
    icon: XCircle, 
    className: 'text-rose-700',
    bgClass: 'bg-rose-100 border-rose-200 hover:bg-rose-200'
  },
  completed: { 
    label: 'Selesai', 
    icon: CheckCircle2, 
    className: 'text-purple-700',
    bgClass: 'bg-purple-100 border-purple-200 hover:bg-purple-200'
  }
};

// Global audio context to satisfy browser autoplay policies
let globalAudioCtx: AudioContext | null = null;

export default function ManageServiceRegistrationsClient() {
  const [registrations, setRegistrations] = useState<ServiceRegistration[]>([]);
  const { settings } = useSiteSettings();
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<ServiceRegistration | null>(null);
  const [newStatus, setNewStatus] = useState<ServiceRegistration['status']>('pending');
  const [adminNotes, setAdminNotes] = useState('');

  // Filter registrations
  const [isLoading, setIsLoading] = useState(true);

  // Bulletproof fix for Radix UI Dialog freezing the page
  useEffect(() => {
    if (!detailModalOpen && !statusModalOpen) {
      setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 100);
    }
  }, [detailModalOpen, statusModalOpen]);

  // Initialize and unlock audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !globalAudioCtx) {
      try {
        globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error('AudioContext not supported', e);
      }
    }

    const unlockAudio = () => {
      if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume().catch(e => console.error('Audio unlock failed:', e));
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: registrationsData } = await supabase.from('service_registrations').select('*').order('created_at', { ascending: false });
        if (registrationsData) setRegistrations(registrationsData as any);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // Setup realtime subscription via custom window event
    const handleDbChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const change = customEvent.detail;
      
      if (change.table === 'service_registrations') {
        if (change.type === 'INSERT') {
          // Play a "ding" sound
          try {
            if (globalAudioCtx) {
              const playSound = () => {
                const oscillator = globalAudioCtx!.createOscillator();
                const gainNode = globalAudioCtx!.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, globalAudioCtx!.currentTime); // A5
                oscillator.frequency.exponentialRampToValueAtTime(1100, globalAudioCtx!.currentTime + 0.1); 
                
                gainNode.gain.setValueAtTime(0, globalAudioCtx!.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, globalAudioCtx!.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx!.currentTime + 0.5);
                
                oscillator.connect(gainNode);
                gainNode.connect(globalAudioCtx!.destination);
                
                oscillator.start();
                oscillator.stop(globalAudioCtx!.currentTime + 0.5);
              };

              if (globalAudioCtx.state === 'suspended') {
                globalAudioCtx.resume().then(() => {
                  if (globalAudioCtx!.state === 'suspended') {
                    console.warn('Audio blocked by browser. User interaction required.');
                  } else {
                    playSound();
                  }
                }).catch(e => console.error(e));
              } else {
                playSound();
              }
            }
          } catch (e) {
            console.error('Audio playback failed:', e);
          }

          const newRegistration = change.record as ServiceRegistration;
          setRegistrations((prev) => [newRegistration, ...prev]);
          toast.success(`Pendaftaran layanan baru diterima: ${newRegistration.participant_name}`, {
            description: `Program: ${newRegistration.program_type} | Kode: ${newRegistration.tracking_code}`,
            duration: 5000,
          });
        } else if (change.type === 'UPDATE') {
          const updatedRegistration = change.record as ServiceRegistration;
          setRegistrations((prev) =>
            prev.map((reg) => (reg.id === updatedRegistration.id ? updatedRegistration : reg))
          );
        }
      }
    };

    window.addEventListener('supabase-db-change', handleDbChange);

    return () => {
      window.removeEventListener('supabase-db-change', handleDbChange);
    };
  }, []);

  const filteredRegistrations = registrations.filter(reg => {
    const query = debouncedSearchQuery.toLowerCase();
    const matchesSearch = !query || Object.values(reg).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(query)
    );
    
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    const matchesProgram = filterProgram === 'all' || reg.program_type === filterProgram;
    
    // Date range filter
    const regDate = new Date(reg.created_at);
    const matchesStartDate = !startDate || regDate >= startDate;
    const matchesEndDate = !endDate || regDate <= new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1); // Include entire end day
    
    return matchesSearch && matchesStatus && matchesProgram && matchesStartDate && matchesEndDate;
  });

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Date presets
  const setDatePreset = (preset: 'today' | 'week' | 'month' | '3months' | 'year') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (preset) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        setStartDate(weekStart);
        setEndDate(today);
        break;
      }
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(monthStart);
        setEndDate(today);
        break;
      }
      case '3months': {
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        setStartDate(threeMonthsAgo);
        setEndDate(today);
        break;
      }
      case 'year': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        setStartDate(yearStart);
        setEndDate(today);
        break;
      }
    }
  };

  // Stats
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    reviewing: registrations.filter(r => r.status === 'reviewing').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    pkl: registrations.filter(r => r.program_type === 'pkl').length,
    research: registrations.filter(r => r.program_type === 'research').length,
  };

  const handleViewDetail = (registration: ServiceRegistration) => {
    setSelectedRegistration(registration);
    setDetailModalOpen(true);
  };

  const handleOpenStatusModal = (registration: ServiceRegistration) => {
    setSelectedRegistration(registration);
    setNewStatus(registration.status);
    setAdminNotes(registration.admin_notes || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRegistration) return;
    
    setSavingStatus(true);
    try {
      const result = await updateRegistrationStatusAction(
        selectedRegistration.id,
        newStatus,
        adminNotes
      );
      
      if (!result.success) throw new Error(result.error);
      
      toast.success('Status berhasil diperbarui');
      
      setRegistrations(prev => prev.map(r => 
        r.id === selectedRegistration.id 
          ? { ...r, status: newStatus, admin_notes: adminNotes, reviewed_at: new Date().toISOString() } 
          : r
      ));
      
      setStatusModalOpen(false);
      // Do not set selectedRegistration to null here to allow Radix Dialog exit animation to complete cleanly
    } catch (error: any) {
      toast.error('Gagal memperbarui status: ' + error.message);
    } finally {
      setSavingStatus(false);
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    if (!filteredRegistrations.length) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const XLSX = await import('xlsx');

    const exportData = filteredRegistrations.map(reg => ({
      'Kode Tracking': reg.tracking_code,
      'Jenis Program': reg.program_type === 'pkl' ? 'PKL' : reg.program_type === 'research' ? 'Penelitian' : reg.program_type === 'koas' ? 'Koas' : 'Wawancara',
      'Nama Peserta': reg.participant_name,
      'NIM/NIS': reg.participant_nim || '-',
      'Email': reg.participant_email,
      'Telepon': reg.participant_phone,
      'Institusi': reg.institution_name,
      'Program Studi': reg.study_program || '-',
      'Judul Penelitian': reg.research_title || '-',
      'Tanggal Mulai': format(new Date(reg.start_date), 'dd/MM/yyyy'),
      'Tanggal Selesai': format(new Date(reg.end_date), 'dd/MM/yyyy'),
      'Status': statusConfig[reg.status].label,
      'Catatan Admin': reg.admin_notes || '-',
      'Tanggal Daftar': format(new Date(reg.created_at), 'dd/MM/yyyy HH:mm'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendaftaran Layanan');
    
    // Set column widths
    const colWidths = [
      { wch: 18 }, // Kode Tracking
      { wch: 12 }, // Jenis Program
      { wch: 25 }, // Nama Peserta
      { wch: 15 }, // NIM
      { wch: 30 }, // Email
      { wch: 15 }, // Telepon
      { wch: 30 }, // Institusi
      { wch: 20 }, // Program Studi
      { wch: 40 }, // Judul Penelitian
      { wch: 12 }, // Tanggal Mulai
      { wch: 12 }, // Tanggal Selesai
      { wch: 12 }, // Status
      { wch: 40 }, // Catatan Admin
      { wch: 18 }, // Tanggal Daftar
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `Pendaftaran_Layanan_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Data berhasil diekspor ke Excel');
  };

  // Export to PDF
  const handleExportPdf = async () => {
    if (!filteredRegistrations.length) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    setIsExportingPdf(true);
    try {
      await exportServiceRegistrationsToPDF(filteredRegistrations, {
        includeLogo: true,
        logoUrl: settings?.logo_url || undefined,
        organizationName: settings?.site_name || 'Taman Margasatwa Ragunan',
        dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
        detailed: true,
      });
      toast.success('Laporan PDF berhasil diunduh');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Gagal mengekspor ke PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const StatusBadge = ({ status }: { status: ServiceRegistration['status'] }) => {
    const config = statusConfig[status];
    const Icon = config.icon as any;
    return (
      <Badge className={`${config.bgClass} ${config.className} border flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold shadow-sm transition-colors`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    );
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
            </div>
            Pendaftaran Layanan
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola pendaftaran magang, penelitian, koas, dan wawancara</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl font-bold border-slate-200 bg-white hover:bg-slate-50 hover:text-green-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="rounded-xl font-bold border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button 
            onClick={handleExportPdf} 
            disabled={isExportingPdf}
            variant="outline" 
            className="rounded-xl font-bold border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
          </div>
          <div className="text-3xl font-black text-slate-800 tracking-tight">{stats.total}</div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl border border-amber-200/60 p-5 rounded-[1.5rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-full -z-10" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Menunggu</p>
          </div>
          <div className="text-3xl font-black text-amber-700 tracking-tight">{stats.pending}</div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl border border-blue-200/60 p-5 rounded-[1.5rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-full -z-10" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Ditinjau</p>
          </div>
          <div className="text-3xl font-black text-blue-700 tracking-tight">{stats.reviewing}</div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl border border-green-200/60 p-5 rounded-[1.5rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/50 rounded-bl-full -z-10" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Disetujui</p>
          </div>
          <div className="text-3xl font-black text-green-700 tracking-tight">{stats.approved}</div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PKL</p>
          </div>
          <div className="text-3xl font-black text-slate-800 tracking-tight">{stats.pkl}</div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-[1.5rem] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penelitian</p>
          </div>
          <div className="text-3xl font-black text-slate-800 tracking-tight">{stats.research}</div>
        </div>
      </div>

      {/* Trend Charts - Pass filtered data */}
      {filteredRegistrations.length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm overflow-hidden p-2">
          <ServiceRegistrationTrendChart registrations={filteredRegistrations} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[2rem] shadow-sm space-y-5">
        {/* Search and Status/Program Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari kode tracking, nama, institusi, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-white border-slate-200 rounded-xl font-medium shadow-sm"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[180px] h-12 bg-white border-slate-200 rounded-xl font-bold shadow-sm">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all" className="font-bold">Semua Status</SelectItem>
              <SelectItem value="pending" className="font-bold text-amber-700">Menunggu</SelectItem>
              <SelectItem value="reviewing" className="font-bold text-blue-700">Ditinjau</SelectItem>
              <SelectItem value="approved" className="font-bold text-green-700">Disetujui</SelectItem>
              <SelectItem value="rejected" className="font-bold text-rose-700">Ditolak</SelectItem>
              <SelectItem value="completed" className="font-bold text-purple-700">Selesai</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterProgram} onValueChange={setFilterProgram}>
            <SelectTrigger className="w-full md:w-[180px] h-12 bg-white border-slate-200 rounded-xl font-bold shadow-sm">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all" className="font-bold">Semua Program</SelectItem>
              <SelectItem value="pkl" className="font-bold">PKL / Magang</SelectItem>
              <SelectItem value="research" className="font-bold">Penelitian</SelectItem>
              <SelectItem value="koas" className="font-bold">Koas</SelectItem>
              <SelectItem value="interview" className="font-bold">Wawancara</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col gap-4 p-4 bg-slate-50/80 rounded-[1.5rem] border border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-2">Filter Cepat:</span>
            <Button
              variant={startDate && endDate && startDate.toDateString() === endDate.toDateString() && startDate.toDateString() === new Date().toDateString() ? "default" : "outline"}
              size="sm"
              onClick={() => setDatePreset('today')}
              className={cn("rounded-lg font-bold", startDate && endDate && startDate.toDateString() === endDate.toDateString() && startDate.toDateString() === new Date().toDateString() ? "bg-green-600 text-white hover:bg-green-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100")}
            >
              Hari Ini
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset('week')}
              className="rounded-lg font-bold bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              Minggu Ini
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset('month')}
              className="rounded-lg font-bold bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              Bulan Ini
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset('3months')}
              className="rounded-lg font-bold bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              3 Bulan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDatePreset('year')}
              className="rounded-lg font-bold bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              Tahun Ini
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Rentang Kustom:</span>
            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-bold rounded-xl h-10 bg-white shadow-sm",
                    !startDate ? "text-slate-400 border-slate-200" : "text-green-700 border-green-200 bg-green-50/50"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd MMM yyyy", { locale: idLocale }) : "Dari tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                  locale={idLocale}
                />
              </PopoverContent>
            </Popover>

            <span className="text-slate-300 font-bold">—</span>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-bold rounded-xl h-10 bg-white shadow-sm",
                    !endDate ? "text-slate-400 border-slate-200" : "text-green-700 border-green-200 bg-green-50/50"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd MMM yyyy", { locale: idLocale }) : "Sampai tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                  className="pointer-events-auto"
                  locale={idLocale}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Date Filter Button */}
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDateFilter}
                className="h-10 px-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold"
              >
                <X className="h-4 w-4 mr-1.5" />
                Reset
              </Button>
            )}
            
            {/* Date filter info */}
            {(startDate || endDate) && (
              <span className="text-sm font-medium text-slate-500 ml-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                <span className="font-bold text-slate-800">{filteredRegistrations.length}</span> hasil
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm overflow-hidden">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <AlertCircle className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-bold text-slate-700 text-lg">Tidak ada data pendaftaran</p>
            <p className="text-slate-500 font-medium mt-1">Coba sesuaikan filter pencarian Anda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 w-[160px] pl-6 whitespace-nowrap">Kode Tracking</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 whitespace-nowrap min-w-[100px]">Program</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 min-w-[150px]">Nama Peserta</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 min-w-[150px]">Institusi</TableHead>
                  <TableHead className="hidden lg:table-cell font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 whitespace-nowrap">Periode</TableHead>
                  <TableHead className="font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 whitespace-nowrap">Status</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 whitespace-nowrap">Tanggal Daftar</TableHead>
                  <TableHead className="text-right font-bold text-slate-500 text-[11px] uppercase tracking-wider h-14 pr-6 sticky right-0 z-10 bg-slate-50/95 backdrop-blur shadow-[-4px_0_10px_rgba(0,0,0,0.02)] whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-700 bg-slate-100/80 px-2 py-1 rounded inline-block text-xs border border-slate-200/60">
                        {reg.tracking_code}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {reg.program_type === 'pkl' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
                          <GraduationCap className="w-3.5 h-3.5" /> PKL
                        </div>
                      )}
                      {reg.program_type === 'research' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/60">
                          <FlaskConical className="w-3.5 h-3.5" /> Penelitian
                        </div>
                      )}
                      {reg.program_type === 'koas' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/60">
                          <Stethoscope className="w-3.5 h-3.5" /> Koas
                        </div>
                      )}
                      {reg.program_type === 'interview' && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200/60">
                          <Mic className="w-3.5 h-3.5" /> Wawancara
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-700 text-sm max-w-[200px] break-words">{reg.participant_name}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm font-medium text-slate-600 max-w-[250px] break-words">
                        {reg.institution_name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      <div className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg inline-block border border-slate-200/60 font-medium">
                        {format(new Date(reg.start_date), 'dd MMM yyyy', { locale: idLocale })} - {format(new Date(reg.end_date), 'dd MMM yyyy', { locale: idLocale })}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={reg.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs font-medium text-slate-500 whitespace-nowrap">
                      {format(new Date(reg.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                    </TableCell>
                    <TableCell className="text-right pr-6 sticky right-0 z-10 bg-white/95 backdrop-blur shadow-[-4px_0_10px_rgba(0,0,0,0.02)] group-hover:bg-slate-50/95 transition-colors">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 border border-transparent hover:border-green-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-100 shadow-xl p-1">
                          <DropdownMenuItem onClick={() => { setSelectedRegistration(reg); setDetailModalOpen(true); }} className="rounded-lg font-bold text-slate-700 focus:bg-slate-50 focus:text-green-600 cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedRegistration(reg); setNewStatus(reg.status); setStatusModalOpen(true); }} className="rounded-lg font-bold text-slate-700 focus:bg-slate-50 focus:text-green-600 cursor-pointer">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => generateServiceDispositionPdf(reg)} className="rounded-lg font-bold text-slate-700 focus:bg-slate-50 focus:text-emerald-600 cursor-pointer">
                            <FileDown className="w-4 h-4 mr-2 text-emerald-600" />
                            Surat Disposisi (PDF)
                          </DropdownMenuItem>
                          {reg.participant_phone && (
                            <DropdownMenuItem 
                              onClick={() => window.open(generateWhatsAppMessageUrl(reg.participant_phone, reg), '_blank')} 
                              className="rounded-lg font-bold text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800 cursor-pointer"
                            >
                              <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" />
                              Kirim Notifikasi WA
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-800">Detail Pendaftaran</DialogTitle>
                  <DialogDescription className="font-mono text-xs font-bold text-slate-500 mt-1">
                    {selectedRegistration?.tracking_code}
                  </DialogDescription>
                </div>
              </div>
              {selectedRegistration && (
                <StatusBadge status={selectedRegistration.status} />
              )}
            </div>
          </DialogHeader>
          
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {selectedRegistration && (
              <div className="space-y-8">
                {/* Info Box */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Program</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      {selectedRegistration.program_type === 'pkl' && <><GraduationCap className="w-4 h-4 text-blue-500" /> PKL</>}
                      {selectedRegistration.program_type === 'research' && <><FlaskConical className="w-4 h-4 text-purple-500" /> Penelitian</>}
                      {selectedRegistration.program_type === 'koas' && <><Stethoscope className="w-4 h-4 text-orange-500" /> Koas</>}
                      {selectedRegistration.program_type === 'interview' && <><Mic className="w-4 h-4 text-green-500" /> Wawancara</>}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Mulai</p>
                    <p className="font-bold text-slate-800">{format(new Date(selectedRegistration.start_date), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Selesai</p>
                    <p className="font-bold text-slate-800">{format(new Date(selectedRegistration.end_date), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Daftar</p>
                    <p className="font-bold text-slate-800">{format(new Date(selectedRegistration.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Participant Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <User className="w-4 h-4 text-green-500" />
                      Data Peserta
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</p>
                        <p className="font-semibold text-slate-800">{selectedRegistration.participant_name}</p>
                      </div>
                      {selectedRegistration.participant_nim && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NIM/NIS</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.participant_nim}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</p>
                        <a href={`mailto:${selectedRegistration.participant_email}`} className="font-semibold text-green-600 hover:underline flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {selectedRegistration.participant_email}
                        </a>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telepon</p>
                        <a href={`tel:${selectedRegistration.participant_phone}`} className="font-semibold text-green-600 hover:underline flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedRegistration.participant_phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Institution Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Building2 className="w-4 h-4 text-green-500" />
                      Data Institusi
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Institusi</p>
                        <p className="font-semibold text-slate-800">{selectedRegistration.institution_name}</p>
                      </div>
                      {selectedRegistration.study_program && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Program Studi</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.study_program}</p>
                        </div>
                      )}
                      {selectedRegistration.institution_email && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Institusi</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.institution_email}</p>
                        </div>
                      )}
                      {selectedRegistration.institution_phone && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telepon Institusi</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.institution_phone}</p>
                        </div>
                      )}
                      {selectedRegistration.institution_address && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat</p>
                          <p className="font-semibold text-slate-800 text-sm leading-relaxed">{selectedRegistration.institution_address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specific Program Info */}
                {selectedRegistration.program_type === 'research' && selectedRegistration.research_title && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <FlaskConical className="w-4 h-4 text-green-500" />
                      Data Penelitian
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Judul Penelitian</p>
                        <p className="font-semibold text-slate-800 italic">"{selectedRegistration.research_title}"</p>
                      </div>
                      {selectedRegistration.participant_count && selectedRegistration.participant_count > 1 && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Peserta/Tim</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.participant_count} Orang</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRegistration.program_type === 'koas' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Stethoscope className="w-4 h-4 text-green-500" />
                      Data Koas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedRegistration.faculty && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fakultas</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.faculty}</p>
                        </div>
                      )}
                      {selectedRegistration.rotation_department && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Departemen Stase</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.rotation_department}</p>
                        </div>
                      )}
                      {selectedRegistration.supervisor_name && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Pembimbing</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.supervisor_name}</p>
                        </div>
                      )}
                      {selectedRegistration.supervisor_phone && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Telp Pembimbing</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.supervisor_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedRegistration.program_type === 'interview' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Mic className="w-4 h-4 text-green-500" />
                      Data Wawancara / Liputan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedRegistration.media_organization && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Organisasi Media</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.media_organization}</p>
                        </div>
                      )}
                      {selectedRegistration.interview_topic && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Topik Wawancara</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.interview_topic}</p>
                        </div>
                      )}
                      {selectedRegistration.target_interviewee && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Narasumber Tujuan</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.target_interviewee}</p>
                        </div>
                      )}
                      {selectedRegistration.equipment_used && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peralatan yang Digunakan</p>
                          <p className="font-semibold text-slate-800">{selectedRegistration.equipment_used}</p>
                        </div>
                      )}
                      {(selectedRegistration.interview_date || selectedRegistration.interview_time) && (
                        <div className="sm:col-span-2 bg-white p-3 rounded-lg border border-slate-200 inline-block">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Waktu Pelaksanaan</p>
                          <p className="font-bold text-green-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {selectedRegistration.interview_date && format(new Date(selectedRegistration.interview_date), 'dd MMMM yyyy', { locale: idLocale })}
                            {selectedRegistration.interview_date && selectedRegistration.interview_time && ' Pukul '}
                            {selectedRegistration.interview_time}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <FileArchive className="w-4 h-4 text-green-500" />
                    Dokumen Pendukung
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRegistration.cover_letter_url ? (
                      <a 
                        href={selectedRegistration.cover_letter_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">Surat Pengantar</p>
                          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1"><Link className="w-3 h-3" /> Buka Dokumen</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl opacity-60">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <X className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-500">Surat Pengantar</p>
                          <p className="text-[10px] font-medium text-slate-400">Tidak dilampirkan</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedRegistration.proposal_url ? (
                      <a 
                        href={selectedRegistration.proposal_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">Proposal Kegiatan</p>
                          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1"><Link className="w-3 h-3" /> Buka Dokumen</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl opacity-60">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <X className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-500">Proposal</p>
                          <p className="text-[10px] font-medium text-slate-400">Tidak dilampirkan</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedRegistration.student_id_url && (
                      <a 
                        href={selectedRegistration.student_id_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">KTM / KTP</p>
                          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1"><Link className="w-3 h-3" /> Buka Dokumen</p>
                        </div>
                      </a>
                    )}
                    
                    {selectedRegistration.recommendation_letter_url && (
                      <a 
                        href={selectedRegistration.recommendation_letter_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">Surat Rekomendasi</p>
                          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1"><Link className="w-3 h-3" /> Buka Dokumen</p>
                        </div>
                      </a>
                    )}
                    
                    {selectedRegistration.journalist_id_url && (
                      <a 
                        href={selectedRegistration.journalist_id_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">Kartu Pers / ID Card</p>
                          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1"><Link className="w-3 h-3" /> Buka Dokumen</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Admin Notes Box */}
                {selectedRegistration.admin_notes && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Catatan Admin
                    </h4>
                    <p className="text-sm font-medium text-amber-900 leading-relaxed">
                      {selectedRegistration.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 gap-3 mt-auto flex-wrap sm:flex-nowrap">
            <Button variant="outline" onClick={() => setDetailModalOpen(false)} className="rounded-xl font-bold border-slate-200 bg-white hover:bg-slate-50 flex-1 sm:flex-none">
              Tutup
            </Button>
            {selectedRegistration && (
              <Button
                variant="outline"
                onClick={() => generateServiceDispositionPdf(selectedRegistration)}
                className="rounded-xl font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Surat Disposisi (PDF)</span>
              </Button>
            )}
            {selectedRegistration?.participant_phone && (
              <a
                href={generateWhatsAppMessageUrl(selectedRegistration.participant_phone, selectedRegistration)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-sm transition-all flex-1 sm:flex-none"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim WA</span>
              </a>
            )}
            <Button 
              onClick={() => {
                setDetailModalOpen(false);
                handleOpenStatusModal(selectedRegistration!);
              }}
              className="rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 flex-1 sm:flex-none"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="max-w-md p-0 gap-0 rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              Update Status Pendaftaran
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            {selectedRegistration && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peserta</p>
                  <p className="font-bold text-slate-800">{selectedRegistration.participant_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tracking Code</p>
                  <p className="font-mono text-sm font-bold text-slate-700">{selectedRegistration.tracking_code}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Status <span className="text-rose-500">*</span></Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ServiceRegistration['status'])}>
                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon as any;
                    return (
                      <SelectItem key={key} value={key} className="py-2.5 cursor-pointer">
                        <div className="flex items-center gap-2 font-bold">
                          <Icon className={cn("w-4 h-4", config.className)} />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Catatan untuk Pemohon (Opsional)</Label>
                {newStatus === 'rejected' && (
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Wajib Diisi</span>
                )}
              </div>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={newStatus === 'rejected' ? 'Berikan alasan penolakan...' : 'Tambahkan pesan atau instruksi selanjutnya...'}
                className="bg-slate-50 border-slate-200 rounded-xl font-medium text-sm resize-none min-h-[120px]"
                required={newStatus === 'rejected'}
              />
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                Catatan ini dapat dilihat oleh pemohon saat mengecek status pendaftaran.
              </p>
            </div>
          </div>
          
          <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 gap-3">
            <Button variant="outline" onClick={() => setStatusModalOpen(false)} className="rounded-xl font-bold border-slate-200 bg-white hover:bg-slate-50 flex-1 sm:flex-none">
              Batal
            </Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={savingStatus || (newStatus === 'rejected' && !adminNotes.trim())}
              className="rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 flex-1 sm:flex-none"
            >
              {savingStatus ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Simpan Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
