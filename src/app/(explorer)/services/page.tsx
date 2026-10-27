"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AppIcon } from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';
import AtmosphericHeader from '@/components/ui/AtmosphericHeader';
import { useCreateRegistration, useCheckRegistrationStatus, type ServiceRegistration } from '@/hooks/useServiceRegistrations';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import KoasFormFields from '@/components/services/KoasFormFields';
import InterviewFormFields from '@/components/services/InterviewFormFields';
import AvailabilityCalendar from '@/components/services/AvailabilityCalendar';
import InteractiveRequirementsGuide, { type ProgramCategory } from '@/components/services/InteractiveRequirementsGuide';
import LiveStatusTracker from '@/components/services/LiveStatusTracker';
import DigitalSubmissionPass from '@/components/services/DigitalSubmissionPass';

type ProgramType = 'pkl' | 'research' | 'koas' | 'interview' | null;
type WizardStep = 1 | 2 | 3 | 4;
type TabType = 'guide' | 'form' | 'track' | 'calendar';

interface FormData {
  programType: ProgramType;
  // Personal & Institutional
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  major: string;
  nim: string;
  // PKL specific
  pklDuration: string;
  pklStartDate: Date | undefined;
  pklEndDate: Date | undefined;
  pklDepartment: string;
  // Research specific
  researchTitle: string;
  researchType: string;
  researchDuration: string;
  researchStartDate: Date | undefined;
  researchEndDate: Date | undefined;
  // Koas specific
  faculty: string;
  rotationDepartment: string;
  supervisorName: string;
  supervisorPhone: string;
  koasStartDate: Date | undefined;
  koasEndDate: Date | undefined;
  // Interview specific
  mediaOrganization: string;
  interviewTopic: string;
  targetInterviewee: string;
  equipmentUsed: string;
  interviewDate: Date | undefined;
  interviewTime: string;
  // Common
  motivation: string;
  documents: File[];
  agreeTerms: boolean;
}

const initialFormData: FormData = {
  programType: 'pkl',
  fullName: '',
  email: '',
  phone: '',
  institution: '',
  major: '',
  nim: '',
  pklDuration: '1 Bulan',
  pklStartDate: undefined,
  pklEndDate: undefined,
  pklDepartment: 'Konservasi & Edukasi Satwa',
  researchTitle: '',
  researchType: 'Skripsi (S1)',
  researchDuration: '',
  researchStartDate: undefined,
  researchEndDate: undefined,
  faculty: '',
  rotationDepartment: 'Pusat Kesehatan Hewan',
  supervisorName: '',
  supervisorPhone: '',
  koasStartDate: undefined,
  koasEndDate: undefined,
  mediaOrganization: '',
  interviewTopic: '',
  targetInterviewee: 'Pengelola Pendidikan & Humas UP TMR',
  equipmentUsed: 'Kamera & Mic Portable',
  interviewDate: undefined,
  interviewTime: '09:00 WIB',
  motivation: '',
  documents: [],
  agreeTerms: false,
};

