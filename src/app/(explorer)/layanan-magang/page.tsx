"use client";

import Link from 'next/link';
import { 
  FileText, CheckCircle, Calendar, Download, Info, 
  MapPin, Mail, Phone, Globe, Clock, ChevronDown, 
  MessageSquare, FileSearch, CheckSquare, FileCheck, Play,
  ArrowRight, Search, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { id as idLocale } from 'date-fns/locale';

export default function LayananMagangPage() {
  const scrollToAlur = () => {
    const element = document.getElementById('alur-pengajuan');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      id: 1,
      title: "Konsultasi",
      description: "Konsultasi awal dengan Pengelola Pendidikan dan Kerja Sama UP TMR, paling lambat 1 bulan sebelum waktu pelaksanaan.",
      icon: MessageSquare,
    },
    {
      id: 2,
      title: "Permohonan",
      description: "Mengajukan dokumen persyaratan lengkap, paling lambat 10 hari sebelum waktu pelaksanaan.",
      icon: FileSearch,
    },
    {
      id: 3,
      title: "Proses Administrasi",
      description: "Dokumen diproses maksimal 7 hari kerja.",
      icon: Clock,
    },
    {
      id: 4,
      title: "Penerbitan Surat Keterangan",
      description: "Surat Keterangan & Surat Balasan untuk kampus/sekolah dapat diambil sebelum kegiatan dimulai.",
      icon: FileCheck,
    },
    {
      id: 5,
      title: "Pelaksanaan",
      description: "Peserta melaksanakan kegiatan sesuai aturan yang berlaku.",
      icon: Play,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-b from-green-900 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542385262-cdf06b539c23?q=80&w=2070')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-green-900/80 mix-blend-multiply" />
        </div>
        
        <div className="container relative z-10 px-4 mx-auto max-w-6xl">
          <AnimatedSection animation="fade-in-up">
            <div className="max-w-3xl">
              <Badge variant="outline" className="text-green-100 border-green-400 mb-4 bg-green-900/50">
                Pendidikan & Kerja Sama
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Layanan Magang, PKL, Penelitian & Wawancara
              </h1>
              <p className="text-lg text-green-50 mb-8 max-w-2xl leading-relaxed">
                UP TMR membuka kesempatan bagi pelajar, mahasiswa, dan peneliti untuk melaksanakan magang, Praktik Kerja Lapangan (PKL), penelitian (skripsi/tesis/disertasi), maupun wawancara terkait Taman Margasatwa Ragunan.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/services?tab=form">
                  <Button 
                    size="lg" 
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold border-0 shadow-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Daftar Online Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/services?tab=track">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold backdrop-blur-sm flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Lacak Status Pengajuan</span>
                  </Button>
                </Link>

                <Button 
                  onClick={scrollToAlur}
                  size="lg" 
                  variant="ghost"
                  className="text-white hover:bg-white/10 flex items-center gap-1.5 text-sm"
                >
                  <span>Lihat Alur & Dokumen</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <div className="container px-4 mx-auto max-w-6xl -mt-8 relative z-20">
        
        {/* Alur Pengajuan */}
        <AnimatedSection animation="fade-in-up" delay={100}>
          <Card id="alur-pengajuan" className="mb-12 shadow-md border-0 scroll-mt-24">
            <CardHeader className="bg-white rounded-t-xl pb-0 pt-8 px-6 md:px-10">
              <CardTitle className="text-2xl text-green-900 flex items-center">
                <CheckCircle className="mr-3 h-6 w-6 text-green-600" />
                Alur Pengajuan
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Proses pengajuan kegiatan akademik dan penelitian di UP TMR
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <div className="relative">
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-green-100 hidden md:block"></div>
                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <div key={step.id} className="relative flex flex-col md:flex-row gap-4 md:gap-8 group">
                      <div className="flex items-center md:items-start shrink-0">
                        <div className="w-14 h-14 rounded-full bg-green-50 border-4 border-white shadow-sm flex items-center justify-center text-green-600 relative z-10 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <div className="h-0.5 flex-1 bg-green-100 mx-4 md:hidden"></div>
                        <div className="text-4xl font-bold text-green-100 md:hidden">{step.id}</div>
                      </div>
                      
                      <div className="flex-1 bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group-hover:border-green-200">
                        <div className="flex items-center mb-2">
                          <span className="hidden md:flex text-3xl font-black text-green-100 mr-3 select-none">{step.id}</span>
                          <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed md:ml-12">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Jenis Layanan & Persyaratan */}
        <AnimatedSection animation="fade-in-up" delay={200}>
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <FileText className="mr-3 h-6 w-6 text-green-600" />
              Pilih Jenis Layanan & Persyaratan
            </h2>
            
            <Tabs defaultValue="penelitian" className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-8 bg-green-50 p-1 h-auto rounded-xl">
                <TabsTrigger value="penelitian" className="text-base py-3 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm rounded-lg">
                  Penelitian (Skripsi/Tesis/Disertasi)
                </TabsTrigger>
                <TabsTrigger value="magang" className="text-base py-3 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm rounded-lg">
                  Magang / PKL / Wawancara
                </TabsTrigger>
              </TabsList>
              
              {/* Tab A - Penelitian */}
              <TabsContent value="penelitian" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6 md:p-8 space-y-8">
                    
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-md">
                      <p className="text-orange-800 flex items-start">
                        <Info className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                        <span><strong>Penting:</strong> UP TMR berhak menolak permohonan bila topik penelitian tidak relevan dengan tugas & fungsi UP TMR.</span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-green-800 border-b pb-2">Dokumen Persyaratan</h3>
                      <p className="text-slate-600 text-sm italic">Diserahkan paling lambat 10 hari kerja sebelum kegiatan:</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {[
                          "Surat Pengantar Izin Penelitian dari universitas, ditujukan kepada Kepala UP TMR",
                          "Proposal Penelitian lengkap BAB 1–3 (judul, tujuan, metodologi, jangka waktu)",
                          "Daftar pertanyaan wawancara lengkap / daftar kebutuhan data",
                          "Surat Pernyataan bermaterai (template tersedia untuk diunduh)",
                          "FC Kartu Mahasiswa",
                          "FC KTP",
                          "Lembar Konsultasi (ditandatangani Pengelola Pendidikan dan Kerjasama antar LK maksimal 1 bulan sebelum penelitian)"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-green-800 border-b pb-2">Kewajiban Selama Penelitian</h3>
                      <ol className="space-y-3 list-decimal list-inside text-slate-700 ml-2">
                        <li className="pl-2">Mengisi daftar hadir di Gedung Kesehatan Hewan UP TMR setiap kehadiran</li>
                        <li className="pl-2">Melapor hasil kegiatan secara lisan ke UP TMR melalui Pengelola Pendidikan dan Kerjasama Antar LK</li>
                        <li className="pl-2">Menyerahkan hasil skripsi/tesis/disertasi (softcopy & hardcopy) ke UP TMR</li>
                      </ol>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab B - Magang */}
              <TabsContent value="magang" className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6 md:p-8 space-y-8">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center">
                          <Clock className="h-8 w-8 text-blue-500 mr-4" />
                          <div>
                            <p className="text-sm text-blue-800 font-medium">Durasi Pelaksanaan</p>
                            <p className="text-lg font-bold text-blue-900">Minimal 1 Bulan</p>
                          </div>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center">
                          <Calendar className="h-8 w-8 text-purple-500 mr-4" />
                          <div>
                            <p className="text-sm text-purple-800 font-medium">Jadwal Kegiatan</p>
                            <p className="text-lg font-bold text-purple-900">Senin - Jumat, 07.30 - 15.00 WIB</p>
                          </div>
                        </div>
                      </div>

                      {/* Calendar Availability (Matching Sewa Tempat) */}
                      <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-600" />
                          Ilustrasi Jadwal Magang
                        </h4>
                        <div className="flex justify-center bg-slate-50/50 p-2 rounded-lg border border-slate-100 max-w-sm mx-auto">
                          <CalendarComponent
                            mode="multiple"
                            selected={[]}
                            modifiers={{ booked: (date) => date.getDay() === 0 || date.getDay() === 6 }}
                            modifiersStyles={{
                              booked: {
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontWeight: 'bold',
                                textDecoration: 'line-through'
                              }
                            }}
                            locale={idLocale}
                            className="pointer-events-none"
                          />
                        </div>
                        <div className="mt-3 flex justify-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-slate-600">Akhir Pekan (Libur)</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div><span className="text-slate-600">Hari Kerja (Tersedia)</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-green-800 border-b pb-2">Dokumen Persyaratan</h3>
                      <p className="text-slate-600 text-sm italic">Diserahkan paling lambat 10 hari kerja sebelum kegiatan:</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {[
                          "Surat Pengantar Izin dari sekolah/universitas, ditujukan kepada Kepala UP TMR",
                          "Proposal kegiatan (judul, tujuan, jangka waktu)",
                          "FC Kartu Mahasiswa/Pelajar",
                          "FC KTP",
                          "Formulir Permohonan Magang/PKL/Wawancara (template tersedia untuk diunduh)",
                          "Lembar Konsultasi (ditandatangani maksimal 1 bulan sebelum kegiatan)"
                        ].map((item, i) => (
                          <li key={i} className="flex items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                            <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-green-800 border-b pb-2">Perlengkapan</h3>
                        <div className="space-y-3">
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="font-semibold text-slate-800 mb-1">Kegiatan Lapangan:</p>
                            <p className="text-sm text-slate-600">Pakaian kerja (wearpack) atau pakaian sopan & nyaman, sepatu/boots, sarung tangan (bila perlu), alat tulis.</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="font-semibold text-slate-800 mb-1">Kegiatan Kantor:</p>
                            <p className="text-sm text-slate-600">Seragam sekolah/pakaian kerja formal, sepatu, alat tulis.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-green-800 border-b pb-2">Kewajiban</h3>
                        <ol className="space-y-2 list-decimal list-inside text-slate-700 ml-2 text-sm">
                          <li className="pl-1">Mengisi daftar hadir di Gedung Kesehatan Hewan</li>
                          <li className="pl-1">Membuat laporan tertulis kegiatan</li>
                          <li className="pl-1">Melapor hasil kegiatan lisan melalui Analis Perencanaan dan Kerjasama</li>
                          <li className="pl-1">Menyerahkan laporan kegiatan (soft & hardcopy)</li>
                        </ol>
                        
                        <div className="mt-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                          <p className="text-sm text-orange-800 font-medium mb-1">Aturan Tambahan:</p>
                          <ul className="list-disc list-inside text-xs text-orange-700 space-y-1">
                            <li>Akses masuk/keluar melalui Pintu Barat</li>
                            <li>Peserta harus di lokasi penempatan, dilarang berkeliling TMR bebas</li>
                            <li>Jumlah peserta mengikuti kuota tersedia</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </AnimatedSection>

        {/* Unduh Dokumen */}
        <AnimatedSection animation="fade-in-up" delay={300}>
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Download className="mr-3 h-6 w-6 text-green-600" />
              Unduh Formulir & Dokumen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="border border-green-100 hover:border-green-300 transition-colors shadow-sm hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>Surat Pernyataan Penelitian</span>
                    <Badge variant="secondary" className="bg-slate-100">Doc/PDF</Badge>
                  </CardTitle>
                  <CardDescription>
                    Wajib bermaterai Rp10.000. Memuat data diri, judul penelitian, dan pernyataan kesediaan menaati tata tertib.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Format Surat
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border border-green-100 hover:border-green-300 transition-colors shadow-sm hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>Formulir Permohonan PKL/Magang</span>
                    <Badge variant="secondary" className="bg-slate-100">Doc/PDF</Badge>
                  </CardTitle>
                  <CardDescription>
                    Memuat data diri, institusi, periode durasi, maksud tujuan, dan minat bidang penempatan.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Formulir
                  </Button>
                </CardFooter>
              </Card>

            </div>
          </div>
        </AnimatedSection>

        {/* FAQ & Kontak */}
        <AnimatedSection animation="fade-in-up" delay={400}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Info className="mr-3 h-6 w-6 text-green-600" />
                Pertanyaan Umum (FAQ)
              </h2>
              <Accordion type="single" collapsible className="w-full bg-white rounded-xl shadow-sm border border-slate-100 px-4">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-green-700">
                    Apakah PKL bisa dilaksanakan kurang dari 1 bulan?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    Sesuai ketentuan yang berlaku di UP TMR, durasi pelaksanaan magang atau Praktik Kerja Lapangan (PKL) minimal adalah 1 bulan untuk memastikan peserta mendapatkan pengalaman dan pengetahuan yang optimal.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-green-700">
                    Apakah pengajuan bisa perorangan atau harus kelompok?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    Pengajuan dapat dilakukan baik secara perorangan maupun kelompok. Namun, penerimaan tetap bergantung pada kuota ketersediaan di masing-masing bidang penempatan pada periode yang diajukan.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-green-700">
                    Apakah ada biaya yang dikenakan untuk magang/penelitian?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600">
                    UP TMR tidak memungut biaya apapun (gratis) untuk proses pengajuan dan pelaksanaan magang, PKL, penelitian, maupun wawancara.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Phone className="mr-3 h-6 w-6 text-green-600" />
                Informasi Kontak
              </h2>
              <Card className="border-0 shadow-md bg-green-900 text-white">
                <CardContent className="p-6 space-y-6">
                  <p className="text-green-100 text-sm mt-4 mb-4">
                    Untuk informasi lebih lanjut mengenai pengajuan, silakan hubungi bagian Pendidikan & Kerja Sama UP TMR:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-green-400 mr-3 shrink-0 mt-0.5" />
                      <span className="text-sm">Jalan Harsono RM No. 1, Ragunan, Pasar Minggu, Jakarta Selatan 12550</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-green-400 mr-3 shrink-0" />
                      <a href="mailto:ragunanzoo@jakarta.go.id" className="text-sm hover:text-green-300 transition-colors">
                        ragunanzoo@jakarta.go.id
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-green-400 mr-3 shrink-0" />
                      <a href="tel:+622178847114" className="text-sm hover:text-green-300 transition-colors">
                        +6221 78847114
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-green-400 mr-3 shrink-0" />
                      <a href="https://ragunanzoo.jakarta.go.id" target="_blank" rel="noreferrer" className="text-sm hover:text-green-300 transition-colors">
                        ragunanzoo.jakarta.go.id
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </AnimatedSection>
        
      </div>
    </div>
  );
}
