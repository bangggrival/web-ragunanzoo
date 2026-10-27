"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppIcon } from '@/components/ui/AppIcon';
import { useTicketContent } from '@/hooks/useTicketContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { TicketContentSection } from '@/components/tickets/TicketContentSection';
import TicketPurchaseDiagrams from '@/components/tickets/TicketPurchaseDiagrams';
import AtmosphericHeader from '@/components/ui/AtmosphericHeader';
import TicketPriceCalculator from '@/components/tickets/TicketPriceCalculator';
import OnlineTicketFlow from '@/components/tickets/OnlineTicketFlow';
import JakCardFlow from '@/components/tickets/JakCardFlow';
import MposFlow from '@/components/tickets/MposFlow';
import TvmFlow from '@/components/tickets/TvmFlow';

function TicketPageContent() {
  const { contents, settings, loading: contentLoading } = useTicketContent();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'online' | 'jakcard' | 'mpos' | 'tvm'>('online');
  const [viewMode, setViewMode] = useState<'interactive' | 'diagram'>('interactive');
  const [onlinePrefill, setOnlinePrefill] = useState<Record<string, number> | null>(null);
  const [jakcardPrefill, setJakcardPrefill] = useState<{ totalAmount: number; recommendation: any } | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'jakcard' || tabParam === 'mpos' || tabParam === 'tvm' || tabParam === 'online') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Get hero content from settings
  const heroTitle = (settings
    ? (language === 'en' && settings.hero_title_en ? settings.hero_title_en : settings.hero_title_id)
    : null) || (language === 'en' ? 'Admission Rates & Ticket Simulation' : 'Tarif Masuk & Simulasi Tiket');
  
  const heroSubtitle = (settings
    ? (language === 'en' && settings.hero_subtitle_en ? settings.hero_subtitle_en : settings.hero_subtitle_id)
    : null) || (language === 'en' ? 'Visit cost calculator, JakCard balance guide, and entry procedure simulation for Ragunan Zoo' : 'Kalkulator estimasi biaya kunjungan, panduan saldo JakCard, dan simulasi tata cara masuk Ragunan Zoo');

  const showPricing = settings?.show_pricing ?? true;

  // Section title for ticket type selection
  const sectionTitle = settings
    ? (language === 'en' && settings.section_title_en ? settings.section_title_en : settings.section_title_id)
    : (language === 'en' ? 'Select Ticket Purchase Type' : 'Pilih Jenis Pembelian Tiket');

  // Regular ticket content
  const regularTitle = settings
    ? (language === 'en' && settings.regular_title_en ? settings.regular_title_en : settings.regular_title_id)
    : (language === 'en' ? 'Offline Ticket (On-site)' : 'Tiket Luring (Di Tempat)');

  // VIP ticket content
  const vipTitle = settings
    ? (language === 'en' && settings.vip_title_en ? settings.vip_title_en : settings.vip_title_id)
    : (language === 'en' ? 'Online Ticket' : 'Tiket Daring');

  const handleTicketClick = (link: string | null | undefined) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <AtmosphericHeader
        theme="tickets"
        icon={<AppIcon icon="Ticket" className="w-5 h-5 md:w-6 md:h-6 text-amber-200" />}
        title={heroTitle}
        description={heroSubtitle}
        breadcrumbs={[
          { label: language === 'en' ? 'Explore' : 'Jelajahi' },
          { label: language === 'en' ? 'Rates & Simulation' : 'Tarif & Simulasi Tiket' },
        ]}
        stats={[
          {
            icon: <AppIcon icon="Ticket" className="w-3.5 h-3.5" />,
            label: language === 'en' ? '4 Entry Options' : '4 Pilihan Jalur Masuk',
          },
          {
            icon: <AppIcon icon="CreditCard" className="w-3.5 h-3.5" />,
            label: 'Cashless / JakCard & QRIS',
          },
        ]}
      />

      <section className="container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">

          {/* Entry Methods Interactive Section */}
          <div id="entry-methods-section" className="space-y-4">
            <div>
              <h2 className="text-base md:text-xl font-extrabold text-foreground">
                {language === 'en' ? 'Entry Methods & Interactive Guide' : 'Metode Masuk & Panduan Interaktif'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {language === 'en'
                  ? 'Explore entry options below to view step-by-step guides or try the interactive simulation'
                  : 'Pilih metode masuk di bawah untuk melihat panduan alur atau mencoba simulasi interaktif'}
              </p>
            </div>

            {/* Tab Buttons (4 Options: Simulasi E-Tiket, JakCard, MPoS, TVM) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5 p-1.5 bg-muted rounded-2xl">
              <button
                onClick={() => setActiveTab('online')}
                className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 min-w-0 ${
                  activeTab === 'online'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                <AppIcon icon="Globe" className={`w-4 h-4 shrink-0 ${activeTab === 'online' ? 'text-white' : 'text-sky-500'}`} />
                <span className="truncate">{language === 'en' ? 'E-Ticket Simulation' : 'Simulasi E-Tiket'}</span>
              </button>

              <button
                onClick={() => setActiveTab('jakcard')}
                className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 min-w-0 ${
                  activeTab === 'jakcard'
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                <AppIcon icon="CreditCard" className={`w-4 h-4 shrink-0 ${activeTab === 'jakcard' ? 'text-white' : 'text-primary'}`} />
                <span className="truncate">JakCard</span>
              </button>

              <button
                onClick={() => setActiveTab('mpos')}
                className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 min-w-0 ${
                  activeTab === 'mpos'
                    ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-md shadow-amber-700/20 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                <AppIcon icon="MonitorSmartphone" className={`w-4 h-4 shrink-0 ${activeTab === 'mpos' ? 'text-white' : 'text-amber-700 dark:text-amber-400'}`} />
                <span className="truncate">MPoS Loket</span>
              </button>

              <button
                onClick={() => setActiveTab('tvm')}
                className={`flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 min-w-0 ${
                  activeTab === 'tvm'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                }`}
              >
                <AppIcon icon="Monitor" className={`w-4 h-4 shrink-0 ${activeTab === 'tvm' ? 'text-white' : 'text-amber-500'}`} />
                <span className="truncate">Mesin TVM</span>
              </button>
            </div>

            {/* View Mode Switcher: Interactive Simulation vs Step Diagram */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                {language === 'en' ? 'Presentation Mode:' : 'Pilihan Tampilan:'}
              </span>

              <div className="inline-flex items-center p-1 rounded-xl bg-muted/80 border border-border/60 text-xs ml-auto">
                <button
                  onClick={() => setViewMode('interactive')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === 'interactive'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AppIcon icon="Sparkles" className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'en' ? 'Interactive Guide' : 'Simulasi Interaktif'}</span>
                </button>

                <button
                  onClick={() => setViewMode('diagram')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === 'diagram'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <AppIcon icon="Layers" className="w-3.5 h-3.5 text-primary" />
                  <span>{language === 'en' ? 'Step Diagrams' : 'Diagram Langkah'}</span>
                </button>
              </div>
            </div>

            {/* Tab Content Display */}
            <div className="animate-fade-in mt-2">
              {viewMode === 'diagram' ? (
                <TicketPurchaseDiagrams activeTab={activeTab} />
              ) : (
                <>
                  {activeTab === 'online' && (
                    <OnlineTicketFlow
                      initialCart={onlinePrefill}
                      onResetToCalculator={() => {
                        document.getElementById('ticket-calculator-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  )}
                  {activeTab === 'jakcard' && (
                    <JakCardFlow
                      calculatedTotal={jakcardPrefill?.totalAmount}
                      recommendedCardType={jakcardPrefill?.recommendation?.cardType}
                      onBackToCalculator={() => {
                        document.getElementById('ticket-calculator-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />
                  )}
                  {activeTab === 'mpos' && <MposFlow />}
                  {activeTab === 'tvm' && <TvmFlow />}
                </>
              )}
            </div>
          </div>

          {/* Interactive Entry Fee & JakCard Balance Calculator */}
          <div id="ticket-calculator-section" className="animate-fade-in">
            <TicketPriceCalculator
              onProceedToOnlineBooking={(cart) => {
                setOnlinePrefill(cart);
                setActiveTab('online');
                setViewMode('interactive');
                document.getElementById('entry-methods-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onProceedToJakCardGuide={(details) => {
                setJakcardPrefill(details);
                setActiveTab('jakcard');
                setViewMode('interactive');
                document.getElementById('entry-methods-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>

          {/* Ticket Content Section - Images and Info */}
          {!contentLoading && contents.length > 0 && (
            <TicketContentSection contents={contents} />
          )}

          {/* Ticket Purchase Options - Article Style */}
          {showPricing && (settings?.regular_image_url || settings?.vip_image_url) && (
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-base md:text-lg font-bold">
                {sectionTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Regular/Luring Ticket Image */}
                {settings?.regular_image_url && (
                  <button
                    onClick={() => handleTicketClick(settings?.regular_link)}
                    disabled={!settings?.regular_link}
                    className={`group overflow-hidden rounded-2xl shadow-md transition-all duration-300 ${
                      settings?.regular_link
                        ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                        : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img 
                        src={settings.regular_image_url} 
                        alt={regularTitle || 'Tiket Luring'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </button>
                )}

                {/* VIP/Daring Ticket Image */}
                {settings?.vip_image_url && (
                  <button
                    onClick={() => handleTicketClick(settings?.vip_link)}
                    disabled={!settings?.vip_link}
                    className={`group overflow-hidden rounded-2xl shadow-md transition-all duration-300 ${
                      settings?.vip_link
                        ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                        : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img 
                        src={settings.vip_image_url} 
                        alt={vipTitle || 'Tiket Daring'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Official External Ticket Portal Direct Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 hidden sm:flex">
                <AppIcon icon="ExternalLink" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {language === 'en' ? 'Official Online Ticket Purchase Portal' : 'Portal Pembelian Tiket Online Resmi'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {language === 'en'
                    ? 'Ready to visit? Purchase authentic e-tickets directly via the official Jakarta government ticketing portal.'
                    : 'Siap berkunjung? Pembelian tiket masuk online resmi yang sah dapat diakses melalui portal resmi Ragunan.'}
                </p>
              </div>
            </div>
            <a
              href={settings?.external_ticket_url || 'https://ragunanzoo.agathis.fun/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm hover:scale-102 flex-shrink-0"
            >
              <span>{language === 'en' ? 'Open Official Portal ↗' : 'Buka Portal Resmi ↗'}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Tickets() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8 text-center">Loading...</div>}>
      <TicketPageContent />
    </Suspense>
  );
}
