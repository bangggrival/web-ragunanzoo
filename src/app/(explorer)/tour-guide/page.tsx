"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTourGuides, useTourPackages, useTourGallery, useCreateBooking, useCheckBookingStatus, TourGuide, TourPackage } from '@/hooks/useTourGuides';
import { useSiteSettings, SiteSettings } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AppIcon } from '@/components/ui/AppIcon';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AnimatedSection from '@/components/ui/AnimatedSection';

const languageLabels: Record<string, any> = {
  id: 'Indonesia',
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
};

const specializationLabels: Record<string, { id: string; en: string }> = {
  satwa: { id: 'Satwa', en: 'Animals' },
  burung: { id: 'Burung', en: 'Birds' },
  reptil: { id: 'Reptil', en: 'Reptiles' },
  primata: { id: 'Primata', en: 'Primates' },
  mamalia: { id: 'Mamalia', en: 'Mammals' },
  flora: { id: 'Flora', en: 'Flora' },
};

const packageIcons: Record<string, React.ReactNode> = {
  Users: <AppIcon icon="solar:users-group-two-rounded-bold-duotone" className="w-6 h-6" />,
  GraduationCap: <AppIcon icon="solar:square-academic-cap-bold-duotone" className="w-6 h-6" />,
  Camera: <AppIcon icon="solar:camera-bold-duotone" className="w-6 h-6" />,
};

