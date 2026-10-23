'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Calendar,
  QrCode,
  Mail,
  ScanLine,
  CreditCard,
  Building,
  CheckCircle2,
  MonitorSmartphone,
  Users,
  ReceiptText,
  Monitor,
  DoorOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export type TabType = 'online' | 'jakcard' | 'mpos' | 'tvm';

interface DiagramProps {
  activeTab: TabType;
}

export default function TicketPurchaseDiagrams({ activeTab }: DiagramProps) {
  const { language } = useLanguage();
  const isEN = language === 'en';

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [jakcardSubPath, setJakcardSubPath] = useState<'new' | 'existing'>('new');

  // Reset active step index when tab changes
  useEffect(() => {
    setActiveStepIndex(0);
  }, [activeTab, jakcardSubPath]);

  // Ragunan official botanical colors
  const themeColors = {
    online: {
      primary: '#0284c7', // Sky blue
      accent: 'bg-sky-500',
      border: 'border-sky-500/40',
      light: 'bg-sky-500/10 text-sky-800 dark:text-sky-300',
    },
    jakcard: {
      primary: '#15803d', // Forest green
      accent: 'bg-emerald-600',
      border: 'border-emerald-500/40',
      light: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
    },
    mpos: {
      primary: '#b45309', // Amber brown
      accent: 'bg-amber-600',
      border: 'border-amber-500/40',
      light: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
    },
    tvm: {
      primary: '#d97706', // Warm amber
      accent: 'bg-amber-500',
      border: 'border-amber-500/40',
      light: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
    },
  }[activeTab];

  // Flow data definitions
  const flows = {
    online: {
      title: isEN ? 'Online Ticket Purchase Flow' : 'Alur Pembelian Tiket Online',
      subtitle: isEN ? 'Official Ragunan website e-ticket booking' : 'Pemesanan e-tiket resmi via website Ragunan',
      icon: <Globe className="w-5 h-5 text-white" />,
      steps: [
        {
          icon: <Globe className="w-6 h-6" />,
          title: isEN ? '1. Access Booking Portal' : '1. Buka Portal Tiket Web',
          desc: isEN ? 'Visit ragunanzoo.jakarta.go.id from any smartphone or laptop browser.' : 'Buka laman resmi ragunanzoo.jakarta.go.id dari browser HP atau komputer Anda.',
          tip: isEN ? 'Booking can be done up to 1 day prior to your visit date.' : 'Pemesanan dapat dilakukan H-1 sebelum tanggal kedatangan Anda.',
        },
        {
          icon: <Calendar className="w-6 h-6" />,
          title: isEN ? '2. Select Visit Date & Guests' : '2. Pilih Tanggal & Kategori',
          desc: isEN ? 'Choose your arrival date, number of adult and child visitors, and parking options.' : 'Tentukan hari kunjungan, jumlah tiket dewasa & anak, serta pilihan parkir kendaraan.',
          tip: isEN ? 'Ragunan is open Tuesday to Sunday. Closed on Mondays for animal rest.' : 'Ragunan buka Selasa - Minggu. Hari Senin libur satwa.',
        },
        {
          icon: <QrCode className="w-6 h-6" />,
          title: isEN ? '3. Pay Instantly via QRIS' : '3. Pembayaran via QRIS',
          desc: isEN ? 'Scan the QRIS dynamic barcode using BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, or any banking app.' : 'Scan kode QRIS yang muncul di layar menggunakan mobile banking atau dompet digital apa saja.',
          tip: isEN ? 'QRIS is accepted from all Indonesian banks and e-wallets.' : 'Mendukung semua m-banking & e-wallet berlogo QRIS resmi.',
        },
        {
          icon: <Mail className="w-6 h-6" />,
          title: isEN ? '4. Receive Digital QR Ticket' : '4. Terima QR Tiket Otomatis',
          desc: isEN ? 'Your official QR pass is generated immediately and also sent to your registered email address.' : 'QR tiket resmi akan langsung tampil di layar dan dikirimkan ke email terdaftar Anda.',
          tip: isEN ? 'Capture a screenshot of the QR code so you can easily show it without internet.' : 'Simpan tangkapan layar (screenshot) QR code di galeri HP Anda.',
        },
        {
          icon: <ScanLine className="w-6 h-6" />,
          title: isEN ? '5. Scan & Enter at Gate' : '5. Scan di Pintu Gerbang Masuk',
          desc: isEN ? 'Show the QR Code on your smartphone directly to the turnstile officer at North or West Gate.' : 'Tunjukkan QR Code di layar HP ke petugas gerbang (Pintu Utara / Barat) untuk masuk.',
          tip: isEN ? 'No need to queue at the ticket counters! Proceed directly to turnstile lanes.' : 'Langsung menuju gerbang tanpa perlu antre di loket tiket fisik!',
        },
      ],
    },
    jakcard: {
      title: isEN ? 'JakCard Entry & Turnstile Flow' : 'Alur Masuk Menggunakan Kartu JakCard',
      subtitle: isEN ? 'Official cashless contactless payment by Bank DKI' : 'Sistem pembayaran non-tunai resmi Bank DKI di seluruh gerbang Ragunan',
      icon: <CreditCard className="w-5 h-5 text-white" />,
      paths: {
        new: [
          {
            icon: <Building className="w-6 h-6" />,
            title: isEN ? '1. Visit Ticket Counter' : '1. Datangi Loket Tiket Gerbang',
            desc: isEN ? 'Approach any active ticket counter booth located at North Gate or West Gate.' : 'Menuju loket tiket fisik di Pintu Masuk Utara atau Pintu Masuk Barat Ragunan.',
            tip: isEN ? 'Prepare cash or QRIS to purchase the starter card package.' : 'Siapkan pembayaran tunai atau QRIS untuk pembelian kartu perdana.',
          },
          {
            icon: <CreditCard className="w-6 h-6" />,
            title: isEN ? '2. Buy Starter JakCard Package' : '2. Beli Kartu Perdana JakCard',
            desc: isEN ? 'Choose Package Rp 45.000 (Rp 20.000 balance) or Package Rp 75.000 (Rp 50.000 balance).' : 'Pilih paket Rp 45.000 (saldo Rp 20.000) atau paket Rp 75.000 (saldo Rp 50.000).',
            tip: isEN ? '1 card can be used for your entire group! Tap repeatedly at the turnstile gate.' : 'Satu kartu bisa dipakai bersama seluruh rombongan secara berulang!',
          },
          {
            icon: <ScanLine className="w-6 h-6" />,
            title: isEN ? '3. Tap Card at Gate Turnstile' : '3. Tap Kartu di Pintu Turnstile',
            desc: isEN ? 'Tap the JakCard against the reader on the turnstile gate for each person in your group.' : 'Tempelkan kartu JakCard pada mesin pembaca turnstile untuk setiap orang rombongan.',
            tip: isEN ? 'Card balance is automatically deducted according to official Perda admission rates.' : 'Saldo kartu akan terpotong otomatis sesuai tarif tiket resmi Perda DKI.',
          },
        ],
        existing: [
          {
            icon: <CheckCircle2 className="w-6 h-6" />,
            title: isEN ? '1. Verify Remaining Balance' : '1. Pastikan Saldo Mencukupi',
            desc: isEN ? 'Check your JakCard balance via JakOne Mobile NFC, Bank DKI ATM, or counter balance checker.' : 'Pastikan saldo JakCard mencukupi total tiket & parkir menggunakan JakOne Mobile atau loket.',
            tip: isEN ? 'Use our calculator below to calculate the exact balance needed for your visit.' : 'Gunakan kalkulator di bawah untuk menghitung saldo persis yang dibutuhkan.',
          },
          {
            icon: <Building className="w-6 h-6" />,
            title: isEN ? '2. Top Up if Balance is Low' : '2. Top Up Saldo Jika Kurang',
            desc: isEN ? 'Top up can be done at any Ragunan ticket booth, Bank DKI ATM, or Tokopedia (NFC).' : 'Top-up saldo dapat dilakukan di loket tiket Ragunan, ATM Bank DKI, atau Tokopedia via NFC.',
            tip: isEN ? 'Top-up at the counter has no administrative fees.' : 'Isi ulang saldo di loket Ragunan bebas biaya admin tambahan.',
          },
          {
            icon: <ScanLine className="w-6 h-6" />,
            title: isEN ? '3. Direct Tap at Gate' : '3. Langsung Tap di Pintu Masuk',
            desc: isEN ? 'Skip the counter queues! Walk directly to the turnstile gate and tap your card to enter.' : 'Lewati antrean loket! Langsung berjalan ke turnstile gerbang dan tap kartu untuk masuk.',
            tip: isEN ? 'Keep the card safe for rides inside like Pusat Primata Schmutzer.' : 'Simpan kartu untuk wahana di dalam seperti Pusat Primata Schmutzer.',
          },
        ],
      },
    },
    mpos: {
      title: isEN ? 'MPoS Mobile Officer Ticket Flow' : 'Alur Tiket MPoS Petugas (Gerbang)',
      subtitle: isEN ? 'Fast assistance from mobile ticketing officers with printed receipts' : 'Layanan tiket cepat dari petugas loket bergerak dengan struk resmi QRIS',
      icon: <MonitorSmartphone className="w-5 h-5 text-white" />,
      steps: [
        {
          icon: <Building className="w-6 h-6" />,
          title: isEN ? '1. Approach MPoS Counter / Officer' : '1. Temui Petugas / Loket MPoS',
          desc: isEN ? 'Locate the dedicated MPoS counter lane or mobile officer station near the entrance plaza.' : 'Temui petugas loket MPoS khusus yang bertugas di depan plaza pintu masuk.',
          tip: isEN ? 'Ideal if you don’t have a JakCard and want to pay directly via QRIS.' : 'Pilihan tepat jika belum punya JakCard dan ingin langsung bayar QRIS.',
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: isEN ? '2. State Number of Visitors & Vehicles' : '2. Sebutkan Jumlah Pengunjung',
          desc: isEN ? 'Tell the officer how many adults and children, plus any vehicle parking tickets needed.' : 'Sebutkan rincian jumlah dewasa, anak-anak, dan jenis kendaraan kepada petugas.',
          tip: isEN ? 'Infants under 3 years old are free of charge.' : 'Anak-anak di bawah 3 tahun gratis tiket masuk.',
        },
        {
          icon: <QrCode className="w-6 h-6" />,
          title: isEN ? '3. Scan QRIS on Officer’s Device' : '3. Scan QRIS di Layar Petugas',
          desc: isEN ? 'The officer will generate a QRIS code on their mobile terminal. Scan and confirm payment.' : 'Petugas menampilkan kode QRIS di mesin MPoS. Scan dengan e-wallet atau mobile banking Anda.',
          tip: isEN ? 'Payment confirmation is instant on the officer’s handheld screen.' : 'Konfirmasi pembayaran muncul seketika di layar terminal petugas.',
        },
        {
          icon: <ReceiptText className="w-6 h-6" />,
          title: isEN ? '4. Receive Official Ticket Receipt' : '4. Terima Struk Fisik Tiket',
          desc: isEN ? 'Collect the thermal printed receipt. This receipt contains your legal entry validation barcode.' : 'Terima struk cetak resmi yang memuat nomor barcode dan validasi masuk sah.',
          tip: isEN ? 'Keep the receipt dry and intact until you exit the zoo grounds.' : 'Simpan struk dengan baik sebagai bukti tiket yang sah.',
        },
        {
          icon: <DoorOpen className="w-6 h-6" />,
          title: isEN ? '5. Enter via Designated Lane' : '5. Masuk via Pintu Petugas',
          desc: isEN ? 'Show the receipt to the turnstile inspector and proceed into the zoo.' : 'Tunjukkan struk tersebut kepada petugas pemeriksa di gate untuk dipersilakan masuk.',
          tip: isEN ? 'Enjoy your visit to Taman Margasatwa Ragunan!' : 'Selamat menikmati keindahan alam dan satwa Ragunan!',
        },
      ],
    },
    tvm: {
      title: isEN ? 'Ticket Vending Machine (TVM) Kiosk Flow' : 'Alur Beli Tiket Mandiri TVM (Kiosk)',
      subtitle: isEN ? 'Self-service automated touch-screen ticketing kiosks' : 'Mesin tiket mandiri layar sentuh praktis tanpa perlu antre di loket',
      icon: <Monitor className="w-5 h-5 text-white" />,
      steps: [
        {
          icon: <Monitor className="w-6 h-6" />,
          title: isEN ? '1. Approach TVM Touchscreen Kiosk' : '1. Datangi Mesin Kios TVM',
          desc: isEN ? 'Walk up to any available TVM touch kiosk situated at the ticket plaza concourse.' : 'Berdiri di depan mesin TVM layar sentuh yang tersedia di area loket gerbang.',
          tip: isEN ? 'Available in both Indonesian and English interface modes.' : 'Tersedia pilihan bahasa Indonesia dan Inggris di pojok layar.',
        },
        {
          icon: <ReceiptText className="w-6 h-6" />,
          title: isEN ? '2. Tap to Select Admission & Rides' : '2. Pilih Jumlah Tiket di Layar',
          desc: isEN ? 'Tap the on-screen buttons to choose adult tickets, child tickets, vehicles, or rides.' : 'Sentuh layar untuk memilih tiket Masuk Dewasa, Anak, Parkir, atau Wahana Schmutzer.',
          tip: isEN ? 'Review your cart breakdown summary displayed on the right of the screen.' : 'Periksa kembali rincian dan total harga di sisi kanan layar mesin.',
        },
        {
          icon: <QrCode className="w-6 h-6" />,
          title: isEN ? '3. Scan QRIS on Screen' : '3. Scan QRIS di Layar Mesin',
          desc: isEN ? 'A large dynamic QRIS code will appear on screen. Scan it with your preferred banking app.' : 'Kode QRIS dinamis akan terpampang jelas di layar TVM. Scan menggunakan aplikasi pembayaran Anda.',
          tip: isEN ? 'Transaction timeout is 120 seconds for security.' : 'Batas waktu pembayaran 120 detik demi keamanan transaksi.',
        },
        {
          icon: <ReceiptText className="w-6 h-6" />,
          title: isEN ? '4. Collect Printed Ticket Voucher' : '4. Ambil Tiket Struk yang Keluar',
          desc: isEN ? 'The machine will automatically print your admission ticket pass from the bottom slot.' : 'Mesin TVM akan otomatis mencetak tiket fisik dari slot pengeluaran di bawah layar.',
          tip: isEN ? 'Take both the ticket pass and payment transaction receipt.' : 'Pastikan mengambil tiket dan struk bukti pembayaran.',
        },
        {
          icon: <DoorOpen className="w-6 h-6" />,
          title: isEN ? '5. Scan Barcode at Turnstile' : '5. Masuk Melalui Pintu Gerbang',
          desc: isEN ? 'Scan the printed ticket barcode at the turnstile scanner lane and enter the zoo.' : 'Pindai barcode pada tiket fisik di pemindai gerbang turnstile dan silakan masuk.',
          tip: isEN ? 'Quick, independent, and queue-free entrance!' : 'Cepat, mandiri, dan bebas antre panjang!',
        },
      ],
    },
  };

  const currentFlow = flows[activeTab];
  
  // Resolve current active steps
  const stepsList = 'paths' in currentFlow
    ? currentFlow.paths[jakcardSubPath]
    : currentFlow.steps;

  const currentStep = stepsList[activeStepIndex] || stepsList[0];
  const totalSteps = stepsList.length;

  const handleNext = () => {
    if (activeStepIndex < totalSteps - 1) {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="rounded-3xl bg-card border border-border/80 shadow-md overflow-hidden transition-all duration-300">
      
      {/* Header Bar */}
      <div 
        className="px-5 md:px-7 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden"
        style={{ backgroundColor: themeColors.primary }}
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
            {currentFlow.icon}
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
              {currentFlow.title}
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              {currentFlow.subtitle}
            </p>
          </div>
        </div>

        {/* Step Indicator Counter */}
        <div className="self-start sm:self-auto px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isEN ? `Step ${activeStepIndex + 1} of ${totalSteps}` : `Langkah ${activeStepIndex + 1} dari ${totalSteps}`}</span>
        </div>
      </div>

      {/* Sub-Path Toggle for JakCard Tab */}
      {activeTab === 'jakcard' && (
        <div className="px-5 md:px-7 pt-5 pb-1 flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-muted/80 border border-border/70 max-w-md w-full">
            <button
              onClick={() => setJakcardSubPath('new')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                jakcardSubPath === 'new'
                  ? 'bg-card text-foreground shadow-sm scale-[1.01]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isEN ? 'A. Don\'t Have Card (Buy Starter)' : 'A. Belum Punya (Beli Baru)'}
            </button>
            <button
              onClick={() => setJakcardSubPath('existing')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                jakcardSubPath === 'existing'
                  ? 'bg-card text-foreground shadow-sm scale-[1.01]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isEN ? 'B. Already Have Card (Top Up)' : 'B. Sudah Punya (Tap Langsung)'}
            </button>
          </div>
        </div>
      )}

      {/* Step Tracker Timeline Bar */}
      <div className="px-5 md:px-7 pt-5 pb-3">
        <div className="relative flex items-center justify-between">
          {/* Connecting Track Line */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full -z-0" />
          
          {/* Active Progress Fill */}
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-1 rounded-full -z-0 transition-all duration-500 ease-out"
            style={{ 
              backgroundColor: themeColors.primary,
              width: `${(activeStepIndex / (totalSteps - 1)) * 100}%`
            }}
          />

          {/* Stepper Dots */}
          {stepsList.map((st, idx) => {
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <button
                key={idx}
                onClick={() => setActiveStepIndex(idx)}
                className={`relative z-10 flex flex-col items-center group focus:outline-none transition-all duration-300 ${
                  isCurrent ? 'scale-110' : ''
                }`}
              >
                <div 
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-sm border-2 ${
                    isCurrent
                      ? 'bg-card text-foreground ring-4 shadow-md'
                      : isCompleted
                      ? 'text-white border-transparent'
                      : 'bg-muted text-muted-foreground border-border/70 group-hover:border-foreground/30'
                  }`}
                  style={{
                    backgroundColor: isCompleted ? themeColors.primary : undefined,
                    borderColor: isCurrent ? themeColors.primary : undefined,
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <span className={`hidden md:block text-[11px] font-semibold mt-1.5 max-w-[85px] truncate text-center ${
                  isCurrent ? 'text-foreground font-bold' : 'text-muted-foreground'
                }`}>
                  {st.title.split('. ')[1] || st.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spotlight Active Step Card */}
      <div className="p-5 md:p-7 pt-3">
        <div className="relative rounded-3xl p-5 sm:p-6 bg-muted/30 border border-border/70 overflow-hidden transition-all duration-300">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
              style={{ backgroundColor: themeColors.primary }}
            >
              {currentStep.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {isEN ? `Step ${activeStepIndex + 1}` : `Langkah ${activeStepIndex + 1}`}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-foreground mt-1">
                {currentStep.title}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                {currentStep.desc}
              </p>
            </div>
          </div>

          {/* Practical Tip Box */}
          {currentStep.tip && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-card border border-border/60 text-xs text-foreground/90 mt-3">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-primary font-bold">{isEN ? 'Helpful Tip: ' : 'Tips Pengunjung: '}</strong>
                <span>{currentStep.tip}</span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-border/60">
            <button
              onClick={handlePrev}
              disabled={activeStepIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border/80 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEN ? 'Previous' : 'Langkah Sebelumnya'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={activeStepIndex === totalSteps - 1}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95"
              style={{ backgroundColor: themeColors.primary }}
            >
              <span>{isEN ? 'Next Step' : 'Langkah Selanjutnya'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
