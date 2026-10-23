'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  DoorOpen,
  Smartphone,
  Banknote,
  QrCode,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Wallet,
  Plus,
  Ticket,
  BadgeCheck,
  WifiOff,
  Lightbulb,
  Sparkles,
  ArrowLeft,
  Info,
  Users,
  Building,
  HelpCircle,
  Check,
  Compass
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTicketContent } from '@/hooks/useTicketContent';

export type FlowState =
  | 'start'
  | 'has_card'
  | 'no_card'
  | 'buy_card'
  | 'topup'
  | 'topup_loket'
  | 'topup_app'
  | 'gate';

type JakCardSectionTab = 'wizard' | 'nfc' | 'locations' | 'rules';

export interface JakCardFlowProps {
  calculatedTotal?: number;
  recommendedCardType?: string;
  onBackToCalculator?: () => void;
}

interface CardOptionProps {
  title: string;
  subtitle: string;
  price: string;
  initialBalance: string;
  cardFee: string;
  recommended?: boolean;
  onClick: () => void;
}

function CardOption({
  title,
  subtitle,
  price,
  initialBalance,
  cardFee,
  recommended,
  onClick,
}: CardOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`relative group w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${
        recommended
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          : 'border-border bg-card hover:bg-muted/40'
      }`}
    >
      {recommended && (
        <span className="absolute -top-2.5 left-4 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
          Paling Direkomendasikan
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              recommended ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'
            }`}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            <p className="text-[10px] text-muted-foreground/80 mt-0.5">Biaya kartu: {cardFee} • Sudah termasuk saldo</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-black text-sm md:text-base text-foreground">{price}</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Saldo: {initialBalance}
          </p>
        </div>
      </div>
    </button>
  );
}

interface TopupChannelProps {
  icon: React.ReactNode;
  name: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
}

function TopupChannel({ icon, name, desc, badge, badgeColor, onClick }: TopupChannelProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center justify-between p-3.5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 text-left active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div>
          <p className="font-bold text-xs sm:text-sm text-foreground">{name}</p>
          <p className="text-[11px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      {badge && (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
            badgeColor || 'bg-muted text-muted-foreground'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export default function JakCardFlow({
  calculatedTotal,
  recommendedCardType,
  onBackToCalculator,
}: JakCardFlowProps) {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const { settings } = useTicketContent();

  const [flow, setFlow] = useState<FlowState>('start');
  const [history, setHistory] = useState<FlowState[]>([]);
  const [sectionTab, setSectionTab] = useState<JakCardSectionTab>('wizard');

  const go = (next: FlowState) => {
    setHistory((h) => [...h, flow]);
    setFlow(next);
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (prev !== undefined) {
      setHistory((h) => h.slice(0, -1));
      setFlow(prev);
    } else {
      setFlow('start');
    }
  };

  const reset = () => {
    setFlow('start');
    setHistory([]);
  };

  // Dynamic values from database settings with Perda DKI defaults
  const adultPrice = settings?.adult_price ?? 4000;
  const childPrice = settings?.child_price ?? 3000;
  const tier1Total = settings?.jakcard_tier_1_total ?? 45000;
  const tier1Balance = settings?.jakcard_tier_1_balance ?? 20000;
  const tier2Total = settings?.jakcard_tier_2_total ?? 75000;
  const tier2Balance = settings?.jakcard_tier_2_balance ?? 50000;
  const cardFee = settings?.jakcard_card_price ?? 25000;

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-card border border-border/80 rounded-3xl shadow-md overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 px-5 py-5 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.15) 10px, rgba(255,255,255,.15) 20px)',
          }}
        />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-emerald-300" />
              <h3 className="font-extrabold text-base md:text-lg tracking-tight">
                {isEN ? 'Comprehensive JakCard Admission Guide' : 'Panduan Terpadu Masuk dengan JakCard'}
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wide">
                Bank DKI
              </span>
            </div>
            <p className="text-white/85 text-xs md:text-sm">
              {isEN
                ? 'Official contactless smartcard guide: Purchase options, NFC balance check, top-up channels, and group entry rules'
                : 'Panduan resmi kartu uang elektronik: Pembelian perdana, cek saldo via NFC, lokasi top-up, & aturan 1 kartu rombongan'}
            </p>
          </div>
          {flow !== 'start' && sectionTab === 'wizard' && (
            <button
              onClick={reset}
              className="flex-shrink-0 flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-bold border border-white/30 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEN ? 'Restart' : 'Ulangi'}</span>
            </button>
          )}
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/15 overflow-x-auto no-scrollbar">
          {[
            { id: 'wizard', label: isEN ? '1. Entry Flow Wizard' : '1. Simulasi Alur Masuk', icon: <DoorOpen className="w-3.5 h-3.5" /> },
            { id: 'nfc', label: isEN ? '2. NFC Balance Check' : '2. Cek Saldo via NFC', icon: <Smartphone className="w-3.5 h-3.5" /> },
            { id: 'locations', label: isEN ? '3. Top Up Locations' : '3. Lokasi Isi Saldo', icon: <Building className="w-3.5 h-3.5" /> },
            { id: 'rules', label: isEN ? '4. Group Rules & FAQs' : '4. Aturan Rombongan & FAQ', icon: <Users className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSectionTab(tab.id as JakCardSectionTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                sectionTab === tab.id
                  ? 'bg-white text-emerald-950 shadow-sm scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-5">
        {/* Banner from Calculator Handoff */}
        {calculatedTotal && calculatedTotal > 0 && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Estimasi Biaya dari Kalkulator: {formatRp(calculatedTotal)}
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  {recommendedCardType || `Disarankan: ${calculatedTotal <= tier1Balance ? `JakCard ${formatRp(tier1Total)}` : `JakCard ${formatRp(tier2Total)}`}`}
                </p>
              </div>
            </div>
            {onBackToCalculator && (
              <button
                onClick={onBackToCalculator}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline whitespace-nowrap"
              >
                Kembali ke Kalkulator
              </button>
            )}
          </div>
        )}

        {/* ─── TAB 1: INTERACTIVE STEPPER WIZARD ─── */}
        {sectionTab === 'wizard' && (
          <div className="space-y-4 animate-fade-in">
            {/* STEP: START */}
            {flow === 'start' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-foreground text-sm md:text-base">
                    {isEN ? 'Do you already have a Bank DKI JakCard?' : 'Apakah Anda sudah memiliki Kartu JakCard?'}
                  </p>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    {isEN
                      ? 'Ragunan Zoo uses JakCard (issued by Bank DKI) for all gate turnstiles and vehicle parking. Cards can be purchased directly at entrance counters or used with existing TransJakarta / MRT JakCards.'
                      : 'Taman Margasatwa Ragunan menggunakan kartu JakCard resmi Bank DKI untuk tiket masuk orang & kendaraan. Anda bisa memakai JakCard yang sudah dimiliki atau beli langsung di loket gerbang.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => go('has_card')}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400/50 hover:border-emerald-500 hover:bg-emerald-500/15 hover:shadow-md active:scale-[0.98] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                        {isEN ? 'Yes, I have one' : 'Sudah punya kartu'}
                      </p>
                      <p className="text-xs text-muted-foreground">Cek saldo & langsung ke gate</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-emerald-500 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => go('no_card')}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/50 hover:border-amber-500 hover:bg-amber-500/15 hover:shadow-md active:scale-[0.98] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-amber-800 dark:text-amber-300">
                        {isEN ? 'No, I need to buy' : 'Belum punya kartu'}
                      </p>
                      <p className="text-xs text-muted-foreground">Pilih paket kartu di loket</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP: HAS CARD */}
            {flow === 'has_card' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-foreground text-sm md:text-base">
                    {isEN ? 'Verify Your JakCard Balance' : 'Periksa Saldo Kartu JakCard Anda'}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-2xl p-4 text-xs space-y-2 border border-border/80">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Tarif Masuk Resmi (Perda DKI Jakarta):</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-card border border-border/60">
                      <span className="text-muted-foreground">Dewasa:</span>{' '}
                      <strong className="text-foreground">{formatRp(adultPrice)}</strong> / orang
                    </div>
                    <div className="p-2 rounded-xl bg-card border border-border/60">
                      <span className="text-muted-foreground">Anak-anak:</span>{' '}
                      <strong className="text-foreground">{formatRp(childPrice)}</strong> / orang
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic pt-1">
                    *Catatan: 1 kartu dapat ditap berulang kali untuk seluruh anggota rombongan di pintu gate.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => go('gate')}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-400/50 hover:border-emerald-500 hover:bg-emerald-500/15 hover:shadow-md active:scale-[0.98] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                        {isEN ? 'Balance is sufficient' : 'Saldo Cukup'}
                      </p>
                      <p className="text-xs text-muted-foreground">Lanjut tap ke gate turnstile</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-emerald-500 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => go('topup')}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/50 hover:border-amber-500 hover:bg-amber-500/15 hover:shadow-md active:scale-[0.98] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-amber-800 dark:text-amber-300">
                        {isEN ? 'Need to Top Up' : 'Saldo Kurang / Perlu Top Up'}
                      </p>
                      <p className="text-xs text-muted-foreground">Lihat cara isi ulang saldo</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP: NO CARD (BUY OPTIONS) */}
            {flow === 'no_card' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-foreground text-sm md:text-base">
                    {isEN ? 'Official JakCard Starter Packages' : 'Pilihan Paket Perdana JakCard di Loket'}
                  </p>
                </div>

                <div className="space-y-3">
                  <CardOption
                    title={`Paket Hemat ${formatRp(tier1Total)}`}
                    subtitle="Cocok untuk perorangan atau pasangan"
                    price={formatRp(tier1Total)}
                    initialBalance={formatRp(tier1Balance)}
                    cardFee={formatRp(cardFee)}
                    onClick={() => go('buy_card')}
                  />
                  <CardOption
                    title={`Paket Keluarga ${formatRp(tier2Total)}`}
                    subtitle="Saldo lebih besar untuk rombongan keluarga & wahana"
                    price={formatRp(tier2Total)}
                    initialBalance={formatRp(tier2Balance)}
                    cardFee={formatRp(cardFee)}
                    recommended
                    onClick={() => go('buy_card')}
                  />
                </div>
              </div>
            )}

            {/* STEP: BUY CARD SUCCESS */}
            {flow === 'buy_card' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                      Kartu JakCard Anda Siap Digunakan!
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kartu sudah terisi saldo perdana dan langsung aktif untuk ditap di turnstile gate.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => go('gate')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Lanjut ke Gate Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP: TOPUP METHODS */}
            {flow === 'topup' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-foreground text-sm md:text-base">
                    Pilih Lokasi & Cara Isi Ulang (Top Up) Saldo
                  </p>
                </div>

                <div className="space-y-2.5">
                  <TopupChannel
                    icon={<Banknote className="w-5 h-5" />}
                    name="Loket Gerbang Ragunan (Tunai / QRIS)"
                    desc="Langsung isi saldo di loket tiket pintu masuk Ragunan"
                    badge="Instan di Tempat"
                    badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                    onClick={() => go('topup_loket')}
                  />
                  <TopupChannel
                    icon={<Smartphone className="w-5 h-5" />}
                    name="Aplikasi JakOne Mobile (NFC Smartphone)"
                    desc="Top up mandiri lewat HP tanpa perlu antre di loket"
                    badge="NFC HP"
                    badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    onClick={() => go('topup_app')}
                  />
                  <TopupChannel
                    icon={<Building className="w-5 h-5" />}
                    name="Halte TransJakarta & TVM Ragunan"
                    desc="Bisa diisi di Halte Busway Koridor 6 dan mesin TVM otomatis"
                    badge="Tersedia 24 Jam"
                    badgeColor="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300"
                    onClick={() => go('topup_loket')}
                  />
                </div>
              </div>
            )}

            {/* STEP: TOPUP LOKET */}
            {flow === 'topup_loket' && (
              <div className="space-y-4">
                <div className="bg-card border border-border/80 p-4 rounded-2xl space-y-3">
                  <p className="font-bold text-sm text-foreground">Langkah Top-up di Loket Ragunan:</p>
                  <ol className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">1</span>
                      <span>Datangi petugas di loket tiket gerbang masuk terdekat.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">2</span>
                      <span>Serahkan kartu JakCard dan sebutkan nominal pengisian saldo (kelipatan Rp 10.000 atau Rp 20.000).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">3</span>
                      <span>Bayar dengan uang pas tunai atau scan QRIS pada monitor kasir loket.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">4</span>
                      <span>Petugas akan menyerahkan kembali kartu dengan struk bukti pengisian saldo.</span>
                    </li>
                  </ol>
                </div>

                <button
                  onClick={() => go('gate')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Lanjut Menuju Pintu Gerbang Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP: TOPUP APP NFC */}
            {flow === 'topup_app' && (
              <div className="space-y-4">
                <div className="bg-card border border-border/80 p-4 rounded-2xl space-y-3">
                  <p className="font-bold text-sm text-foreground">Langkah Top-up via JakOne Mobile (NFC):</p>
                  <ol className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">1</span>
                      <span>Buka aplikasi <strong>JakOne Mobile</strong> di smartphone yang mendukung sensor NFC.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">2</span>
                      <span>Pilih menu <strong>JakCard / E-Money</strong>, lalu pilih <strong>Top Up Saldo</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">3</span>
                      <span>Masukkan nomor kartu atau tempelkan kartu di punggung ponsel.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">4</span>
                      <span>Selesaikan pembayaran, lalu <strong>tempelkan kembali kartu ke sensor NFC</strong> hingga proses update saldo sukses.</span>
                    </li>
                  </ol>
                </div>

                <button
                  onClick={() => go('gate')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Lanjut Menuju Pintu Gerbang Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP: GATE TAP */}
            {flow === 'gate' && (
              <div className="space-y-4">
                <div className="relative bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-5 text-white text-center shadow-xl space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto shadow-inner">
                    <DoorOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight">TAP KARTU DI TURNSTILE GATE</h4>
                    <p className="text-xs text-white/80 mt-1 max-w-sm mx-auto">
                      Tempelkan kartu JakCard Anda pada mesin pembaca turnstile gate selama ±2 detik hingga terdengar bunyi "BEEP" dan palang pintu terbuka.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                      1 Kartu Bisa Dipakai Rombongan
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation back button */}
            {flow !== 'start' && (
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <button
                  onClick={back}
                  className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: NFC BALANCE CHECK GUIDE ─── */}
        {sectionTab === 'nfc' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
              <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-sm text-purple-900 dark:text-purple-200">
                  Cara Cek Saldo JakCard via Smartphone Ber-NFC
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  Anda dapat memeriksa sisa saldo secara langsung tanpa perlu mendatangi loket menggunakan aplikasi resmi Bank DKI di ponsel Android atau iPhone ber-NFC.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">1</span>
                <p className="font-bold text-xs text-foreground">Aktifkan Fitur NFC</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Buka pengaturan ponsel Anda dan pastikan fitur NFC (Near Field Communication) sudah aktif.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">2</span>
                <p className="font-bold text-xs text-foreground">Buka JakOne Mobile</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Buka aplikasi JakOne Mobile. Anda bahkan tidak perlu login untuk menggunakan fitur Cek Saldo JakCard.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">3</span>
                <p className="font-bold text-xs text-foreground">Tempel Kartu di Punggung HP</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Dekatkan kartu JakCard ke bagian belakang atas smartphone hingga saldo dan riwayat transaksi tampil.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: TOP UP LOCATIONS ─── */}
        {sectionTab === 'locations' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-muted-foreground">
              Berikut lokasi resmi pengisian saldo kartu JakCard di dalam dan sekitar kawasan Ragunan:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1.5 shadow-2xs">
                <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Loket Pintu Masuk Utama (Utara)</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Terletak di area concourse TransJakarta Koridor 6. Menyediakan kasir tunai, QRIS, dan mesin TVM.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1.5 shadow-2xs">
                <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Loket Pintu Masuk Barat (Kav Polri)</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Loket pembelian dan top-up untuk pengunjung kendaraan mobil dan motor dari arah Cilandak/Jagakarsa.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1.5 shadow-2xs">
                <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-sky-600" />
                  <span>Halte TransJakarta Ragunan</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Bisa diisi saldo di petugas loket halte TransJakarta sebelum melangkah ke gerbang Ragunan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-1.5 shadow-2xs">
                <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span>ATM Bank DKI & Minimarket Partner</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Melalui menu Isi Ulang Uang Elektronik pada seluruh jaringan mesin ATM Bank DKI berlogo JakCard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: GROUP RULES & FAQ ─── */}
        {sectionTab === 'rules' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs sm:text-sm text-foreground">
                  Aturan 1 Kartu untuk Rombongan (Multiple Tap)
                </h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Anda <strong>TIDAK PERLU</strong> membeli kartu untuk setiap orang! Cukup miliki 1 kartu JakCard dengan saldo yang mencukupi seluruh anggota rombongan. Tempelkan kartu di gate turnstile secara bergantian:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                <li>Anggota keluarga pertama menempelkan kartu dan masuk saat palang terbuka.</li>
                <li>Setelah pintu berputar, tempelkan kembali kartu untuk anggota kedua, dan seterusnya.</li>
                <li>Satu kartu juga dapat digunakan untuk membayar tiket masuk mobil/motor di gerbang parkir.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>Pertanyaan yang Sering Diajukan (FAQ):</span>
              </p>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                <p className="font-bold text-foreground">Apakah Flazz, e-Money Mandiri, atau TapCash bisa dipakai?</p>
                <p className="text-muted-foreground text-[11px]">
                  Saat ini gate tiket Ragunan Zoo terafiliasi resmi dengan <strong>Bank DKI (JakCard)</strong> dan <strong>Tiket Online QRIS</strong>. Kartu bank lain belum didukung di turnstile gate.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                <p className="font-bold text-foreground">Apakah sisa saldo di JakCard memiliki masa kedaluwarsa?</p>
                <p className="text-muted-foreground text-[11px]">
                  Tidak ada! Saldo JakCard berlaku selamanya (seumur hidup) dan dapat Anda gunakan kembali untuk kunjungan Ragunan berikutnya, naik TransJakarta, MRT Jakarta, LRT, atau Monas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
