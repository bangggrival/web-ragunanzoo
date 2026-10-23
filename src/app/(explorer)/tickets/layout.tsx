import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarif Masuk & Simulasi Tiket',
  description: 'Informasi resmi tarif retribusi, kalkulator estimasi biaya kunjungan, panduan saldo kartu JakCard Bank DKI, dan simulasi tata cara masuk Taman Margasatwa Ragunan.',
  openGraph: {
    title: 'Tarif Masuk & Simulasi Tiket | Taman Margasatwa Ragunan',
    description: 'Kalkulator estimasi biaya kunjungan, panduan saldo JakCard, tarif resmi wahana, dan simulasi tata cara masuk Ragunan Zoo.',
  },
};

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