export default function TourGuidePage() {
  const { language } = useLanguage();
  const { data: guides = [], isLoading: loadingGuides } = useTourGuides();
  const { data: packages = [], isLoading: loadingPackages } = useTourPackages();
  const { data: gallery = [] } = useTourGallery();
  const { settings: siteSettings } = useSiteSettings();
  const createBooking = useCreateBooking();
  
  const [activeTab, setActiveTab] = useState('guides');
  const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  const [bookingDate, setBookingDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [participants, setParticipants] = useState(1);
  const [notes, setNotes] = useState('');
  
  const { data: bookingStatus, isLoading: loadingStatus, refetch: checkStatus } = useCheckBookingStatus(trackingCode);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
  ];

  const handleBooking = async () => {
    if (!selectedGuide || !selectedPackage || !bookingDate) {
      toast.error(language === 'id' ? 'Lengkapi semua data' : 'Please complete all fields');
      return;
    }

    if (!customerName || !customerPhone) {
      toast.error(language === 'id' ? 'Nama dan nomor telepon wajib diisi' : 'Name and phone are required');
      return;
    }

    const totalPrice = selectedGuide.hourly_rate * selectedPackage.duration_hours * participants;

    try {
      const result = await createBooking.mutateAsync({
        guide_id: selectedGuide.id,
        package_id: selectedPackage.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        booking_date: format(bookingDate, 'yyyy-MM-dd'),
        start_time: startTime,
        duration_hours: selectedPackage.duration_hours,
        participants,
        total_price: totalPrice,
        notes: notes || null,
      });

      toast.success(
        language === 'id' 
          ? `Booking berhasil! Kode: ${result.booking_code}` 
          : `Booking successful! Code: ${result.booking_code}`
      );
      setShowBookingModal(false);
      resetForm();
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const handleWhatsAppBooking = () => {
    if (!selectedGuide || !selectedPackage || !bookingDate) {
      toast.error(language === 'id' ? 'Pilih pemandu, paket, dan tanggal terlebih dahulu' : 'Select guide, package, and date first');
      return;
    }

    const message = language === 'id'
      ? `Halo, saya ingin booking tur:\n\nPemandu: ${selectedGuide.name}\nPaket: ${selectedPackage.name_id}\nTanggal: ${format(bookingDate, 'dd MMMM yyyy', { locale: localeId })}\nWaktu: ${startTime}\nJumlah Peserta: ${participants}\n\nMohon konfirmasi ketersediaan.`
      : `Hello, I want to book a tour:\n\nGuide: ${selectedGuide.name}\nPackage: ${selectedPackage.name_en || selectedPackage.name_id}\nDate: ${format(bookingDate, 'dd MMMM yyyy')}\nTime: ${startTime}\nParticipants: ${participants}\n\nPlease confirm availability.`;

    const phone = siteSettings?.whatsapp_number || '6281234567890';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const resetForm = () => {
    setSelectedGuide(null);
    setSelectedPackage(null);
    setBookingDate(undefined);
    setStartTime('09:00');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setParticipants(1);
    setNotes('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { id: string; en: string }> = {
      pending: { id: 'Menunggu', en: 'Pending' },
      confirmed: { id: 'Dikonfirmasi', en: 'Confirmed' },
      completed: { id: 'Selesai', en: 'Completed' },
      cancelled: { id: 'Dibatalkan', en: 'Cancelled' },
    };
    return labels[status]?.[language] || status;
  };

  if (loadingGuides || loadingPackages) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AppIcon icon="Loader2" className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white py-10 sm:py-16 px-4">
        <div className="container mx-auto text-center">
          <AnimatedSection animation="fade-in-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              {language === 'id' ? 'Layanan Pemandu Wisata' : 'Tour Guide Services'}
            </h1>
            <p className="text-sm sm:text-lg opacity-90 max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
              {language === 'id' 
                ? 'Jelajahi kebun binatang dengan panduan profesional dan berpengalaman'
                : 'Explore the zoo with professional and experienced guides'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <Button 
                size="default" 
                variant="secondary"
                onClick={() => setShowBookingModal(true)}
                className="w-full sm:w-auto"
              >
                <AppIcon icon="Calendar" className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                {language === 'id' ? 'Booking Sekarang' : 'Book Now'}
              </Button>
              <Button 
                size="default" 
                variant="outline"
                className="bg-white/10 border-white/30 hover:bg-white/20 w-full sm:w-auto"
                onClick={() => setShowStatusModal(true)}
              >
                <AppIcon icon="Search" className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                {language === 'id' ? 'Cek Status Booking' : 'Check Booking Status'}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-8 h-auto">
            <TabsTrigger value="guides" className="text-xs sm:text-sm py-2 sm:py-2.5 flex-col sm:flex-row gap-1 sm:gap-2">
              <AppIcon icon="Users" className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'id' ? 'Pemandu' : 'Guides'}</span>
              <span className="sm:hidden text-[10px]">{language === 'id' ? 'Pemandu' : 'Guides'}</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="text-xs sm:text-sm py-2 sm:py-2.5 flex-col sm:flex-row gap-1 sm:gap-2">
              <AppIcon icon="MapPin" className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'id' ? 'Paket Tur' : 'Tour Packages'}</span>
              <span className="sm:hidden text-[10px]">{language === 'id' ? 'Paket' : 'Packages'}</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs sm:text-sm py-2 sm:py-2.5 flex-col sm:flex-row gap-1 sm:gap-2">
              <AppIcon icon="Camera" className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'id' ? 'Galeri' : 'Gallery'}</span>
              <span className="sm:hidden text-[10px]">{language === 'id' ? 'Galeri' : 'Gallery'}</span>
            </TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {guides.map((guide, index) => (
                <AnimatedSection key={guide.id} animation="fade-in-up" delay={index * 100}>
                  <Card className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    selectedGuide?.id === guide.id && "ring-2 ring-primary"
                  )} onClick={() => setSelectedGuide(guide)}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-muted overflow-hidden flex-shrink-0">
                          {guide.photo_url ? (
                            <img src={guide.photo_url} alt={guide.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-muted-foreground">
                              {guide.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base sm:text-lg truncate">{guide.name}</h3>
                          <div className="flex items-center gap-1 text-yellow-500 mb-1 sm:mb-2">
                            <AppIcon icon="Star" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                            <span className="text-xs sm:text-sm font-medium">{guide.rating || 5.0}</span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">({guide.total_reviews || 0})</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-1 sm:mb-2">
                            {guide.languages?.slice(0, 2).map(lang => (
                              <Badge key={lang} variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                                {languageLabels[lang] || lang}
                              </Badge>
                            ))}
                            {guide.languages && guide.languages.length > 2 && (
                              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                                +{guide.languages.length - 2}
                              </Badge>
                            )}
                          </div>
                          <p className="text-primary font-semibold text-sm sm:text-base">
                            {formatCurrency(guide.hourly_rate)}/jam
                          </p>
                        </div>
                      </div>
                      {guide.specialization && guide.specialization.length > 0 && (
                        <div className="mt-2 sm:mt-4 flex flex-wrap gap-1">
                          {guide.specialization.slice(0, 3).map(spec => (
                            <Badge key={spec} variant="outline" className="text-[10px] sm:text-xs">
                              {specializationLabels[spec]?.[language] || spec}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {language === 'id' ? guide.bio_id : guide.bio_en || guide.bio_id}
                      </p>
                      {selectedGuide?.id === guide.id && (
                        <Badge className="mt-2 sm:mt-3 bg-primary text-xs">
                          <AppIcon icon="CheckCircle" className="w-3 h-3 mr-1" />
                          {language === 'id' ? 'Dipilih' : 'Selected'}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}

              {guides.length === 0 && (
                <div className="col-span-full text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
                  {language === 'id' ? 'Belum ada pemandu tersedia' : 'No guides available yet'}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {packages.map((pkg, index) => (
                <AnimatedSection key={pkg.id} animation="fade-in-up" delay={index * 100}>
                  <Card className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    selectedPackage?.id === pkg.id && "ring-2 ring-primary"
                  )} onClick={() => setSelectedPackage(pkg)}>
                    <CardContent className="p-4 sm:pt-6">
                      <div className={cn(
                        "w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4",
                        pkg.color_class === 'primary' && "bg-primary/10 text-primary",
                        pkg.color_class === 'blue-500' && "bg-accent/20 text-accent-foreground",
                        pkg.color_class === 'orange-500' && "bg-secondary/20 text-secondary-foreground"
                      )}>
                        <div className="[&_svg]:w-5 [&_svg]:h-5 sm:[&_svg]:w-6 sm:[&_svg]:h-6">
                          {packageIcons[pkg.icon || 'Users']}
                        </div>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">
                        {language === 'id' ? pkg.name_id : pkg.name_en || pkg.name_id}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                        {language === 'id' ? pkg.description_id : pkg.description_en || pkg.description_id}
                      </p>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <AppIcon icon="Clock" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                          <span>{pkg.duration_hours} {language === 'id' ? 'jam' : 'hours'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AppIcon icon="Users" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                          <span>{language === 'id' ? 'Maks' : 'Max'} {pkg.max_participants} {language === 'id' ? 'peserta' : 'participants'}</span>
                        </div>
                      </div>
                      {selectedPackage?.id === pkg.id && (
                        <Badge className="mt-3 sm:mt-4 bg-primary text-xs">
                          <AppIcon icon="CheckCircle" className="w-3 h-3 mr-1" />
                          {language === 'id' ? 'Dipilih' : 'Selected'}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {gallery.map((item, index) => (
                <AnimatedSection key={item.id} animation="fade-in-up" delay={index * 50}>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={item.image_url} 
                      alt={language === 'id' ? item.caption_id || '' : item.caption_en || item.caption_id || ''} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </AnimatedSection>
              ))}

              {gallery.length === 0 && (
                <div className="col-span-full text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
                  {language === 'id' ? 'Belum ada foto galeri' : 'No gallery photos yet'}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Booking Summary */}
        {(selectedGuide || selectedPackage) && (
          <div className="fixed bottom-16 sm:bottom-4 left-2 right-2 sm:left-auto sm:right-4 sm:w-96 bg-card border rounded-lg shadow-lg p-3 sm:p-4 z-40">
            <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">{language === 'id' ? 'Ringkasan Booking' : 'Booking Summary'}</h4>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              {selectedGuide && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'id' ? 'Pemandu' : 'Guide'}:</span>
                  <span className="font-medium truncate ml-2 max-w-[150px] sm:max-w-none">{selectedGuide.name}</span>
                </div>
              )}
              {selectedPackage && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'id' ? 'Paket' : 'Package'}:</span>
                    <span className="font-medium truncate ml-2 max-w-[150px] sm:max-w-none">{language === 'id' ? selectedPackage.name_id : selectedPackage.name_en || selectedPackage.name_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'id' ? 'Durasi' : 'Duration'}:</span>
                    <span>{selectedPackage.duration_hours} {language === 'id' ? 'jam' : 'hours'}</span>
                  </div>
                </>
              )}
              {selectedGuide && selectedPackage && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">{language === 'id' ? 'Estimasi Harga' : 'Est. Price'}:</span>
                  <span className="font-bold text-primary text-sm sm:text-base">
                    {formatCurrency(selectedGuide.hourly_rate * selectedPackage.duration_hours)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3 sm:mt-4">
              <Button className="flex-1 text-xs sm:text-sm h-9 sm:h-10" onClick={() => setShowBookingModal(true)}>
                {language === 'id' ? 'Booking Online' : 'Book Online'}
              </Button>
              <Button variant="outline" onClick={handleWhatsAppBooking} className="h-9 sm:h-10">
                <AppIcon icon="MessageCircle" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <AppIcon icon="Calendar" className="w-5 h-5 text-primary" />
              {language === 'id' ? 'Form Booking Tur' : 'Tour Booking Form'}
            </DialogTitle>
            <DialogDescription>
              {language === 'id' ? 'Lengkapi data untuk melakukan booking' : 'Complete the form to make a booking'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-5">
              {/* Pilihan Tur Section */}
              <div className="bg-card rounded-lg border p-5">
                <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                  <AppIcon icon="MapPin" className="w-4 h-4 text-primary" />
                  {language === 'id' ? 'Pilihan Tur' : 'Tour Selection'}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {language === 'id' ? 'Pemandu' : 'Guide'} <span className="text-destructive">*</span>
                    </Label>
                    <Select value={selectedGuide?.id || ''} onValueChange={(val) => setSelectedGuide(guides.find(g => g.id === val) || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'id' ? 'Pilih pemandu' : 'Select guide'} />
                      </SelectTrigger>
                      <SelectContent>
                        {guides.map(guide => (
                          <SelectItem key={guide.id} value={guide.id}>
                            {guide.name} - {formatCurrency(guide.hourly_rate)}/jam
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {language === 'id' ? 'Paket Tur' : 'Tour Package'} <span className="text-destructive">*</span>
                    </Label>
                    <Select value={selectedPackage?.id || ''} onValueChange={(val) => setSelectedPackage(packages.find(p => p.id === val) || null)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'id' ? 'Pilih paket' : 'Select package'} />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {language === 'id' ? pkg.name_id : pkg.name_en || pkg.name_id} ({pkg.duration_hours} jam)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Jadwal Section */}
              <div className="bg-card rounded-lg border p-5">
                <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                  <AppIcon icon="Clock" className="w-4 h-4 text-primary" />
                  {language === 'id' ? 'Jadwal' : 'Schedule'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {language === 'id' ? 'Tanggal' : 'Date'} <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start h-11">
                          <AppIcon icon="Calendar" className="mr-2 h-4 w-4" />
                          {bookingDate ? format(bookingDate, 'dd MMM yyyy', { locale: localeId }) : (language === 'id' ? 'Pilih tanggal' : 'Select date')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={bookingDate}
                          onSelect={setBookingDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {language === 'id' ? 'Waktu Mulai' : 'Start Time'} <span className="text-destructive">*</span>
                    </Label>
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium">
                    {language === 'id' ? 'Jumlah Peserta' : 'Participants'}
                  </Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={selectedPackage?.max_participants || 20}
                    value={participants}
                    onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'id' ? `Maksimal ${selectedPackage?.max_participants || 20} peserta` : `Maximum ${selectedPackage?.max_participants || 20} participants`}
                  </p>
                </div>
              </div>

              {/* Data Pemesan Section */}
              <div className="bg-card rounded-lg border p-5">
                <h3 className="font-semibold text-base flex items-center gap-2 mb-4">
                  <AppIcon icon="Users" className="w-4 h-4 text-primary" />
                  {language === 'id' ? 'Data Pemesan' : 'Customer Information'}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {language === 'id' ? 'Nama Lengkap' : 'Full Name'} <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)} 
                      placeholder={language === 'id' ? 'Masukkan nama lengkap' : 'Enter full name'}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {language === 'id' ? 'Nomor Telepon' : 'Phone Number'} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <AppIcon icon="Phone" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          value={customerPhone} 
                          onChange={(e) => setCustomerPhone(e.target.value)} 
                          placeholder="08xxxxxxxxxx"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <Input 
                        type="email" 
                        value={customerEmail} 
                        onChange={(e) => setCustomerEmail(e.target.value)} 
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{language === 'id' ? 'Catatan' : 'Notes'}</Label>
                    <Textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      rows={3} 
                      placeholder={language === 'id' ? 'Catatan tambahan (opsional)' : 'Additional notes (optional)'}
                    />
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              {selectedGuide && selectedPackage && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-sm">{language === 'id' ? 'Ringkasan Harga' : 'Price Summary'}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{language === 'id' ? 'Tarif pemandu' : 'Guide rate'}</span>
                      <span>{formatCurrency(selectedGuide.hourly_rate)}/jam</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{language === 'id' ? 'Durasi' : 'Duration'}</span>
                      <span>{selectedPackage.duration_hours} jam</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{language === 'id' ? 'Peserta' : 'Participants'}</span>
                      <span>{participants} orang</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatCurrency(selectedGuide.hourly_rate * selectedPackage.duration_hours * participants)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-muted/30 flex-shrink-0 flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleBooking}
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? <AppIcon icon="Loader2" className="w-4 h-4 mr-2 animate-spin" /> : null}
              {language === 'id' ? 'Kirim Booking' : 'Submit Booking'}
            </Button>
            <Button variant="outline" onClick={handleWhatsAppBooking}>
              <AppIcon icon="MessageCircle" className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check Status Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'id' ? 'Cek Status Booking' : 'Check Booking Status'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{language === 'id' ? 'Kode Booking' : 'Booking Code'}</Label>
              <div className="flex gap-2">
                <Input 
                  value={trackingCode} 
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="TUR-XXXXXX-XXXX"
                />
                <Button onClick={() => checkStatus()} disabled={!trackingCode || loadingStatus}>
                  {loadingStatus ? <AppIcon icon="Loader2" className="w-4 h-4 animate-spin" /> : <AppIcon icon="Search" className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {bookingStatus && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono font-bold">{bookingStatus.booking_code}</span>
                    <Badge className={getStatusColor(bookingStatus.status)}>
                      {getStatusLabel(bookingStatus.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'id' ? 'Pemandu' : 'Guide'}:</span>
                      <span>{(bookingStatus.guide as any)?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'id' ? 'Paket' : 'Package'}:</span>
                      <span>{language === 'id' ? (bookingStatus.package as any)?.name_id : (bookingStatus.package as any)?.name_en || (bookingStatus.package as any)?.name_id || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'id' ? 'Tanggal' : 'Date'}:</span>
                      <span>{format(new Date(bookingStatus.booking_date), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{language === 'id' ? 'Waktu' : 'Time'}:</span>
                      <span>{bookingStatus.start_time}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(bookingStatus.total_price)}</span>
                    </div>
                  </div>
                  
                  {bookingStatus.status === 'confirmed' && (bookingStatus.guide as any)?.phone && (
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => window.open(`https://wa.me/${(bookingStatus.guide as any).phone}`, '_blank')}
                    >
                      <AppIcon icon="Phone" className="w-4 h-4 mr-2" />
                      {language === 'id' ? 'Hubungi Pemandu' : 'Contact Guide'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {trackingCode && !loadingStatus && !bookingStatus && (
              <p className="text-center text-muted-foreground py-4">
                {language === 'id' ? 'Booking tidak ditemukan' : 'Booking not found'}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
