"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface BackButtonProps {
  fallbackPath?: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'link' | 'overlay' | 'header';
}

export default function BackButton({
  fallbackPath = '/',
  label,
  className,
  variant = 'ghost'
}: BackButtonProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  };

  const displayLabel = label ?? t('back');

  // Overlay variant — for use on images/hero
  if (variant === 'overlay') {
    return (
      <button
        onClick={handleBack}
        className={cn(
          "flex items-center gap-2 bg-white/40 dark:bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full hover:bg-white/50 transition-colors",
          className
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        {displayLabel}
      </button>
    );
  }

  // Header variant — for use inside gradient page headers (white text)
  if (variant === 'header') {
    return (
      <button
        onClick={handleBack}
        className={cn(
          "inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors group",
          className
        )}
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        {displayLabel}
      </button>
    );
  }

  return (
    <Button
      variant={variant === 'default' ? 'default' : variant}
      size="sm"
      onClick={handleBack}
      className={cn("-ml-2", className)}
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      {displayLabel}
    </Button>
  );
}
