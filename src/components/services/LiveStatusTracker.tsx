'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Building2, 
  Calendar, 
  User, 
  MessageSquare, 
  Printer, 
  Share2, 
  Copy, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Check,
  PhoneCall
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCheckRegistrationStatus, ServiceRegistration } from '@/hooks/useServiceRegistrations';

interface LiveStatusTrackerProps {
  initialTrackingCode?: string | null;
  onApplyNew?: () => void;
  className?: string;
}

export default function LiveStatusTracker({
  initialTrackingCode = null,
  onApplyNew,
  className = '',
}: LiveStatusTrackerProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [inputCode, setInputCode] = useState(initialTrackingCode || '');
  const [activeSearchCode, setActiveSearchCode] = useState<string | null>(initialTrackingCode);

  // Sync if initialTrackingCode changes
  useEffect(() => {
    if (initialTrackingCode) {
      setInputCode(initialTrackingCode);
      setActiveSearchCode(initialTrackingCode);
    }
  }, [initialTrackingCode]);

  const { 
    data: registration, 
    isLoading, 
    error 
  } = useCheckRegistrationStatus(activeSearchCode);

  const handleSearch = (codeToSearch?: string) => {
    const target = (codeToSearch || inputCode).trim().toUpperCase();
    if (!target) {
      toast.error(isEn ? 'Please enter a tracking code' : 'Masukkan kode pelacakan terlebih dahulu');
      return;
    }
    setInputCode(target);
    setActiveSearchCode(target);
  };

  const handleCopyCode = () => {
    if (registration?.tracking_code) {
      navigator.clipboard.writeText(registration.tracking_code);
      toast.success(isEn ? 'Tracking code copied!' : 'Kode pelacakan berhasil disalin!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleContactAdmin = () => {
    const text = `Halo Admin Layanan Pendidikan UP TMR, saya ingin menanyakan progres pengajuan dengan Kode: ${activeSearchCode || '-'}`;
    const url = `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Demo / sample tracking codes to make testing instant and delightful
  const demoCodes = [
    { label: 'Demo PKL (Baru)', code: 'PKL-DEMO-2601', sampleStatus: 'pending' },
    { label: 'Demo Riset (Ditinjau)', code: 'RES-DEMO-2602', sampleStatus: 'reviewing' },
    { label: 'Demo Koas (Disetujui)', code: 'KOA-DEMO-2603', sampleStatus: 'approved' },
  ];

  // Map 5 stages for the visual timeline
  const stages = [
    {
      id: 'pending',
      stepNum: 1,
      title: isEn ? 'Application Submitted' : 'Pendaftaran Diterima',
      desc: isEn ? 'Document entered into system' : 'Dokumen berhasil tersimpan di sistem UP TMR',
      icon: Clock,
    },
    {
      id: 'reviewing',
      stepNum: 2,
      title: isEn ? 'Document Verification' : 'Verifikasi Berkas & Administrasi',
      desc: isEn ? 'Reviewing qualifications & proposal' : 'Penelaahan kelayakan proposal & kelengkapan syarat',
      icon: FileText,
    },
    {
      id: 'approved',
      stepNum: 3,
      title: isEn ? 'Head Office Approval' : 'Persetujuan Kepala UP TMR',
      desc: isEn ? 'Official confirmation & quota assignment' : 'Persetujuan resmi dan alokasi unit penempatan',
      icon: CheckCircle2,
    },
    {
      id: 'ready',
      stepNum: 4,
      title: isEn ? 'Official Letter Issued' : 'Penerbitan Surat Keterangan / Balasan',
      desc: isEn ? 'Letter ready for pick-up / download' : 'Surat balasan resmi untuk kampus/sekolah selesai',
      icon: FileCheck,
    },
    {
      id: 'completed',
      stepNum: 5,
      title: isEn ? 'Program Completed' : 'Pelaksanaan Selesai',
      desc: isEn ? 'Reporting & certificate finalized' : 'Penyerahan laporan akhir dan sertifikat kegiatan',
      icon: Sparkles,
    },
  ];

  // Helper to determine current stage index (0-4)
  const getActiveStageIndex = (status?: ServiceRegistration['status'] | string) => {
    if (!status) return 0;
    switch (status) {
      case 'pending': return 0;
      case 'reviewing': return 1;
      case 'approved': return 2;
      case 'completed': return 4;
      case 'rejected': return 2; // handled with special error card
      default: return 0;
    }
  };

  const isRejected = registration?.status === 'rejected';
  const activeStageIndex = getActiveStageIndex(registration?.status);

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Search Input Card */}
      <div className="rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {isEn ? 'Live Status Tracker' : 'Pelacakan Status Pengajuan Berkas'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isEn 
              ? 'Enter your tracking code from your submission pass (e.g. PKL-260913-9K2L) to view real-time progress.'
              : 'Masukkan kode pelacakan dari tanda terima pendaftaran Anda untuk memantau proses verifikasi secara real-time.'}
          </p>
        </div>

        {/* Input Bar */}
        <div className="max-w-xl mx-auto">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Contoh: PKL-260913-9K2L"
                className="w-full py-3.5 pl-4 pr-10 rounded-2xl bg-muted/60 border border-border/80 font-mono text-sm sm:text-base font-bold tracking-wider placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all uppercase"
              />
              {inputCode && (
                <button
                  onClick={() => setInputCode('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="px-5 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isEn ? 'Track' : 'Lacak'}</span>
            </button>
          </div>

          {/* Quick Demo Codes */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center mt-3 text-[11px] text-muted-foreground">
            <span>{isEn ? 'Quick test code:' : 'Atau coba kode tes:'}</span>
            {demoCodes.map((demo) => (
              <button
                key={demo.code}
                onClick={() => {
                  setInputCode(demo.code);
                  handleSearch(demo.code);
                }}
                className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors font-mono font-medium border border-border/70"
              >
                {demo.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-12 rounded-3xl bg-card border border-border/70 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold text-muted-foreground">
            {isEn ? 'Checking verification records in database...' : 'Menghubungkan ke basis data UP TMR...'}
          </p>
        </div>
      )}

      {/* Result Section */}
      {activeSearchCode && !isLoading && (
        <>
          {registration ? (
            <div className="rounded-3xl bg-card border border-border/80 shadow-md overflow-hidden transition-all duration-300">
              
              {/* Header Status Bar */}
              <div className="px-6 py-5 bg-muted/40 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-mono font-black text-sm">
                    RGZ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base sm:text-lg font-black text-foreground">
                        {registration.tracking_code}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-1 rounded-md text-muted-foreground hover:text-primary"
                        title="Salin Kode"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isEn ? 'Registered on' : 'Diajukan pada'}{' '}
                      {format(new Date(registration.created_at), 'dd MMMM yyyy, HH:mm', { locale: isEn ? enUS : idLocale })}
                    </p>
                  </div>
                </div>

                <div>
                  {isRejected ? (
                    <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>{isEn ? 'Application Rejected / Revision' : 'Perlu Perbaikan / Ditolak'}</span>
                    </Badge>
                  ) : registration.status === 'completed' ? (
                    <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>{isEn ? 'Program Completed' : 'Kegiatan Selesai'}</span>
                    </Badge>
                  ) : registration.status === 'approved' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isEn ? 'Approved by UP TMR' : 'Disetujui UP TMR'}</span>
                    </Badge>
                  ) : registration.status === 'reviewing' ? (
                    <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>{isEn ? 'Under Review' : 'Sedang Ditinjau'}</span>
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{isEn ? 'Pending Review' : 'Menunggu Verifikasi'}</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* 5-Stage Visual Stepper Timeline */}
              <div className="p-6 md:p-8 bg-background border-b border-border/70">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-6">
                  {isEn ? 'Progress Timeline' : 'Tahapan Verifikasi Pengajuan'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                  {stages.map((stage, idx) => {
                    const isPassed = !isRejected && idx < activeStageIndex;
                    const isCurrent = !isRejected && idx === activeStageIndex;
                    const isFuture = !isRejected && idx > activeStageIndex;
                    const StageIcon = stage.icon;

                    return (
                      <div key={stage.id} className="flex md:flex-col items-start gap-3 md:gap-2 relative">
                        
                        {/* Step Marker */}
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 ${
                            isPassed
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md animate-pulse'
                                : isRejected && idx === 2
                                  ? 'bg-red-500 text-white'
                                  : 'bg-muted text-muted-foreground'
                          }`}>
                            {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>

                          {/* Connecting Line (Desktop) */}
                          {idx < 4 && (
                            <div className={`hidden md:block flex-1 h-1 rounded-full ${
                              isPassed ? 'bg-emerald-500' : 'bg-muted'
                            }`} />
                          )}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 md:mt-1">
                          <p className={`font-bold text-xs sm:text-sm leading-tight ${
                            isCurrent ? 'text-primary' : isPassed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {stage.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed hidden sm:block">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Information Grid */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Admin Feedback Box (If Any) */}
                {registration.admin_notes && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <MessageSquare className="w-4 h-4" />
                      <span>{isEn ? 'Official Officer Notes:' : 'Catatan Petugas UP TMR:'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 font-medium pl-5.5">
                      {registration.admin_notes}
                    </p>
                  </div>
                )}

                {/* Rejection Alert */}
                {isRejected && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-800 dark:text-red-300">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <p className="font-bold">
                        {isEn ? 'Application Requires Revision / Incomplete' : 'Permohonan Belum Dapat Disetujui'}
                      </p>
                      <p className="mt-0.5 opacity-90">
                        {registration.admin_notes || (isEn 
                          ? 'Please contact our education coordinator for further details and revision assistance.'
                          : 'Silakan hubungi bagian Pendidikan & Kerja Sama UP TMR untuk panduan perbaikan dokumen.')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>{isEn ? 'Applicant Name' : 'Nama Lengkap'}</span>
                    </div>
                    <p className="font-bold text-sm text-foreground">{registration.participant_name}</p>
                    {registration.participant_nim && (
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        NIM/NIS: {registration.participant_nim}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>{isEn ? 'Institution' : 'Asal Sekolah / Kampus'}</span>
                    </div>
                    <p className="font-bold text-sm text-foreground truncate">{registration.institution_name}</p>
                    {registration.study_program && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Prodi: {registration.study_program}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{isEn ? 'Period & Duration' : 'Periode Pengajuan'}</span>
                    </div>
                    <p className="font-bold text-sm text-foreground">
                      {format(new Date(registration.start_date), 'dd MMM yyyy', { locale: isEn ? enUS : idLocale })}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      s/d {format(new Date(registration.end_date), 'dd MMM yyyy', { locale: isEn ? enUS : idLocale })}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/70">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-card border border-border text-xs font-semibold text-foreground transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-primary" />
                      <span>{isEn ? 'Print Slip' : 'Cetak Bukti'}</span>
                    </button>
                    <button
                      onClick={handleContactAdmin}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{isEn ? 'WhatsApp Helpdesk' : 'Hubungi Petugas'}</span>
                    </button>
                  </div>

                  {onApplyNew && (
                    <button
                      onClick={onApplyNew}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {isEn ? 'Submit another application' : 'Daftar pengajuan baru'} →
                    </button>
                  )}
                </div>

              </div>

            </div>
          ) : (
            /* Not Found State */
            <div className="p-8 md:p-12 rounded-3xl bg-card border border-border/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {isEn ? 'Tracking Code Not Found' : 'Kode Pelacakan Tidak Ditemukan'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isEn
                    ? `We could not find any records for "${activeSearchCode}". Please verify your code spelling or try our test demo code above.`
                    : `Data pengajuan dengan kode "${activeSearchCode}" tidak tercatat di sistem. Pastikan format penulisan sudah benar (contoh: PKL-260913-9K2L).`}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setInputCode('')}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-card border border-border text-xs font-semibold text-foreground transition-colors"
                >
                  {isEn ? 'Clear Input' : 'Hapus Pencarian'}
                </button>
                <button
                  onClick={handleContactAdmin}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Ask Helpdesk' : 'Tanya Petugas via WhatsApp'}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
