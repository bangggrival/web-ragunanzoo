"use client";

import { useOrganizationMemberships } from '@/hooks/useOrganizationMemberships';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { SiteSettings } from '@/hooks/useSiteSettings';

interface FooterProps {
  settings?: SiteSettings | null;
  settingsLoading?: boolean;
}

export default function Footer({ settings: propSettings, settingsLoading: propLoading }: FooterProps = {}) {
  const { activeOrganizations } = useOrganizationMemberships();

  const fallbackHook = useSiteSettings();
  const settings = propSettings !== undefined ? propSettings : fallbackHook.settings;
  const isSettingsLoading = propLoading !== undefined ? propLoading : fallbackHook.loading;

  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Live Operating Status calculation (Jakarta WIB, UTC+7)
  const getOperatingStatus = () => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const jakartaTime = new Date(utcTime + (3600000 * 7));
    const day = jakartaTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = jakartaTime.getHours();
    const minutes = jakartaTime.getMinutes();
    const currentMins = hours * 60 + minutes;

    // Monday: Closed for animal care & park maintenance
    if (day === 1) {
      return {
        isOpen: false,
        badgeBg: 'bg-rose-950/40 border-rose-800/40 text-rose-300',
        dotColor: 'bg-rose-500',
        title: language === 'en' ? 'Closed Today (Animal Care Day)' : 'Tutup Hari Ini (Libur Satwa)',
        subtext: language === 'en' ? 'Opens Tuesday at 07:00 WIB' : 'Buka kembali Selasa pukul 07.00 WIB'
      };
    }

    // Tuesday - Sunday: 07:00 (420 mins) to 16:00 (960 mins)
    const openMins = 7 * 60; // 07:00
    const closeMins = 16 * 60; // 16:00
    const closingSoonMins = 15 * 60 + 30; // 15:30

    if (currentMins >= openMins && currentMins < closingSoonMins) {
      return {
        isOpen: true,
        badgeBg: 'bg-[#242b15] border-[#43551d] text-[#cbe68a]',
        dotColor: 'bg-[#94be2d]',
        title: language === 'en' ? 'Open Now for Visitors' : 'Buka Sekarang untuk Kunjungan',
        subtext: language === 'en' ? 'Open today until 16:00 WIB' : 'Jam operasional s.d. pukul 16.00 WIB'
      };
    }

    if (currentMins >= closingSoonMins && currentMins < closeMins) {
      return {
        isOpen: true,
        badgeBg: 'bg-amber-950/40 border-amber-600/40 text-amber-200',
        dotColor: 'bg-amber-400',
        title: language === 'en' ? 'Closing Soon (at 16:00 WIB)' : 'Segera Tutup (Pukul 16.00 WIB)',
        subtext: language === 'en' ? 'Loket tiket ditutup pukul 15.30 WIB' : 'Tiket masuk ditutup 15.30 WIB'
      };
    }

    // Outside operating hours
    const isMorning = currentMins < openMins;
    return {
      isOpen: false,
      badgeBg: 'bg-[#28201a] border-[#44352b] text-[#d5c5b0]',
      dotColor: 'bg-[#8c7662]',
      title: language === 'en' ? 'Currently Closed' : 'Saat Ini Sedang Tutup',
      subtext: isMorning 
        ? (language === 'en' ? 'Opens today at 07:00 WIB' : 'Buka hari ini pukul 07.00 WIB')
        : (day === 0 
            ? (language === 'en' ? 'Tomorrow is Monday (Animal Care Day)' : 'Besok Senin (Libur Satwa)')
            : (language === 'en' ? 'Opens tomorrow at 07:00 WIB' : 'Buka besok pukul 07.00 WIB'))
    };
  };

  const status = getOperatingStatus();

  // Smooth scroll back to top handler
  const handleScrollTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="site-footer" className="relative mt-auto bg-[#1e1713] text-[#d5c5b0] border-t border-[#3e2e23] selection:bg-[#94be2d]/30 overflow-hidden">
      
      {/* ── Visual Polish: Top Ambient Glow & Light Edge ── */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-40 bg-amber-600/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-80 h-36 bg-[#94be2d]/[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="h-px bg-gradient-to-r from-transparent via-[#94be2d]/35 to-transparent absolute top-0 left-0 right-0 pointer-events-none" />

      {/* ── Pre-Footer Action Ribbon (Ajakan Kunjungan & Tiket Cepat) ── */}
      <div className="relative z-10 border-b border-[#3e2e23] bg-gradient-to-r from-[#2a1f18] via-[#241a13] to-[#2a1f18] backdrop-blur-xs">
        <div className="container mx-auto px-4 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-xl bg-[#94be2d]/15 border border-[#94be2d]/30 flex items-center justify-center text-[#a6cf38] flex-shrink-0 hidden sm:flex">
              <AppIcon icon="solar:stars-minimalistic-bold-duotone" className="w-4 h-4 text-[#a6cf38]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#FFF6E8]">
                {language === 'en' ? 'Plan your visit to Jakarta’s iconic wildlife oasis' : 'Rencanakan kunjungan rekreasi dan edukasi satwa Anda'}
              </p>
              <p className="text-[11px] sm:text-xs text-[#bba892]">
                {language === 'en' ? 'Purchase official tickets online directly via the official portal for faster entry' : 'Beli tiket resmi secara online langsung melalui portal resmi untuk akses masuk lebih cepat'}
              </p>
            </div>
          </div>

          <a
            href={settings?.ticket_external_url || 'https://ragunanzoo.agathis.fun/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#94be2d] hover:bg-[#85ab28] text-white text-xs font-bold transition-all duration-200 shadow-sm hover:scale-102 active:scale-98 flex-shrink-0 group"
          >
            <AppIcon icon="solar:ticket-bold-duotone" className="w-3.5 h-3.5 text-[#eef7d5]" />
            <span>{language === 'en' ? 'Book Tickets Online' : 'Pesan Tiket Online'}</span>
            <AppIcon icon="solar:arrow-right-up-linear" className="w-3.5 h-3.5 text-[#eef7d5] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* ── Main Footer Container ── */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-10 sm:pt-12 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-12">

        {/* 4-Column Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">

          {/* Column 1: Identity & Live Operational Status (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block group">
              {isSettingsLoading ? (
                <div className="h-16 w-40 bg-white/10 animate-pulse rounded-xl" />
              ) : (settings?.footer_logo_url || settings?.logo_url) ? (
                <img
                  src={settings?.footer_logo_url || settings?.logo_url || ''}
                  alt="Taman Margasatwa Ragunan"
                  className="h-14 sm:h-16 w-auto object-contain max-w-[220px] transition-transform duration-200 group-hover:scale-102"
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#94be2d]/15 border border-[#94be2d]/30 flex items-center justify-center">
                    <AppIcon icon="solar:leaf-bold-duotone" className="w-4 h-4 text-[#94be2d]" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-[#FFF6E8]">
                    Taman Margasatwa Ragunan
                  </span>
                </div>
              )}
            </Link>

            {isSettingsLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/10 animate-pulse rounded-full" />
                <div className="h-3 w-4/5 bg-white/10 animate-pulse rounded-full" />
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#bba892] leading-relaxed max-w-sm">
                {language === 'en'
                  ? (settings?.footer_description_en || 'A modern conservation, education, and recreation hub preserving wildlife biodiversity and tropical flora in Jakarta.')
                  : (settings?.footer_description_id || 'Pusat konservasi, edukasi, dan rekreasi alam yang didedikasikan untuk pelestarian keanekaragaman satwa liar dan flora tropis.')}
              </p>
            )}

            {/* 🟢 Live Zoo Operating Status Indicator */}
            <div className={`p-3.5 rounded-2xl border text-xs w-full max-w-sm transition-all duration-300 ${status.badgeBg}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="relative flex items-center justify-center w-3 h-3">
                  {status.isOpen && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dotColor}`} />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dotColor}`} />
                </div>
                <span className="font-bold text-[#FFF6E8] text-xs tracking-tight">
                  {status.title}
                </span>
              </div>
              <p className="text-[#d5c5b0]/90 text-[11px] pl-5 leading-snug">
                {status.subtext}
              </p>
              <div className="mt-2 pt-2 border-t border-[#3e2e23] flex items-center justify-between text-[10px] text-[#bba892] pl-5">
                <span>Selasa–Minggu: 07.00–16.00 WIB</span>
                <span className="text-[#8c7662]">Senin: Libur Satwa</span>
              </div>
            </div>
          </div>

          {/* Column 2: Visitor Navigation (Jelajahi) (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a6cf38] flex items-center gap-1.5">
              <span>{language === 'en' ? 'Visitor Guide' : 'Jelajahi Ragunan'}</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { href: '/tickets', label_id: 'Tarif Masuk & Simulasi Tiket', label_en: 'Admission Rates & Simulation' },
                { href: '/map', label_id: 'Peta Interaktif & Rute GPS', label_en: 'Interactive Map & GPS' },
                { href: '/fauna', label_id: 'Koleksi Satwa (Fauna)', label_en: 'Fauna Species Collection' },
                { href: '/flora', label_id: 'Koleksi Tanaman (Flora)', label_en: 'Tropical Flora Garden' },
                { href: '/events', label_id: 'Jadwal Atraksi Feeding', label_en: 'Animal Feeding Schedule' },
                { href: '/audio-guide', label_id: 'Panduan Audio Satwa', label_en: 'Audio Tour Guide' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-[#c2b099] hover:text-[#FFF6E8] hover:translate-x-1 transition-all duration-150 py-0.5 group"
                  >
                    <AppIcon icon="solar:alt-arrow-right-linear" className="w-3.5 h-3.5 text-[#6e5847] group-hover:text-[#a6cf38] transition-colors" />
                    <span>{language === 'en' ? link.label_en : link.label_id}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Public Services & Conservation (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a6cf38] flex items-center gap-1.5">
              <span>{language === 'en' ? 'Public Services' : 'Layanan Publik'}</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { href: '/venues', label_id: 'Sewa Tempat & Fasilitas', label_en: 'Venue & Area Rental' },
                { href: '/tour-guide', label_id: 'Pemandu Wisata (Tour Guide)', label_en: 'Official Tour Guide' },
                { href: '/services', label_id: 'Pendaftaran PKL & Riset', label_en: 'Internship & Research' },
                { href: '/standar-pelayanan', label_id: 'Standar Pelayanan Publik', label_en: 'Service Standards' },
                { href: '/wbs', label_id: 'Whistle Blowing (WBS)', label_en: 'Whistle Blowing System' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-[#c2b099] hover:text-[#FFF6E8] hover:translate-x-1 transition-all duration-150 py-0.5 group"
                  >
                    <AppIcon icon="solar:alt-arrow-right-linear" className="w-3.5 h-3.5 text-[#6e5847] group-hover:text-[#a6cf38] transition-colors" />
                    <span>{language === 'en' ? link.label_en : link.label_id}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Click-to-Call & Click-to-Maps (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a6cf38] flex items-center gap-1.5">
              <span>{language === 'en' ? 'Contact Information' : 'Kontak & Informasi'}</span>
            </h4>

            <ul className="space-y-3 text-xs sm:text-sm">
              {/* Click-to-Maps */}
              <li className="flex items-start gap-2.5 group">
                <div className="w-7 h-7 rounded-lg bg-[#2b2019] border border-[#3e2e23] text-[#94be2d] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#382a20] group-hover:border-[#94be2d]/40 group-hover:scale-105 transition-all">
                  <AppIcon icon="solar:map-point-bold-duotone" className="w-3.5 h-3.5 text-[#94be2d]" />
                </div>
                <a
                  href="https://maps.google.com/?q=Taman+Margasatwa+Ragunan+Jakarta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c2b099] hover:text-[#FFF6E8] leading-relaxed text-xs transition-colors flex items-center gap-1 group/link"
                  title={language === 'en' ? 'Open directions in Google Maps' : 'Buka petunjuk arah di Google Maps'}
                >
                  <span>{settings?.contact_address || 'Jl. Harsono RM No. 1, Ragunan, Pasar Minggu, Jakarta Selatan 12550'}</span>
                  <AppIcon icon="solar:arrow-right-up-linear" className="w-3 h-3 text-[#6e5847] group-hover/link:text-[#a6cf38] inline-block opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>
              </li>

              {/* Click-to-Call */}
              <li className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-lg bg-[#2b2019] border border-[#3e2e23] text-[#94be2d] flex items-center justify-center flex-shrink-0 group-hover:bg-[#382a20] group-hover:border-[#94be2d]/40 group-hover:scale-105 transition-all">
                  <AppIcon icon="solar:phone-bold-duotone" className="w-3.5 h-3.5 text-[#94be2d]" />
                </div>
                <a
                  href={`tel:${(settings?.contact_phone || '(021) 7884 7114').replace(/[^0-9+]/g, '')}`}
                  className="text-[#c2b099] hover:text-[#FFF6E8] text-xs font-medium transition-colors"
                  title={language === 'en' ? 'Click to call directly' : 'Klik untuk melakukan panggilan telepon'}
                >
                  {settings?.contact_phone || '(021) 7884 7114'}
                </a>
              </li>

              {/* Click-to-Email */}
              <li className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-lg bg-[#2b2019] border border-[#3e2e23] text-[#94be2d] flex items-center justify-center flex-shrink-0 group-hover:bg-[#382a20] group-hover:border-[#94be2d]/40 group-hover:scale-105 transition-all">
                  <AppIcon icon="solar:letter-bold-duotone" className="w-3.5 h-3.5 text-[#94be2d]" />
                </div>
                <a
                  href={`mailto:${settings?.contact_email || 'ragunanzoo@jakarta.go.id'}`}
                  className="text-[#c2b099] hover:text-[#FFF6E8] transition-colors text-xs font-medium truncate"
                  title={language === 'en' ? 'Send an email' : 'Kirim email'}
                >
                  {settings?.contact_email || 'ragunanzoo@jakarta.go.id'}
                </a>
              </li>
            </ul>

            {/* Social Media Links in Polished Monochromatic Squircles */}
            {!isSettingsLoading && (settings?.social_instagram || settings?.social_facebook || settings?.social_twitter || settings?.social_youtube || settings?.social_tiktok) && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-[#8c7662] uppercase tracking-wider mb-2">
                  {language === 'en' ? 'Official Social Media' : 'Media Sosial Resmi'}
                </p>
                <div className="flex gap-2">
                  {settings?.social_instagram && (
                    <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#28201a] hover:bg-[#94be2d]/20 border border-[#3e2e23] hover:border-[#94be2d]/50 flex items-center justify-center text-[#c2b099] hover:text-[#FFF6E8] transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-[#94be2d]/20"
                      title="Instagram"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                  )}
                  {settings?.social_facebook && (
                    <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#28201a] hover:bg-[#94be2d]/20 border border-[#3e2e23] hover:border-[#94be2d]/50 flex items-center justify-center text-[#c2b099] hover:text-[#FFF6E8] transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-[#94be2d]/20"
                      title="Facebook"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                    </a>
                  )}
                  {settings?.social_twitter && (
                    <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#28201a] hover:bg-[#94be2d]/20 border border-[#3e2e23] hover:border-[#94be2d]/50 flex items-center justify-center text-[#c2b099] hover:text-[#FFF6E8] transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-[#94be2d]/20"
                      title="X (Twitter)"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  )}
                  {settings?.social_youtube && (
                    <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#28201a] hover:bg-[#94be2d]/20 border border-[#3e2e23] hover:border-[#94be2d]/50 flex items-center justify-center text-[#c2b099] hover:text-[#FFF6E8] transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-[#94be2d]/20"
                      title="YouTube"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.33zM9.75 8.48l5.75 3.27-5.75 3.27V8.48z"/></svg>
                    </a>
                  )}
                  {settings?.social_tiktok && (
                    <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#28201a] hover:bg-[#94be2d]/20 border border-[#3e2e23] hover:border-[#94be2d]/50 flex items-center justify-center text-[#c2b099] hover:text-[#FFF6E8] transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xs hover:shadow-[#94be2d]/20"
                      title="TikTok"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 448 512"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Institutional & Conservation Accreditation Bar ── */}
        {activeOrganizations.length > 0 && (
          <div className="pt-8 pb-6 border-t border-[#36271e]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c7662] text-center mb-4">
              {language === 'en' 
                ? 'Accredited Conservation Memberships & Governing Bodies' 
                : 'Dewan Pengelola & Afiliasi Konservasi Resmi'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {activeOrganizations.map(org => (
                <a
                  key={org.id}
                  href={org.website_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  title={org.full_name || org.name}
                >
                  {org.logo_url ? (
                    <div className="h-11 px-3 py-1.5 bg-[#FFF6E8] hover:bg-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs hover:shadow-sm group-hover:-translate-y-0.5 border border-[#e6d8c4]">
                      <img
                        src={org.logo_url}
                        alt={org.name}
                        className="h-7 w-auto max-w-[100px] object-contain transition-transform duration-200 group-hover:scale-103"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-11 px-3.5 border border-[#3e2e23] bg-[#28201a] hover:bg-[#32261e] rounded-xl flex items-center justify-center transition-all">
                      <span className="text-xs font-semibold text-[#c2b099] group-hover:text-[#FFF6E8]">{org.name}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="h-px bg-[#36271e] mb-6" />

        {/* ── Bottom Legal, Copyright & Back to Top Bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8c7662]">
          <p className="text-center sm:text-left leading-relaxed">
            © {currentYear} Unit Pengelola Taman Margasatwa Ragunan • Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta.
          </p>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-[#d5c5b0] transition-colors">
              {language === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi'}
            </Link>
            <span className="text-[#4a3a2f]">•</span>
            <Link href="/terms" className="hover:text-[#d5c5b0] transition-colors">
              {language === 'en' ? 'Terms of Service' : 'Ketentuan Layanan'}
            </Link>
            <span className="text-[#4a3a2f]">•</span>
            <span className="text-[#8c7662] flex items-center gap-1">
              <AppIcon icon="solar:shield-check-bold-duotone" className="w-3.5 h-3.5 text-[#94be2d]/80" />
              <span>{language === 'en' ? 'Official Gov Portal' : 'Portal Resmi Pemprov DKI'}</span>
            </span>
            <span className="text-[#4a3a2f] hidden sm:inline">•</span>

            {/* Back to Top Button */}
            <button
              onClick={handleScrollTop}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#28201a] hover:bg-[#94be2d]/20 border border-[#3e2e23] hover:border-[#94be2d]/40 text-[#c2b099] hover:text-[#FFF6E8] transition-all text-[11px] font-medium group active:scale-95"
              title={language === 'en' ? 'Back to top' : 'Kembali ke atas'}
            >
              <AppIcon icon="solar:arrow-up-linear" className="w-3 h-3 text-[#94be2d] group-hover:-translate-y-0.5 transition-transform" />
              <span>{language === 'en' ? 'Top' : 'Ke Atas'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
