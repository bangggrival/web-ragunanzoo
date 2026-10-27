'use client';

import React from 'react';
import Link from 'next/link';
import { AppIcon } from './AppIcon';
import { cn } from '@/lib/utils';
import BackButton from './BackButton';

export type AtmosphericTheme = 'fauna' | 'flora' | 'events' | 'map' | 'tickets' | 'library' | 'default';

export interface AtmosphericStat {
  icon: React.ReactNode;
  label: string;
}

export interface AtmosphericBreadcrumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface AtmosphericHeaderProps {
  /** Ikon utama pada badge judul */
  icon?: React.ReactNode;
  /** Judul utama halaman (akan dirender sebagai <h1>) */
  title: string;
  /** Deskripsi pendukung */
  description?: string | null;
  /** Pilihan tema gradien alam */
  theme?: AtmosphericTheme;
  /** Daftar jejak breadcrumb */
  breadcrumbs?: AtmosphericBreadcrumb[];
  /** Chip statistik ringkas (misal: 74 Spesies, 5 Kategori) */
  stats?: AtmosphericStat[];
  /** Konten aksi di sisi kanan (misal: tombol kuis, tombol unduh) */
  rightContent?: React.ReactNode;
  /** Konten tambahan di bawah judul */
  children?: React.ReactNode;
  /** Tombol kembali opsional */
  backPath?: string;
  backLabel?: string;
  className?: string;
}

const THEME_STYLES: Record<
  AtmosphericTheme,
  {
    bgGradient: string;
    glow1: string;
    glow2: string;
    accentPill: string;
  }
> = {
  fauna: {
    bgGradient: 'bg-gradient-to-br from-emerald-950 via-[#06281f] to-slate-950',
    glow1: 'bg-emerald-500/20',
    glow2: 'bg-teal-400/15',
    accentPill: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100',
  },
  flora: {
    bgGradient: 'bg-gradient-to-br from-[#0c2618] via-[#1c2212] to-slate-950',
    glow1: 'bg-lime-500/15',
    glow2: 'bg-amber-500/12',
    accentPill: 'bg-lime-500/15 border-lime-400/30 text-lime-100',
  },
  events: {
    bgGradient: 'bg-gradient-to-br from-[#241a08] via-[#10291d] to-slate-950',
    glow1: 'bg-amber-500/20',
    glow2: 'bg-emerald-400/15',
    accentPill: 'bg-amber-500/15 border-amber-400/30 text-amber-100',
  },
  map: {
    bgGradient: 'bg-gradient-to-br from-[#04202c] via-[#082928] to-slate-950',
    glow1: 'bg-cyan-500/20',
    glow2: 'bg-teal-400/15',
    accentPill: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-100',
  },
  tickets: {
    bgGradient: 'bg-gradient-to-br from-[#1a1c0d] via-[#0b291d] to-slate-950',
    glow1: 'bg-amber-500/20',
    glow2: 'bg-emerald-500/15',
    accentPill: 'bg-amber-500/15 border-amber-400/30 text-amber-100',
  },
  library: {
    bgGradient: 'bg-gradient-to-br from-[#141d2f] via-[#0d2724] to-slate-950',
    glow1: 'bg-indigo-500/20',
    glow2: 'bg-teal-400/15',
    accentPill: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-100',
  },
  default: {
    bgGradient: 'bg-gradient-to-br from-emerald-950 via-[#0a2720] to-slate-950',
    glow1: 'bg-emerald-500/20',
    glow2: 'bg-teal-400/15',
    accentPill: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100',
  },
};

export default function AtmosphericHeader({
  icon,
  title,
  description,
  theme = 'default',
  breadcrumbs,
  stats,
  rightContent,
  children,
  backPath,
  backLabel,
  className,
}: AtmosphericHeaderProps) {
  const currentTheme = THEME_STYLES[theme] || THEME_STYLES.default;

  return (
    <section
      className={cn(
        'relative overflow-hidden text-white py-8 md:py-12 border-b border-white/10 shadow-lg',
        currentTheme.bgGradient,
        className
      )}
    >
      {/* Ambient Radial Glow Elements */}
      <div
        className={cn(
          'absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700',
          currentTheme.glow1
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute -bottom-28 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700',
          currentTheme.glow2
        )}
        aria-hidden="true"
      />

      {/* Topographic Contour Lines SVG Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-screen"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='360' height='360' viewBox='0 0 360 360' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,180 C90,120 180,240 270,180 C315,150 345,165 360,180 M0,90 C120,40 210,130 360,90 M0,270 C100,310 200,230 360,270 M0,45 C150,15 240,75 360,45 M0,315 C120,345 220,285 360,315 M0,225 C80,260 170,190 260,225 C310,245 340,235 360,225 M0,135 C70,105 160,165 250,135 C300,118 335,128 360,135' stroke='%23ffffff' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '240px 240px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Back Button Row (if provided) */}
        {backPath && (
          <div className="mb-4">
            <BackButton fallbackPath={backPath} label={backLabel} variant="header" />
          </div>
        )}

        {/* Breadcrumb row */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/70 mb-3.5 flex-wrap">
            {breadcrumbs.map((bc, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <AppIcon name="solar:alt-arrow-right-linear" className="w-3 h-3 text-white/40 flex-shrink-0" />}
                  {bc.href && !isLast ? (
                    <Link
                      href={bc.href}
                      className="inline-flex items-center gap-1 hover:text-white transition-colors duration-200"
                    >
                      {bc.icon}
                      <span>{bc.label}</span>
                    </Link>
                  ) : (
                    <span className={cn('inline-flex items-center gap-1', isLast ? 'text-white font-semibold' : '')}>
                      {bc.icon}
                      <span>{bc.label}</span>
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Main Content Row: Left Info & Right Action */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 md:gap-3.5 mb-2.5">
              {icon && (
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner text-white">
                  {icon}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                {title}
              </h1>
            </div>

            {description && (
              <p className="text-white/80 font-normal text-sm md:text-base leading-relaxed max-w-xl pl-0.5">
                {description}
              </p>
            )}

            {/* Metric Chips / Stats */}
            {stats && stats.length > 0 && (
              <div className="flex items-center flex-wrap gap-2 mt-4 pt-1">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-medium shadow-2xs hover:bg-white/15 transition-all"
                  >
                    <span className="text-white/80">{stat.icon}</span>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Content Widget Slot */}
          {rightContent && (
            <div className="flex-shrink-0 w-full md:w-auto">
              {rightContent}
            </div>
          )}
        </div>

        {/* Supplementary Children Slot */}
        {children && <div className="mt-6 pt-2">{children}</div>}
      </div>
    </section>
  );
}
