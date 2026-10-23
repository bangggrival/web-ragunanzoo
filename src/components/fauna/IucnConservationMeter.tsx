'use client';

import React, { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, Info, HelpCircle, Leaf } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface IucnConservationMeterProps {
  statusText?: string | null;
  animalName?: string;
  className?: string;
  compact?: boolean;
}

interface IucnCategory {
  code: string;
  labelId: string;
  labelEn: string;
  descriptionId: string;
  descriptionEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const IUCN_CATEGORIES: IucnCategory[] = [
  {
    code: 'LC',
    labelId: 'Risiko Rendah',
    labelEn: 'Least Concern',
    descriptionId: 'Populasi satwa masih melimpah dan stabil di alam liar.',
    descriptionEn: 'Species has a widespread and abundant population in the wild.',
    color: '#10b981',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    code: 'NT',
    labelId: 'Mendekati Terancam',
    labelEn: 'Near Threatened',
    descriptionId: 'Mungkin terancam punah dalam waktu dekat jika habitat tidak dijaga.',
    descriptionEn: 'Likely to qualify for a threatened category in the near future.',
    color: '#84cc16',
    bgColor: 'bg-lime-500/15',
    borderColor: 'border-lime-500/40',
    textColor: 'text-lime-700 dark:text-lime-300',
  },
  {
    code: 'VU',
    labelId: 'Rentan',
    labelEn: 'Vulnerable',
    descriptionId: 'Menghadapi risiko kepunahan di alam liar dalam jangka menengah.',
    descriptionEn: 'Facing a high risk of endangerment in the medium term.',
    color: '#f59e0b',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
  {
    code: 'EN',
    labelId: 'Terancam',
    labelEn: 'Endangered',
    descriptionId: 'Menghadapi risiko kepunahan sangat tinggi di alam liar dalam waktu dekat.',
    descriptionEn: 'Facing a very high risk of extinction in the wild.',
    color: '#f97316',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
  {
    code: 'CR',
    labelId: 'Kritis',
    labelEn: 'Critically Endangered',
    descriptionId: 'Berada pada risiko kepunahan ekstrim dalam waktu sangat dekat.',
    descriptionEn: 'Facing an extremely high risk of extinction in the immediate wild.',
    color: '#ef4444',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/40',
    textColor: 'text-rose-700 dark:text-rose-300',
  },
  {
    code: 'EW',
    labelId: 'Punah di Alam',
    labelEn: 'Extinct in Wild',
    descriptionId: 'Hanya bertahan hidup di penangkaran, kebun binatang, atau budidaya.',
    descriptionEn: 'Known only to survive in captivity, ex-situ or cultivated.',
    color: '#8b5cf6',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  {
    code: 'EX',
    labelId: 'Punah',
    labelEn: 'Extinct',
    descriptionId: 'Tidak ada lagi individu yang masih hidup di seluruh dunia.',
    descriptionEn: 'No reasonable doubt that the last individual has died.',
    color: '#475569',
    bgColor: 'bg-slate-500/15',
    borderColor: 'border-slate-500/40',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
];

export default function IucnConservationMeter({
  statusText,
  animalName,
  className = '',
  compact = false,
}: IucnConservationMeterProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Deteksi kategori berdasarkan text status satwa
  const activeCategoryIndex = useMemo(() => {
    if (!statusText) return 0;
    const lower = statusText.toLowerCase();

    if (lower.includes('kritis') || lower.includes('cr') || lower.includes('critically')) return 4;
    if (lower.includes('terancam') || lower.includes('en') || lower.includes('endangered')) return 3;
    if (lower.includes('rentan') || lower.includes('vu') || lower.includes('vulnerable')) return 2;
    if (lower.includes('mendekati') || lower.includes('nt') || lower.includes('near')) return 1;
    if (lower.includes('alam') || lower.includes('ew')) return 5;
    if (lower.includes('punah') && !lower.includes('terancam')) return 6;
    if (lower.includes('aman') || lower.includes('dilindungi') || lower.includes('lc') || lower.includes('least')) return 0;

    return 2; // Default rentan bila ada status namun tidak spesifik
  }, [statusText]);

  const currentCategory = IUCN_CATEGORIES[activeCategoryIndex];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs backdrop-blur-md ${currentCategory.bgColor} ${currentCategory.borderColor} ${currentCategory.textColor} ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-extrabold">{currentCategory.code}</span>
        <span className="opacity-80">·</span>
        <span>{isEn ? currentCategory.labelEn : currentCategory.labelId}</span>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: currentCategory.color }}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              {isEn ? 'IUCN Conservation Status' : 'Status Konservasi IUCN'}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isEn ? 'Global Red List Classification' : 'Klasifikasi Perlindungan Satwa Dunia'}
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-extrabold border ${currentCategory.bgColor} ${currentCategory.borderColor} ${currentCategory.textColor} flex items-center gap-1.5`}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentCategory.color }} />
          <span>{currentCategory.code} - {isEn ? currentCategory.labelEn : currentCategory.labelId}</span>
        </div>
      </div>

      {/* Meter Visual Spectrum Track */}
      <div className="my-3">
        <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
          {IUCN_CATEGORIES.map((cat, idx) => {
            const isSelected = idx === activeCategoryIndex;
            return (
              <div
                key={cat.code}
                className="h-full flex-1 relative transition-all duration-300"
                style={{
                  backgroundColor: cat.color,
                  opacity: isSelected ? 1 : 0.35,
                  filter: isSelected ? 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Labels below the track */}
        <div className="grid grid-cols-7 gap-1 mt-2 text-center">
          {IUCN_CATEGORIES.map((cat, idx) => {
            const isSelected = idx === activeCategoryIndex;
            return (
              <div
                key={cat.code}
                className={`flex flex-col items-center transition-all ${
                  isSelected ? 'scale-110 -translate-y-0.5' : 'opacity-60'
                }`}
              >
                <span
                  className={`text-[10px] sm:text-xs font-black tracking-wider ${
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                  style={{ color: isSelected ? cat.color : undefined }}
                >
                  {cat.code}
                </span>
                <span className="hidden sm:inline-block text-[9px] text-muted-foreground truncate max-w-[50px]">
                  {isEn ? cat.labelEn.split(' ')[0] : cat.labelId.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Education & Description Box */}
      <div className={`mt-2 p-3 rounded-2xl border ${currentCategory.bgColor} ${currentCategory.borderColor} flex items-start gap-2.5`}>
        <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentCategory.textColor}`} />
        <div className="text-xs leading-relaxed">
          <p className={`font-semibold ${currentCategory.textColor}`}>
            {isEn ? currentCategory.labelEn : currentCategory.labelId}:{' '}
            <span className="font-normal text-foreground/90">
              {isEn ? currentCategory.descriptionEn : currentCategory.descriptionId}
            </span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Leaf className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isEn
                ? 'Protected in Taman Margasatwa Ragunan under Indonesian Conservation Law (UU No. 5/1990)'
                : 'Dilindungi dan dikonservasi di Ragunan Zoo berdasarkan UU No. 5/1990 & CITES'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
