import "@/index.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import DynamicFavicon from "@/components/DynamicFavicon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragunanzoo.jakarta.go.id';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta",
    template: "%s | Taman Margasatwa Ragunan",
  },
  description: "Aplikasi Terpadu Taman Margasatwa Ragunan - Informasi Lengkap Satwa, Flora, Tiket Online, Peta Interaktif, & Layanan Publik",
  keywords: [
    "Ragunan Zoo",
    "Taman Margasatwa Ragunan",
    "Kebun Binatang Jakarta",
    "Tiket Ragunan",
    "Peta Ragunan",
    "Satwa Ragunan",
    "Wisata Edukasi Jakarta",
  ],
  authors: [{ name: "Taman Margasatwa Ragunan DKI Jakarta" }],
  creator: "UPTD Taman Margasatwa Ragunan",
  publisher: "Dinas Pertamanan dan Hutan Kota DKI Jakarta",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/api/favicon', sizes: 'any', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/api/favicon',
    apple: [
      { url: '/api/favicon', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteUrl,
    siteName: 'Taman Margasatwa Ragunan',
    title: 'Taman Margasatwa Ragunan - Kebun Binatang Resmi DKI Jakarta',
    description: 'Eksplorasi satwa, flora, peta digital interaktif, pembelian tiket, dan layanan terpadu Ragunan Zoo Jakarta.',
    images: [
      {
        url: '/api/favicon',
        width: 512,
        height: 512,
        alt: 'Logo Taman Margasatwa Ragunan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taman Margasatwa Ragunan Jakarta',
    description: 'Eksplorasi satwa, flora, peta digital interaktif, dan tiket online Ragunan Zoo.',
    images: ['/api/favicon'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/api/favicon" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/api/favicon" type="image/png" />
        <link rel="apple-touch-icon" href="/api/favicon" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <DynamicFavicon />
          {children}
        </Providers>
      </body>
    </html>
  );
}
