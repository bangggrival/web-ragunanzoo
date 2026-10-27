import React from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import LazyImage from '@/components/ui/LazyImage';
import { cn } from '@/lib/utils';

export interface ModernMediaCardProps {
  href?: string;
  onClick?: () => void;
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  description?: string;
  badgeText?: string;
  badgeVariant?: 'primary' | 'emerald' | 'amber' | 'rose' | 'neutral';
  badgeTopLeft?: React.ReactNode;
  badgeTopRight?: React.ReactNode;
  metaLabel?: string;
  metaIcon?: React.ReactNode;
  metaRight?: React.ReactNode;
  tags?: string[];
  isFeatured?: boolean | null;
  quickAudioAction?: React.ReactNode;
  aspectRatio?: 'standard' | 'video' | 'portrait' | 'square' | 'wide';
  actionText?: string | null;
  actionIcon?: React.ReactNode;
  showActionRow?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * ModernMediaCard
 * Desain kartu standar editorial modern (National Geographic / Apple HIG style):
 * - Micro-border tipis & ambient shadow berjenjang yang lembut (bebas glow neon norak).
 * - Efek zoom gambar sinematik (cubic-bezier 0.16, 1, 0.3, 1).
 * - Badge floating dengan frosted glass halus (backdrop-blur-md).
 * - Action indicator mikro panah yang berotasi halus saat di-hover.
 * - Fleksibel: dapat menjadi Link atau div interaktif dengan onClick.
 */
export default function ModernMediaCard({
  href,
  onClick,
  imageSrc,
  imageAlt,
  title,
  subtitle,
  description,
  badgeText,
  badgeVariant = 'emerald',
  badgeTopLeft,
  badgeTopRight,
  metaLabel,
  metaIcon,
  metaRight,
  tags,
  isFeatured = false,
  quickAudioAction,
  aspectRatio = 'standard',
  actionText = 'Lihat Detail',
  actionIcon,
  showActionRow = true,
  className,
  children,
}: ModernMediaCardProps) {
  const aspectClass = {
    standard: 'aspect-[4/3]',
    video: 'aspect-[16/10]',
    wide: 'aspect-[16/9]',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  }[aspectRatio];

  const badgeStyles = {
    emerald: 'bg-emerald-500/90 text-white border-emerald-400/30',
    primary: 'bg-primary/90 text-white border-primary-foreground/20',
    amber: 'bg-amber-500/90 text-white border-amber-400/30',
    rose: 'bg-rose-500/90 text-white border-rose-400/30',
    neutral: 'bg-slate-900/80 text-white border-white/20',
  }[badgeVariant];

  const cardClasses = cn(
    'group relative flex flex-col rounded-2xl md:rounded-3xl overflow-hidden',
    'bg-card border border-border/70 hover:border-primary/40',
    'shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_1px_3px_0_rgba(0,0,0,0.03)]',
    'hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)]',
    'transition-all duration-500 ease-spring hover:-translate-y-1',
    href || onClick ? 'cursor-pointer' : 'cursor-default',
    className
  );

  const cardContent = (
    <>
      {/* ── Visual Media Container ── */}
      <div className={cn('relative w-full overflow-hidden bg-muted/60', aspectClass)}>
        <LazyImage
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.05]"
          wrapperClassName="w-full h-full"
        />

        {/* Ambient Gradient Scrim (Natural contrast, avoids muddy solid blocks) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

        {/* Top Floating Meta Elements */}
        <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between gap-2 z-10 pointer-events-auto min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {badgeTopLeft ? (
              badgeTopLeft
            ) : badgeText ? (
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide backdrop-blur-md border shadow-sm pointer-events-none min-w-0 max-w-[130px] sm:max-w-[160px]',
                  badgeStyles
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                <span className="truncate">{badgeText}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
            {quickAudioAction}
            {badgeTopRight ? (
              badgeTopRight
            ) : isFeatured ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold tracking-wider uppercase shadow-md backdrop-blur-md pointer-events-none shrink-0">
                <AppIcon icon="solar:magic-stick-3-bold-duotone" className="w-3 h-3 text-amber-900 shrink-0" />
                <span>Ikonik</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Floating Meta (Location or Zone Pill) */}
        {(metaLabel || metaRight) && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3.5 sm:right-3.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
            {metaLabel ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md text-white/95 text-[11px] font-medium border border-white/15 shadow-sm">
                {metaIcon || <AppIcon icon="solar:map-point-bold-duotone" className="w-3 h-3 text-primary-foreground/90" />}
                <span className="truncate max-w-[160px] sm:max-w-[200px]">{metaLabel}</span>
              </div>
            ) : <div />}

            {metaRight && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md text-white/95 text-[11px] font-medium border border-white/15 shadow-sm">
                {metaRight}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Content Details Container ── */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4 justify-between bg-card">
        <div>
          {/* Subtitle / Category Tracking */}
          {subtitle && (
            <p className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-primary/90 mb-1 line-clamp-1">
              {subtitle}
            </p>
          )}

          {/* Primary Title */}
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 leading-snug">
            {title}
          </h3>

          {/* Short Excerpt/Description */}
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
              {description}
            </p>
          )}

          {/* Optional Tag Pills */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground border border-border/50"
                >
                  <AppIcon name="solar:tag-linear" className="w-2.5 h-2.5 text-muted-foreground/70" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {children}
        </div>

        {/* ── Footer Interaction Row ── */}
        {showActionRow && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs text-muted-foreground">
            <span className="text-[11px] font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">
              {actionText || 'Lihat Detail'}
            </span>

            {/* Micro Action Button Circle */}
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-muted/80 group-hover:bg-primary text-muted-foreground group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-110 group-hover:translate-x-0.5">
              {actionIcon || <AppIcon name="solar:arrow-right-up-linear" className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />}
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (href && href !== '#') {
    return (
      <Link href={href} className={cardClasses} onClick={onClick}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      {cardContent}
    </div>
  );
}
