import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peta Interaktif & Zona Kebun Binatang',
  description: 'Peta interaktif digital Taman Margasatwa Ragunan: temukan lokasi kandang satwa, toilet, musala, halte kereta wisata, dan pintu masuk utama.',
  openGraph: {
    title: 'Peta Interaktif & Zona Kebun Binatang | Taman Margasatwa Ragunan',
    description: 'Jelajahi peta interaktif digital Ragunan Zoo dengan navigasi zona dan fasilitas umum.',
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
