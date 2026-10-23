"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PawPrint, 
  Ticket, 
  DollarSign,
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X, 
  LogOut, 
  Leaf, 
  FolderTree, 
  Building2, 
  Palette, 
  Newspaper, 
  Map, 
  MapPin, 
  BarChart3, 
  Image, 
  MousePointer2, 
  ExternalLink, 
  Navigation, 
  Megaphone, 
  History, 
  Activity, 
  MessageCircle, 
  Sparkles, 
  FolderOpen, 
  GraduationCap, 
  Cog, 
  Compass, 
  BookOpen, 
  ClipboardCheck, 
  CalendarDays, 
  Bot, 
  Award, 
  AlertCircle, 
  Utensils, 
  Wrench,
  Search,
  Clock,
  CheckCheck,
  CheckCircle2,
  QrCode
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useUserPermissions, MANAGER_PAGES } from '@/hooks/useUserPermissions';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import CommandPaletteModal from '@/components/manager/CommandPaletteModal';

// Map path to permission key
const pathToPermissionKey: Record<string, any> = {
  '/manager': 'dashboard',
  '/manager/animals': 'animals',
  '/manager/plants': 'plants',
  '/manager/categories': 'categories',
  '/manager/feeding-schedules': 'feeding-schedules',
  '/manager/events': 'events',
  '/manager/trivia': 'trivia',
  '/manager/tariffs': 'ticket-content',
  '/manager/tickets': 'tickets',
  '/manager/ticket-content': 'ticket-content',
  '/manager/venues': 'venues',
  '/manager/news': 'news',
  '/manager/announcements': 'announcements',
  '/manager/users': 'users',
  '/manager/branding': 'branding',
  '/manager/map': 'map',
  '/manager/map-markers': 'map-markers',
  '/manager/gps-map': 'map',
  '/manager/qr-generator': 'animals',
  '/manager/hero-banner': 'hero-banner',
  '/manager/floating-button': 'floating-button',
  '/manager/explorer-navbar': 'explorer-navbar',
  '/manager/navbar': 'explorer-navbar',
  '/manager/custom-pages': 'custom-pages',
  '/manager/history': 'history',
  '/manager/website-analytics': 'website-analytics',
  '/manager/whatsapp-templates': 'whatsapp-templates',
  '/manager/whats-new': 'whats-new',
  '/manager/gallery': 'gallery',
  '/manager/wbs': 'wbs',
  '/manager/facility-reports': 'facility-reports',
  '/manager/service-registrations': 'service-registrations',
  '/manager/service-settings': 'service-settings',
  '/manager/service-availability': 'service-availability',
  '/manager/tour-guides': 'tour-guides',
  '/manager/library': 'library',
  '/manager/perpustakaan': 'library',
  '/manager/service-standards': 'service-standards',
  '/manager/chatbot-faqs': 'chatbot-faqs',
  '/manager/jdih': 'jdih',
  '/manager/organizations': 'organizations',
  '/manager/system-configs': 'system-configs',
  '/manager/maintenance': 'system-configs',
};

