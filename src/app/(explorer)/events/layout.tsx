import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jadwal Acara & Atraksi Satwa',
  description: 'Temukan agenda kegiatan seru di Taman Margasatwa Ragunan: jadwal feeding time satwa, pertunjukan edukasi, dan program akhir pekan keluarga.',
  openGraph: {
    title: 'Jadwal Acara & Atraksi Satwa | Taman Margasatwa Ragunan',
    description: 'Jadwal lengkap feeding time satwa, atraksi edukasi, dan acara menarik di Ragunan Zoo.',
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
