import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perpustakaan Digital Satwa',
  description: 'Koleksi buku digital, materi edukasi konservasi satwa, dan literasi lingkungan resmi Taman Margasatwa Ragunan.',
  openGraph: {
    title: 'Perpustakaan Digital Satwa | Taman Margasatwa Ragunan',
    description: 'Membaca dan unduh buku digital edukasi satwa serta konservasi lingkungan Ragunan Zoo.',
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
