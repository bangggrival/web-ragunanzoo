import { 
  PawPrint, 
  Bird, 
  Fish, 
  Bug, 
  Leaf, 
  TreeDeciduous, 
  Flower2, 
  Sprout, 
  Footprints, 
  Sun, 
  Layers, 
  Cat,
  type LucideProps
} from 'lucide-react';
import React from 'react';
import { ReptileIcon, PrimateIcon } from './icons';
import { getCategoryIcon } from '@/utils/animalIcons';
import { cn } from '@/lib/utils';

const LUCIDE_MAP: Record<string, React.ComponentType<LucideProps>> = {
  PawPrint,
  Bird,
  Fish,
  Bug,
  Leaf,
  TreeDeciduous,
  Flower2,
  Sprout,
  Footprints,
  Sun,
  Layers,
  Cat,
  ReptileIcon,
  Reptil: ReptileIcon,
  PrimateIcon,
  Primata: PrimateIcon,
};

interface CategoryIconProps extends LucideProps {
  icon?: string | null;
  categoryName?: string | null;
  type?: 'fauna' | 'flora';
}

/**
 * CategoryIcon
 * Komponen resmi untuk menampilkan ikon kategori dengan Gaya Duotone / Two-Tone Nature Ragunan:
 * - Kategori Fauna: mamalia.svg, primata.svg, burung.svg, reptil.svg, ikan.svg, amfibi.svg, serangga.svg, dll.
 * - Kategori Flora: pohon.svg, bunga.svg, anggrek.svg, tanaman-langka.svg, tanaman-karnivora.svg, bambu.svg, kaktus.svg, dll.
 */
export default function CategoryIcon({ icon, categoryName = '', type, className, ...props }: CategoryIconProps) {
  // 1. Cari Duotone Icon Meta berdasarkan nama kategori atau icon string / emoji
  const categoryMeta = getCategoryIcon(categoryName || icon, type) || getCategoryIcon(icon, type);

  if (categoryMeta) {
    return (
      <img
        src={categoryMeta.svgPath}
        alt={categoryName || categoryMeta.nameId}
        className={cn('w-full h-full object-contain select-none transition-transform duration-300', className)}
        loading="lazy"
        draggable={false}
      />
    );
  }

  // 2. Jika ikon cocok dengan Lucide Map eksplisit
  if (icon && LUCIDE_MAP[icon]) {
    const IconComponent = LUCIDE_MAP[icon];
    return <IconComponent className={className} {...props} />;
  }

  // 3. Fallback duotone default berdasarkan tipe
  const fallbackSvg = type === 'flora' ? '/icons/categories/pohon.svg' : '/icons/categories/mamalia.svg';
  return (
    <img
      src={fallbackSvg}
      alt={categoryName || (type === 'flora' ? 'Flora' : 'Fauna')}
      className={cn('w-full h-full object-contain select-none', className)}
      loading="lazy"
      draggable={false}
    />
  );
}
