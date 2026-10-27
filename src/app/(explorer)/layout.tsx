"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppIcon } from '@/components/ui/AppIcon';
import { useState, useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useNavbarItems } from '@/hooks/useNavbarItems';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { usePageTracking } from '@/hooks/usePageTracking';
import { useAuth } from '@/hooks/useAuth';
import LanguageSelector from '@/components/ui/LanguageSelector';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import SkipLinks from '@/components/accessibility/SkipLinks';
import DesktopNav from '@/components/layouts/explorer/DesktopNav';
import MobileNav from '@/components/layouts/explorer/MobileNav';
import BottomNav from '@/components/layouts/explorer/BottomNav';
import Footer from '@/components/layouts/explorer/Footer';

const FloatingTicketButton = dynamic(() => import('@/components/explorer/FloatingTicketButton'), { ssr: false });
const FloatingChatbot = dynamic(() => import('@/components/explorer/FloatingChatbot'), { ssr: false });
const AccessibilityWidget = dynamic(() => import('@/components/accessibility/AccessibilityWidget'), { ssr: false });

const ROUTE_TITLES: Record<string, { id: string; en: string }> = {
  '/': { id: 'Taman Margasatwa Ragunan - Informasi Satwa, Tiket, & Peta Interaktif', en: 'Ragunan Zoo - Animal Info, Tickets & Interactive Map' },
  '/map': { id: 'Peta Interaktif Pintu & Zona', en: 'Interactive Map & Gates' },
  '/tickets': { id: 'Tarif Masuk & Simulasi Tiket', en: 'Admission Rates & Ticket Simulation' },
  '/fauna': { id: 'Koleksi Satwa (Fauna)', en: 'Fauna Collection' },
  '/flora': { id: 'Koleksi Flora & Tumbuhan', en: 'Flora & Plants Collection' },
  '/events': { id: 'Acara & Pertunjukan', en: 'Events & Shows' },
  '/news': { id: 'Berita & Pengumuman', en: 'News & Announcements' },
  '/services': { id: 'Fasilitas & Layanan Utama', en: 'Facilities & Main Services' },
  '/history': { id: 'Sejarah Margasatwa Ragunan', en: 'History of Ragunan Zoo' },
  '/gallery-3d': { id: 'Galeri Virtual 3D', en: '3D Virtual Gallery' },
  '/perpustakaan': { id: 'Perpustakaan & Buku Literasi', en: 'Library & Literacy Books' },
  '/library': { id: 'Katalog Perpustakaan Satwa', en: 'Animal Library Catalog' },
  '/my-library': { id: 'Peminjaman Saya', en: 'My Borrowed Books' },
  '/audio-guide': { id: 'Panduan Audio Wisata', en: 'Audio Tour Guide' },
  '/layanan-magang': { id: 'Layanan Magang & Penelitian', en: 'Internship & Research Services' },
  '/report-facility': { id: 'Lapor Kendala Fasilitas', en: 'Report Facility Issue' },
  '/track-report': { id: 'Lacak Status Laporan', en: 'Track Report Status' },
  '/wbs': { id: 'Whistleblowing System (WBS)', en: 'Whistleblowing System (WBS)' },
  '/tour-guide': { id: 'Pemandu Wisata Zoo', en: 'Zoo Tour Guide' },
  '/venues': { id: 'Sewa Area & Venue Acara', en: 'Venue & Event Area Rental' },
  '/privacy': { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
  '/terms': { id: 'Syarat & Ketentuan', en: 'Terms & Conditions' },
  '/standar-pelayanan': { id: 'Standar Pelayanan Publik', en: 'Public Service Standards' },
  '/jdih': { id: 'JDIH - Produk Hukum', en: 'JDIH - Legal Products' },
  '/categories': { id: 'Kategori Satwa & Fasilitas', en: 'Animal & Facility Categories' },
  '/qr-scan': { id: 'Pindai Kode QR', en: 'Scan QR Code' },
};

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { topNavItems, bottomNavItems, loading: navLoading } = useNavbarItems();
  const { language } = useLanguage();
  const { toggleMenu, isMenuOpen } = useAccessibility();
  const { isAuthenticated, user, signOut, userRole } = useAuth();
  
  // Track page views for analytics
  usePageTracking();

  const isMapPage = pathname === '/map';

  // Close mobile menu and set dynamic page title on route change
  useEffect(() => {
    setMobileMenuOpen(false);

    const siteTitle = language === 'en' ? 'Ragunan Zoo' : 'Taman Margasatwa Ragunan';
    const matched = ROUTE_TITLES[pathname];
    if (matched) {
      const pageName = language === 'en' ? matched.en : matched.id;
      document.title = pathname === '/' ? pageName : `${pageName} - ${siteTitle}`;
    } else if (pathname.startsWith('/animals/')) {
      document.title = `${language === 'en' ? 'Detail Satwa' : 'Detail Satwa'} - ${siteTitle}`;
    } else if (pathname.startsWith('/news/')) {
      document.title = `${language === 'en' ? 'News Detail' : 'Detail Berita'} - ${siteTitle}`;
    } else if (pathname.startsWith('/library/')) {
      document.title = `${language === 'en' ? 'Book Detail' : 'Detail Buku'} - ${siteTitle}`;
    }
  }, [pathname, language]);

  const fallbackLogo = "/favicon.png";
  const logoDesktop = settings?.logo_url || fallbackLogo;
  const logoMobile = settings?.logo_mobile_url || settings?.logo_url || fallbackLogo;

  const getLabel = (item: { label_id: string; label_en: string | null }) => {
    if (language === 'en' && item.label_en) return item.label_en;
    return item.label_id;
  };

  const getPath = (item: { path: string; path_en?: string | null }) => {
    if (language === 'en' && item.path_en) return item.path_en;
    return item.path;
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const getExternalUrl = (item: { path: string; path_en?: string | null }) => {
    const currentPath = getPath(item);
    if (currentPath.startsWith('http://') || currentPath.startsWith('https://')) {
      return currentPath;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Skip Links for Keyboard Navigation */}
      <SkipLinks />

      {/* Pattern Background - Excluded on Map page */}
      {!isMapPage && (
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          aria-hidden="true"
          style={{
            backgroundImage: `url("/images/main-pattern.png")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '600px',
            opacity: 0.15,
          }}
        />
      )}

      {/* Header - Always visible on all pages including map for consistent brand identity and mobile navigation */}
      <header
        id="main-navigation"
        role="banner"
        className="sticky top-0 z-50 transition-all duration-300"
      >
        <div className="bg-[#FAF8F5]/98 dark:bg-[#0A120E]/98 backdrop-blur-2xl border-b border-border/90 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between py-2 md:py-2.5 gap-2">

              {/* Logo */}
              {(logoMobile || logoDesktop) && (
                <Link
                  href="/"
                  className="flex items-center group flex-shrink-0 rounded-xl p-1 transition-all duration-300 hover:bg-primary/5"
                >
                  {logoMobile && (
                    <img
                      src={logoMobile}
                      alt="Logo"
                      className="md:hidden h-11 sm:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-active:scale-95"
                    />
                  )}
                  {logoDesktop && (
                    <img
                      src={logoDesktop}
                      alt="Logo"
                      className="hidden md:block h-12 lg:h-14 xl:h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                    />
                  )}
                </Link>
              )}

              {/* Desktop Navigation */}
              <DesktopNav
                items={topNavItems}
                isActive={isActive}
                getLabel={getLabel}
                getPath={getPath}
                getExternalUrl={getExternalUrl}
              />

              {/* Right Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Search */}
                <div className="xl:hidden">
                  <GlobalSearch variant="icon" />
                </div>
                <div className="hidden xl:block">
                  <GlobalSearch variant="expanded" />
                </div>

                {/* Language */}
                <LanguageSelector />

                {/* Accessibility Toggle in Header - Visible on mobile only; desktop uses the floating widget */}
                <button
                  type="button"
                  onClick={toggleMenu}
                  className={`md:hidden w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-2xs ${
                    isMenuOpen 
                      ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20' 
                      : 'bg-muted/60 hover:bg-muted border-border/60 text-foreground hover:text-primary'
                  }`}
                  title={language === 'en' ? 'Accessibility Options' : 'Opsi Aksesibilitas'}
                  aria-label={language === 'en' ? 'Accessibility Options' : 'Opsi Aksesibilitas'}
                  aria-expanded={isMenuOpen}
                >
                  <AppIcon icon="solar:accessibility-bold-duotone" className="w-4 h-4" />
                </button>

                {/* Auth */}
                {isAuthenticated ? (
                  <div className="hidden sm:flex items-center relative group">
                    <button className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 shadow-xs">
                      <AppIcon icon="solar:user-bold-duotone" className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card dark:bg-[#111C16] border border-border/90 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] ring-1 ring-black/5 dark:ring-white/10 p-1.5">
                      <div className="px-3.5 py-2.5 mb-1 border-b border-border/60 bg-muted/40 rounded-xl">
                        <p className="text-sm font-bold text-foreground truncate">{user?.name || user?.username}</p>
                        <p className="text-xs font-semibold text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                          <AppIcon icon="solar:shield-check-bold-duotone" className="w-3.5 h-3.5 text-primary" />
                          {userRole || 'Visitor'}
                        </p>
                      </div>
                      {(userRole === 'admin' || userRole === 'staff') && (
                        <Link href="/manager" className="w-full text-left px-3.5 py-2 text-sm font-semibold hover:bg-primary/10 flex items-center gap-2.5 text-foreground hover:text-primary rounded-xl transition-colors">
                          <AppIcon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-emerald-600" />
                          Panel Pengelola
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 rounded-xl transition-colors"
                      >
                        <AppIcon icon="solar:logout-2-bold-duotone" className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-all duration-200 bg-primary text-primary-foreground hover:bg-[#062E22] rounded-full shadow-xs"
                  >
                    <AppIcon icon="solar:user-bold-duotone" className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Sign In' : 'Masuk'}</span>
                  </Link>
                )}

                {/* Mobile hamburger */}
                <button
                  className="md:hidden w-9 h-9 rounded-full bg-muted/60 hover:bg-muted border border-border/60 flex items-center justify-center text-foreground transition-all active:scale-95"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? (
                    <AppIcon icon="solar:close-circle-bold" className="w-4 h-4" />
                  ) : (
                    <AppIcon icon="solar:hamburger-menu-bold" className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown - Decoupled from sticky header */}
      {mobileMenuOpen && (
        <MobileNav
          items={topNavItems}
          isActive={isActive}
          getLabel={getLabel}
          getPath={getPath}
          getExternalUrl={getExternalUrl}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        id="main-content"
        role="main"
        className={`flex-1 flex flex-col relative z-10 ${
          isMapPage
            ? 'h-[calc(100dvh-56px)] sm:h-[calc(100dvh-60px)] md:h-[calc(100vh-64px)] overflow-hidden'
            : ''
        }`}
      >
        <div className={`flex-1 flex flex-col ${isMapPage ? 'h-full' : ''}`}>
          {children}
        </div>
        {!isMapPage && <Footer settings={settings} settingsLoading={settingsLoading} />}
      </main>

      {/* Accessibility Widget - Hidden on map page */}
      {!isMapPage && <AccessibilityWidget />}

      {/* Floating Ticket Button - Hidden on map page */}
      {!isMapPage && <FloatingTicketButton />}
      
      {/* FAQ Chatbot - Hidden on map page */}
      {!isMapPage && <FloatingChatbot />}

      {/* Mobile Bottom Navigation - Hidden on map page or when top mobile menu is open */}
      {!isMapPage && !mobileMenuOpen && (
        <BottomNav 
          items={bottomNavItems}
          isActive={isActive}
          getLabel={getLabel}
          getPath={getPath}
          getExternalUrl={getExternalUrl}
        />
      )}
    </div>
  );
}
