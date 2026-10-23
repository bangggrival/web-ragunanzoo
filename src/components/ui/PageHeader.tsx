"use client";

import React from 'react';
import Link from 'next/link';
import BackButton from './BackButton';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Icon component atau emoji */
  icon?: React.ReactNode;
  /** Judul halaman */
  title: string;
  /** Deskripsi opsional di bawah judul */
  description?: string;
  /** Path fallback tombol kembali */
  backPath?: string;
  /** Label tombol kembali (default: i18n 'back') */
  backLabel?: string;
  /** Konten tambahan di kanan (misal badge jumlah) */
  rightContent?: React.ReactNode;
  /** Extra children di bawah judul */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Komponen header halaman yang seragam di seluruh site.
 * Menggunakan gaya Atmospheric Nature Gradient yang kaya estetika dan modern.
 */
export default function PageHeader({
  icon,
  title,
  description,
  backPath,
  backLabel,
  rightContent,
  children,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-emerald-950 via-[#0a2720] to-slate-950 text-white py-7 md:py-10 border-b border-white/10 shadow-md",
        className
      )}
    >
      {/* Subtle ambient glows */}
      <div 
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Topographic Contour Lines SVG Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-screen"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='360' height='360' viewBox='0 0 360 360' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,180 C90,120 180,240 270,180 C315,150 345,165 360,180 M0,90 C120,40 210,130 360,90 M0,270 C100,310 200,230 360,270 M0,45 C150,15 240,75 360,45 M0,315 C120,345 220,285 360,315 M0,225 C80,260 170,190 260,225 C310,245 340,235 360,225 M0,135 C70,105 160,165 250,135 C300,118 335,128 360,135' stroke='%23ffffff' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '240px 240px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Back button row */}
        {backPath && (
          <div className="mb-3.5">
            <BackButton
              fallbackPath={backPath}
              label={backLabel}
              variant="header"
            />
          </div>
        )}

        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-3.5">
            {icon && (
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner text-white">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-white/80 text-xs sm:text-sm md:text-base mt-0.5 max-w-2xl font-normal leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
          {rightContent && (
            <div className="flex-shrink-0">{rightContent}</div>
          )}
        </div>

        {/* Optional extra content */}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </section>
  );
}

