"use client";
import dynamic from 'next/dynamic';

const Gallery3DClient = dynamic(() => import('./Gallery3DClient'), {
  ssr: false,
});

export default function Gallery3DPage() {
  return <Gallery3DClient />;
}
