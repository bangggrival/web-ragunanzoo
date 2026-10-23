'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Users,
  QrCode,
  FileText,
  DoorOpen,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  UserCheck,
  ScanLine,
  ReceiptText,
  MonitorSmartphone,
  Info,
  Sparkles,
  ArrowLeft,
  Banknote,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTicketContent } from '@/hooks/useTicketContent';

type MposStep = 'start' | 'arrive' | 'counter' | 'input_visitors' | 'verify' | 'qris' | 'payment_success' | 'struk' | 'gate';

interface StepConfig {
  id: MposStep;
  icon: React.ReactNode;
  label: string;
}

function ProgressStepper({ currentStep, steps }: { currentStep: MposStep; steps: StepConfig[] }) {
  const currentIdx = steps.findIndex((s) => s.id === currentStep);
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-1 no-scrollbar">
      {steps.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                    : isActive
                    ? 'bg-violet-600 border-violet-600 text-white scale-110 shadow-lg shadow-violet-300 dark:shadow-violet-900'
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-[10px] font-extrabold">{step.icon}</span>
                )}
              </div>
              <span
                className={`text-[9px] font-semibold text-center max-w-[44px] leading-tight ${
                  isActive
                    ? 'text-violet-600 dark:text-violet-400'
                    : isDone
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mt-4 mx-0.5 min-w-[10px] rounded-full transition-all duration-300 ${
                  idx < currentIdx ? 'bg-emerald-400' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function MposFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState<MposStep>('start');
  const [visitorCount, setVisitorCount] = useState(2);
  const [history, setHistory] = useState<MposStep[]>([]);

  const isEN = language === 'en';

  const go = (next: MposStep) => {
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
    setVisitorCount(2);
  };

  const flowSteps: StepConfig[] = [
    { id: 'arrive', icon: <span>1</span>, label: isEN ? 'Arrive' : 'Tiba' },
    { id: 'counter', icon: <span>2</span>, label: isEN ? 'Counter' : 'Loket' },
    { id: 'input_visitors', icon: <span>3</span>, label: isEN ? 'Input' : 'Input' },
    { id: 'qris', icon: <span>4</span>, label: isEN ? 'QRIS' : 'QRIS' },
    { id: 'struk', icon: <span>5</span>, label: isEN ? 'Receipt' : 'Struk' },
    { id: 'gate', icon: <span>6</span>, label: isEN ? 'Gate' : 'Gate' },
  ];

  const { settings } = useTicketContent();
  const adultPrice = settings?.adult_price ?? 4000;
  const totalPrice = visitorCount * adultPrice;
  const formatRp = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-card border border-border rounded-3xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-5 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,.15) 12px, rgba(255,255,255,.15) 24px)',
          }}
        />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MonitorSmartphone className="w-5 h-5" />
              <h3 className="font-extrabold text-base md:text-lg tracking-tight">
                {isEN ? 'MPoS Ticket Purchase Guide' : 'Panduan Beli Tiket via MPoS'}
              </h3>
            </div>
            <p className="text-white/80 text-xs md:text-sm">
              {isEN
                ? 'Buy your ticket at the counter using Mobile Point of Sale'
                : 'Beli tiket di loket menggunakan Mobile Point of Sale (MPoS)'}
            </p>
          </div>
          {step !== 'start' && (
            <button
              onClick={reset}
              className="flex-shrink-0 flex items-center gap-1 text-white/80 hover:text-white text-xs font-bold border border-white/30 px-2.5 py-1.5 rounded-full hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              {isEN ? 'Restart' : 'Ulangi'}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar (after start) */}
      {step !== 'start' && (
        <div className="px-5 pt-4 pb-1">
          <ProgressStepper currentStep={step} steps={flowSteps} />
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">

        {/* ─── START ─── */}
        {step === 'start' && (
          <div className="space-y-4">
            {/* What is MPoS */}
            <div className="bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 rounded-2xl px-4 py-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 flex items-center justify-center flex-shrink-0">
                <MonitorSmartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-violet-700 dark:text-violet-300 mb-1">
                  {isEN ? 'What is MPoS?' : 'Apa itu MPoS?'}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isEN
                    ? 'MPoS (Mobile Point of Sale) is a digital cashier system used by Ragunan officers at the ticket counter. Visitors pay via QRIS and receive a printed receipt as their entry ticket.'
                    : 'MPoS (Mobile Point of Sale) adalah sistem kasir digital yang digunakan petugas Ragunan di loket tiket. Pengunjung membayar melalui QRIS dan mendapatkan struk cetak sebagai tiket masuk.'}
                </p>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-muted/50 rounded-2xl px-4 py-3">
              <p className="font-bold text-sm text-foreground mb-2 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{isEN ? 'Ticket Prices (Weekday)' : 'Harga Tiket (Hari Biasa)'}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: isEN ? 'Adult' : 'Dewasa', price: 'Rp 4.000' },
                  { label: isEN ? 'Child (3–12 yrs)' : 'Anak (3–12 thn)', price: 'Rp 2.000' },
                  { label: isEN ? 'Adult (Weekend)' : 'Dewasa (Akhir Pekan)', price: 'Rp 6.000' },
                  { label: isEN ? 'Child (Weekend)' : 'Anak (Akhir Pekan)', price: 'Rp 4.000' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between bg-card border border-border px-3 py-2 rounded-xl">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-bold text-foreground">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => go('arrive')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-md hover:shadow-violet-300/40 dark:hover:shadow-violet-900/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            >
              {isEN ? 'Start the Guide' : 'Mulai Panduan'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── ARRIVE ─── */}
        {step === 'arrive' && (
          <StepCard
            icon={<DoorOpen className="w-6 h-6" />}
            iconBg="bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300"
            title={isEN ? 'Arrive at Ragunan Zoo' : 'Tiba di Taman Margasatwa Ragunan'}
            description={isEN
              ? 'Welcome! Head towards the main entrance gate, then look for the ticket counter (loket). Counters are located near each main gate.'
              : 'Selamat datang! Arahkan langkah Anda menuju pintu masuk utama, kemudian cari loket tiket terdekat. Loket tersedia di setiap pintu masuk utama.'}
          >
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs">
              <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-700 dark:text-emerald-300">
                {isEN
                  ? 'Tip: Ragunan has 3 main gates. Each gate has a MPoS ticket counter.'
                  : 'Tips: Ragunan memiliki 3 pintu masuk utama. Masing-masing memiliki loket MPoS.'}
              </p>
            </div>
            <NextButton onClick={() => go('counter')} label={isEN ? 'Go to Ticket Counter' : 'Ke Loket Tiket'} />
          </StepCard>
        )}

        {/* ─── COUNTER ─── */}
        {step === 'counter' && (
          <StepCard
            icon={<Users className="w-6 h-6" />}
            iconBg="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
            title={isEN ? 'Tell the officer the number of visitors' : 'Sebutkan jumlah pengunjung kepada petugas'}
            description={isEN
              ? 'Approach the MPoS counter and tell the officer how many visitors are in your group. Be sure to specify separately: number of adults and number of children (age 3–12).'
              : 'Dekati loket MPoS dan sebutkan kepada petugas berapa jumlah pengunjung dalam rombongan Anda. Pastikan menyebutkan secara terpisah: jumlah dewasa dan jumlah anak-anak (usia 3–12 tahun).'}
          >
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5 text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{isEN ? 'Example:' : 'Contoh ucapan:'}</span>
              </p>
              <p className="italic">
                {isEN
                  ? '"We are 3 adults and 2 children"'
                  : '"Kami 3 orang dewasa dan 2 anak-anak"'}
              </p>
            </div>
            <NextButton onClick={() => go('input_visitors')} label={isEN ? 'Officer is Entering Data' : 'Petugas Memasukkan Data'} />
          </StepCard>
        )}

        {/* ─── INPUT VISITORS ─── */}
        {step === 'input_visitors' && (
          <StepCard
            icon={<UserCheck className="w-6 h-6" />}
            iconBg="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
            title={isEN ? 'Officer inputs & verifies visitor count' : 'Petugas memasukkan & memverifikasi jumlah pengunjung'}
            description={isEN
              ? 'The officer enters the number of visitors into the MPoS device. Then the officer will turn the screen towards you to confirm the number is correct.'
              : 'Petugas memasukkan jumlah pengunjung ke dalam perangkat MPoS. Kemudian petugas akan memperlihatkan layar kepada Anda untuk konfirmasi bahwa jumlahnya sesuai.'}
          >
            {/* Interactive Visitor Counter Preview */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">MPoS — Loket Tiket Ragunan</div>
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{isEN ? 'Visitors' : 'Pengunjung'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVisitorCount((v) => Math.max(1, v - 1))}
                      className="w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="font-extrabold w-5 text-center">{visitorCount}</span>
                    <button
                      onClick={() => setVisitorCount((v) => Math.min(20, v + 1))}
                      className="w-6 h-6 rounded-full bg-violet-500 hover:bg-violet-400 text-white text-sm font-bold flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{isEN ? 'Price / person' : 'Harga / orang'}</span>
                  <span className="font-bold text-amber-300">{formatRp(adultPrice)}</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                  <span className="text-slate-300 font-bold">{isEN ? 'Total' : 'Total'}</span>
                  <span className="font-extrabold text-base text-emerald-400">{formatRp(totalPrice)}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 text-center">{isEN ? 'Coba sesuaikan jumlah pengunjung ↑' : 'Coba sesuaikan jumlah pengunjung ↑'}</div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs">
              <CheckCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 dark:text-amber-300">
                {isEN
                  ? 'Confirm that the number on the screen matches your group before proceeding.'
                  : 'Pastikan jumlah yang tertera di layar sesuai dengan rombongan Anda sebelum lanjut.'}
              </p>
            </div>
            <NextButton onClick={() => go('qris')} label={isEN ? 'Data Confirmed ✓' : 'Data Sesuai ✓'} color="amber" />
          </StepCard>
        )}

        {/* ─── QRIS ─── */}
        {step === 'qris' && (
          <StepCard
            icon={<QrCode className="w-6 h-6" />}
            iconBg="bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300"
            title={isEN ? 'Officer shows QRIS — Scan & Pay!' : 'Petugas menampilkan QRIS — Scan & Bayar!'}
            description={isEN
              ? "The officer will display the QRIS QR code on the MPoS device screen. Open any mobile banking or e-wallet app (GoPay, OVO, Dana, BCA, etc.) and scan the QR code to complete payment."
              : 'Petugas akan menampilkan kode QR QRIS melalui layar perangkat MPoS. Buka aplikasi mobile banking atau dompet digital Anda (GoPay, OVO, Dana, BCA, dll.) dan scan kode QR untuk melakukan pembayaran.'}
          >
            {/* QR code illustration */}
            <div className="flex justify-center">
              <div className="relative bg-white rounded-2xl p-4 shadow-md border border-border w-fit">
                <div className="w-36 h-36 grid grid-cols-5 grid-rows-5 gap-1">
                  {/* Simulated QR pattern */}
                  {Array.from({ length: 25 }).map((_, i) => {
                    const corner = [0,1,5,6, 3,4,8,9, 15,16,20,21, 18,19,23,24];
                    const dots = [2,7,10,12,14,17,22];
                    return (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          corner.includes(i) ? 'bg-slate-900' :
                          dots.includes(i) ? 'bg-slate-700' : 'bg-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2 font-bold">QRIS — {formatRp(totalPrice)}</p>
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-xl px-3 py-2.5">
              <p className="text-xs font-bold text-sky-700 dark:text-sky-300 mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>{isEN ? 'Compatible apps:' : 'Aplikasi yang bisa digunakan:'}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja', 'BCA Mobile', 'BRImo', 'Livin\''].map(app => (
                  <span key={app} className="text-[10px] font-semibold bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full">{app}</span>
                ))}
              </div>
            </div>
            <NextButton onClick={() => go('payment_success')} label={isEN ? 'Payment Successful ✓' : 'Pembayaran Berhasil ✓'} color="sky" />
          </StepCard>
        )}

        {/* ─── PAYMENT SUCCESS ─── */}
        {step === 'payment_success' && (
          <StepCard
            icon={<ScanLine className="w-6 h-6" />}
            iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
            title={isEN ? 'Payment Successful!' : 'Pembayaran Berhasil!'}
            description={isEN
              ? "Your payment has been confirmed. The officer will now process and print your entry receipt/ticket."
              : 'Pembayaran Anda telah dikonfirmasi. Petugas akan segera memproses dan mencetak struk tiket masuk Anda.'}
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center ring-4 ring-emerald-200 dark:ring-emerald-800 shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{isEN ? 'Total paid:' : 'Total dibayarkan:'} <span className="font-extrabold">{formatRp(totalPrice)}</span></span>
              </p>
              <p className="mt-0.5 text-emerald-600/70 dark:text-emerald-400/70">{isEN ? 'Please wait for your printed receipt.' : 'Harap tunggu struk tiket dicetak oleh petugas.'}</p>
            </div>
            <NextButton onClick={() => go('struk')} label={isEN ? 'Receive Receipt' : 'Terima Struk'} color="emerald" />
          </StepCard>
        )}

        {/* ─── STRUK ─── */}
        {step === 'struk' && (
          <StepCard
            icon={<ReceiptText className="w-6 h-6" />}
            iconBg="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
            title={isEN ? 'Receive your receipt — this is your ticket!' : 'Terima struk — ini adalah tiket masuk Anda!'}
            description={isEN
              ? "Take the printed receipt from the officer. This receipt is your official entry ticket to Ragunan Zoo. Keep it safe until you exit."
              : 'Ambil struk cetak dari petugas. Struk ini adalah tiket masuk resmi Anda ke Taman Margasatwa Ragunan. Simpan baik-baik hingga Anda keluar.'}
          >
            {/* Receipt mockup */}
            <div className="flex justify-center">
              <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 w-52 shadow-md font-mono text-[10px] text-slate-700 dark:text-slate-300 space-y-1 relative">
                <div className="text-center font-extrabold text-[11px] text-slate-900 dark:text-white">TAMAN MARGASATWA</div>
                <div className="text-center text-slate-500">RAGUNAN — JAKARTA</div>
                <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-1.5" />
                <div className="flex justify-between"><span>{isEN ? 'Ticket MPoS' : 'Tiket MPoS'}</span></div>
                <div className="flex justify-between"><span>{isEN ? 'Visitors' : 'Pengunjung'}</span><span>{visitorCount} {isEN ? 'pax' : 'orang'}</span></div>
                <div className="flex justify-between"><span>{isEN ? 'Price/pax' : 'Harga/org'}</span><span>{formatRp(adultPrice)}</span></div>
                <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-1.5" />
                <div className="flex justify-between font-bold text-[11px]"><span>TOTAL</span><span className="text-emerald-600">{formatRp(totalPrice)}</span></div>
                <div className="flex justify-between"><span>QRIS</span><span>✓ LUNAS</span></div>
                <div className="border-t border-dashed border-slate-300 dark:border-slate-600 my-1.5" />
                <div className="text-center text-slate-400 text-[9px]">Tunjukkan struk ini ke petugas gate</div>
                {/* Torn edge */}
                <div className="absolute -bottom-2 left-0 right-0 h-2 flex justify-around">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-background rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs">
              <FileText className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-orange-700 dark:text-orange-300">
                {isEN
                  ? 'Keep the receipt throughout your visit. The officer at the gate will check it before you enter.'
                  : 'Simpan struk ini selama kunjungan. Petugas gate akan memeriksa struk sebelum Anda masuk.'}
              </p>
            </div>
            <NextButton onClick={() => go('gate')} label={isEN ? 'Proceed to Entry Gate' : 'Lanjut ke Gate Masuk'} color="orange" />
          </StepCard>
        )}

        {/* ─── GATE ─── */}
        {step === 'gate' && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3 ring-4 ring-emerald-200 dark:ring-emerald-800 shadow-lg">
                <DoorOpen className="w-9 h-9" />
              </div>
              <h4 className="font-extrabold text-lg text-foreground">
                {isEN ? 'Show your receipt at the gate!' : 'Tunjukkan struk di Gate Masuk!'}
              </h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                {isEN
                  ? 'Hand the receipt to the gate officer. They will validate and allow you to enter.'
                  : 'Serahkan struk kepada petugas gate. Petugas akan memvalidasi dan mengizinkan Anda masuk.'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl p-5 text-white text-center overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(60deg, transparent, transparent 15px, rgba(255,255,255,.1) 15px, rgba(255,255,255,.1) 30px)' }} />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <ReceiptText className="w-9 h-9 animate-bounce" />
                <ChevronRight className="w-5 h-5 opacity-60" />
                <div className="w-12 h-12 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center">
                  <DoorOpen className="w-6 h-6" />
                </div>
              </div>
              <p className="font-extrabold text-lg tracking-wide mt-3">TUNJUKKAN STRUK</p>
              <p className="text-white/80 text-xs mt-1">
                {isEN ? 'Show receipt to gate officer for entry' : 'Tunjukkan struk ke petugas gate untuk masuk'}
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 space-y-2">
              <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{isEN ? 'Entry checklist' : 'Checklist Masuk'}</span>
              </p>
              {[
                isEN ? 'Officer validates the receipt at the gate' : 'Petugas gate memvalidasi struk',
                isEN ? 'Keep the receipt for exit documentation' : 'Simpan struk untuk data keluar',
                isEN ? `${visitorCount} visitor(s) may enter at once` : `${visitorCount} pengunjung dapat masuk bersamaan`,
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium inline-flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{isEN ? 'Welcome to Ragunan Zoo! Enjoy your visit!' : 'Selamat datang di Taman Margasatwa Ragunan! Selamat menikmati!'}</span>
              </p>
            </div>
          </div>
        )}

        {/* Back + step indicator */}
        {step !== 'start' && (
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <button
              onClick={back}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEN ? 'Back' : 'Kembali'}</span>
            </button>
            <span className="text-[10px] text-muted-foreground font-medium">
              {flowSteps.findIndex((s) => s.id === step) + 1} / {flowSteps.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HELPER COMPONENTS ───

function StepCard({
  icon,
  iconBg,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground leading-snug">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function NextButton({
  onClick,
  label,
  color = 'violet',
}: {
  onClick: () => void;
  label: string;
  color?: 'violet' | 'amber' | 'sky' | 'emerald' | 'orange';
}) {
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-600 hover:bg-violet-700 shadow-violet-300/40 dark:shadow-violet-900/40',
    amber: 'bg-amber-500 hover:bg-amber-600 shadow-amber-300/40 dark:shadow-amber-900/40',
    sky: 'bg-sky-500 hover:bg-sky-600 shadow-sky-300/40 dark:shadow-sky-900/40',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-300/40 dark:shadow-emerald-900/40',
    orange: 'bg-orange-500 hover:bg-orange-600 shadow-orange-300/40 dark:shadow-orange-900/40',
  };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-extrabold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ${colorMap[color]}`}
    >
      {label}
      <ArrowRight className="w-4 h-4" />
    </button>
  );
}