// Grouped navigation structure
const navGroups = [
  {
    label: 'Utama',
    items: [
      { label: 'Dashboard', path: '/manager', icon: LayoutDashboard, permKey: 'dashboard' },
      { label: 'Analytics Website', path: '/manager/website-analytics', icon: Activity, permKey: 'website-analytics' },
    ]
  },
  {
    label: 'Konten',
    items: [
      { label: 'Kategori', path: '/manager/categories', icon: FolderTree, permKey: 'categories' },
      { label: 'Data Satwa', path: '/manager/animals', icon: PawPrint, permKey: 'animals' },
      { label: 'Data Tumbuhan', path: '/manager/plants', icon: Leaf, permKey: 'plants' },
      { label: 'Jadwal Makan Satwa', path: '/manager/feeding-schedules', icon: Utensils, permKey: 'feeding-schedules' },
      { label: 'Jadwal & Acara', path: '/manager/events', icon: Calendar, permKey: 'events' },
      { label: 'Kuis Edukasi', path: '/manager/trivia', icon: AlertCircle, permKey: 'trivia' },
      { label: 'Berita', path: '/manager/news', icon: Newspaper, permKey: 'news' },
      { label: 'Sewa Tempat', path: '/manager/venues', icon: Building2, permKey: 'venues' },
      { label: 'Perpustakaan Digital', path: '/manager/library', icon: BookOpen, permKey: 'library' },
      { label: 'JDIH', path: '/manager/jdih', icon: FileText, permKey: 'jdih' },
      { label: 'Atur Tarif & Tiket', path: '/manager/tariffs', icon: DollarSign, permKey: 'ticket-content' },
      { label: 'Halaman Tiket', path: '/manager/ticket-content', icon: Ticket, permKey: 'ticket-content' },
      { label: 'Halaman Kustom', path: '/manager/custom-pages', icon: FileText, permKey: 'custom-pages' },
      { label: 'Sejarah', path: '/manager/history', icon: History, permKey: 'history' },
    ]
  },
  {
    label: 'Komunikasi',
    items: [
      { label: 'FAQ Chatbot', path: '/manager/chatbot-faqs', icon: Bot, permKey: 'chatbot-faqs' },
      { label: 'Pengumuman', path: '/manager/announcements', icon: Megaphone, permKey: 'announcements' },
      { label: 'Template WhatsApp', path: '/manager/whatsapp-templates', icon: MessageCircle, permKey: 'whatsapp-templates' },
    ]
  },
  {
    label: 'Peta & Navigasi',
    items: [
      { label: 'Peta Kebun Binatang', path: '/manager/map', icon: Map, permKey: 'map' },
      { label: 'Marker Zona', path: '/manager/map-markers', icon: MapPin, permKey: 'map-markers' },
      { label: 'Peta GPS Interaktif', path: '/manager/gps-map', icon: Compass, permKey: 'map' },
      { label: 'Cetak Label QR', path: '/manager/qr-generator', icon: QrCode, permKey: 'animals' },
    ]
  },
  {
    label: 'Tampilan',
    items: [
      { label: 'Hero Banner', path: '/manager/hero-banner', icon: Image, permKey: 'hero-banner' },
      { label: 'Yang Terbaru', path: '/manager/whats-new', icon: Sparkles, permKey: 'whats-new' },
      { label: 'Galeri Media', path: '/manager/gallery', icon: FolderOpen, permKey: 'gallery' },
      { label: 'Branding & Logo', path: '/manager/branding', icon: Palette, permKey: 'branding' },
      { label: 'Keanggotaan Organisasi', path: '/manager/organizations', icon: Award, permKey: 'organizations' },
      { label: 'Tombol Floating', path: '/manager/floating-button', icon: MousePointer2, permKey: 'floating-button' },
      { label: 'Menu Navigasi', path: '/manager/explorer-navbar', icon: Navigation, permKey: 'explorer-navbar' },
    ]
  },
  {
    label: 'Sistem',
    items: [
      { label: 'Tiket (Transaksi)', path: '/manager/tickets', icon: Ticket, permKey: 'tickets' },
      { label: 'Kelola Tarif & Harga', path: '/manager/tariffs', icon: DollarSign, permKey: 'ticket-content' },
      { label: 'Pemandu Wisata', path: '/manager/tour-guides', icon: Compass, permKey: 'tour-guides' },
      { label: 'Pendaftaran Layanan', path: '/manager/service-registrations', icon: GraduationCap, permKey: 'service-registrations' },
      { label: 'Ketersediaan Jadwal', path: '/manager/service-availability', icon: CalendarDays, permKey: 'service-availability' },
      { label: 'Standar Pelayanan', path: '/manager/service-standards', icon: ClipboardCheck, permKey: 'service-standards' },
      { label: 'Pengaturan Layanan', path: '/manager/service-settings', icon: Cog, permKey: 'service-settings' },
      { label: 'WBS', path: '/manager/wbs', icon: Megaphone, permKey: 'wbs' },
      { label: 'Lapor Fasilitas', path: '/manager/facility-reports', icon: AlertCircle, permKey: 'facility-reports' },
      { label: 'Manajemen Pengguna', path: '/manager/users', icon: Users, permKey: 'users' },
      { label: 'Pengaturan Sistem', path: '/manager/system-configs', icon: Cog, permKey: 'system-configs' },
      { label: 'Mode Maintenance', path: '/manager/maintenance', icon: Wrench, permKey: 'system-configs' },
    ]
  },
];

