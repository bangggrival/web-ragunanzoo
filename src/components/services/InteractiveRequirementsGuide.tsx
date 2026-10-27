'use client';

import React, { useState } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export type ProgramCategory = 'pkl' | 'research' | 'koas' | 'interview';

interface InteractiveRequirementsGuideProps {
  onSelectProgramAndRegister?: (program: ProgramCategory) => void;
  className?: string;
}

export default function InteractiveRequirementsGuide({
  onSelectProgramAndRegister,
  className = '',
}: InteractiveRequirementsGuideProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeCategory, setActiveCategory] = useState<ProgramCategory>('pkl');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const programs = [
    {
      id: 'pkl' as ProgramCategory,
      title: isEn ? 'Internship / PKL' : 'Magang / PKL Siswa & Mahasiswa',
      shortTitle: 'Magang / PKL',
      desc: isEn 
        ? 'Practical field learning program for vocational schools (SMK) and university students in animal conservation & park management.'
        : 'Program praktik kerja lapangan untuk siswa SMK dan mahasiswa di bidang konservasi satwa, edukasi, pakan, dan manajemen kebun binatang.',
      icon: 'solar:diploma-bold-duotone',
      duration: isEn ? '1 - 3 Months' : 'Minimal 1 Bulan s/d 3 Bulan',
      schedule: isEn ? 'Mon - Fri, 07:30 - 15:00 WIB' : 'Senin - Jumat, 07.30 - 15.00 WIB',
      quota: isEn ? '20 participants/period' : '20 peserta / periode',
      badgeColor: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20',
      documents: [
        { id: 'pkl_1', name: isEn ? 'Official Cover Letter from School/University to Head of UP TMR' : 'Surat Pengantar Izin dari Sekolah / Universitas (ditujukan ke Kepala UP TMR)', required: true },
        { id: 'pkl_2', name: isEn ? 'Activity Proposal (Title, Objectives, Timeline)' : 'Proposal Kegiatan (Judul, Tujuan, dan Jangka Waktu Pelaksanaan)', required: true },
        { id: 'pkl_3', name: isEn ? 'Copy of Student ID (KTM / Kartu Pelajar)' : 'Fotokopi / Scan Kartu Mahasiswa atau Kartu Pelajar aktif', required: true },
        { id: 'pkl_4', name: isEn ? 'Copy of National ID (KTP)' : 'Fotokopi / Scan KTP Pemohon', required: true },
        { id: 'pkl_5', name: isEn ? 'Official Internship Application Form (Downloadable below)' : 'Formulir Permohonan Magang / PKL (Format resmi tersedia)', required: true },
        { id: 'pkl_6', name: isEn ? 'Consultation Sheet (Max 1 month prior to activity)' : 'Lembar Konsultasi Pengelola Pendidikan (Maksimal 1 bulan sebelum kegiatan)', required: false },
      ],
      rules: [
        isEn ? 'Wear appropriate field wearpack or formal uniform, closed safety shoes/boots.' : 'Wajib menggunakan pakaian kerja (wearpack) atau seragam resmi sekolah/kampus, serta sepatu tertutup.',
        isEn ? 'Daily check-in/attendance at Animal Health Building (Gedung Kesehatan Hewan).' : 'Wajib mengisi daftar hadir setiap hari di Gedung Kesehatan Hewan UP TMR.',
        isEn ? 'Access via West Gate (Pintu Barat) during designated hours.' : 'Akses keluar masuk area kebun binatang melalui Pintu Barat.',
        isEn ? 'Submit final activity report (hardcopy & softcopy) at completion.' : 'Wajib menyerahkan laporan akhir kegiatan (softcopy & hardcopy) sebelum surat keterangan terbit.',
      ]
    },
    {
      id: 'research' as ProgramCategory,
      title: isEn ? 'Academic Research & Survey' : 'Penelitian Karya Tulis / Riset',
      shortTitle: 'Riset & Penelitian',
      desc: isEn 
        ? 'Research facility for undergraduate (S1), master (S2), doctoral (S3) theses, and scientific journals.'
        : 'Layanan fasilitas penelitian skripsi, tesis, disertasi, dan publikasi jurnal ilmiah bidang biologi satwa, botani, kedokteran hewan, dan lanskap.',
      icon: 'solar:test-tube-minimalistic-bold-duotone',
      duration: isEn ? 'Flexible (Based on Approved Proposal)' : 'Fleksibel (Sesuai Proposal Disetujui)',
      schedule: isEn ? 'During operating & research hours' : 'Mengikuti jadwal pengamatan satwa',
      quota: isEn ? 'Quota verified by research division' : 'Disesuaikan dengan daya dukung satwa/laboratorium',
      badgeColor: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20',
      documents: [
        { id: 'res_1', name: isEn ? 'Official Research Permit Request Letter from Dean / Faculty' : 'Surat Pengantar Izin Penelitian dari Dekanat / Rektorat ke Kepala UP TMR', required: true },
        { id: 'res_2', name: isEn ? 'Complete Research Proposal (Chapters 1 to 3: Background, Methodology, Instrument)' : 'Proposal Penelitian Lengkap (Bab 1–3: Latar Belakang, Metodologi, Instrumen)', required: true },
        { id: 'res_3', name: isEn ? 'List of Interview Questions / Required Secondary Data Points' : 'Daftar Pertanyaan Wawancara / Kebutuhan Data Sekunder Lengkap', required: true },
        { id: 'res_4', name: isEn ? 'Notarized Statement Letter (Rp 10.000 Stamp duty format below)' : 'Surat Pernyataan Penelitian Bermaterai Rp 10.000 (Format resmi tersedia)', required: true },
        { id: 'res_5', name: isEn ? 'Copy of Student ID & National Identity Card (KTM & KTP)' : 'Fotokopi / Scan Kartu Mahasiswa (KTM) & KTP Pemohon', required: true },
      ],
      rules: [
        isEn ? 'UP TMR reserves the right to decline topics not aligned with conservation goals.' : 'UP TMR berhak menolak permohonan jika topik tidak relevan dengan tugas dan fungsi konservasi.',
        isEn ? 'Strict adherence to animal welfare and keeper safety protocols at all times.' : 'Dilarang mengganggu satwa atau memasuki kandang tanpa pendampingan kurator/keeper.',
        isEn ? 'Submit one bound hardcopy and PDF softcopy of final thesis/journal to UP TMR Library.' : 'Wajib menyerahkan 1 eksemplar skripsi/tesis hardcopy dan softcopy ke Perpustakaan UP TMR.',
      ]
    },
    {
      id: 'koas' as ProgramCategory,
      title: isEn ? 'Veterinary Clinical Rotation (Koas)' : 'Kepaniteraan Klinik (Koas Dokter Hewan)',
      shortTitle: 'Koas Dokter Hewan',
      desc: isEn 
        ? 'Professional veterinary clinical internship in wild animal surgery, pathology, quarantine, and preventive medicine.'
        : 'Program kepaniteraan klinik profesi dokter hewan (PPDH) di Pusat Kesehatan Hewan Ragunan, laboratorium patologi, dan karantina satwa.',
      icon: 'solar:stethoscope-bold-duotone',
      duration: isEn ? '4 - 8 Weeks' : '4 s/d 8 Minggu',
      schedule: isEn ? 'Clinical shift rotation' : 'Rotasi shift klinik dan piket rawat inap',
      quota: isEn ? '10 veterinary students/batch' : '10 mahasiswa koas / gelombang',
      badgeColor: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30',
      activeBorder: 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/50 dark:bg-teal-950/20',
      documents: [
        { id: 'koa_1', name: isEn ? 'Official Assignment Letter from Faculty of Veterinary Medicine (FKH)' : 'Surat Tugas / Pengantar Resmi dari Fakultas Kedokteran Hewan (FKH)', required: true },
        { id: 'koa_2', name: isEn ? 'Clinical Rotation Curriculum & Competency Logbook' : 'Silabus Rotasi Klinik & Buku Logbook Kompetensi PPDH', required: true },
        { id: 'koa_3', name: isEn ? 'Proof of Rabies & Tetanus Vaccinations' : 'Surat Keterangan Vaksinasi Rabies & Tetanus yang masih berlaku', required: true },
        { id: 'koa_4', name: isEn ? 'Copy of Student ID & Faculty Supervisor Recommendation' : 'Fotokopi KTM & Surat Rekomendasi Dosen Pembimbing Klinik', required: true },
      ],
      rules: [
        isEn ? 'Complete personal protective equipment (Lab coat, scrubs, boots, surgical gloves).' : 'Wajib membawa APD medis lengkap (jas lab, scrubs, boots, masker medis, sarung tangan bedah).',
        isEn ? 'Comply with biosafety level and quarantine biohazard procedures.' : 'Patuhi protokol biosekuriti ketat dan tata tertib area karantina satwa.',
      ]
    },
    {
      id: 'interview' as ProgramCategory,
      title: isEn ? 'Media Interview & News Coverage' : 'Wawancara & Liputan Media',
      shortTitle: 'Wawancara / Media',
      desc: isEn 
        ? 'Official interview and educational journalistic coverage services for TV, press, and verified media crews.'
        : 'Layanan izin wawancara narasumber dan peliputan jurnalistik edukasi konservasi satwa bagi pers, stasiun televisi, dan media terverifikasi.',
      icon: 'solar:microphone-3-bold-duotone',
      duration: isEn ? '1 - 3 Hours per session' : '1 s/d 3 Jam per sesi kegiatan',
      schedule: isEn ? 'By confirmed appointment' : 'Sesuai kesepakatan jadwal Humas',
      quota: isEn ? 'Confirmed media crew only' : 'Kru media terdaftar',
      badgeColor: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20',
      documents: [
        { id: 'int_1', name: isEn ? 'Formal Media Coverage / Interview Request Letter on Media Letterhead' : 'Surat Permohonan Liputan / Wawancara resmi berkop surat media / institusi', required: true },
        { id: 'int_2', name: isEn ? 'Detailed Interview Questionnaire Outline' : 'Daftar Daftar Pertanyaan (Kuesioner Wawancara Lengkap)', required: true },
        { id: 'int_3', name: isEn ? 'Copy of Press Card / Journalist ID' : 'Fotokopi / Scan Kartu Pers (Press Card) / ID Kru', required: true },
      ],
      rules: [
        isEn ? 'Shooting must not disturb animal habitats or use invasive flash lighting.' : 'Dilarang menggunakan lampu kilat (flash) kuat yang dapat mengejutkan satwa.',
        isEn ? 'Media crew must be accompanied by official PR personnel at all times.' : 'Wajib didampingi oleh petugas Humas & Protokol UP TMR selama peliputan.',
      ]
    },
  ];

  const currentProgram = programs.find(p => p.id === activeCategory) || programs[0];

  const toggleCheck = (docId: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  // Calculate readiness percentage for the currently selected program
  const currentProgramDocs = currentProgram.documents;
  const checkedCount = currentProgramDocs.filter(d => checkedDocs[d.id]).length;
  const readinessPercent = Math.round((checkedCount / currentProgramDocs.length) * 100);

  const handleDownloadTemplate = (templateName: string) => {
    toast.success(
      isEn 
        ? `Preparing "${templateName}" template download...` 
        : `Mengunduh format dokumen "${templateName}"...`
    );
    // Trigger download simulation or actual PDF/Doc template link
    const link = document.createElement('a');
    link.href = `/api/services/template?type=${activeCategory}`;
    link.setAttribute('download', `${templateName}.pdf`);
    document.body.appendChild(link);
    // Link click fallback
    setTimeout(() => {
      document.body.removeChild(link);
    }, 200);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      
      {/* Category Tabs Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-muted/80 border border-border/70">
        {programs.map((p) => {
          const isActive = activeCategory === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActiveCategory(p.id)}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-card text-foreground shadow-sm scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <AppIcon name={p.icon} className="w-4 h-4 text-primary" />
              <span>{p.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Program Summary Card */}
      <div className={`rounded-3xl border p-6 md:p-8 bg-card shadow-sm transition-all duration-300 ${currentProgram.activeBorder}`}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={currentProgram.badgeColor}>
                {isEn ? 'Official Public Service' : 'Standar Layanan Publik UP TMR'}
              </Badge>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <AppIcon name="solar:check-circle-bold" className="w-3.5 h-3.5" />
                {isEn ? 'Free (Rp 0)' : 'Gratis (Rp 0)'}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {currentProgram.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              {currentProgram.desc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start md:self-auto shrink-0">
            {onSelectProgramAndRegister && (
              <button
                onClick={() => onSelectProgramAndRegister(currentProgram.id)}
                className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <span>{isEn ? 'Apply for This Program' : 'Daftar Program Ini'}</span>
                <AppIcon name="solar:arrow-right-linear" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Program Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/70 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <AppIcon name="solar:clock-circle-bold-duotone" className="w-4 h-4" />
            </div>
            <div>
              <p className="text-muted-foreground font-medium">{isEn ? 'Duration' : 'Durasi Kegiatan'}</p>
              <p className="font-bold text-foreground text-xs sm:text-sm">{currentProgram.duration}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <AppIcon name="solar:buildings-2-bold-duotone" className="w-4 h-4" />
            </div>
            <div>
              <p className="text-muted-foreground font-medium">{isEn ? 'Work Schedule' : 'Jadwal & Waktu'}</p>
              <p className="font-bold text-foreground text-xs sm:text-sm">{currentProgram.schedule}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <AppIcon name="solar:shield-check-bold-duotone" className="w-4 h-4" />
            </div>
            <div>
              <p className="text-muted-foreground font-medium">{isEn ? 'Quota' : 'Kapasitas Kuota'}</p>
              <p className="font-bold text-foreground text-xs sm:text-sm">{currentProgram.quota}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Requirement Checklist & Readiness Meter */}
      <div className="rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <AppIcon name="solar:check-circle-bold" className="w-5 h-5 text-primary" />
              <span>{isEn ? 'Document Checklist & Readiness Meter' : 'Ceklis Kelengkapan Dokumen Persyaratan'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {isEn 
                ? 'Check off the documents you have prepared to check your submission readiness.' 
                : 'Centang berkas yang sudah Anda siapkan di bawah untuk mengetahui persentase kesiapan berkas.'}
            </p>
          </div>

          {/* Readiness Meter Pill */}
          <div className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-muted border border-border/80 min-w-[160px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-muted-foreground">{isEn ? 'Readiness:' : 'Kesiapan:'}</span>
              <span className={readinessPercent === 100 ? 'text-emerald-600 font-extrabold' : 'text-primary'}>
                {readinessPercent}%
              </span>
            </div>
            <Progress value={readinessPercent} className="h-2" />
          </div>
        </div>

        {/* Document Checklist Items */}
        <div className="space-y-2.5">
          {currentProgram.documents.map((doc) => {
            const isChecked = !!checkedDocs[doc.id];
            return (
              <div
                key={doc.id}
                onClick={() => toggleCheck(doc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                    : 'bg-muted/30 border-border/70 hover:bg-muted/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-muted-foreground/40 bg-card'
                  }`}>
                    {isChecked && <AppIcon name="solar:check-read-linear" className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                      isChecked ? 'text-foreground' : 'text-foreground/90'
                    }`}>
                      {doc.name}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {doc.required ? (
                    <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                      {isEn ? 'Required' : 'Wajib'}
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      {isEn ? 'Optional' : 'Jika Ada'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Readiness Meter Feedback Box */}
        {readinessPercent === 100 ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm">
              <AppIcon name="solar:stars-minimalistic-bold" className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">
                {isEn 
                  ? 'All required documents prepared! You are ready to submit.' 
                  : 'Seluruh berkas persyaratan telah lengkap! Anda siap mengisi formulir pendaftaran.'}
              </span>
            </div>
            {onSelectProgramAndRegister && (
              <button
                onClick={() => onSelectProgramAndRegister(currentProgram.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-transform hover:scale-105 shrink-0"
              >
                {isEn ? 'Proceed to Application' : 'Lanjut Isi Formulir Pendaftaran'} →
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <AppIcon name="solar:info-circle-bold-duotone" className="w-4 h-4 text-primary shrink-0" />
            <span>
              {isEn 
                ? 'Tip: Submit applications at least 10 business days before your intended start date.' 
                : 'Tips: Ajukan dokumen lengkap paling lambat 10 hari kerja sebelum rencana tanggal pelaksanaan kegiatan.'}
            </span>
          </div>
        )}
      </div>

      {/* Official Downloadable Templates Section */}
      <div className="rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-sm space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <AppIcon name="solar:download-bold" className="w-5 h-5 text-primary" />
          <span>{isEn ? 'Official Document Templates' : 'Unduh Format Surat & Formulir Resmi'}</span>
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isEn 
            ? 'Use the official templates provided by UP Taman Margasatwa Ragunan to prevent administrative rejection.' 
            : 'Gunakan format baku resmi UP Taman Margasatwa Ragunan untuk mempercepat proses persetujuan berkas.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] font-mono">DOC / PDF</Badge>
                <AppIcon name="solar:document-text-bold-duotone" className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                Surat Pernyataan Penelitian Bermaterai
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Format surat bermaterai Rp 10.000 wajib untuk riset karya ilmiah/skripsi.
              </p>
            </div>
            <button
              onClick={() => handleDownloadTemplate('Surat_Pernyataan_Penelitian_Ragunan')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-card hover:bg-primary/10 hover:text-primary border border-border/80 text-xs font-bold text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <AppIcon name="solar:download-bold" className="w-3.5 h-3.5" />
              <span>{isEn ? 'Download Template' : 'Unduh Format'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] font-mono">DOC / PDF</Badge>
                <AppIcon name="solar:diploma-bold-duotone" className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                Formulir Permohonan Magang / PKL
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Formulir biodata siswa/mahasiswa, unit divisi minat, dan persetujuan tata tertib.
              </p>
            </div>
            <button
              onClick={() => handleDownloadTemplate('Formulir_Magang_PKL_Ragunan')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-card hover:bg-primary/10 hover:text-primary border border-border/80 text-xs font-bold text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <AppIcon name="solar:download-bold" className="w-3.5 h-3.5" />
              <span>{isEn ? 'Download Template' : 'Unduh Format'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 hover:border-primary/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] font-mono">PDF</Badge>
                <AppIcon name="solar:book-bookmark-bold-duotone" className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                Buku Pedoman & Tata Tertib Peserta
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1">
                Standar operasional prosedur (SOP) keselamatan di area konservasi satwa.
              </p>
            </div>
            <button
              onClick={() => handleDownloadTemplate('Pedoman_Tata_Tertib_Ragunan')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-card hover:bg-primary/10 hover:text-primary border border-border/80 text-xs font-bold text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <AppIcon name="solar:download-bold" className="w-3.5 h-3.5" />
              <span>{isEn ? 'Download SOP' : 'Unduh Pedoman'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Rules of Conduct & FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Rules Card */}
        <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <AppIcon name="solar:shield-check-bold-duotone" className="w-5 h-5 text-primary" />
            <span>{isEn ? 'Code of Conduct & Obligations' : 'Tata Tertib & Kewajiban Peserta'}</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            {currentProgram.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ Accordion */}
        <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-sm space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <AppIcon name="solar:question-circle-bold-duotone" className="w-5 h-5 text-primary" />
            <span>{isEn ? 'Frequently Asked Questions' : 'Pertanyaan Umum (FAQ)'}</span>
          </h3>
          
          <Accordion type="single" collapsible className="w-full text-xs">
            <AccordionItem value="q1">
              <AccordionTrigger className="text-left font-semibold hover:text-primary text-xs">
                {isEn ? 'Is there any fee charged for internship or research?' : 'Apakah ada pungutan biaya pendaftaran atau pelaksanaan?'}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {isEn 
                  ? 'No. All educational public services at UP Taman Margasatwa Ragunan are completely FREE (Rp 0).' 
                  : 'Tidak ada. Seluruh layanan pendidikan dan penelitian di UP Taman Margasatwa Ragunan adalah 100% GRATIS (Rp 0) tanpa biaya administrasi apapun.'}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2">
              <AccordionTrigger className="text-left font-semibold hover:text-primary text-xs">
                {isEn ? 'How long does the verification process take?' : 'Berapa lama proses telaah berkas hingga surat terbit?'}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {isEn 
                  ? 'The document verification and processing SLA takes up to 7 business days from complete submission.' 
                  : 'Sesuai standar operasional pelayanan, berkas lengkap diproses maksimal dalam 7 hari kerja.'}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3">
              <AccordionTrigger className="text-left font-semibold hover:text-primary text-xs">
                {isEn ? 'Can we apply as a team or group?' : 'Apakah pengajuan bisa perorangan atau berkelompok?'}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {isEn 
                  ? 'Yes. You can register individually or as an institution group, subject to quota availability in the requested division.' 
                  : 'Bisa. Pengajuan dapat dilakukan secara mandiri maupun rombongan kampus, dengan penempatan menyesuaikan kuota unit terkait.'}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </div>

    </div>
  );
}
