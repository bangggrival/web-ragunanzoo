"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, MapPin, Calendar, Image, Plus, Pencil, Trash2, Star, Loader2, Eye, CheckCircle, XCircle, Clock, Compass } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { TablePagination } from '@/components/ui/TablePagination';
import ImageInputWithGallery from '@/components/gallery/ImageInputWithGallery';
import { TourGuideFormModal } from '@/components/modals/TourGuideFormModal';
import { TourGuide, TourPackage, TourBooking, TourGalleryItem, MOCK_GUIDES, MOCK_PACKAGES, MOCK_GALLERY } from '@/hooks/useTourGuides';
import { 
  upsertGuideAction, 
  deleteGuideAction, 
  upsertPackageAction, 
  deletePackageAction, 
  updateBookingStatusAction, 
  createGalleryImageAction, 
  deleteGalleryImageAction 
} from './actions';
import { supabase } from '@/integrations/supabase/client';

// Global audio context to satisfy browser autoplay policies
let globalAudioCtx: AudioContext | null = null;
if (typeof window !== 'undefined') {
  const initAudio = () => {
    if (!globalAudioCtx) {
      globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(e => console.error(e));
    }
  };
  window.addEventListener('click', initAudio, { once: true });
  window.addEventListener('keydown', initAudio, { once: true });
}

const ITEMS_PER_PAGE = 10;

