'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTicketContent } from '@/hooks/useTicketContent';
import { toast } from 'sonner';

export type OnlineStep = 'start' | 'form' | 'contact' | 'qris' | 'success';

export interface TicketCategoryItem {
  id: string;
  category: 'pengunjung' | 'wahana' | 'kendaraan';
  nameId: string;
  nameEn: string;
  price: number;
  icon: React.ReactNode;
}

export interface OnlineTicketFlowProps {
  initialCart?: Record<string, number> | null;
  initialVisitDate?: string;
  onResetToCalculator?: () => void;
}

export default function OnlineTicketFlow({
  initialCart,
  initialVisitDate,
  onResetToCalculator,
}: OnlineTicketFlowProps) {
  const { language } = useLanguage();
  const isEN = language === 'en';
  const { settings } = useTicketContent();

  const [step, setStep] = useState<OnlineStep>(initialCart ? 'form' : 'start');
  const [history, setHistory] = useState<OnlineStep[]>([]);
  const [isPrefilled, setIsPrefilled] = useState<boolean>(!!initialCart);

  // Visit Date State
  const defaultDate = useMemo(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    // If tomorrow is Monday, recommend Tuesday
    if (tomorrow.getDay() === 1) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const [visitDate, setVisitDate] = useState<string>(initialVisitDate || defaultDate);

  // Sync if parent updates initialCart or initialVisitDate
  useEffect(() => {
    if (initialCart && Object.keys(initialCart).length > 0) {
      setCart(initialCart);
      setIsPrefilled(true);
      setStep('form');
    }
  }, [initialCart]);

  useEffect(() => {
    if (initialVisitDate) {
      setVisitDate(initialVisitDate);
    }
  }, [initialVisitDate]);

  // Cart quantity state
  const [cart, setCart] = useState<Record<string, number>>(() => {
    if (initialCart && Object.keys(initialCart).length > 0) {
      return initialCart;
    }
    return {
      dewasa: 2,
      anak: 1,
      schmutzer: 2,
      gol3: 1,
    };
  });

  // Contact info state
  const [contact, setContact] = useState({
    name: 'Ahmad Rivaldi',
    email: 'ahmad.rivaldi@example.com',
    phone: '081234567890',
  });

  // QRIS timer countdown state (15 minutes = 900 seconds)
  const [qrisTimeLeft, setQrisTimeLeft] = useState(900);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [bookingCode, setBookingCode] = useState(() => `RAG-2026-${Math.floor(100000 + Math.random() * 900000)}`);

  const ticketPassRef = useRef<HTMLDivElement>(null);

  // Countdown effect when in QRIS payment step
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'qris') {
      timer = setInterval(() => {
        setQrisTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setQrisTimeLeft(900);
    }
    return () => clearInterval(timer);
  }, [step]);

  // Check if selected date is a Monday (Animal Rest Day)
  const isMonday = useMemo(() => {
    if (!visitDate) return false;
    const parts = visitDate.split('-');
    if (parts.length !== 3) return false;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.getDay() === 1;
  }, [visitDate]);

  // Check if weekend (for Schmutzer price determination)
  const isWeekend = useMemo(() => {
    if (!visitDate) return false;
    const parts = visitDate.split('-');
    if (parts.length !== 3) return false;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.getDay() === 0 || d.getDay() === 6;
  }, [visitDate]);

  const schmutzerPrice = isWeekend
    ? (settings?.schmutzer_weekend_price ?? 7500)
    : (settings?.schmutzer_weekday_price ?? 6000);

  const ticketItems: TicketCategoryItem[] = [
    // 1. Tiket Pengunjung
    {
      id: 'dewasa',
      category: 'pengunjung',
      nameId: 'Tiket Masuk Dewasa',
      nameEn: 'Adult Admission Ticket',
      price: settings?.adult_price ?? 4000,
      icon: <AppIcon name="solar:users-group-two-rounded-bold-duotone" className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'anak',
      category: 'pengunjung',
      nameId: 'Tiket Masuk Anak (3–12 thn)',
      nameEn: 'Child Admission Ticket (3-12 yrs)',
      price: settings?.child_price ?? 3000,
      icon: <AppIcon name="fluent-emoji-flat:baby" className="w-4 h-4 text-emerald-400" />,
    },

    // 2. Tiket Wahana
    {
      id: 'schmutzer',
      category: 'wahana',
      nameId: `Pusat Primata Schmutzer (${isWeekend ? 'Akhir Pekan' : 'Hari Kerja'})`,
      nameEn: `Schmutzer Primate Center (${isWeekend ? 'Weekend' : 'Weekday'})`,
      price: schmutzerPrice,
      icon: <AppIcon name="fluent-emoji-flat:monkey-face" className="w-4 h-4" />,
    },
    {
      id: 'taman_anak',
      category: 'wahana',
      nameId: 'Taman Satwa Anak',
      nameEn: 'Children Zoo Park',
      price: 2500,
      icon: <AppIcon name="solar:stars-minimalistic-bold" className="w-4 h-4 text-pink-500" />,
    },

    // 3. Tiket Kendaraan
    {
      id: 'gol1',
      category: 'kendaraan',
      nameId: 'Kendaraan Gol I (Bus Besar / Truk)',
      nameEn: 'Vehicle Cat I (Large Tour Bus)',
      price: settings?.parking_bus ?? 15000,
      icon: <AppIcon name="fluent-emoji-flat:bus" className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'gol2',
      category: 'kendaraan',
      nameId: 'Kendaraan Gol II (Bus Sedang / Elf / Truk Kecil)',
      nameEn: 'Vehicle Cat II (Medium Bus / Minivan)',
      price: 10000,
      icon: <AppIcon name="fluent-emoji-flat:minibus" className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'gol3',
      category: 'kendaraan',
      nameId: 'Kendaraan Gol III (Mobil Sedan / Minibus / SUV)',
      nameEn: 'Vehicle Cat III (Car / Sedan / SUV)',
      price: settings?.parking_car ?? 10000,
      icon: <AppIcon name="fluent-emoji-flat:automobile" className="w-4 h-4 text-sky-500" />,
    },
    {
      id: 'motor',
      category: 'kendaraan',
      nameId: 'Sepeda Motor & Roda Tiga',
      nameEn: 'Motorcycle & 3-Wheeler',
      price: settings?.parking_motor ?? 5000,
      icon: <AppIcon name="fluent-emoji-flat:motorcycle" className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'sepeda',
      category: 'kendaraan',
      nameId: 'Sepeda Gowes',
      nameEn: 'Bicycle Pass',
      price: settings?.parking_bike ?? 1000,
      icon: <AppIcon name="fluent-emoji-flat:bicycle" className="w-4 h-4 text-teal-500" />,
    },
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

  const go = (next: OnlineStep) => {
    setHistory((h) => [...h, step]);
    setStep(next);
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (prev !== undefined) {
      setHistory((h) => h.slice(0, -1));
      setStep(prev);
    } else {
      setStep('start');
    }
  };

  const reset = () => {
    setStep('start');
    setHistory([]);
    setIsPrefilled(false);
    setCart({ dewasa: 2, anak: 1, schmutzer: 2, gol3: 1 });
    setBookingCode(`RAG-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Format QRIS countdown string MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulate payment processing
  const handleSimulatePayment = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      go('success');
      toast.success(
        language === 'en'
          ? 'Payment successfully verified! QR Ticket Pass is ready.'
          : 'Pembayaran QRIS berhasil diverifikasi! QR Tiket Anda sudah aktif.'
      );
    }, 1200);
  };

  // Copy booking code
  const handleCopyBookingCode = () => {
    navigator.clipboard.writeText(bookingCode);
    setIsCopied(true);
    toast.success(language === 'en' ? 'Booking code copied!' : 'Kode reservasi disalin!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // QRIS payload string for SVG QR generator
  const qrisPayloadString = useMemo(() => {
    return `00020101021226600016ID.GO.JAKARTA.RAGUNAN0118${bookingCode}5204${totalPrice}53033605802ID5919TAMAN MARGASATWA RAGUNAN6007JAKARTA6304ABCD`;
  }, [bookingCode, totalPrice]);

  // Download Ticket Pass as PNG Image
  const handleDownloadTicketPass = () => {
    const node = ticketPassRef.current;
    if (!node) return;

    toast.info(language === 'en' ? 'Generating voucher image...' : 'Menyiapkan berkas tiket...');
    
    // Create a virtual canvas to capture ticket details
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background styling
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 160);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(1, '#0f766e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, 160);

    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('TAMAN MARGASATWA RAGUNAN', 40, 65);
    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('[ CONTOH SIMULASI ] • Bukan Tiket Masuk Sah • ragunanzoo.jakarta.go.id', 40, 95);

    // Ticket Details Card
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(40, 190, 620, 680, 24);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('⚠️ VOUCHER SIMULASI ESTIMASI KUNJUNGAN (BUKAN TIKET MASUK RESMI)', 70, 220);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(bookingCode, 70, 250);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('TANGGAL KUNJUNGAN:', 70, 285);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(visitDate, 70, 315);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('NAMA PEMESAN:', 380, 285);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(contact.name || 'Pengunjung Ragunan', 380, 315);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 340);
    ctx.lineTo(630, 340);
    ctx.stroke();

    // Items list
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('RINCIAN TIKET:', 70, 375);

    let currY = 410;
    Object.entries(cart).forEach(([id, qty]) => {
      const item = ticketItems.find(t => t.id === id);
      if (item && qty > 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px sans-serif';
        ctx.fillText(`${qty}x ${item.nameId}`, 70, currY);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(formatRp(item.price * qty), 480, currY);
        currY += 35;
      }
    });

    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(70, currY + 10);
    ctx.lineTo(630, currY + 10);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('TOTAL ESTIMASI (QRIS):', 70, currY + 45);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(formatRp(totalPrice), 440, currY + 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Voucher simulasi ini tidak berlaku sebagai tiket masuk resmi. Pembelian resmi via loket/portal resmi.', 70, 830);

    // Download trigger
    const link = document.createElement('a');
    link.download = `Simulasi-Tiket-Ragunan-${bookingCode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success(language === 'en' ? 'Simulation voucher downloaded!' : 'Contoh voucher simulasi berhasil diunduh!');
  };

  // WhatsApp send confirmation
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*SIMULASI ESTIMASI TIKET TAMAN MARGASATWA RAGUNAN*\n` +
      `(Catatan: Ini adalah rincian estimasi biaya/simulasi, bukan tiket masuk resmi)\n\n` +
      `Kode Simulasi: ${bookingCode}\n` +
      `Nama: ${contact.name}\n` +
      `Tanggal Kunjungan: ${visitDate}\n` +
      `Total Tiket: ${totalItems} tiket (${formatRp(totalPrice)})\n\n` +
      `Untuk pembelian tiket resmi: Kunjungi portal resmi Pemprov DKI atau gunakan JakCard di loket Ragunan.`
    );
    const url = `https://api.whatsapp.com/send?phone=${contact.phone.replace(/^0/, '62')}&text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-card border border-border/80 rounded-3xl shadow-md overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 px-5 py-5 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.15) 10px, rgba(255,255,255,.15) 20px)',
          }}
        />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <AppIcon name="solar:global-bold-duotone" className="w-5 h-5 text-sky-200" />
              <h3 className="font-extrabold text-base md:text-lg tracking-tight">
                {isEN ? 'Interactive E-Ticket Flow Simulation' : 'Simulasi Alur Pemesanan E-Tiket'}
              </h3>
              <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wide">
                {isEN ? 'Simulation Mode' : 'Mode Simulasi'}
              </span>
            </div>
            <p className="text-white/85 text-xs md:text-sm">
              {isEN
                ? 'Interactive planning simulator: Select date, test checkout flow, and preview digital entry pass format.'
                : 'Simulasi tata cara pemesanan e-tiket: Pilih tanggal kunjungan, simulasikan alur pembayaran, dan lihat contoh voucher digital.'}
            </p>
          </div>
          {step !== 'start' && (
            <button
              onClick={reset}
              className="flex-shrink-0 flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-bold border border-white/30 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all active:scale-95"
            >
              <AppIcon name="solar:restart-bold" className="w-3.5 h-3.5" />
              <span>{isEN ? 'Restart' : 'Reset'}</span>
            </button>
          )}
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/15 overflow-x-auto no-scrollbar">
          {[
            { id: 'form', label: isEN ? '1. Tickets' : '1. Tiket & Tanggal' },
            { id: 'contact', label: isEN ? '2. Contact' : '2. Data Pemesan' },
            { id: 'qris', label: isEN ? '3. Simulation' : '3. Simulasi Bayar' },
            { id: 'success', label: isEN ? '4. Preview Pass' : '4. Contoh Voucher' },
          ].map((s, idx) => {
            const stepOrder = ['start', 'form', 'contact', 'qris', 'success'];
            const currIdx = stepOrder.indexOf(step);
            const thisIdx = stepOrder.indexOf(s.id);
            const isDone = currIdx > thisIdx;
            const isCurrent = step === s.id;

            return (
              <div
                key={s.id}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-white text-sky-900 shadow-xs'
                    : isDone
                    ? 'bg-white/20 text-white'
                    : 'text-white/50'
                }`}
              >
                {isDone ? <AppIcon name="solar:check-read-linear" className="w-3 h-3 text-emerald-300" /> : null}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-5">
        {/* Banner Edukatif & Tautan Portal Resmi */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AppIcon name="solar:danger-triangle-bold" className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">
                {isEN ? 'Educational Simulation Feature' : 'Fitur Simulasi & Estimasi Edukatif'}
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {isEN
                  ? 'This tool simulates the e-ticketing experience for planning. For authentic admissions, visit the official portal or tap your JakCard at the zoo counter.'
                  : 'Fitur ini adalah simulasi alur masuk & estimasi. Pembelian tiket masuk resmi yang sah dapat dilakukan melalui portal resmi Ragunan atau kartu JakCard di loket.'}
              </p>
            </div>
          </div>
          <a
            href="https://ragunanzoo.agathis.fun/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap transition-all shadow-xs flex-shrink-0"
          >
            <span>{isEN ? 'Official Ticket Portal ↗' : 'Buka Portal Resmi ↗'}</span>
          </a>
        </div>

        {/* Banner if Prefilled from Ticket Calculator */}
        {isPrefilled && step === 'form' && (
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AppIcon name="solar:stars-minimalistic-bold" className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <p className="text-xs text-sky-900 dark:text-sky-200">
                {isEN
                  ? 'Ticket counts have been prefilled automatically from your visit simulator!'
                  : 'Jumlah tiket dan wahana telah otomatis diisikan dari kalkulator kunjungan Anda.'}
              </p>
            </div>
            {onResetToCalculator && (
              <button
                onClick={onResetToCalculator}
                className="text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:underline whitespace-nowrap"
              >
                {isEN ? 'Change in Calculator' : 'Ubah di Kalkulator'}
              </button>
            )}
          </div>
        )}

        {/* ─── START STEP ─── */}
        {step === 'start' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 flex items-center justify-center flex-shrink-0">
                <AppIcon name="solar:global-bold-duotone" className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-sky-900 dark:text-sky-200">
                  {isEN ? 'E-Ticket Procedure & Simulation' : 'Tata Cara & Simulasi E-Tiket Daring'}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isEN
                    ? 'Explore how online e-ticketing works. You can calculate ticket quantities, test the QRIS checkout simulation, and preview the generated entry pass format.'
                    : 'Pelajari bagaimana alur pemesanan e-tiket Ragunan Zoo berjalan. Anda dapat merencanakan jumlah tiket, mensimulasikan alur pembayaran, serta melihat contoh format voucher digital.'}
                </p>
              </div>
            </div>

            {/* Step Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { num: '1', title: isEN ? 'Pick Date' : 'Pilih Tanggal', desc: isEN ? 'Tuesday - Sunday' : 'Selasa - Minggu' },
                { num: '2', title: isEN ? 'Select Tickets' : 'Kategori Tiket', desc: isEN ? 'Visitors & Rides' : 'Pengunjung & Wahana' },
                { num: '3', title: isEN ? 'Contact Details' : 'Data Pemesan', desc: isEN ? 'Email & WhatsApp' : 'Simulasi Kontak' },
                { num: '4', title: isEN ? 'QRIS & Pass' : 'Scan & Pass', desc: isEN ? 'Demo Voucher' : 'Contoh Voucher' },
              ].map((s) => (
                <div key={s.num} className="bg-card border border-border/80 p-3 rounded-2xl shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 font-extrabold text-[11px] flex items-center justify-center mb-1.5">
                    {s.num}
                  </div>
                  <p className="font-bold text-foreground text-xs">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => go('form')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <span>{isEN ? 'Start Simulation Flow' : 'Mulai Simulasi Alur'}</span>
              <AppIcon name="solar:arrow-right-linear" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── FORM STEP: DATE & TICKET QUANTITIES ─── */}
        {step === 'form' && (
          <div className="space-y-4 animate-fade-in">
            {/* Step 1: Visit Date Selection */}
            <div className="bg-card border border-border/80 p-4 rounded-2xl space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <AppIcon name="solar:calendar-bold-duotone" className="w-4 h-4 text-sky-600" />
                  <span>1. {isEN ? 'Select Visit Date' : 'Pilih Tanggal Kedatangan'}</span>
                </label>
                {isWeekend && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Akhir Pekan / Weekend
                  </span>
                )}
              </div>

              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {/* Monday Alert */}
              {isMonday && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <AppIcon name="solar:danger-triangle-bold" className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Perhatian: Hari Senin adalah Hari Libur Satwa!</p>
                    <p className="text-[11px] text-amber-600/90 mt-0.5">
                      Ragunan Zoo tutup setiap hari Senin untuk pemeliharaan kesejahteraan satwa (kecuali hari libur nasional). Disarankan memilih hari Selasa - Minggu.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Ticket Categories Selector */}
            <div className="space-y-3">
              <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <AppIcon name="solar:ticket-bold-duotone" className="w-4 h-4 text-sky-600" />
                <span>2. {isEN ? 'Customize Ticket Quantities' : 'Pilih Jumlah Tiket & Wahana'}</span>
              </p>

              {/* Group 1: Tiket Pengunjung */}
              <div className="bg-card border border-border/80 p-3.5 rounded-2xl space-y-2.5 shadow-2xs">
                <p className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AppIcon name="solar:users-group-two-rounded-bold-duotone" className="w-3.5 h-3.5" />
                  <span>Tiket Masuk Pengunjung</span>
                </p>
                <div className="space-y-2">
                  {ticketItems.filter((i) => i.category === 'pengunjung').map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-muted/60 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <div>
                          <p className="text-xs font-bold text-foreground">{isEN ? item.nameEn : item.nameId}</p>
                          <p className="text-[10px] text-muted-foreground">{formatRp(item.price)} / orang</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCart(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-card border border-border hover:bg-muted text-foreground font-bold text-sm flex items-center justify-center transition-colors active:scale-90"
                        >
                          <AppIcon name="solar:minus-linear" className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-sm w-5 text-center text-foreground">
                          {cart[item.id] || 0}
                        </span>
                        <button
                          onClick={() => updateCart(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center justify-center transition-colors active:scale-90"
                        >
                          <AppIcon name="solar:add-linear" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2: Tiket Wahana */}
              <div className="bg-card border border-border/80 p-3.5 rounded-2xl space-y-2.5 shadow-2xs">
                <p className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AppIcon name="solar:trees-bold-duotone" className="w-3.5 h-3.5" />
                  <span>Wahana & Atraksi Satwa</span>
                </p>
                <div className="space-y-2">
                  {ticketItems.filter((i) => i.category === 'wahana').map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-muted/60 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <div>
                          <p className="text-xs font-bold text-foreground">{isEN ? item.nameEn : item.nameId}</p>
                          <p className="text-[10px] text-muted-foreground">{formatRp(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCart(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-card border border-border hover:bg-muted text-foreground font-bold text-sm flex items-center justify-center transition-colors active:scale-90"
                        >
                          <AppIcon name="solar:minus-linear" className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-sm w-5 text-center text-foreground">
                          {cart[item.id] || 0}
                        </span>
                        <button
                          onClick={() => updateCart(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center justify-center transition-colors active:scale-90"
                        >
                          <AppIcon name="solar:add-linear" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 3: Tiket Kendaraan */}
              <div className="bg-card border border-border/80 p-3.5 rounded-2xl space-y-2.5 shadow-2xs">
                <p className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AppIcon name="solar:wheel-bold-duotone" className="w-3.5 h-3.5" />
                  <span>Parkir Kendaraan</span>
                </p>
                <div className="space-y-2">
                  {ticketItems.filter((i) => i.category === 'kendaraan').map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-muted/60 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {item.icon}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{isEN ? item.nameEn : item.nameId}</p>
                          <p className="text-[10px] text-muted-foreground">{formatRp(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateCart(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-card border border-border hover:bg-muted text-foreground font-bold text-sm flex items-center justify-center transition-colors active:scale-90"
                        >
                          <AppIcon name="solar:minus-linear" className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-sm w-5 text-center text-foreground">
                          {cart[item.id] || 0}
                        </span>
                        <button
                          onClick={() => updateCart(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center justify-center transition-colors active:scale-90"
                        >
                          <AppIcon name="solar:add-linear" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Sticky Bar */}
            <div className="bg-muted p-4 rounded-2xl flex items-center justify-between shadow-sm border border-border/80">
              <div>
                <p className="text-[11px] text-muted-foreground">Total {totalItems} tiket dipilih</p>
                <p className="text-lg font-black text-sky-600 dark:text-sky-400">{formatRp(totalPrice)}</p>
              </div>
              <button
                disabled={totalItems === 0}
                onClick={() => go('contact')}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <span>{isEN ? 'Continue to Contact' : 'Lanjut Isi Data'}</span>
                <AppIcon name="solar:arrow-right-linear" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── CONTACT INFO STEP ─── */}
        {step === 'contact' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center flex-shrink-0">
                <AppIcon name="solar:user-bold-duotone" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {isEN ? '3. Fill Contact Information' : '3. Data Kontak & Pengiriman Tiket'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isEN
                    ? 'QR Entry Ticket will be sent immediately to your email and WhatsApp.'
                    : 'Tiket QR pass resmi akan langsung dikirimkan ke Email dan nomor WhatsApp ini.'}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border/80 p-4 rounded-2xl space-y-3.5 shadow-2xs">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                  <AppIcon name="solar:user-bold-duotone" className="w-3.5 h-3.5 text-sky-600" />
                  <span>Nama Lengkap Pemesan</span>
                </label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  placeholder="Masukkan nama lengkap sesuai KTP"
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                  <AppIcon name="solar:letter-bold-duotone" className="w-3.5 h-3.5 text-sky-600" />
                  <span>Alamat Email Aktif</span>
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="contoh: nama@gmail.com"
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                  <AppIcon name="solar:phone-bold-duotone" className="w-3.5 h-3.5 text-sky-600" />
                  <span>Nomor Telepon / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="0812xxxxxxxx"
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Verification Security Notice */}
            <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl px-3.5 py-3 flex items-start gap-2.5 text-xs text-sky-800 dark:text-sky-300">
              <AppIcon name="solar:shield-check-bold-duotone" className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-600" />
              <p>
                Pastikan email <strong>{contact.email}</strong> dan nomor HP ditulis dengan benar agar QR Tiket sampai tepat waktu.
              </p>
            </div>

            <button
              onClick={() => go('qris')}
              disabled={!contact.name || !contact.email}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              <span>{isEN ? `Proceed to QRIS Payment (${formatRp(totalPrice)})` : `Lanjut ke Pembayaran QRIS (${formatRp(totalPrice)})`}</span>
              <AppIcon name="solar:arrow-right-linear" className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── QRIS PAYMENT STEP ─── */}
        {step === 'qris' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300 flex items-center justify-center flex-shrink-0">
                <AppIcon name="solar:qr-code-bold-duotone" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {isEN ? '4. Scan QRIS to Complete Booking' : '4. Pembayaran QRIS Dinamis Otomatis'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {isEN
                    ? 'Scan the dynamic QRIS below using any Indonesian banking or e-wallet application.'
                    : 'Pindai kode QRIS di bawah menggunakan mobile banking (BCA, Mandiri, BRI, Bank DKI, BNI) atau dompet digital (GoPay, OVO, Dana, ShopeePay).'}
                </p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold w-fit mx-auto">
              <AppIcon name="solar:clock-circle-bold-duotone" className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Selesaikan dalam: {formatTimer(qrisTimeLeft)}</span>
            </div>

            {/* QRIS Card Voucher Container */}
            <div className="flex justify-center">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-border text-center max-w-xs w-full space-y-4 text-slate-900">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-1 text-[11px] font-black tracking-wider text-rose-600">
                    <span>QRIS</span>
                    <span className="text-slate-400 font-normal">| GPN</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">Taman Margasatwa Ragunan</span>
                </div>

                {/* Real SVG QR Code */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
                  <QRCodeSVG
                    value={qrisPayloadString}
                    size={175}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500">Total Nominal Pembayaran:</p>
                  <p className="text-2xl font-black text-sky-700 tracking-tight">{formatRp(totalPrice)}</p>
                  <p className="text-[10px] font-mono text-slate-400">Ref: {bookingCode}</p>
                </div>
              </div>
            </div>

            {/* Action Simulator Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isSimulatingPayment}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              {isSimulatingPayment ? (
                <span>Memverifikasi Pembayaran Otomatis...</span>
              ) : (
                <>
                  <AppIcon name="solar:check-circle-bold-duotone" className="w-4 h-4" />
                  <span>{isEN ? 'Simulate Payment Success (Demo)' : 'Simulasikan Pembayaran Berhasil (Demo)'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ─── SUCCESS STEP: E-TICKET PASS & DOWNLOAD ─── */}
        {step === 'success' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2.5 ring-4 ring-emerald-200 dark:ring-emerald-800 shadow-md">
                <AppIcon name="solar:check-circle-bold-duotone" className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg text-foreground">
                {isEN ? 'E-Ticket Simulation Completed!' : 'Simulasi E-Ticket Pass Selesai!'}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {isEN 
                  ? 'Here is an interactive preview of the digital voucher pass based on your simulation.' 
                  : 'Berikut adalah contoh pratinjau voucher pass digital berdasarkan simulasi tanggal & kategori yang dipilih.'}
              </p>
            </div>

            {/* Official Digital Ticket Pass Stub */}
            <div
              ref={ticketPassRef}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-5 shadow-2xl border border-sky-400/30 space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <AppIcon name="solar:ticket-bold-duotone" className="w-5 h-5 text-sky-400" />
                  <div>
                    <p className="text-xs font-black tracking-wider text-amber-300 uppercase">
                      {isEN ? '[ SIMULATION PASS PREVIEW ]' : '[ CONTOH SIMULASI VOUCHER ]'}
                    </p>
                    <p className="text-[10px] text-white/60">Taman Margasatwa Ragunan • Estimasi Kunjungan</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                    {isEN ? 'SIMULATION' : 'SIMULASI ESTIMASI'}
                  </span>
                </div>
              </div>

              {/* QR and Booking Code */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                  <QRCodeSVG value={`SIMULASI-RAGUNAN:${bookingCode}:${visitDate}`} size={120} level="H" />
                </div>
                <div className="space-y-1.5 text-center sm:text-left min-w-0">
                  <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">
                    {isEN ? 'Simulation Booking Ref' : 'Ref Kode Simulasi'}
                  </p>
                  <p className="text-lg font-black font-mono text-sky-300 flex items-center justify-center sm:justify-start gap-1.5">
                    <span>{bookingCode}</span>
                    <button
                      onClick={handleCopyBookingCode}
                      className="p-1 hover:bg-white/10 rounded-md transition-colors"
                      title="Salin kode booking"
                    >
                      {isCopied ? <AppIcon name="solar:check-read-linear" className="w-3.5 h-3.5 text-emerald-400" /> : <AppIcon name="solar:copy-bold-duotone" className="w-3.5 h-3.5 text-white/70" />}
                    </button>
                  </p>
                  <p className="text-xs text-white/90 font-medium">Pemesan: <strong>{contact.name}</strong></p>
                  <p className="text-xs text-emerald-400 font-semibold">Tgl Kedatangan: {visitDate}</p>
                </div>
              </div>

              {/* Item Summary Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-white/60 uppercase font-semibold">Rincian Tiket:</p>
                  <p className="font-bold text-white mt-0.5">{totalItems} Tiket Kunjungan</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/60 uppercase font-semibold">Total Estimasi:</p>
                  <p className="font-black text-sky-300 text-sm mt-0.5">{formatRp(totalPrice)}</p>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-white/70 text-center border-t border-white/10">
                💡 {isEN 
                  ? 'Notice: In the official system, genuine e-tickets are scanned at the turnstile gate for entry.' 
                  : 'Catatan: Pada sistem resmi, e-voucher resmi akan di-scan pada turnstile gate untuk masuk kawasan Ragunan.'}
              </div>
            </div>

            {/* Official Portal Direct CTA Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <AppIcon name="solar:danger-triangle-bold" className="w-4 h-4" />
                <span>{isEN ? 'Notice: This voucher is for educational simulation only' : 'Perhatian: Voucher ini merupakan hasil simulasi estimasi'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isEN
                  ? 'This pass cannot be used for official gate entry. Authentic tickets can be purchased directly through the official Jakarta portal or by tapping a JakCard at the zoo counter.'
                  : 'Voucher simulasi ini tidak berlaku sebagai tiket masuk gerbang. Tiket resmi dapat dibeli langsung melalui portal resmi Pemprov DKI atau menggunakan kartu JakCard di loket.'}
              </p>
              <a
                href="https://ragunanzoo.agathis.fun/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm hover:scale-102 transition-all"
              >
                <span>{isEN ? 'Purchase Official Ticket Online (External) ↗' : 'Beli Tiket Resmi di Portal Eksternal ↗'}</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleDownloadTicketPass}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              >
                <AppIcon name="solar:download-square-bold-duotone" className="w-4 h-4" />
                <span>{isEN ? 'Download Simulation Pass (PNG)' : 'Unduh Contoh Voucher Simulasi (PNG)'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              >
                <AppIcon name="solar:share-bold-duotone" className="w-4 h-4" />
                <span>{isEN ? 'Share Estimate via WhatsApp' : 'Kirim Estimasi ke WhatsApp'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        {step !== 'start' && step !== 'success' && (
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