function ServicesContent() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const searchParams = useSearchParams();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<TabType>('guide');

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // Submission result state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTrackingCode, setSubmittedTrackingCode] = useState<string>('');
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    institution: string;
    program: 'pkl' | 'research' | 'koas' | 'interview';
    startDate?: string;
    endDate?: string;
  } | null>(null);

  // Status tracker state
  const [trackerCode, setTrackerCode] = useState<string | null>(null);

  // Read URL query params on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'form' || tabParam === 'track' || tabParam === 'guide' || tabParam === 'calendar') {
      setActiveTab(tabParam);
    }
    const trackParam = searchParams.get('track');
    if (trackParam) {
      setTrackerCode(trackParam);
      setActiveTab('track');
    }
  }, [searchParams]);

  const createRegistration = useCreateRegistration();

  const handleProgramCardSelect = (program: ProgramCategory) => {
    setFormData(prev => ({ ...prev, programType: program }));
    setActiveTab('form');
    setCurrentStep(2);
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => file.size <= 5 * 1024 * 1024);
      if (validFiles.length < files.length) {
        toast.error(isEn ? 'Some files exceeded 5MB and were skipped' : 'Beberapa file melebihi batas 5MB dan dilewati');
      }
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...validFiles] }));
      toast.success(isEn ? `${validFiles.length} file(s) attached` : `${validFiles.length} berkas berhasil ditambahkan`);
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Step validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.programType !== null;
      case 2: {
        const baseValid = formData.fullName.trim() && formData.email.trim() && formData.phone.trim();
        if (formData.programType === 'pkl') {
          return baseValid && formData.institution.trim() && !!formData.pklStartDate && !!formData.pklEndDate;
        } else if (formData.programType === 'research') {
          return baseValid && formData.institution.trim() && formData.researchTitle.trim() && !!formData.researchStartDate && !!formData.researchEndDate;
        } else if (formData.programType === 'koas') {
          return baseValid && formData.institution.trim() && formData.faculty.trim() && !!formData.koasStartDate && !!formData.koasEndDate;
        } else if (formData.programType === 'interview') {
          return baseValid && formData.mediaOrganization.trim() && formData.interviewTopic.trim() && !!formData.interviewDate;
        }
        return baseValid && formData.institution.trim();
      }
      case 3:
        return formData.documents.length > 0;
      case 4:
        return formData.agreeTerms;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } else {
      if (currentStep === 2) {
        toast.error(isEn ? 'Please fill in all required fields and dates' : 'Mohon lengkapi seluruh data wajib dan tanggal pelaksanaan');
      } else if (currentStep === 3 && formData.documents.length === 0) {
        toast.error(isEn ? 'Please upload at least one required document (PDF/DOC)' : 'Unggah minimal 1 dokumen persyaratan (PDF/DOC)');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreeTerms) {
      toast.error(isEn ? 'Please agree to the UP TMR rules and obligations' : 'Mohon setujui ketentuan dan tata tertib peserta UP TMR');
      return;
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (formData.programType === 'pkl') {
      startDate = formData.pklStartDate;
      endDate = formData.pklEndDate;
    } else if (formData.programType === 'research') {
      startDate = formData.researchStartDate;
      endDate = formData.researchEndDate;
    } else if (formData.programType === 'koas') {
      startDate = formData.koasStartDate;
      endDate = formData.koasEndDate;
    } else if (formData.programType === 'interview') {
      startDate = formData.interviewDate;
      endDate = formData.interviewDate;
    }
    
    if (!startDate || !endDate) {
      toast.error(isEn ? 'Please select start and end dates' : 'Pilih tanggal mulai dan selesai kegiatan');
      return;
    }

    if (!formData.programType) {
      toast.error(isEn ? 'Please select a program' : 'Pilih jenis program pendaftaran');
      return;
    }

    try {
      const institutionVal = formData.programType === 'interview' ? formData.mediaOrganization : formData.institution;
      
      const result = await createRegistration.mutateAsync({
        program_type: formData.programType,
        institution_name: institutionVal,
        institution_email: formData.email,
        institution_phone: formData.phone,
        participant_name: formData.fullName,
        participant_nim: formData.nim || undefined,
        participant_phone: formData.phone,
        participant_email: formData.email,
        study_program: formData.major || undefined,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        research_title: formData.researchTitle || undefined,
        faculty: formData.faculty || undefined,
        rotation_department: formData.rotationDepartment || undefined,
        supervisor_name: formData.supervisorName || undefined,
        supervisor_phone: formData.supervisorPhone || undefined,
        media_organization: formData.mediaOrganization || undefined,
        interview_topic: formData.interviewTopic || undefined,
        target_interviewee: formData.targetInterviewee || undefined,
        equipment_used: formData.equipmentUsed || undefined,
        interview_date: formData.interviewDate ? format(formData.interviewDate, 'yyyy-MM-dd') : undefined,
        interview_time: formData.interviewTime || undefined,
        documents: formData.documents,
      });
      
      const code = result.tracking_code;
      setSubmittedTrackingCode(code);
      setSubmittedData({
        name: formData.fullName,
        institution: institutionVal,
        program: formData.programType,
        startDate: format(startDate, 'dd MMM yyyy'),
        endDate: format(endDate, 'dd MMM yyyy'),
      });
      setIsSubmitted(true);
      toast.success(isEn ? 'Application successfully submitted!' : 'Pendaftaran berhasil diajukan!');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(isEn ? 'Failed to submit application. Please try again.' : 'Gagal mengirim pendaftaran. Silakan coba kembali.');
    }
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setFormData(initialFormData);
    setSubmittedTrackingCode('');
    setSubmittedData(null);
  };

  const stepLabels = [
    { step: 1, title: isEn ? 'Select Program' : 'Pilih Program', icon: 'solar:clipboard-list-bold-duotone' },
    { step: 2, title: isEn ? 'Personal Data' : 'Data & Spesifikasi', icon: 'solar:users-group-two-rounded-bold-duotone' },
    { step: 3, title: isEn ? 'Upload Files' : 'Unggah Berkas', icon: 'solar:document-text-bold-duotone' },
    { step: 4, title: isEn ? 'Review & Submit' : 'Tinjau & Kirim', icon: 'solar:plain-bold-duotone' },
  ];

  const progressPercent = ((currentStep - 1) / 3) * 100;

  return (
    <div className="animate-fade-in min-h-screen pb-20">
      
      {/* Atmospheric Hero Header */}
      <AtmosphericHeader
        theme="tickets"
        icon={<AppIcon icon="GraduationCap" className="w-5 h-5 md:w-6 md:h-6 text-emerald-200" />}
        title={isEn ? 'Public Service Portal' : 'Portal Layanan Publik'}
        description={
          isEn
            ? 'Official application portal for academic internship (PKL), scientific research, veterinary clinical rotation (Koas), and media coverage at Ragunan Zoo.'
            : 'Pusat layanan terpadu pendaftaran Praktik Kerja Lapangan (PKL), penelitian karya tulis ilmiah, kepaniteraan klinik (Koas), dan peliputan media di UP Taman Margasatwa Ragunan.'
        }
        breadcrumbs={[
          { label: isEn ? 'Explore' : 'Jelajahi' },
          { label: isEn ? 'Public Services' : 'Layanan Publik & Pendidikan' },
        ]}
        stats={[
          {
            icon: <AppIcon icon="ShieldCheck" className="w-3.5 h-3.5 text-emerald-400" />,
            label: isEn ? '100% Free (Rp 0)' : '100% Bebas Biaya (Rp 0)',
          },
          {
            icon: <AppIcon icon="Clock" className="w-3.5 h-3.5 text-sky-400" />,
            label: isEn ? '7-Day Review SLA' : 'Respon 7 Hari Kerja',
          },
          {
            icon: <AppIcon icon="BookOpen" className="w-3.5 h-3.5 text-amber-400" />,
            label: isEn ? '4 Academic Paths' : '4 Jalur Pendaftaran',
          },
        ]}
      />

      {/* Main Container */}
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        
        {/* Top-Level Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-muted border border-border/80 mb-8">
          
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'guide'
                ? 'bg-card text-foreground shadow-sm scale-[1.01]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AppIcon icon="BookOpen" className={`w-4 h-4 ${activeTab === 'guide' ? 'text-primary' : ''}`} />
            <span>{isEn ? 'Requirements Guide' : 'Panduan & Persyaratan'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('form');
              if (isSubmitted) setIsSubmitted(false);
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'form'
                ? 'bg-card text-foreground shadow-sm scale-[1.01]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AppIcon icon="ClipboardList" className={`w-4 h-4 ${activeTab === 'form' ? 'text-primary' : ''}`} />
            <span>{isEn ? 'Application Form' : 'Formulir Pendaftaran'}</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'track'
                ? 'bg-card text-foreground shadow-sm scale-[1.01]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AppIcon icon="Search" className={`w-4 h-4 ${activeTab === 'track' ? 'text-primary' : ''}`} />
            <span>{isEn ? 'Live Status Tracker' : 'Live Tracker Status'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'calendar'
                ? 'bg-card text-foreground shadow-sm scale-[1.01]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AppIcon icon="CalendarDays" className={`w-4 h-4 ${activeTab === 'calendar' ? 'text-primary' : ''}`} />
            <span>{isEn ? 'Quota & Calendar' : 'Jadwal & Kuota'}</span>
          </button>

        </div>

        {/* TAB 1: PANDUAN & PERSYARATAN INTERAKTIF */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <InteractiveRequirementsGuide
              onSelectProgramAndRegister={handleProgramCardSelect}
            />
          </div>
        )}

        {/* TAB 2: FORM WIZARD PENDAFTARAN */}
        {activeTab === 'form' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* If Submitted, Show Digital Pass */}
            {isSubmitted ? (
              <div className="space-y-6">
                <DigitalSubmissionPass
                  trackingCode={submittedTrackingCode}
                  applicantName={submittedData?.name || formData.fullName}
                  institutionName={submittedData?.institution || formData.institution}
                  programType={submittedData?.program || formData.programType || 'pkl'}
                  startDate={submittedData?.startDate}
                  endDate={submittedData?.endDate}
                  onTrackStatus={() => {
                    setTrackerCode(submittedTrackingCode);
                    setActiveTab('track');
                  }}
                  onNewRegistration={handleResetForm}
                />
              </div>
            ) : (
              /* Wizard Steps Flow */
              <div className="rounded-3xl bg-card border border-border/80 shadow-md overflow-hidden">
                
                {/* Wizard Header Bar & Stepper Indicator */}
                <div className="p-6 md:p-8 bg-muted/40 border-b border-border/70 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {isEn ? `Step ${currentStep} of 4` : `Langkah ${currentStep} dari 4`}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                        {stepLabels[currentStep - 1].title}
                      </h3>
                    </div>
                    <Badge variant="outline" className="self-start sm:self-auto bg-card">
                      {isEn ? 'Online Registration Form' : 'Formulir Pendaftaran Daring'}
                    </Badge>
                  </div>

                  {/* Progress Line */}
                  <Progress value={progressPercent} className="h-2" />

                  {/* 4 Step Number Markers */}
                  <div className="grid grid-cols-4 gap-2">
                    {stepLabels.map(({ step, title }) => {
                      const isDone = currentStep > step;
                      const isCurrent = currentStep === step;
                      return (
                        <div
                          key={step}
                          className={`flex items-center gap-2 transition-all ${
                            isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground/60'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                            isDone 
                              ? 'bg-emerald-600 text-white' 
                              : isCurrent 
                                ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {isDone ? <AppIcon icon="Check" className="w-4 h-4" /> : step}
                          </div>
                          <span className="text-xs font-bold truncate hidden sm:inline">
                            {title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Wizard Content Body */}
                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* STEP 1: Pilih Program */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="text-center max-w-xl mx-auto mb-6">
                        <h4 className="text-lg font-bold text-foreground">
                          {isEn ? 'Select Your Academic / Coverage Program' : 'Pilih Jenis Program yang Ingin Anda Daftarkan'}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {isEn 
                            ? 'Each program has tailored requirements and allocated quotas at Ragunan Zoo.'
                            : 'Setiap program memiliki durasi, unit penempatan, dan persyaratan administratif yang disesuaikan.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Option 1: PKL / Magang */}
                        <div
                          onClick={() => handleInputChange('programType', 'pkl')}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            formData.programType === 'pkl'
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                              : 'border-border/80 bg-muted/20 hover:bg-muted/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <AppIcon icon="GraduationCap" className="w-6 h-6" />
                              </div>
                              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                                SMK & Mahasiswa
                              </Badge>
                            </div>
                            <h5 className="font-black text-base text-foreground mb-1">
                              Magang / Praktik Kerja Lapangan (PKL)
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Praktik di bidang konservasi satwa, edukasi botani, nutrisi pakan, dan manajemen umum kebun binatang.
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Durasi: 1 - 3 Bulan</span>
                            <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
                          </div>
                        </div>

                        {/* Option 2: Riset / Penelitian */}
                        <div
                          onClick={() => handleInputChange('programType', 'research')}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            formData.programType === 'research'
                              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                              : 'border-border/80 bg-muted/20 hover:bg-muted/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <AppIcon icon="FlaskConical" className="w-6 h-6" />
                              </div>
                              <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px]">
                                S1, S2, S3 & Peneliti
                              </Badge>
                            </div>
                            <h5 className="font-black text-base text-foreground mb-1">
                              Penelitian Karya Tulis / Riset Ilmiah
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Pengambilan data skripsi, tesis, disertasi, maupun publikasi jurnal konservasi dan perilaku satwa.
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Durasi: Fleksibel</span>
                            <span className="font-bold text-blue-600">Gratis (Rp 0)</span>
                          </div>
                        </div>

                        {/* Option 3: Koas Dokter Hewan */}
                        <div
                          onClick={() => handleInputChange('programType', 'koas')}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            formData.programType === 'koas'
                              ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm'
                              : 'border-border/80 bg-muted/20 hover:bg-muted/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                                <AppIcon icon="Stethoscope" className="w-6 h-6" />
                              </div>
                              <Badge className="bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30 text-[10px]">
                                Profesi Dokter Hewan
                              </Badge>
                            </div>
                            <h5 className="font-black text-base text-foreground mb-1">
                              Kepaniteraan Klinik (Koas FKH)
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Rotasi klinik di Gedung Kesehatan Hewan, bedah satwa liar, laboratorium patologi, dan karantina.
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Durasi: 4 - 8 Minggu</span>
                            <span className="font-bold text-teal-600">Gratis (Rp 0)</span>
                          </div>
                        </div>

                        {/* Option 4: Wawancara / Media */}
                        <div
                          onClick={() => handleInputChange('programType', 'interview')}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            formData.programType === 'interview'
                              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm'
                              : 'border-border/80 bg-muted/20 hover:bg-muted/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                <AppIcon icon="Mic" className="w-6 h-6" />
                              </div>
                              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                                Media & Jurnalis
                              </Badge>
                            </div>
                            <h5 className="font-black text-base text-foreground mb-1">
                              Wawancara & Liputan Berita
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Wawancara narasumber kurator/dokter hewan dan liputan jurnalistik program konservasi satwa Ragunan.
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Durasi: Sesuai Sesi</span>
                            <span className="font-bold text-amber-600">Gratis (Rp 0)</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* STEP 2: Data Diri & Spesifikasi Program */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      
                      {/* Section A: Identitas Pemohon */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                          <AppIcon icon="Users" className="w-4 h-4 text-primary" />
                          <span>Identitas Pemohon / Ketua Tim</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Nama Lengkap Pemohon *</Label>
                            <Input
                              value={formData.fullName}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                              placeholder="Nama lengkap sesuai KTP / Kartu Pelajar"
                              className="rounded-xl text-xs sm:text-sm"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">NIM / NIS / NIK *</Label>
                            <Input
                              value={formData.nim}
                              onChange={(e) => handleInputChange('nim', e.target.value)}
                              placeholder="Nomor Induk Mahasiswa / Siswa"
                              className="rounded-xl text-xs sm:text-sm font-mono"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Email Aktif *</Label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="nama@email.com"
                              className="rounded-xl text-xs sm:text-sm"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">No. WhatsApp / Telepon Aktif *</Label>
                            <Input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="08xxxxxxxxxx"
                              className="rounded-xl text-xs sm:text-sm font-mono"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                              {formData.programType === 'interview' ? 'Nama Media / Organisasi Pers *' : 'Asal Sekolah / Universitas *'}
                            </Label>
                            <Input
                              value={formData.programType === 'interview' ? formData.mediaOrganization : formData.institution}
                              onChange={(e) => handleInputChange(formData.programType === 'interview' ? 'mediaOrganization' : 'institution', e.target.value)}
                              placeholder={formData.programType === 'interview' ? 'Contoh: Harian Kompas / CNN' : 'Contoh: Institut Pertanian Bogor'}
                              className="rounded-xl text-xs sm:text-sm"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Program Studi / Jurusan *</Label>
                            <Input
                              value={formData.major}
                              onChange={(e) => handleInputChange('major', e.target.value)}
                              placeholder="Contoh: Kedokteran Hewan / Biologi / Kehutanan"
                              className="rounded-xl text-xs sm:text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section B: Detail Spesifik Program */}
                      <div className="space-y-4 pt-2">
                        <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                          <AppIcon icon="Calendar" className="w-4 h-4 text-primary" />
                          <span>Detail Jadwal & Spesifikasi Program</span>
                        </h4>

                        {/* Program Specific Fields */}
                        {formData.programType === 'pkl' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Divisi / Bagian yang Diminati</Label>
                              <select
                                value={formData.pklDepartment}
                                onChange={(e) => handleInputChange('pklDepartment', e.target.value)}
                                className="w-full py-2.5 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm focus:ring-2 focus:ring-primary/40"
                              >
                                <option value="Konservasi & Edukasi Satwa">Konservasi & Edukasi Satwa</option>
                                <option value="Kesehatan Hewan & Karantina">Kesehatan Hewan & Karantina</option>
                                <option value="Nutrisi & Dapur Pakan Satwa">Nutrisi & Dapur Pakan Satwa</option>
                                <option value="Humas & Protokol">Humas, Publikasi & Protokol</option>
                                <option value="Pertamanan & Botani">Pertamanan & Botani</option>
                                <option value="Pelayanan Pengunjung & Tiket">Pelayanan Pengunjung & Tiket</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Durasi Kegiatan</Label>
                              <select
                                value={formData.pklDuration}
                                onChange={(e) => handleInputChange('pklDuration', e.target.value)}
                                className="w-full py-2.5 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm focus:ring-2 focus:ring-primary/40"
                              >
                                <option value="1 Bulan">1 Bulan (Standar Minimal)</option>
                                <option value="2 Bulan">2 Bulan</option>
                                <option value="3 Bulan">3 Bulan</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Rencana Tanggal Mulai *</Label>
                              <Input
                                type="date"
                                onChange={(e) => handleInputChange('pklStartDate', e.target.value ? new Date(e.target.value) : undefined)}
                                className="rounded-xl text-xs sm:text-sm"
                                required
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Rencana Tanggal Selesai *</Label>
                              <Input
                                type="date"
                                onChange={(e) => handleInputChange('pklEndDate', e.target.value ? new Date(e.target.value) : undefined)}
                                className="rounded-xl text-xs sm:text-sm"
                                required
                              />
                            </div>
                          </div>
                        )}

                        {formData.programType === 'research' && (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Judul Penelitian / Topik Riset *</Label>
                              <Input
                                value={formData.researchTitle}
                                onChange={(e) => handleInputChange('researchTitle', e.target.value)}
                                placeholder="Contoh: Analisis Pola Aktivitas Harian Bekantan (Nasalis larvatus) di Pusat Primata Schmutzer"
                                className="rounded-xl text-xs sm:text-sm"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Jenjang Penelitian</Label>
                                <select
                                  value={formData.researchType}
                                  onChange={(e) => handleInputChange('researchType', e.target.value)}
                                  className="w-full py-2.5 px-3 rounded-xl border border-input bg-background text-xs sm:text-sm focus:ring-2 focus:ring-primary/40"
                                >
                                  <option value="Skripsi (S1)">Skripsi (S1)</option>
                                  <option value="Tesis (S2)">Tesis (S2)</option>
                                  <option value="Disertasi (S3)">Disertasi (S3)</option>
                                  <option value="Jurnal Ilmiah / Mandiri">Jurnal Ilmiah / Mandiri</option>
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Tanggal Mulai Penelitian *</Label>
                                <Input
                                  type="date"
                                  onChange={(e) => handleInputChange('researchStartDate', e.target.value ? new Date(e.target.value) : undefined)}
                                  className="rounded-xl text-xs sm:text-sm"
                                  required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Tanggal Selesai Penelitian *</Label>
                                <Input
                                  type="date"
                                  onChange={(e) => handleInputChange('researchEndDate', e.target.value ? new Date(e.target.value) : undefined)}
                                  className="rounded-xl text-xs sm:text-sm"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.programType === 'koas' && (
                          <KoasFormFields
                            formData={formData}
                            onInputChange={handleInputChange}
                            language={isEn ? 'en' : 'id'}
                          />
                        )}

                        {formData.programType === 'interview' && (
                          <InterviewFormFields
                            formData={formData}
                            onInputChange={handleInputChange}
                            language={isEn ? 'en' : 'id'}
                          />
                        )}

                        <div className="space-y-1.5 pt-2">
                          <Label className="text-xs font-semibold">Motivasi & Ringkasan Rencana Kegiatan</Label>
                          <Textarea
                            value={formData.motivation}
                            onChange={(e) => handleInputChange('motivation', e.target.value)}
                            placeholder="Jelaskan secara singkat latar belakang dan tujuan Anda mengajukan permohonan di UP Taman Margasatwa Ragunan..."
                            rows={3}
                            className="rounded-xl text-xs sm:text-sm resize-none"
                          />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* STEP 3: Unggah Berkas & Checklist */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                        <AppIcon icon="AlertCircle" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-foreground/90 space-y-1">
                          <p className="font-bold text-amber-800 dark:text-amber-300">
                            Ketentuan Unggah Berkas:
                          </p>
                          <p>
                            Format berkas yang didukung adalah <strong>PDF, DOC, DOCX, JPG, PNG</strong> dengan ukuran maksimal <strong>5 MB per berkas</strong>. Pastikan dokumen terbaca dengan jelas.
                          </p>
                        </div>
                      </div>

                      {/* Dropzone Visual */}
                      <div className="p-8 rounded-3xl border-2 border-dashed border-border/80 hover:border-primary/60 transition-colors text-center bg-muted/20 relative group">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 shadow-inner group-hover:scale-105 transition-transform">
                          <AppIcon icon="Upload" className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-foreground mb-1">
                          {isEn ? 'Drop your files here or click to browse' : 'Tarik berkas persyaratan ke sini atau klik untuk memilih file'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {isEn ? 'PDF, DOCX, or Scanned Images up to 5MB' : 'Mendukung Surat Pengantar, Proposal, KTM, dan Surat Pernyataan'}
                        </p>
                      </div>

                      {/* Uploaded Files List */}
                      {formData.documents.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-foreground block">
                            Berkas Terlampir ({formData.documents.length}):
                          </span>
                          <div className="space-y-2">
                            {formData.documents.map((file, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <AppIcon icon="FileCheck" className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="font-semibold text-foreground truncate">{file.name}</span>
                                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(idx)}
                                  className="text-red-500 hover:text-red-700 p-1 font-bold text-xs"
                                >
                                  Hapus
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Official Downloadable Shortcut */}
                      <div className="p-4 rounded-2xl bg-card border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <AppIcon icon="Download" className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">
                            Belum memiliki format Surat Pernyataan atau Formulir Magang?
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('guide')}
                          className="font-bold text-primary hover:underline shrink-0"
                        >
                          Unduh di Tab Panduan →
                        </button>
                      </div>

                    </div>
                  )}

                  {/* STEP 4: Tinjau & Konfirmasi Pengajuan */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                          <AppIcon icon="CheckCircle2" className="w-4 h-4 text-primary" />
                          <span>Tinjau Data Pendaftaran Sebelum Mengirim</span>
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Periksa kembali kebenaran data diri dan dokumen pendukung Anda. Setelah dikirim, Anda akan memperoleh Kode Pelacakan resmi.
                        </p>
                      </div>

                      {/* Summary Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        
                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                          <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[10px]">
                            Program Dipilih
                          </span>
                          <p className="text-base font-black text-foreground capitalize">
                            {formData.programType === 'pkl' ? 'Magang / PKL' :
                             formData.programType === 'research' ? 'Penelitian / Riset' :
                             formData.programType === 'koas' ? 'Koas Dokter Hewan' : 'Wawancara Media'}
                          </p>
                          <p className="text-muted-foreground">
                            Tarif Layanan: <strong className="text-emerald-600">Gratis (Rp 0)</strong>
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                          <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[10px]">
                            Identitas Pemohon
                          </span>
                          <p className="font-bold text-foreground text-sm">{formData.fullName}</p>
                          <p className="text-muted-foreground truncate">{formData.email} • {formData.phone}</p>
                          <p className="text-muted-foreground font-mono">{formData.nim}</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                          <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[10px]">
                            Asal Institusi
                          </span>
                          <p className="font-bold text-foreground text-sm">
                            {formData.programType === 'interview' ? formData.mediaOrganization : formData.institution}
                          </p>
                          <p className="text-muted-foreground">{formData.major}</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                          <span className="font-bold uppercase tracking-wider text-muted-foreground block text-[10px]">
                            Berkas yang Dikirim
                          </span>
                          <p className="font-bold text-foreground text-sm">
                            {formData.documents.length} Dokumen Persyaratan
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Waktu verifikasi standar: maksimal 7 hari kerja
                          </p>
                        </div>

                      </div>

                      {/* Agreement Checkbox */}
                      <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms-check"
                          checked={formData.agreeTerms}
                          onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                          className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary mt-0.5 cursor-pointer shrink-0"
                        />
                        <label htmlFor="terms-check" className="text-xs text-foreground/90 leading-relaxed cursor-pointer select-none">
                          Saya menyatakan bahwa seluruh data dan dokumen yang saya unggah adalah <strong>benar, sah, dan dapat dipertanggungjawabkan</strong>. Saya bersedia menaati seluruh tata tertib serta standar keselamatan dan konservasi satwa yang berlaku di UP Taman Margasatwa Ragunan.
                        </label>
                      </div>

                    </div>
                  )}

                </div>

                {/* Wizard Footer Navigation Controls */}
                <div className="p-6 bg-muted/30 border-t border-border/70 flex items-center justify-between gap-3">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-bold text-xs sm:text-sm text-foreground transition-all flex items-center gap-1.5"
                    >
                      <AppIcon icon="ChevronLeft" className="w-4 h-4" />
                      <span>{isEn ? 'Previous' : 'Sebelumnya'}</span>
                    </button>
                  ) : <div />}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 hover:scale-[1.02]"
                    >
                      <span>{isEn ? 'Next Step' : 'Langkah Berikutnya'}</span>
                      <AppIcon icon="ChevronRight" className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={createRegistration.isPending || !formData.agreeTerms}
                      className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
                    >
                      {createRegistration.isPending ? (
                        <>
                          <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" />
                          <span>{isEn ? 'Submitting...' : 'Mengirim Pengajuan...'}</span>
                        </>
                      ) : (
                        <>
                          <AppIcon icon="Send" className="w-4 h-4" />
                          <span>{isEn ? 'Submit Application Now' : 'Kirim Pengajuan Sekarang'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 3: LIVE TRACKER STATUS PENGAJUAN */}
        {activeTab === 'track' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <LiveStatusTracker
              initialTrackingCode={trackerCode}
              onApplyNew={() => {
                setActiveTab('form');
                handleResetForm();
              }}
            />
          </div>
        )}

        {/* TAB 4: JADWAL & KUOTA KETERSEDIAAN */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="rounded-3xl border-border/80 shadow-sm p-6 md:p-8">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                  <AppIcon icon="CalendarDays" className="w-6 h-6 text-primary" />
                  <span>{isEn ? 'Quota & Schedule Availability' : 'Kalender Ketersediaan Kuota Magang & Penelitian'}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {isEn 
                    ? 'Check available intake slots for each month to schedule your application.'
                    : 'Periksa ketersediaan kuota penerimaan per periode untuk menyesuaikan jadwal permohonan Anda.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <AvailabilityCalendar
                  programType={formData.programType || 'pkl'}
                  selectedDate={formData.pklStartDate}
                  onSelectDate={(d) => {
                    handleInputChange('pklStartDate', d);
                    toast.success(isEn ? 'Date selected' : 'Tanggal dipilih');
                  }}
                  language={isEn ? 'en' : 'id'}
                />
              </CardContent>
            </Card>
          </div>
        )}

      </div>

    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="p-20 text-center">
        <AppIcon icon="Loader2" className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
