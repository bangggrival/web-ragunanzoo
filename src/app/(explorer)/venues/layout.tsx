import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sewa Tempat & Venue Acara',
  description: 'Informasi penyewaan area terbuka, aula, dan venue acara untuk gathering, syuting, resepsi, atau kegiatan komunitas di Taman Margasatwa Ragunan.',
  openGraph: {
    title: 'Sewa Tempat & Venue Acara | Taman Margasatwa Ragunan',
    description: 'Pilihan sewa area hijau, panggung, dan venue acara resmi di Ragunan Zoo Jakarta.',
  },
};

export default function VenuesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
