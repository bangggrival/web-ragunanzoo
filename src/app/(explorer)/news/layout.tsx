import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Berita & Artikel | Ragunan Zoo',
  description: 'Dapatkan informasi terbaru, berita, dan artikel edukasi seputar satwa dan kegiatan di Taman Margasatwa Ragunan.',
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
