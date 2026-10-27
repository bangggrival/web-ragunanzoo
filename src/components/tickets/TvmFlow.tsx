'use client';

import React, { useState } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTicketContent } from '@/hooks/useTicketContent';

type TvmStep = 'start' | 'arrive' | 'select_category' | 'qris' | 'payment_success' | 'receipt' | 'gate';

interface TicketItem {
  id: string;
  category: 'pengunjung' | 'wahana' | 'kendaraan';
  nameId: string;
  nameEn: string;
  price: number;
  icon: React.ReactNode;
}

export default function TvmFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState<TvmStep>('start');
  const [history, setHistory] = useState<TvmStep[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({
    'dewasa': 1,
    'schmutzer': 1,
  });

  const isEN = language === 'en';
  const { settings } = useTicketContent();

  const ticketItems: TicketItem[] = [
    // Tiket Pengunjung
    { id: 'dewasa', category: 'pengunjung', nameId: 'Tiket Dewasa', nameEn: 'Adult Ticket', price: settings?.adult_price ?? 4000, icon: <AppIcon name="solar:users-group-two-rounded-bold-duotone" className="w-4 h-4 text-emerald-500" /> },
    { id: 'anak', category: 'pengunjung', nameId: 'Tiket Anak', nameEn: 'Child Ticket', price: settings?.child_price ?? 3000, icon: <AppIcon name="fluent-emoji-flat:baby" className="w-4 h-4 text-emerald-400" /> },
    
    // Tiket Wahana
    { id: 'schmutzer', category: 'wahana', nameId: 'Pusat Primata Schmutzer', nameEn: 'Schmutzer Primate Center', price: settings?.schmutzer_weekday_price ?? 6000, icon: <AppIcon name="fluent-emoji-flat:monkey-face" className="w-4 h-4 text-amber-500" /> },
    { id: 'taman_anak', category: 'wahana', nameId: 'Taman Satwa Anak', nameEn: 'Children Zoo Park', price: 2500, icon: <AppIcon name="solar:stars-minimalistic-bold" className="w-4 h-4 text-pink-500" /> },
    
    // Tiket Kendaraan
    { id: 'sepeda', category: 'kendaraan', nameId: 'Tiket Sepeda', nameEn: 'Bicycle Pass', price: settings?.parking_bike ?? 1000, icon: <AppIcon name="fluent-emoji-flat:bicycle" className="w-4 h-4 text-sky-500" /> },
  ];

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: updated };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = ticketItems.find((t) => t.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const go = (next: TvmStep) => {
    setHistory((h) => [...h, step]);
    setStep(next);
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (prev !== undefined) {
      setHistory((h) => h.slice(0, -1));
      setStep(prev);
    }
  };

  const reset = () => {
    setStep('start');
    setHistory([]);
    setCart({ 'dewasa': 1, 'schmutzer': 1 });
  };

  return (
    <div className="bg-card border border-border rounded-3xl shadow-md overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-5 py-5 text-white relative overflow-hidden">
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
              <AppIcon name="solar:tv-bold-duotone" className="w-5 h-5" />
              <h3 className="font-extrabold text-base md:text-lg tracking-tight">
                {isEN ? 'TVM Ticket Kiosk Guide' : 'Panduan Mesin TVM (Ticket Vending Machine)'}
              </h3>
            </div>
            <p className="text-white/80 text-xs md:text-sm">
              {isEN
                ? 'Self-service ticket purchase for Zoo Entry, Rides & Bicycle'
                : 'Beli tiket mandiri di mesin TVM untuk Masuk, Wahana & Sepeda'}
            </p>
          </div>
          {step !== 'start' && (
            <button
              onClick={reset}
              className="flex-shrink-0 flex items-center gap-1 text-white/80 hover:text-white text-xs font-bold border border-white/30 px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-all"
            >
              <AppIcon name="solar:restart-bold" className="w-3 h-3" />
              {isEN ? 'Restart' : 'Ulangi'}
            </button>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 space-y-4">

        {/* ─── START ─── */}
        {step === 'start' && (
          <div className="space-y-4">
            <div className="bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-2xl px-4 py-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
                <AppIcon name="solar:tv-bold-duotone" className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-teal-700 dark:text-teal-300 mb-1">
                  {isEN ? 'What is TVM?' : 'Apa itu Ticket Vending Machine (TVM)?'}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isEN
                    ? 'TVM is a self-service touch screen kiosk stationed around Ragunan Zoo. Visitors can purchase tickets for Zoo Entry, Rides, and Bicycle independently using QRIS.'
                    : 'TVM adalah mesin kios layar sentuh mandiri yang tersebar di titik-titik lokasi Ragunan. Pengunjung dapat memilih tiket Masuk, Wahana, dan Sepeda sendiri secara cepat dengan pembayaran QRIS.'}
                </p>
              </div>
            </div>

            {/* TVM Categories Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-card border border-border p-3 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                    <AppIcon name="fluent-emoji-flat:footprints" className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-foreground">
                    {isEN ? 'Visitor Tickets' : 'Tiket Pengunjung'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">• {isEN ? 'Adult' : 'Dewasa'} ({formatRp(settings?.adult_price ?? 4000)})</p>
                <p className="text-[11px] text-muted-foreground">• {isEN ? 'Child' : 'Anak'} ({formatRp(settings?.child_price ?? 3000)})</p>
              </div>

              <div className="bg-card border border-border p-3 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                    <AppIcon name="solar:trees-bold-duotone" className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-foreground">
                    {isEN ? 'Ride Tickets' : 'Tiket Wahana'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">• {isEN ? 'Schmutzer Primate Center' : 'Pusat Primata Schmutzer'}</p>
                <p className="text-[11px] text-muted-foreground">• {isEN ? 'Children Zoo Park' : 'Taman Satwa Anak'}</p>
              </div>

              <div className="bg-card border border-border p-3 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                    <AppIcon name="fluent-emoji-flat:bicycle" className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-foreground">
                    {isEN ? 'Vehicle Pass' : 'Tiket Kendaraan'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">• {isEN ? 'Bicycle Pass' : 'Sepeda'} ({formatRp(settings?.parking_bike ?? 1000)})</p>
              </div>
            </div>

            <button
              onClick={() => go('arrive')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md hover:shadow-teal-300/40 dark:hover:shadow-teal-900/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              {isEN ? 'Start TVM Purchase Guide' : 'Mulai Panduan TVM'}
              <AppIcon name="solar:arrow-right-linear" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── ARRIVE AT TVM ─── */}
        {step === 'arrive' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
                <AppIcon name="solar:map-point-bold-duotone" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {isEN ? '1. Arrive at the TVM Kiosk Location' : '1. Tiba di Titik Lokasi Mesin TVM'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isEN
                    ? 'Walk towards the designated TVM stations near the gate or ride entrances.'
                    : 'Pengunjung menuju titik lokasi mesin TVM terdekat di area pintu masuk atau area wahana.'}
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-2xl p-3.5 space-y-2 text-xs">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <AppIcon name="solar:map-point-bold-duotone" className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{isEN ? 'TVM Locations at Ragunan:' : 'Titik Lokasi TVM:'}</span>
              </p>
              <ul className="space-y-1 text-muted-foreground pl-1">
                <li>• {isEN ? 'Main Entrance Gate (North/East Gate)' : 'Pintu Masuk Utama (North/East Gate)'}</li>
                <li>• {isEN ? 'Front Gate of Schmutzer Primate Center' : 'Depan Gerbang Pusat Primata Schmutzer'}</li>
                <li>• {isEN ? 'Bicycle Rental & Children Zoo Park Area' : 'Area Rental Sepeda & Taman Satwa Anak'}</li>
              </ul>
            </div>

            <button
              onClick={() => go('select_category')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              {isEN ? 'Touch Screen to Start' : 'Sentuh Layar Mesin TVM'}
              <AppIcon name="solar:arrow-right-linear" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── INTERACTIVE TVM KIOSK SCREEN ─── */}
        {step === 'select_category' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                <AppIcon name="solar:tv-bold-duotone" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {isEN ? '2. Select Tickets on TVM Screen' : '2. Pilih Tiket pada Layar Kios TVM'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isEN
                    ? 'Tap category tabs and add items to your cart.'
                    : 'Pilih kategori Tiket Pengunjung, Tiket Wahana, atau Tiket Kendaraan di bawah ini.'}
                </p>
              </div>
            </div>

            {/* Simulating Interactive TVM Kiosk Screen */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-extrabold text-emerald-400">TVM KIOSK #04 — RAGUNAN</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">LAYAR SENTUH</span>
              </div>

              {/* Items List grouped by Category */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">

                {/* Category 1: Tiket Pengunjung */}
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">
                    1. Tiket Pengunjung
                  </p>
                  <div className="space-y-1.5">
                    {ticketItems.filter(i => i.category === 'pengunjung').map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <div>
                            <p className="text-xs font-bold text-white">{language === 'en' ? item.nameEn : item.nameId}</p>
                            <p className="text-[10px] text-slate-400">{formatRp(item.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCart(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center active:scale-95"
                          >
                            <AppIcon name="solar:minus-bold" className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-sm w-4 text-center text-white">{cart[item.id] || 0}</span>
                          <button
                            onClick={() => updateCart(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center active:scale-95"
                          >
                            <AppIcon name="solar:add-bold" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category 2: Tiket Wahana */}
                <div>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                    2. Tiket Wahana
                  </p>
                  <div className="space-y-1.5">
                    {ticketItems.filter(i => i.category === 'wahana').map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <div>
                            <p className="text-xs font-bold text-white">{language === 'en' ? item.nameEn : item.nameId}</p>
                            <p className="text-[10px] text-slate-400">{formatRp(item.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCart(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center active:scale-95"
                          >
                            <AppIcon name="solar:minus-bold" className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-sm w-4 text-center text-white">{cart[item.id] || 0}</span>
                          <button
                            onClick={() => updateCart(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center active:scale-95"
                          >
                            <AppIcon name="solar:add-bold" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category 3: Tiket Kendaraan */}
                <div>
                  <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1.5">
                    3. Tiket Kendaraan
                  </p>
                  <div className="space-y-1.5">
                    {ticketItems.filter(i => i.category === 'kendaraan').map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <div>
                            <p className="text-xs font-bold text-white">{language === 'en' ? item.nameEn : item.nameId}</p>
                            <p className="text-[10px] text-slate-400">{formatRp(item.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCart(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center active:scale-95"
                          >
                            <AppIcon name="solar:minus-bold" className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-sm w-4 text-center text-white">{cart[item.id] || 0}</span>
                          <button
                            onClick={() => updateCart(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center active:scale-95"
                          >
                            <AppIcon name="solar:add-bold" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Total & Checkout Bar inside Kiosk */}
              <div className="border-t border-slate-800 pt-3 mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">{totalItems} item dipilih</p>
                  <p className="text-base font-extrabold text-emerald-400">{formatRp(totalPrice)}</p>
                </div>
                <button
                  disabled={totalItems === 0}
                  onClick={() => go('qris')}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <span>Lanjut Pembayaran</span>
                  <AppIcon name="solar:arrow-right-linear" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SELECT METHOD: QRIS ─── */}
        {step === 'qris' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300 flex items-center justify-center flex-shrink-0">
                <AppIcon name="solar:qr-code-bold-duotone" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {isEN ? '3. Select QRIS & Scan Code' : '3. Pilih Pembayaran QRIS pada Mesin TVM'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isEN
                    ? 'The TVM screen displays a dynamic QRIS QR code. Scan with your mobile banking or e-wallet app.'
                    : 'Mesin TVM akan menampilkan kode QR QRIS di layar. Scan menggunakan e-wallet atau mobile banking Anda.'}
                </p>
              </div>
            </div>

            {/* QRIS Screen Mockup */}
            <div className="flex justify-center">
              <div className="relative bg-white rounded-2xl p-5 shadow-lg border border-border text-center w-64 space-y-3">
                <div className="flex items-center justify-center gap-1.5 bg-sky-50 text-sky-700 py-1 px-3 rounded-full text-xs font-bold">
                  <AppIcon name="solar:qr-code-bold-duotone" className="w-3.5 h-3.5" />
                  <span>METODE PEMBAYARAN: QRIS</span>
                </div>
                
                {/* QR Code Container */}
                <div className="w-44 h-44 bg-white rounded-xl mx-auto flex items-center justify-center p-3 relative shadow-inner border border-slate-200">
                  <QRCodeSVG
                    value={`00020101021226590014ID.LINKAJA.WWW0118936009110021234567020812345678520458125303360540${totalPrice}5802ID5914TMR RAGUNAN6007JAKARTA`}
                    size={150}
                    level="M"
                    fgColor="#0f172a"
                  />
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground">
                    {isEN ? 'Total TVM Bill:' : 'Total Tagihan TVM:'}
                  </p>
                  <p className="text-lg font-extrabold text-emerald-600">{formatRp(totalPrice)}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => go('payment_success')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <span>{isEN ? 'Simulate Payment Success' : 'Simulasi Pembayaran Berhasil'}</span>
              <AppIcon name="solar:check-circle-bold-duotone" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── PAYMENT SUCCESS ─── */}
        {step === 'payment_success' && (
          <div className="space-y-4">
            <div className="text-center py-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 ring-4 ring-emerald-200 dark:ring-emerald-800 shadow-md">
                <AppIcon name="solar:check-circle-bold-duotone" className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-base text-foreground">
                {isEN ? 'Payment Successful!' : 'Pembayaran Berhasil!'}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEN ? 'The TVM printer is now printing your ticket receipt' : 'Mesin TVM sedang mencetak struk tiket Anda'}
              </p>
            </div>

            <button
              onClick={() => go('receipt')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <span>{isEN ? 'Collect Ticket Receipt' : 'Ambil Struk Tiket'}</span>
              <AppIcon name="solar:bill-list-bold-duotone" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── PRINTED RECEIPT ─── */}
        {step === 'receipt' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                <AppIcon name="solar:bill-list-bold-duotone" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {isEN ? '4. Collect Printed Ticket Receipt' : '4. Ambil Struk Tiket Cetak dari Mesin TVM'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isEN
                    ? 'Struk yang keluar dari dispenser cetak TVM adalah bukti tiket sah untuk masuk dan wahana.'
                    : 'Struk cetak yang keluar dari mesin TVM digunakan sebagai bukti sah tiket masuk dan wahana.'}
                </p>
              </div>
            </div>

            {/* Receipt Mockup */}
            <div className="flex justify-center">
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 w-60 shadow-md font-mono text-[10px] text-slate-700 dark:text-slate-300 space-y-1 relative">
                <div className="text-center font-extrabold text-[11px] text-slate-900 dark:text-white">
                  {isEN ? 'TVM TICKET RECEIPT' : 'TVM BUKTI TIKET'}
                </div>
                <div className="text-center text-slate-500">TM RAGUNAN KIOSK #04</div>
                <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-1.5" />
                {Object.entries(cart).map(([id, qty]) => {
                  const item = ticketItems.find(t => t.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between">
                      <span>{isEN ? item.nameEn : item.nameId} (x{qty})</span>
                      <span>{formatRp(item.price * qty)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-1.5" />
                <div className="flex justify-between font-bold text-[11px]">
                  <span>TOTAL</span>
                  <span className="text-emerald-600">{formatRp(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[9px] text-emerald-600">
                  <span>{isEN ? 'METHOD' : 'METODE'}</span>
                  <span>{isEN ? 'QRIS PAID' : 'QRIS LUNAS'}</span>
                </div>
                <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-1.5" />
                <div className="text-center text-slate-400 text-[9px]">
                  {isEN ? 'Present this receipt at Entry Gate / Ride entrance' : 'Gunakan struk ini di Gate Masuk / Wahana'}
                </div>
              </div>
            </div>

            <button
              onClick={() => go('gate')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <span>{isEN ? 'Proceed to Entry Gate' : 'Lanjut ke Gate Masuk'}</span>
              <AppIcon name="solar:login-2-bold-duotone" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── GATE ENTRY ─── */}
        {step === 'gate' && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3 ring-4 ring-emerald-200 dark:ring-emerald-800 shadow-lg">
                <AppIcon name="solar:login-2-bold-duotone" className="w-9 h-9" />
              </div>
              <h4 className="font-extrabold text-lg text-foreground">
                {isEN ? 'You are at the Gate!' : 'Tunjukkan Struk TVM di Gate Masuk'}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                {isEN
                  ? 'Show your TVM receipt to the officer at the gate to enter Ragunan & Rides.'
                  : 'Tunjukkan struk TVM kepada petugas gate untuk diverifikasi sebelum masuk.'}
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 space-y-2">
              <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <AppIcon name="solar:check-circle-bold" className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Checklist Masuk TVM:</span>
              </p>
              <div className="space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
                <p>• Struk tiket dari TVM siap diperlihatkan</p>
                <p>• Berlaku untuk Tiket Masuk, Wahana, dan Sepeda sesuai pilihan</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium inline-flex items-center justify-center gap-1.5">
                <AppIcon name="solar:stars-minimalistic-bold" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Selamat berkunjung di Taman Margasatwa Ragunan!</span>
              </p>
            </div>
          </div>
        )}

        {/* Back navigation button */}
        {step !== 'start' && (
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <button
              onClick={back}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <AppIcon name="solar:arrow-left-linear" className="w-3.5 h-3.5" />
              <span>{isEN ? 'Back' : 'Kembali'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

