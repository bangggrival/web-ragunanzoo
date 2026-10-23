"use client";

import { useLanguage } from '@/contexts/LanguageContext';

export default function SkipLinks() {
  const { language } = useLanguage();

  const links = [
    {
      href: '#main-content',
      label: language === 'en' ? 'Skip to main content' : 'Langsung ke konten utama',
    },
    {
      href: '#main-navigation',
      label: language === 'en' ? 'Skip to navigation' : 'Langsung ke navigasi',
    },
  ];

  return (
    <div className="skip-links">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          suppressHydrationWarning
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/50 font-medium text-sm transition-all"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
