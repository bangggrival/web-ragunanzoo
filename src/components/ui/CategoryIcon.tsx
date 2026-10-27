"use client";

import React, { memo } from 'react';
import { getCategoryIcon } from '@/utils/animalIcons';
import { AppIcon, type AppIconProps } from './AppIcon';
import { cn } from '@/lib/utils';

export interface CategoryIconProps extends AppIconProps {
  icon?: string | null;
  categoryName?: string | null;
  type?: 'fauna' | 'flora';
}

/**
 * CategoryIcon
 * Komponen terpadu Ragunan Zoo untuk menampilkan ikon kategori & satwa/flora:
 * 1. Menggunakan Iconify (Fluent Emoji Flat / Solar / Lucide) untuk tampilan natural, modern, dan beresolusi tinggi.
 * 2. Mendukung aset SVG vektor khusus dari Tim Desain Internal (contoh: Komodo Dragon, Kasuari, Rafflesia).
 * 3. Menerjemahkan otomatis emoji lama dari database (🦁, 🦎, 🦅, dll.) ke Iconify.
 * 4. Resilient, zero-runtime error, dan aman dari XSS.
 */
export const CategoryIcon = memo(function CategoryIcon({
  icon,
  categoryName = '',
  type,
  className,
  ...props
}: CategoryIconProps) {
  // 1. Cek apakah icon adalah Iconify string eksplisit (e.g. "fluent-emoji-flat:lion", "solar:paw-bold")
  if (icon && icon.includes(':')) {
    return (
      <AppIcon
        icon={icon}
        className={cn('w-full h-full object-contain select-none transition-transform duration-300', className)}
        {...props}
      />
    );
  }

  // 2. Cari metadata kategori berdasarkan nama kategori, query, atau emoji icon
  const categoryMeta = getCategoryIcon(categoryName || icon, type) || getCategoryIcon(icon, type);

  if (categoryMeta) {
    // Jika merupakan satwa khusus dengan aset SVG kustom tim desain internal (e.g. Komodo)
    if (categoryMeta.isCustomDesign && categoryMeta.svgPath) {
      return (
        <img
          src={categoryMeta.svgPath}
          alt={categoryName || categoryMeta.nameId}
          className={cn('w-full h-full object-contain select-none transition-transform duration-300', className)}
          loading="lazy"
          draggable={false}
          style={props.style}
          title={props.title}
          id={props.id}
          onClick={props.onClick}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
      );
    }

    // Default: Gunakan Iconify Icon resmi dari metadata
    return (
      <AppIcon
        icon={categoryMeta.iconifyIcon}
        className={cn('w-full h-full object-contain select-none transition-transform duration-300', className)}
        fallback={
          <img
            src={categoryMeta.svgPath}
            alt={categoryName || categoryMeta.nameId}
            className={cn('w-full h-full object-contain select-none', className)}
            loading="lazy"
            draggable={false}
          />
        }
        {...props}
      />
    );
  }

  // 3. Jika diberikan icon string (emoji atau Lucide name)
  if (icon) {
    return (
      <AppIcon
        icon={icon}
        className={cn('w-full h-full object-contain select-none transition-transform duration-300', className)}
        {...props}
      />
    );
  }

  // 4. Fallback default Iconify berdasarkan tipe kategori (Flora / Fauna)
  const defaultIconify = type === 'flora' ? 'fluent-emoji-flat:deciduous-tree' : 'fluent-emoji-flat:lion';
  return (
    <AppIcon
      icon={defaultIconify}
      className={cn('w-full h-full object-contain select-none', className)}
      {...props}
    />
  );
});

export default CategoryIcon;