export default function ManageTourGuidesClient() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [guidesRes, packagesRes, bookingsRes, galleryRes] = await Promise.all([
          supabase.from('tour_guides').select('*').order('name'),
          supabase.from('tour_packages').select('*').order('name_id'),
          supabase.from('tour_bookings').select('*, guide:tour_guides(*)').order('created_at', { ascending: false }),
          supabase.from('tour_gallery').select('*').order('order_index'),
        ]);
        if (guidesRes.data !== null && Array.isArray(guidesRes.data)) setGuides(guidesRes.data as any);
        else setGuides(MOCK_GUIDES as any);

        if (packagesRes.data !== null && Array.isArray(packagesRes.data)) setPackages(packagesRes.data as any);
        else setPackages(MOCK_PACKAGES as any);

        if (bookingsRes.data) setBookings(bookingsRes.data as any);

        if (galleryRes.data !== null && Array.isArray(galleryRes.data)) setGallery(galleryRes.data as any);
        else setGallery(MOCK_GALLERY as any);
      } catch (err) {
        console.error('Error fetching data:', err);
        setGuides(MOCK_GUIDES as any);
        setPackages(MOCK_PACKAGES as any);
        setGallery(MOCK_GALLERY as any);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // Setup realtime subscription for bookings via custom window event
    const handleDbChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const change = customEvent.detail;
      
      if (change.table === 'tour_bookings') {
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

          const newBooking = change.record as TourBooking;
          // We don't have the full joined guide data here, but we can append it with an empty guide
          setBookings((prev) => [newBooking, ...prev]);
          toast.success(`Booking pemandu baru diterima: ${newBooking.customer_name}`, {
            description: `Kode: ${newBooking.booking_code} | Tanggal: ${newBooking.booking_date}`,
            duration: 5000,
          });
        } else if (change.type === 'UPDATE') {
          const updatedBooking = change.record as TourBooking;
          setBookings((prev) =>
            prev.map((booking) => (booking.id === updatedBooking.id ? { ...booking, ...updatedBooking } : booking))
          );
        }
      }
    };

    window.addEventListener('supabase-db-change', handleDbChange);

    return () => {
      window.removeEventListener('supabase-db-change', handleDbChange);
    };
  }, []);

  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('guides');
  
  // States
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [gallery, setGallery] = useState<TourGalleryItem[]>([]);

  // Modal states
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Bulletproof fix for Radix UI Dialog freezing the page
  useEffect(() => {
    if (!showGuideModal && !showPackageModal && !showBookingModal && !showGalleryModal) {
      setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 100);
    }
  }, [showGuideModal, showPackageModal, showBookingModal, showGalleryModal]);
  
  // Edit states
  const [editingGuide, setEditingGuide] = useState<TourGuide | null>(null);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<TourBooking | null>(null);
  
  // Loading states
  const [savingPackage, setSavingPackage] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);

  // Form states - Package
  const [pkgNameId, setPkgNameId] = useState('');
  const [pkgNameEn, setPkgNameEn] = useState('');
  const [pkgDescId, setPkgDescId] = useState('');
  const [pkgDescEn, setPkgDescEn] = useState('');
  const [pkgDuration, setPkgDuration] = useState(2);
  const [pkgMaxParticipants, setPkgMaxParticipants] = useState(20);
  const [pkgIcon, setPkgIcon] = useState('Users');
  const [pkgActive, setPkgActive] = useState(true);
  
  // Form states - Gallery
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [galleryCaptionId, setGalleryCaptionId] = useState('');
  const [galleryCaptionEn, setGalleryCaptionEn] = useState('');
  
  // Booking update states
  const [bookingStatus, setBookingStatus] = useState<TourBooking['status']>('pending');
  const [bookingAdminNotes, setBookingAdminNotes] = useState('');
  
  // Pagination
  const [guidePage, setGuidePage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);

  // Reset package form
  const resetPackageForm = () => {
    setPkgNameId('');
    setPkgNameEn('');
    setPkgDescId('');
    setPkgDescEn('');
    setPkgDuration(2);
    setPkgMaxParticipants(20);
    setPkgIcon('Users');
    setPkgActive(true);
    setEditingPackage(null);
  };

  // Open guide modal for edit
  const openEditGuide = (guide: TourGuide) => {
    setEditingGuide(guide);
    setShowGuideModal(true);
  };

  // Open package modal for edit
  const openEditPackage = (pkg: TourPackage) => {
    setEditingPackage(pkg);
    setPkgNameId(pkg.name_id);
    setPkgNameEn(pkg.name_en || '');
    setPkgDescId(pkg.description_id || '');
    setPkgDescEn(pkg.description_en || '');
    setPkgDuration(pkg.duration_hours);
    setPkgMaxParticipants(pkg.max_participants || 20);
    setPkgIcon(pkg.icon || 'Users');
    setPkgActive(pkg.is_active ?? true);
    setShowPackageModal(true);
  };

  // Handle guide submit from modal
  const handleGuideSubmit = async (data: Omit<TourGuide, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews'>) => {
    try {
      const payload = {
        id: editingGuide?.id,
        ...data
      };
      const result = await upsertGuideAction(payload);
      if (!result.success) throw new Error(result.error);
      
      toast.success(editingGuide ? 'Pemandu berhasil diperbarui' : 'Pemandu berhasil ditambahkan');
      setShowGuideModal(false);
      setEditingGuide(null);
      window.location.reload();
    } catch (err: any) {
      toast.error('Gagal menyimpan pemandu: ' + err.message);
    }
  };

  const handleDeleteGuide = async (id: string) => {
    try {
      const result = await deleteGuideAction(id);
      if (!result.success) throw new Error(result.error);
      toast.success('Pemandu berhasil dihapus');
      setGuides(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      toast.error('Gagal menghapus pemandu: ' + err.message);
    }
  };

  // Handle package submit
  const handlePackageSubmit = async () => {
    if (!pkgNameId) {
      toast.error('Nama paket wajib diisi');
      return;
    }

    setSavingPackage(true);
    try {
      const packageData = {
        id: editingPackage?.id,
        name_id: pkgNameId,
        name_en: pkgNameEn || null,
        description_id: pkgDescId || null,
        description_en: pkgDescEn || null,
        duration_hours: pkgDuration,
        max_participants: pkgMaxParticipants,
        icon: pkgIcon,
        is_active: pkgActive,
        min_participants: 1,
        color_class: 'primary',
        order_index: 0,
      };

      const result = await upsertPackageAction(packageData);
      if (!result.success) throw new Error(result.error);

      toast.success(editingPackage ? 'Paket tur diperbarui' : 'Paket tur ditambahkan');
      setShowPackageModal(false);
      resetPackageForm();
      window.location.reload();
    } catch (err: any) {
      toast.error('Gagal menyimpan paket tur: ' + err.message);
    } finally {
      setSavingPackage(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      const result = await deletePackageAction(id);
      if (!result.success) throw new Error(result.error);
      toast.success('Paket tur berhasil dihapus');
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error('Gagal menghapus paket tur: ' + err.message);
    }
  };

  // Open booking modal
  const openBookingDetail = (booking: TourBooking) => {
    setSelectedBooking(booking);
    setBookingStatus(booking.status);
    setBookingAdminNotes(booking.admin_notes || '');
    setShowBookingModal(true);
  };

  // Handle booking status update
  const handleBookingUpdate = async () => {
    if (!selectedBooking) return;

    setSavingBooking(true);
    try {
      const result = await updateBookingStatusAction(selectedBooking.id, bookingStatus, bookingAdminNotes || undefined);
      if (!result.success) throw new Error(result.error);

      toast.success('Status booking berhasil diperbarui');
      setShowBookingModal(false);
      // Do not set selectedBooking to null here to allow Radix Dialog exit animation to complete cleanly
      
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? {
        ...b,
        status: bookingStatus,
        admin_notes: bookingAdminNotes
      } : b));
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
    } finally {
      setSavingBooking(false);
    }
  };

  // Handle gallery add
  const handleAddGalleryImage = async () => {
    if (!galleryImageUrl) {
      toast.error('URL gambar wajib diisi');
      return;
    }

    setSavingGallery(true);
    try {
      const payload = {
        image_url: galleryImageUrl,
        caption_id: galleryCaptionId || null,
        caption_en: galleryCaptionEn || null,
        is_active: true,
        order_index: gallery.length,
      };

      const result = await createGalleryImageAction(payload);
      if (!result.success) throw new Error(result.error);

      toast.success('Gambar berhasil ditambahkan');
      setGalleryImageUrl('');
      setGalleryCaptionId('');
      setGalleryCaptionEn('');
      setShowGalleryModal(false);
      window.location.reload();
    } catch (err: any) {
      toast.error('Gagal menambahkan gambar: ' + err.message);
    } finally {
      setSavingGallery(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      const result = await deleteGalleryImageAction(id);
      if (!result.success) throw new Error(result.error);
      toast.success('Gambar berhasil dihapus');
      setGallery(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      toast.error('Gagal menghapus gambar: ' + err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    const labels: Record<string, string> = {
      pending: 'Menunggu',
      confirmed: 'Dikonfirmasi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return <Badge variant="outline" className={`font-bold border ${styles[status]}`}>{labels[status] || status}</Badge>;
  };

  // Paginated data
  const paginatedGuides = guides.slice((guidePage - 1) * ITEMS_PER_PAGE, guidePage * ITEMS_PER_PAGE);
  const paginatedBookings = bookings.slice((bookingPage - 1) * ITEMS_PER_PAGE, bookingPage * ITEMS_PER_PAGE);

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
    <>
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
              <Compass className="w-5 h-5 text-green-500" />
            </div>
            Kelola Pemandu Wisata
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-13">Kelola pemandu, paket tur, booking dan galeri</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-2xl border border-slate-200 h-auto">
          <TabsTrigger value="guides" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
            <Users className="w-4 h-4 md:mr-2" />
            {!isMobile && 'Pemandu'}
          </TabsTrigger>
          <TabsTrigger value="packages" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
            <MapPin className="w-4 h-4 md:mr-2" />
            {!isMobile && 'Paket Tur'}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
            <Calendar className="w-4 h-4 md:mr-2" />
            {!isMobile && 'Booking'}
          </TabsTrigger>
          <TabsTrigger value="gallery" className="py-2.5 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm">
            <Image className="w-4 h-4 md:mr-2" />
            {!isMobile && 'Galeri'}
          </TabsTrigger>
        </TabsList>

        {/* GUIDES TAB */}
        <TabsContent value="guides" className="space-y-6 mt-6">
          <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl border border-white/80 p-4 rounded-[1.5rem] shadow-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" /> Daftar Pemandu
            </h2>
            <button onClick={() => { setEditingGuide(null); setShowGuideModal(true); }} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Pemandu</span>
            </button>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm overflow-hidden">
            {isMobile ? (
              <div className="p-4 space-y-4">
                {paginatedGuides.map(guide => (
                  <div key={guide.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                        {guide.photo_url ? (
                          <img src={guide.photo_url} alt={guide.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-300">
                            {guide.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-slate-800">{guide.name}</h3>
                          <Badge variant="outline" className={guide.is_active ? 'border-green-200 bg-green-50 text-green-600' : 'border-slate-200 bg-slate-50 text-slate-500'}>
                            {guide.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-amber-500 font-bold mb-1">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {guide.rating || 5.0}
                        </div>
                        <p className="text-sm text-green-600 font-bold">{formatCurrency(guide.hourly_rate)} <span className="text-slate-400 font-medium">/jam</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg border-slate-200" onClick={() => openEditGuide(guide)}>
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="rounded-lg border-slate-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Pemandu?</AlertDialogTitle>
                            <AlertDialogDescription>Pemandu {guide.name} akan dihapus. Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                            <AlertDialogAction className="rounded-xl bg-rose-500 hover:bg-rose-600" onClick={() => handleDeleteGuide(guide.id)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                {guides.length === 0 && <p className="text-center text-slate-500 font-medium py-8">Belum ada pemandu.</p>}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Pemandu</TableHead>
                    <TableHead className="font-bold text-slate-700">Rating</TableHead>
                    <TableHead className="font-bold text-slate-700">Tarif/Jam</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGuides.map(guide => (
                    <TableRow key={guide.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            {guide.photo_url ? (
                              <img src={guide.photo_url} alt={guide.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">
                                {guide.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-slate-800">{guide.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-4 h-4 fill-current" />
                          {guide.rating || 5.0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">{formatCurrency(guide.hourly_rate)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={guide.is_active ? 'border-green-200 bg-green-50 text-green-600' : 'border-slate-200 bg-slate-50 text-slate-500'}>
                          {guide.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg border-slate-200 hover:bg-slate-50" onClick={() => openEditGuide(guide)}>
                            <Pencil className="w-4 h-4 text-slate-600" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg border-slate-200 hover:bg-rose-50 text-rose-500 hover:border-rose-200"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Pemandu?</AlertDialogTitle>
                                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                                <AlertDialogAction className="rounded-xl bg-rose-500 hover:bg-rose-600" onClick={() => handleDeleteGuide(guide.id)}>Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {guides.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-medium">Belum ada pemandu.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {guides.length > ITEMS_PER_PAGE && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <TablePagination
                  currentPage={guidePage}
                  totalPages={Math.ceil(guides.length / ITEMS_PER_PAGE)}
                  onPageChange={setGuidePage}
                  totalItems={guides.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageSizeChange={() => {}}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* PACKAGES TAB */}
        <TabsContent value="packages" className="space-y-6 mt-6">
          <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl border border-white/80 p-4 rounded-[1.5rem] shadow-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-500" /> Daftar Paket Tur
            </h2>
            <button onClick={() => { resetPackageForm(); setShowPackageModal(true); }} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Paket</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm p-6 hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg border-slate-200 bg-white/90 hover:bg-white text-slate-600 hover:text-green-600 shadow-sm backdrop-blur-sm" onClick={() => openEditPackage(pkg)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg border-slate-200 bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 shadow-sm backdrop-blur-sm"><Trash2 className="w-4 h-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Paket?</AlertDialogTitle>
                        <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                        <AlertDialogAction className="rounded-xl bg-rose-500 hover:bg-rose-600" onClick={() => handleDeletePackage(pkg.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex justify-between items-start mb-4 pr-20">
                  <h3 className="font-bold text-slate-800 text-lg">{pkg.name_id}</h3>
                </div>
                
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 font-medium flex-1">{pkg.description_id}</p>
                
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold">{pkg.duration_hours} jam</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold">Max {pkg.max_participants}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Badge variant="outline" className={pkg.is_active ? 'border-green-200 bg-green-50 text-green-600' : 'border-slate-200 bg-slate-50 text-slate-500'}>
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>
            ))}
            {packages.length === 0 && <div className="col-span-full text-center py-12 text-slate-500 font-medium">Belum ada paket tur.</div>}
          </div>
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings" className="space-y-6 mt-6">
          <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl border border-white/80 p-4 rounded-[1.5rem] shadow-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" /> Daftar Booking
            </h2>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm overflow-hidden">
            {isMobile ? (
              <div className="p-4 space-y-4">
                {paginatedBookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-green-200 transition-colors" onClick={() => openBookingDetail(booking)}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-sm font-black text-green-900 bg-green-50 px-2 py-1 rounded-lg">{booking.booking_code}</span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="font-bold text-slate-800 mb-1">{booking.customer_name}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(booking.booking_date), 'dd MMM yyyy')} - {booking.start_time}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
                      <span className="text-sm text-green-600 font-black">{formatCurrency(booking.total_price)}</span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-center text-slate-500 font-medium py-8">Belum ada booking.</p>}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Kode & Pelanggan</TableHead>
                    <TableHead className="font-bold text-slate-700">Tanggal Tur</TableHead>
                    <TableHead className="font-bold text-slate-700">Pemandu</TableHead>
                    <TableHead className="font-bold text-slate-700">Total Harga</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBookings.map(booking => (
                    <TableRow key={booking.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => openBookingDetail(booking)}>
                      <TableCell>
                        <div className="mb-1">
                          <span className="font-mono text-xs font-black text-green-900 bg-green-50 px-2 py-0.5 rounded mr-2">{booking.booking_code}</span>
                        </div>
                        <p className="font-bold text-slate-800">{booking.customer_name}</p>
                        <p className="text-xs font-medium text-slate-500">{booking.customer_phone}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-700">{format(new Date(booking.booking_date), 'dd MMM yyyy')}</p>
                        <p className="text-xs font-medium text-slate-500">{booking.start_time}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-slate-700">{(booking.guide as any)?.name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-green-600">{formatCurrency(booking.total_price)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg text-green-500 hover:bg-green-50 hover:text-green-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-medium">Belum ada booking.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {bookings.length > ITEMS_PER_PAGE && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <TablePagination
                  currentPage={bookingPage}
                  totalPages={Math.ceil(bookings.length / ITEMS_PER_PAGE)}
                  onPageChange={setBookingPage}
                  totalItems={bookings.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageSizeChange={() => {}}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* GALLERY TAB */}
        <TabsContent value="gallery" className="space-y-6 mt-6">
          <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl border border-white/80 p-4 rounded-[1.5rem] shadow-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Image className="w-5 h-5 text-green-500" /> Galeri Tur Wisata
            </h2>
            <button onClick={() => setShowGalleryModal(true)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-violet-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-300 font-bold shadow-[0_2px_15px_-3px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Foto</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map(item => (
              <div key={item.id} className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[1.5rem] shadow-sm p-2 group relative overflow-hidden">
                <div className="aspect-square rounded-xl overflow-hidden relative">
                  <img src={item.image_url} alt={item.caption_id || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="destructive" className="rounded-xl w-10 h-10 bg-rose-500 hover:bg-rose-600 shadow-lg"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Gambar?</AlertDialogTitle>
                          <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                          <AlertDialogAction className="rounded-xl bg-rose-500 hover:bg-rose-600" onClick={() => handleDeleteGallery(item.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {item.caption_id && (
                  <div className="px-2 pt-3 pb-1">
                    <p className="text-xs font-medium text-slate-600 truncate">{item.caption_id}</p>
                  </div>
                )}
              </div>
            ))}
            {gallery.length === 0 && <div className="col-span-full text-center py-12 text-slate-500 font-medium">Belum ada gambar di galeri.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>

      {/* Guide Modal Component */}
      <TourGuideFormModal
        open={showGuideModal}
        onOpenChange={(open) => {
          setShowGuideModal(open);
          if (!open) setEditingGuide(null);
        }}
        guide={editingGuide}
        onSubmit={handleGuideSubmit}
        isPending={false}
      />

      {/* Package Modal */}
      <Dialog open={showPackageModal} onOpenChange={setShowPackageModal}>
        <DialogContent className="max-w-xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
              {editingPackage ? 'Edit Paket Tur' : 'Tambah Paket Tur'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <div className="space-y-6">
              {/* Informasi Dasar */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama Paket (Indonesia) <span className="text-rose-500">*</span></Label>
                  <Input 
                    value={pkgNameId} 
                    onChange={(e) => setPkgNameId(e.target.value)} 
                    placeholder="Masukkan nama paket"
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama Paket (English)</Label>
                  <Input 
                    value={pkgNameEn} 
                    onChange={(e) => setPkgNameEn(e.target.value)} 
                    placeholder="Enter package name"
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Deskripsi (Indonesia)</Label>
                  <Textarea 
                    value={pkgDescId} 
                    onChange={(e) => setPkgDescId(e.target.value)} 
                    rows={3} 
                    placeholder="Deskripsi singkat paket tur..."
                    className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 resize-none font-medium text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Deskripsi (English)</Label>
                  <Textarea 
                    value={pkgDescEn} 
                    onChange={(e) => setPkgDescEn(e.target.value)} 
                    rows={3} 
                    placeholder="Short description of the tour package..."
                    className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 resize-none font-medium text-sm"
                  />
                </div>
              </div>

              {/* Pengaturan */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Durasi (Jam)</Label>
                  <Input 
                    type="number" 
                    step="0.5" 
                    value={pkgDuration} 
                    onChange={(e) => setPkgDuration(parseFloat(e.target.value) || 1)} 
                    className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Max Peserta</Label>
                  <Input 
                    type="number" 
                    value={pkgMaxParticipants} 
                    onChange={(e) => setPkgMaxParticipants(parseInt(e.target.value) || 1)} 
                    className="h-10 bg-white border-slate-200 rounded-xl focus-visible:ring-green-500 font-bold"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Icon Kategori</Label>
                  <Select value={pkgIcon} onValueChange={setPkgIcon}>
                    <SelectTrigger className="h-10 bg-white border-slate-200 rounded-xl focus:ring-green-500 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Users">Users (Keluarga)</SelectItem>
                      <SelectItem value="GraduationCap">GraduationCap (Edukasi)</SelectItem>
                      <SelectItem value="Camera">Camera (Fotografi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-green-900">Status Aktif</label>
                  <p className="text-[11px] font-medium text-green-600/80">
                    Paket yang aktif akan tampil di halaman publik
                  </p>
                </div>
                <Switch checked={pkgActive} onCheckedChange={setPkgActive} className="data-[state=checked]:bg-green-600" />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setShowPackageModal(false)} className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 px-6">Batal</Button>
            <Button onClick={handlePackageSubmit} disabled={savingPackage} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
              {savingPackage ? 'Menyimpan...' : (editingPackage ? 'Simpan Perubahan' : 'Tambah Paket')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Detail Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              Detail Booking
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              <div className="space-y-6">
                {/* Header Booking */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kode Booking</p>
                    <span className="font-mono font-black text-xl text-green-900">{selectedBooking.booking_code}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>
                
                {/* Informasi Pelanggan */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    Data Pelanggan
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama</p>
                      <p className="font-bold text-slate-800">{selectedBooking.customer_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telepon</p>
                      <p className="font-bold text-slate-800">{selectedBooking.customer_phone}</p>
                    </div>
                    {selectedBooking.customer_email && (
                      <div className="space-y-1 col-span-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</p>
                        <p className="font-bold text-slate-800">{selectedBooking.customer_email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informasi Booking */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    Detail Tur
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal</p>
                        <p className="font-bold text-slate-800">{format(new Date(selectedBooking.booking_date), 'dd MMM yyyy')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Waktu</p>
                        <p className="font-bold text-slate-800">{selectedBooking.start_time} <span className="text-slate-500 font-medium text-xs">({selectedBooking.duration_hours} jam)</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pemandu</p>
                        <p className="font-bold text-slate-800">{(selectedBooking.guide as any)?.name || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peserta</p>
                        <p className="font-bold text-slate-800">{selectedBooking.participants} orang</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Harga</span>
                        <span className="text-xl font-black text-green-600">{formatCurrency(selectedBooking.total_price)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-4">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Catatan Pelanggan</p>
                    <p className="text-sm font-medium text-amber-900">{selectedBooking.notes}</p>
                  </div>
                )}

                {/* Update Status */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Manajemen Status</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Ubah Status</Label>
                      <Select value={bookingStatus} onValueChange={(val) => setBookingStatus(val as TourBooking['status'])}>
                        <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl focus:ring-green-500 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="pending">
                            <span className="flex items-center gap-2 text-amber-600 font-bold">
                              <Clock className="w-4 h-4" /> Menunggu
                            </span>
                          </SelectItem>
                          <SelectItem value="confirmed">
                            <span className="flex items-center gap-2 text-green-600 font-bold">
                              <CheckCircle className="w-4 h-4" /> Dikonfirmasi
                            </span>
                          </SelectItem>
                          <SelectItem value="completed">
                            <span className="flex items-center gap-2 text-green-600 font-bold">
                              <Star className="w-4 h-4" /> Selesai
                            </span>
                          </SelectItem>
                          <SelectItem value="cancelled">
                            <span className="flex items-center gap-2 text-rose-600 font-bold">
                              <XCircle className="w-4 h-4" /> Dibatalkan
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Catatan Admin Internal</Label>
                      <Textarea 
                        value={bookingAdminNotes} 
                        onChange={(e) => setBookingAdminNotes(e.target.value)} 
                        rows={3} 
                        placeholder="Catatan internal untuk admin (tidak dilihat pelanggan)..."
                        className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 resize-none text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setShowBookingModal(false)} className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 px-6">Tutup</Button>
            <Button onClick={handleBookingUpdate} disabled={savingBooking} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
              {savingBooking ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gallery Modal */}
      <Dialog open={showGalleryModal} onOpenChange={setShowGalleryModal}>
        <DialogContent className="max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] border-white/60 bg-white/95 backdrop-blur-2xl">
          <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-white/50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <Image className="w-5 h-5 text-green-500" />
              </div>
              Tambah Foto Galeri
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Gambar Galeri <span className="text-rose-500">*</span></Label>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <ImageInputWithGallery value={galleryImageUrl} onChange={setGalleryImageUrl} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Keterangan Gambar</h3>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Caption (Indonesia)</Label>
                  <Input 
                    value={galleryCaptionId} 
                    onChange={(e) => setGalleryCaptionId(e.target.value)} 
                    placeholder="Contoh: Keluarga menikmati tur kebun binatang"
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Caption (English)</Label>
                  <Input 
                    value={galleryCaptionEn} 
                    onChange={(e) => setGalleryCaptionEn(e.target.value)} 
                    placeholder="Example: Family enjoying the zoo tour"
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-green-500 font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-5 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setShowGalleryModal(false)} className="rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50 px-6">Batal</Button>
            <Button onClick={handleAddGalleryImage} disabled={savingGallery || !galleryImageUrl} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 px-6">
              {savingGallery ? 'Mengunggah...' : 'Upload Gambar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
