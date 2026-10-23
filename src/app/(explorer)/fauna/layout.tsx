import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Koleksi Satwa (Fauna)',
  description: 'Jelajahi ensiklopedia dan informasi lengkap koleksi satwa di Taman Margasatwa Ragunan, mulai dari mamalia, reptil, burung, primata, hingga satwa endemik Indonesia.',
  openGraph: {
    title: 'Koleksi Satwa (Fauna) | Taman Margasatwa Ragunan',
    description: 'Eksplorasi ragam satwa mamalia, reptil, burung, dan primata di Ragunan Zoo Jakarta.',
  },
};

export default function FaunaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