// Flat nav for mobile bottom bar
const bottomNav = [
  { label: 'Home', path: '/manager', icon: LayoutDashboard, permKey: 'dashboard' },
  { label: 'Satwa', path: '/manager/animals', icon: PawPrint, permKey: 'animals' },
  { label: 'Berita', path: '/manager/news', icon: Newspaper, permKey: 'news' },
  { label: 'Menu', path: '', icon: Menu, isMenuTrigger: true },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Utama', 'Konten']);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, userRole, signOut, loading } = useAuth();
  const { settings } = useSiteSettings();
  const { hasPermission, loading: permLoading } = useUserPermissions();

  const [pendingRegistrations, setPendingRegistrations] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);

  useEffect(() => {
    if (loading || permLoading || !user) return;
    
    async function fetchCounts() {
      try {
        const { data: regData, error: regErr } = await supabase.from('service_registrations').select('id').eq('status', 'pending');
        if (regErr && regErr.message !== 'Authentication required') {
          console.error('Error fetching registrations:', regErr);
        }
        const regCount = regData ? regData.length : 0;
        setPendingRegistrations(regCount);

        const { data: bookData, error: bookErr } = await supabase.from('tour_bookings').select('id').eq('status', 'pending');
        if (bookErr && bookErr.message !== 'Authentication required') {
          console.error('Error fetching tour bookings:', bookErr);
        }
        const bookCount = bookData ? bookData.length : 0;
        setPendingBookings(bookCount);
        
      } catch (err) {
        console.error('Failed to fetch pending counts:', err);
      }
    }
    
    fetchCounts();

    const handleDbChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const change = customEvent.detail;
      
      if (change.table === 'service_registrations' || change.table === 'tour_bookings') {
        fetchCounts();
      }
    };

    window.addEventListener('supabase-db-change', handleDbChange);
    return () => window.removeEventListener('supabase-db-change', handleDbChange);
  }, [user, userRole, hasPermission, loading, permLoading]);

  // Filter navigation based on permissions
  const filteredNavGroups = useMemo(() => {
    if (userRole === 'admin') return navGroups;
    return navGroups.map(group => ({
      ...group,
      items: group.items.filter(item => hasPermission(item.permKey as any))
    })).filter(group => group.items.length > 0);
  }, [userRole, hasPermission]);

  const filteredBottomNav = useMemo(() => {
    if (userRole === 'admin') return bottomNav;
    return bottomNav.filter(item => item.isMenuTrigger || hasPermission(item.permKey as any));
  }, [userRole, hasPermission]);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Indonesian Live Clock
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const dayName = days[d.getDay()];
      const dateNum = d.getDate();
      const monthName = months[d.getMonth()];
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setCurrentTime(`${dayName}, ${dateNum} ${monthName} • ${hours}:${mins} WIB`);
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!loading && !user && !isLoggingOut) router.push('/auth');
  }, [user, loading, router, isLoggingOut]);

  // Auto-expand group containing active route and set dynamic document.title
  useEffect(() => {
    const MANAGER_ROUTE_TITLES: Record<string, string> = {
      '/manager': 'Dashboard Pengelola',
      '/manager/branding': 'Pengaturan Branding & Logo',
      '/manager/users': 'Manajemen Pengguna & Staf',
      '/manager/animals': 'Manajemen Satwa',
      '/manager/plants': 'Manajemen Flora',
      '/manager/events': 'Manajemen Acara & Kegiatan',
      '/manager/news': 'Manajemen Berita & Artikel',
      '/manager/tickets': 'Manajemen Tiket & Tarif',
      '/manager/ticket-content': 'Konten & Ketentuan Tiket',
      '/manager/map': 'Manajemen Peta Interaktif',
      '/manager/map-markers': 'Manajemen Titik Peta (Markers)',
      '/manager/gps-map': 'Manajemen Peta GPS Interaktif',
      '/manager/facility-reports': 'Manajemen Laporan Fasilitas',
      '/manager/service-registrations': 'Manajemen Pendaftaran Layanan',
      '/manager/service-availability': 'Ketersediaan Layanan',
      '/manager/service-standards': 'Standar Layanan Publik',
      '/manager/service-settings': 'Pengaturan Layanan',
      '/manager/wbs': 'Manajemen Laporan WBS',
      '/manager/website-analytics': 'Analitik Pengunjung Website',
      '/manager/announcements': 'Manajemen Pengumuman',
      '/manager/categories': 'Manajemen Kategori',
      '/manager/chatbot-faqs': 'Manajemen Tanya Jawab Chatbot',
      '/manager/custom-pages': 'Manajemen Halaman Kustom',
      '/manager/explorer-navbar': 'Manajemen Navigasi Explorer',
      '/manager/floating-button': 'Pengaturan Tombol Melayang',
      '/manager/gallery': 'Manajemen Galeri Media',
      '/manager/hero-banner': 'Manajemen Banner Utama',
      '/manager/history': 'Manajemen Sejarah Zoo',
      '/manager/jdih': 'Manajemen Produk Hukum JDIH',
      '/manager/library': 'Manajemen Katalog Perpustakaan',
      '/manager/perpustakaan': 'Manajemen Peminjaman Buku',
      '/manager/maintenance': 'Pengaturan Pemeliharaan Sistem',
      '/manager/navbar': 'Pengaturan Bar Navigasi',
      '/manager/organizations': 'Manajemen Keanggotaan Organisasi',
      '/manager/tour-guides': 'Manajemen Pemandu Wisata',
      '/manager/venues': 'Manajemen Venue & Area Acara',
      '/manager/whats-new': 'Manajemen Apa yang Baru',
      '/manager/whatsapp-templates': 'Templat Pesan WhatsApp',
      '/manager/feeding-schedules': 'Manajemen Jadwal Makan Satwa',
      '/manager/system-configs': 'Konfigurasi Sistem',
      '/manager/trivia': 'Manajemen Kuis Edukasi',
    };

    const title = MANAGER_ROUTE_TITLES[pathname] || 'Panel Pengelola';
    document.title = `${title} - Panel Pengelola Ragunan Zoo`;

    filteredNavGroups.forEach(group => {
      const isGroupActive = group.items.some(item =>
        item.path === '/manager' ? pathname === '/manager' : pathname.startsWith(item.path)
      );
      if (isGroupActive) {
        setExpandedGroups(prev => prev.includes(group.label) ? prev : [...prev, group.label]);
      }
    });
  }, [pathname, filteredNavGroups]);

  const isActive = (path: string) => {
    if (path === '/manager') return pathname === '/manager';
    return pathname.startsWith(path);
  };

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupLabel) ? prev.filter(g => g !== groupLabel) : [...prev, groupLabel]
    );
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  };

  const currentPageLabel = filteredNavGroups.flatMap(g => g.items).find(i => isActive(i.path))?.label || 'Dashboard';
  const currentGroupLabel = filteredNavGroups.find(g => g.items.some(i => isActive(i.path)))?.label;
  const displayName = user?.email?.split('@')[0] || user?.username || user?.name || 'Admin';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  if (loading || isLoggingOut) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <PawPrint className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              {isLoggingOut ? 'Mengalihkan ke Explorer...' : 'Memuat Dashboard'}
            </p>
            <p className="text-sm text-slate-500 mt-1">Harap tunggu sebentar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative flex overflow-hidden">
      {/* Global Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-green-200/20 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-teal-200/20 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite_alternate]" />
      </div>

      {/* ===================== DESKTOP SIDEBAR ===================== */}
      <aside className={cn(
        "hidden md:flex flex-col fixed left-4 top-4 bottom-4 h-[calc(100vh-2rem)] z-40 transition-all duration-300 ease-spring",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08),_0_2px_8px_-2px_rgba(0,0,0,0.04)] rounded-[1.25rem]",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}>
        {/* Brand Header */}
        <div className={cn(
          "flex items-center border-b border-border/40 flex-shrink-0 h-[64px] bg-transparent relative",
          sidebarCollapsed ? "justify-center px-0" : "px-4"
        )}>
          <Link href="/manager" className={cn(
            "flex items-center gap-3 overflow-hidden min-w-0 group",
            !sidebarCollapsed && "flex-1"
          )}>
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
              ) : (
                <div className="w-9 h-9 bg-primary/10 group-hover:bg-primary/15 transition-colors rounded-xl flex items-center justify-center shadow-sm ring-1 ring-primary/20">
                  <Leaf className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {settings?.site_name || 'Ragunan Zoo'}
                </span>
                <span className="text-[0.65rem] text-slate-400 dark:text-slate-500 font-semibold tracking-[0.15em] uppercase">
                  Dashboard
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex-shrink-0 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700",
              sidebarCollapsed ? "absolute -right-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm z-50 rounded-full" : ""
            )}
            title={sidebarCollapsed ? "Perluas" : "Ciutkan"}
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", !sidebarCollapsed && "rotate-180")} />
          </button>
        </div>

        {/* Quick Search in Sidebar */}
        <div className="px-2.5 pt-2 pb-1">
          {!sidebarCollapsed ? (
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 group transition-all"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">Cari Modul...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[10px] font-mono border border-slate-200 dark:border-slate-700 shadow-2xs">
                Ctrl K
              </kbd>
            </button>
          ) : (
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-11 h-10 mx-auto rounded-xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-all"
              title="Pencarian Cepat (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-2 px-2.5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
        >
          {filteredNavGroups.map((group) => (
            <div key={group.label} className="mb-3">
              {/* Group label */}
              {!sidebarCollapsed ? (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2.5 py-1 mb-1 group"
                >
                  <span className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    {group.label}
                  </span>
                  <ChevronDown className={cn(
                    "w-3 h-3 text-slate-400/60 transition-all duration-200 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                    !expandedGroups.includes(group.label) && "-rotate-90"
                  )} />
                </button>
              ) : (
                <div className="h-px bg-slate-200/60 dark:bg-slate-800 my-2 mx-1" />
              )}

              {/* Group items */}
              {(sidebarCollapsed || expandedGroups.includes(group.label)) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl text-[0.82rem] font-medium transition-all duration-150 group relative",
                          sidebarCollapsed
                            ? "w-11 h-11 justify-center mx-auto"
                            : "px-2.5 py-[9px]",
                          active
                            ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25 font-semibold"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <Icon className={cn(
                          "flex-shrink-0 transition-colors",
                          sidebarCollapsed ? "w-[18px] h-[18px]" : "w-4 h-4",
                          active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                        )} />
                        {!sidebarCollapsed && (
                          <span className="truncate leading-none">{item.label}</span>
                        )}
                        {(() => {
                          let count = 0;
                          if (item.path === '/manager/service-registrations') count = pendingRegistrations;
                          if (item.path === '/manager/tour-guides') count = pendingBookings;
                          
                          if (count > 0) {
                            return sidebarCollapsed ? (
                              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/50" />
                            ) : (
                              <span className="ml-auto px-1.5 py-0.5 rounded-md text-[0.65rem] font-bold flex-shrink-0 bg-rose-500 text-white shadow-sm">
                                {count > 99 ? '99+' : count}
                              </span>
                            );
                          }
                          
                          if (active && !sidebarCollapsed) {
                            return <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />;
                          }
                          
                          return null;
                        })()}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={cn(
          "flex-shrink-0 border-t border-slate-200/60 dark:border-slate-800/80 p-2.5",
          "bg-slate-50/50 dark:bg-slate-950/40"
        )}>
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-2.5 rounded-xl text-[0.82rem] font-semibold transition-all text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
              sidebarCollapsed ? "w-11 h-11 justify-center mx-auto" : "px-2.5 py-[9px]"
            )}
            title={sidebarCollapsed ? "Lihat Explorer" : undefined}
          >
            <ExternalLink className={cn("flex-shrink-0", sidebarCollapsed ? "w-[18px] h-[18px]" : "w-4 h-4 text-emerald-600 dark:text-emerald-400")} />
            {!sidebarCollapsed && <span>Lihat Explorer</span>}
          </Link>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT WRAPPER ===================== */}
      <div className={cn(
        "flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ease-spring",
        sidebarCollapsed ? "md:ml-[88px]" : "md:ml-[276px]"
      )}>

        {/* ===== TOP HEADER ===== */}
        <header className={cn(
          "sticky top-0 z-30 flex-shrink-0 h-[64px]",
          "bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/80",
          "shadow-[0_4px_24px_-12px_rgba(0,0,0,0.06)]"
        )}>
          <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">

            {/* LEFT: Mobile logo | Desktop breadcrumb | Live clock */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Link href="/manager" className="md:hidden flex items-center gap-2.5">
                <div className="w-10 h-10 flex items-center justify-center">
                  {settings?.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
                <span className="font-bold text-foreground text-sm">Manager</span>
              </Link>

              {/* Desktop breadcrumb */}
              <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
                {currentGroupLabel && (
                  <>
                    <span className="text-muted-foreground/60 font-medium truncate max-w-[120px]">{currentGroupLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                  </>
                )}
                <span className="font-semibold text-foreground truncate">{currentPageLabel}</span>
              </nav>

              {/* Live Clock Indonesian */}
              {currentTime && (
                <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 badge-live-pulse" />
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{currentTime}</span>
                </div>
              )}
            </div>

            {/* RIGHT: Actions (Search, Notification, Profile, Mobile Trigger) */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Quick Search Shortcut Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 text-xs text-muted-foreground hover:text-foreground transition-all btn-interactive"
                title="Pencarian Cepat Modul (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium hidden md:inline">Pencarian</span>
                <kbd className="px-1.5 py-0.5 rounded bg-background text-[10px] font-mono border border-border/60 shadow-2xs">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Center Popover */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-xl transition-all relative btn-interactive",
                    notificationsOpen
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  title="Pusat Notifikasi"
                >
                  <Bell className="w-4 h-4" />
                  {(pendingRegistrations > 0 || pendingBookings > 0) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                      {pendingRegistrations + pendingBookings}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border/60 overflow-hidden z-50 animate-slide-in-up">
                    <div className="p-4 border-b border-border/40 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="font-bold text-sm text-foreground">Notifikasi & Tugas</h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Real-time
                      </span>
                    </div>

                    <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto">
                      {pendingRegistrations > 0 && (
                        <Link
                          href="/manager/service-registrations"
                          onClick={() => setNotificationsOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 border border-indigo-200/50 dark:border-indigo-800/40 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                            {pendingRegistrations}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              Permohonan PKL Menunggu
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Ada {pendingRegistrations} berkas magang yang perlu diverifikasi
                            </p>
                          </div>
                        </Link>
                      )}

                      {pendingBookings > 0 && (
                        <Link
                          href="/manager/tour-guides"
                          onClick={() => setNotificationsOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 border border-amber-200/50 dark:border-amber-800/40 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                            {pendingBookings}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              Booking Tur Pemandu Baru
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Ada {pendingBookings} pesanan pemandu wisata belum dikonfirmasi
                            </p>
                          </div>
                        </Link>
                      )}

                      {pendingRegistrations === 0 && pendingBookings === 0 && (
                        <div className="py-8 text-center text-muted-foreground space-y-1">
                          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
                          <p className="text-xs font-bold text-foreground">Semua Tugas Selesai</p>
                          <p className="text-[11px]">Tidak ada permohonan tertunda saat ini.</p>
                        </div>
                      )}
                    </div>

                    <div className="p-2 border-t border-border/40 bg-slate-50/70 dark:bg-slate-800/40 text-center">
                      <Link
                        href="/manager/system-configs"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Lihat Status & Konfigurasi Sistem
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all border btn-interactive",
                    profileDropdownOpen
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      : "border-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-200/60 dark:hover:border-slate-700/60"
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shadow-xs flex-shrink-0">
                    <span className="text-xs font-bold text-white">{avatarLetter}</span>
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-[0.8rem] font-semibold text-slate-900 dark:text-white">{displayName}</span>
                    <span className="text-[0.68rem] text-slate-500 dark:text-slate-400 capitalize mt-0.5">{userRole}</span>
                  </div>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block",
                    profileDropdownOpen && "rotate-180"
                  )} />
                </button>

                {/* Dropdown panel */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-slate-200/70 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User card */}
                    <div className="px-4 py-3.5 bg-gradient-to-br from-emerald-500/5 to-transparent border-b border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="text-sm font-bold text-white">{avatarLetter}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{userRole} · Ragunan Zoo</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="p-1.5 space-y-0.5">
                      <Link href="/manager/users" onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                      >
                        <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        </div>
                        Kelola Pengguna
                      </Link>
                      <Link href="/manager/branding" onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                      >
                        <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        </div>
                        Pengaturan
                      </Link>
                      <Link href="/" target="_blank" onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                      >
                        <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        </div>
                        Lihat Website
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-slate-200/60 dark:border-slate-800">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); handleSignOut(); }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors w-full font-medium"
                      >
                        <div className="w-7 h-7 bg-rose-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile search trigger */}
              <button
                className="md:hidden w-9 h-9 flex items-center justify-center hover:bg-muted rounded-xl transition-colors"
                onClick={() => setCommandPaletteOpen(true)}
                title="Cari Modul"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Mobile hamburger */}
              <button
                className="md:hidden w-9 h-9 flex items-center justify-center hover:bg-muted rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* ===== MOBILE DRAWER ===== */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="md:hidden fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-white dark:bg-slate-950 z-50 shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-300 flex flex-col">
              {/* Drawer header */}
              <div className="h-[64px] flex items-center justify-between px-4 border-b border-slate-200/60 dark:border-slate-800 flex-shrink-0 bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {settings?.logo_url ? (
                      <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-emerald-500/20">
                        <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2 max-w-[170px]">{settings?.site_name || 'Ragunan Zoo'}</p>
                    <p className="text-[0.62rem] text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] font-semibold mt-0.5">Dashboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-3"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
              >
                {filteredNavGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-2.5 mb-1.5 text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                              active
                                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 font-semibold"
                                : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
                            )}
                          >
                            <Icon className={cn(
                              "w-4 h-4 flex-shrink-0 transition-colors",
                              active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                            )} />
                            <span className="truncate">{item.label}</span>
                            {(() => {
                              let count = 0;
                              if (item.path === '/manager/service-registrations') count = pendingRegistrations;
                              if (item.path === '/manager/tour-guides') count = pendingBookings;
                              
                              if (count > 0) {
                                return (
                                  <span className="ml-auto px-1.5 py-0.5 rounded-md text-[0.65rem] font-bold flex-shrink-0 bg-rose-500 text-white shadow-sm">
                                    {count > 99 ? '99+' : count}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Drawer footer */}
              <div className="flex-shrink-0 border-t border-slate-200/60 dark:border-slate-800/80 p-2.5 space-y-1 bg-slate-50/70 dark:bg-slate-950/50">
                <Link href="/" target="_blank" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Lihat Explorer</span>
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 w-full transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 relative p-4 md:p-8 pb-28 md:pb-12 w-full mx-auto max-w-screen-2xl">
          {children}
        </main>
      </div>

      {/* ===================== MOBILE BOTTOM NAV ===================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/70 dark:border-slate-800 shadow-[0_-2px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-[60px] px-1">
          {filteredBottomNav.map((item, index) => {
            const Icon = item.icon;

            if (item.isMenuTrigger) {
              return (
                <button
                  key={index}
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-emerald-600 dark:text-emerald-400 active:scale-90 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-600/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[0.6rem] font-bold">{item.label}</span>
                </button>
              );
            }

            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all active:scale-90",
                  active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  active ? "bg-emerald-500/10 dark:bg-emerald-500/20" : "bg-transparent"
                )}>
                  <Icon className={cn("w-5 h-5", active && "stroke-[2.2px]")} />
                </div>
                <span className={cn("text-[0.6rem]", active ? "font-bold" : "font-medium")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ===================== COMMAND PALETTE (CTRL+K) ===================== */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

