'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AppIcon } from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export interface TicketBreakdownItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface InstantTicketPreviewProps {
  adultCount: number;
  childCount: number;
  adultRate: number;
  childRate: number;
  vehicleName: string;
  vehicleRate: number;
  additionalRides: { name: string; total: number }[];
  totalAmount: number;
  dayType: 'weekday' | 'weekend';
  className?: string;
}

export default function InstantTicketPreview({
  adultCount,
  childCount,
  adultRate,
  childRate,
  vehicleName,
  vehicleRate,
  additionalRides,
  totalAmount,
  dayType,
  className = '',
}: InstantTicketPreviewProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const ticketRef = useRef<HTMLDivElement>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Generate deterministic simulation ticket number
  const ticketCode = React.useMemo(() => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `RGZ-2026-${randomSuffix}`;
  }, []);

  const todayFormatted = React.useMemo(() => {
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  }, [isEn]);

  const qrData = `https://ragunanzoo.jakarta.go.id/tickets?code=${ticketCode}&total=${totalAmount}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*ESTIMASI TIKET TAMAN MARGASATWA RAGUNAN*\n` +
      `Nomor Tiket: ${ticketCode}\n` +
      `Tanggal: ${todayFormatted} (${dayType === 'weekend' ? 'Akhir Pekan/Libur' : 'Hari Kerja'})\n` +
      `Pengunjung: ${adultCount} Dewasa, ${childCount} Anak\n` +
      `Kendaraan: ${vehicleName}\n` +
      `Total Estimasi: ${formatRupiah(totalAmount)}\n\n` +
      `Disimulasikan melalui Website Resmi Taman Margasatwa Ragunan`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ── Visual Boarding Pass / Ticket Stub Card ── */}
      <div 
        ref={ticketRef}
        className="relative rounded-3xl bg-gradient-to-br from-[#1b3022] via-[#16271c] to-[#0e1a12] text-white p-5 sm:p-7 shadow-2xl border border-emerald-500/30 overflow-hidden print:bg-white print:text-black print:border-black"
      >
        {/* Subtle Watermark Silhouette */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
          <AppIcon name="solar:ticket-bold-duotone" className="w-80 h-80 text-emerald-400" />
        </div>

        {/* Top Header of Ticket */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-emerald-500/20 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-black text-xl shadow-inner">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isEn ? 'Simulation Estimate Pass' : 'Simulasi Estimasi Tiket'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {ticketCode}
                </span>
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-white mt-0.5 tracking-tight">
                Taman Margasatwa Ragunan
              </h4>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-semibold">
              {isEn ? 'Ticket Category' : 'Kategori Tiket'}
            </p>
            <p className="text-xs font-bold text-white">
              {dayType === 'weekend' 
                ? (isEn ? 'Weekend / Holiday Pass' : 'Akhir Pekan / Hari Libur') 
                : (isEn ? 'Weekday Pass (Tue - Fri)' : 'Hari Kerja (Selasa - Jumat)')}
            </p>
          </div>
        </div>

        {/* Main Body: Details & QR Code Stub */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 relative z-10">
          
          {/* Left: Summary Items (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            
            {/* Meta Row: Date & Gate */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div>
                <p className="text-[10px] text-white/60 uppercase font-semibold flex items-center gap-1">
                  <AppIcon name="solar:calendar-bold-duotone" className="w-3 h-3 text-emerald-400" />
                  <span>{isEn ? 'Visit Date' : 'Tanggal Kunjungan'}</span>
                </p>
                <p className="font-bold text-white mt-0.5 truncate">{todayFormatted}</p>
              </div>

              <div>
                <p className="text-[10px] text-white/60 uppercase font-semibold flex items-center gap-1">
                  <AppIcon name="solar:users-group-two-rounded-bold-duotone" className="w-3 h-3 text-emerald-400" />
                  <span>{isEn ? 'Visitors' : 'Pengunjung'}</span>
                </p>
                <p className="font-bold text-white mt-0.5">
                  {adultCount + childCount} {isEn ? 'Persons' : 'Orang'} ({adultCount} D, {childCount} A)
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] text-white/60 uppercase font-semibold flex items-center gap-1">
                  <AppIcon name="solar:map-point-bold-duotone" className="w-3 h-3 text-emerald-400" />
                  <span>{isEn ? 'Entry Gate' : 'Pintu Masuk'}</span>
                </p>
                <p className="font-bold text-white mt-0.5">Pintu Utara / Barat</p>
              </div>
            </div>

            {/* Cost Breakdown Table */}
            <div className="space-y-2 text-xs">
              <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                {isEn ? 'Itemized Admission Cost' : 'Rincian Tarif Kunjungan'}
              </p>

              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 space-y-2">
                {/* Adults */}
                <div className="flex items-center justify-between text-white/85">
                  <span>Tiket Masuk Dewasa ({adultCount}x @ {formatRupiah(adultRate)})</span>
                  <span className="font-semibold text-white">{formatRupiah(adultCount * adultRate)}</span>
                </div>

                {/* Children */}
                {childCount > 0 && (
                  <div className="flex items-center justify-between text-white/85">
                    <span>Tiket Masuk Anak-anak ({childCount}x @ {formatRupiah(childRate)})</span>
                    <span className="font-semibold text-white">{formatRupiah(childCount * childRate)}</span>
                  </div>
                )}

                {/* Vehicle Parking */}
                {vehicleRate > 0 && (
                  <div className="flex items-center justify-between text-white/85">
                    <span>Retribusi Parkir ({vehicleName})</span>
                    <span className="font-semibold text-white">{formatRupiah(vehicleRate)}</span>
                  </div>
                )}

                {/* Additional Rides */}
                {additionalRides.map((ride, i) => (
                  <div key={i} className="flex items-center justify-between text-white/85">
                    <span>Wahana: {ride.name}</span>
                    <span className="font-semibold text-white">{formatRupiah(ride.total)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Digital QR Stub (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-between p-4 rounded-2xl bg-white/5 border border-emerald-400/20 text-center relative">
            
            <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-2">
              {isEn ? 'Scan at Turnstile Gate' : 'Scan di Pintu Gerbang'}
            </p>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-emerald-400">
              <QRCodeSVG 
                value={qrData}
                size={120}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>

            <p className="text-[10px] font-mono text-white/70 mt-2 font-bold">
              {ticketCode}
            </p>

            <div className="mt-3 pt-2 border-t border-white/10 w-full text-center">
              <span className="text-[10px] text-white/60">
                {isEn ? 'Simulated Pass • Bank DKI JakCard' : 'Simulasi Pass • Tap JakCard'}
              </span>
            </div>
          </div>

        </div>

        {/* Perforated Divider Bar */}
        <div className="relative my-2">
          <div className="absolute -left-7 -top-3.5 w-7 h-7 rounded-full bg-card" />
          <div className="absolute -right-7 -top-3.5 w-7 h-7 rounded-full bg-card" />
          <div className="border-b-2 border-dashed border-white/20 w-full" />
        </div>

        {/* Bottom Total Bar & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-xs uppercase tracking-wider text-white/70 font-bold">
              {isEn ? 'Total Admission Due:' : 'Total Estimasi Tarif:'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-sm">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Share WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <AppIcon name="solar:share-bold" className="w-3.5 h-3.5" />
              <span>{isEn ? 'Share WhatsApp' : 'Bagikan ke WA'}</span>
            </button>

            {/* Print Slip */}
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <AppIcon name="solar:printer-bold-duotone" className="w-3.5 h-3.5" />
              <span>{isEn ? 'Print / Save Slip' : 'Cetak / Simpan Slip'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Trust & Policy Badge */}
      <div className="space-y-1.5 pt-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold">
          <span>
            {isEn
              ? '⚠️ Note: This slip is an interactive cost estimate for planning, not an authentic entrance ticket.'
              : '⚠️ Catatan: Slip ini adalah kalkulasi estimasi biaya untuk perencanaan, bukan tiket masuk resmi.'}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <AppIcon name="solar:shield-check-bold" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            {isEn
              ? 'Official DKI Jakarta Regional Regulation tariff. Free entry for seniors and disabled visitors with verified ID.'
              : 'Tarif resmi Perda DKI Jakarta. Gratis masuk lansia ber-KTP DKI dan disabilitas terdaftar.'}
          </span>
        </div>
      </div>
    </div>
  );
}
