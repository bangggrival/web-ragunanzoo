'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  GraduationCap, 
  FlaskConical, 
  Stethoscope, 
  Mic, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Printer, 
  Share2, 
  Sparkles, 
  Building2, 
  User, 
  ShieldCheck,
  Search,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export interface DigitalSubmissionPassProps {
  trackingCode: string;
  applicantName: string;
  institutionName: string;
  programType: 'pkl' | 'research' | 'koas' | 'interview';
  startDate?: string;
  endDate?: string;
  submittedAt?: string;
  onTrackStatus?: () => void;
  onNewRegistration?: () => void;
  className?: string;
}

export default function DigitalSubmissionPass({
  trackingCode,
  applicantName,
  institutionName,
  programType,
  startDate,
  endDate,
  submittedAt,
  onTrackStatus,
  onNewRegistration,
  className = '',
}: DigitalSubmissionPassProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const programConfig = {
    pkl: {
      label: isEn ? 'Internship & Field Practice (PKL)' : 'Praktik Kerja Lapangan (PKL) / Magang',
      icon: GraduationCap,
      color: 'emerald',
      badgeClass: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      headerBg: 'from-emerald-700 to-emerald-900',
    },
    research: {
      label: isEn ? 'Academic Research (Thesis/Dissertation)' : 'Penelitian & Riset Akademik',
      icon: FlaskConical,
      color: 'blue',
      badgeClass: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30',
      headerBg: 'from-blue-700 to-blue-900',
    },
    koas: {
      label: isEn ? 'Veterinary Clinical Rotation (Koas)' : 'Kepaniteraan Klinik (Koas Dokter Hewan)',
      icon: Stethoscope,
      color: 'teal',
      badgeClass: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30',
      headerBg: 'from-teal-700 to-teal-900',
    },
    interview: {
      label: isEn ? 'Media Interview & News Coverage' : 'Wawancara & Liputan Media',
      icon: Mic,
      color: 'amber',
      badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
      headerBg: 'from-amber-700 to-amber-900',
    },
  };

  const currentProg = programConfig[programType] || programConfig.pkl;
  const ProgIcon = currentProg.icon;

  const dateNow = submittedAt || new Intl.DateTimeFormat(isEn ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trackingCode);
    toast.success(isEn ? 'Tracking code copied to clipboard!' : 'Kode pelacakan berhasil disalin!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*BUKTI PENDAFTARAN LAYANAN PUBLIK UP TMR*\n` +
      `No. Pelacakan: ${trackingCode}\n` +
      `Program: ${currentProg.label}\n` +
      `Pemohon: ${applicantName}\n` +
      `Institusi: ${institutionName}\n` +
      `Tanggal Pengajuan: ${dateNow}\n` +
      `Status: Pendaftaran Diterima (Proses Verifikasi)\n\n` +
      `Lacak status secara live di: https://ragunanzoo.jakarta.go.id/services?track=${trackingCode}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const qrValue = `https://ragunanzoo.jakarta.go.id/services?track=${trackingCode}`;

  return (
    <div className={`space-y-5 max-w-2xl mx-auto ${className}`}>
      
      {/* Visual Digital Boarding Pass */}
      <div 
        id="digital-service-pass"
        className="relative bg-card rounded-3xl border border-border/80 shadow-2xl overflow-hidden transition-all duration-300 print:border-none print:shadow-none"
      >
        {/* Pass Header Banner */}
        <div className={`bg-gradient-to-r ${currentProg.headerBg} p-6 text-white relative overflow-hidden`}>
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/25">
                <ProgIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                    {isEn ? 'Official Digital Pass' : 'Tanda Terima Resmi'}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight mt-0.5">
                  UP Taman Margasatwa Ragunan
                </h3>
              </div>
            </div>

            <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 text-right">
              <span className="block text-[10px] text-white/75 font-medium uppercase">
                {isEn ? 'Service Fee' : 'Tarif Layanan'}
              </span>
              <span className="font-black text-xs sm:text-sm text-emerald-300">
                {isEn ? 'FREE (Rp 0)' : 'GRATIS (Rp 0)'}
              </span>
            </div>
          </div>
        </div>

        {/* Pass Body Content */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Main Verification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Left 2 Cols: Details */}
            <div className="md:col-span-2 space-y-4">
              
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
                  {isEn ? 'Tracking Code / ID Registrasi' : 'Kode Pelacakan Pengajuan'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-primary tracking-wider select-all">
                    {trackingCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                    title={isEn ? 'Copy tracking code' : 'Salin kode pelacakan'}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isEn ? 'Keep this code to track review status' : 'Gunakan kode ini untuk mengecek status berkas secara live'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold">{isEn ? 'Applicant Name' : 'Nama Pemohon'}</span>
                  </div>
                  <p className="font-bold text-sm text-foreground truncate">{applicantName || '-'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold">{isEn ? 'Institution' : 'Asal Sekolah / Kampus'}</span>
                  </div>
                  <p className="font-bold text-sm text-foreground truncate">{institutionName || '-'}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold">{isEn ? 'Program & Duration' : 'Program & Periode'}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{currentProg.label}</span>
                  {startDate && endDate && (
                    <span className="text-xs text-muted-foreground font-mono">
                      ({startDate} s/d {endDate})
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Right 1 Col: Dynamic QR Code */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/20 border border-border/70 text-center">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                <QRCodeSVG
                  value={qrValue}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground mt-2 uppercase tracking-tight">
                Scan Live Status
              </span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Terverifikasi Sistem</span>
              </div>
            </div>

          </div>

          {/* Perforated Stub Divider Line */}
          <div className="relative my-4 flex items-center">
            <div className="absolute -left-10 w-6 h-6 rounded-full bg-background border-r border-border/80 shadow-inner" />
            <div className="w-full border-t-2 border-dashed border-border/80" />
            <div className="absolute -right-10 w-6 h-6 rounded-full bg-background border-l border-border/80 shadow-inner" />
          </div>

          {/* Bottom Verification SLA */}
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {isEn ? 'Estimated Review Time: 7 Business Days' : 'Estimasi Verifikasi Berkas: Maksimal 7 Hari Kerja'}
                </p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  {isEn 
                    ? 'Our team will review your proposal and documents. You will receive notification on status change.' 
                    : 'Pengelola Pendidikan & Kerja Sama UP TMR akan menelaah berkas persyaratan permohonan Anda.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{dateNow}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4 text-primary" />
          <span>{isEn ? 'Print / Save PDF' : 'Cetak / Simpan Slip'}</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02]"
        >
          <Share2 className="w-4 h-4" />
          <span>{isEn ? 'Share to WhatsApp' : 'Kirim Ringkasan ke WhatsApp'}</span>
        </button>

        {onTrackStatus && (
          <button
            onClick={onTrackStatus}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02]"
          >
            <Search className="w-4 h-4" />
            <span>{isEn ? 'Track Status Now' : 'Lacak Status Langsung'}</span>
          </button>
        )}

        {onNewRegistration && (
          <button
            onClick={onNewRegistration}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground font-semibold text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEn ? 'New Application' : 'Daftar Baru'}</span>
          </button>
        )}
      </div>

    </div>
  );
}
