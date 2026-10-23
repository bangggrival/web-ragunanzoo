import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Koleksi Flora & Tumbuhan',
  description: 'Informasi ragam pohon peneduh, tanaman hias, dan flora langka yang dilestarikan di kawasan hutan kota Taman Margasatwa Ragunan.',
  openGraph: {
    title: 'Koleksi Flora & Tumbuhan | Taman Margasatwa Ragunan',
    description: 'Jelajahi keanekaragaman tanaman, bunga, dan pohon peneduh di hutan kota Ragunan Zoo Jakarta.',
  },
};

export default function FloraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
