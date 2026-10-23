"use client";

import React, { useLayoutEffect, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronUp, ChevronRight, Link as LinkIcon, ExternalLink, X } from 'lucide-react';
import { type NavbarItem } from '@/hooks/useNavbarItems';
import { allIcons } from '@/components/ui/IconPicker';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface BottomNavProps {
  items: NavbarItem[];
  isActive: (path: string) => boolean;
  getLabel: (item: { label_id: string; label_en: string | null }) => string;
  getPath: (item: { path: string; path_en?: string | null }) => string;
  getExternalUrl: (item: { path: string; path_en?: string | null }) => string | null;
}

export default function BottomNav({ 
  items, 
  isActive, 
  getLabel, 
  getPath, 
  getExternalUrl 
}: BottomNavProps) {
  const pathname = usePathname();
  const [activeSheetItem, setActiveSheetItem] = useState<NavbarItem | null>(null);
  const { isVisible: isScrollVisible } = useScrollDirection();

  // Close sheet when route changes
  useLayoutEffect(() => {
    setActiveSheetItem(null);
  }, [pathname]);

  // Lock body scroll when bottom sheet is open
  useEffect(() => {
    if (!activeSheetItem) return;
    const origBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origBody;
    };
  }, [activeSheetItem]);

  if (items.length === 0) return null;

  // Limit to max 5 items for bottom nav
  const displayItems = items.slice(0, 5);

  const getShortLabel = (item: NavbarItem) => {
    const full = getLabel(item);
    if (full.toLowerCase().startsWith('layanan')) return 'Layanan';
    if (full.toLowerCase().startsWith('public service')) return 'Services';
    if (full.length > 10 && full.includes(' ')) {
      return full.split(' ')[0];
    }
    return full;
  };
  
  return (
    <>
      {/* Bottom Sheet Drawer Modal */}
      {activeSheetItem && (
        <div 
          className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={getLabel(activeSheetItem)}
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
            onClick={() => setActiveSheetItem(null)}
          />

          {/* Drawer Sheet */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[480px] mx-auto bg-card dark:bg-[#0A120E] text-card-foreground dark:text-slate-100 rounded-t-[28px] shadow-2xl border-t border-border/80 flex flex-col max-h-[82dvh] animate-in slide-in-from-bottom-full duration-200 ease-out overflow-hidden"
          >
            {/* Header & Tabs Section (Always fixed at top, never shrinks) */}
            <div className="flex-shrink-0 px-4 pt-3.5 pb-2">
              {/* Drag Handle Bar */}
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-3" />

              {/* Title Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/70">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    {React.createElement(allIcons[activeSheetItem.icon] || LinkIcon, { className: "w-4.5 h-4.5" })}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground leading-tight truncate">
                      {getLabel(activeSheetItem)}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">Pilih menu navigasi di bawah</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSheetItem(null)}
                  className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors active:scale-95 flex-shrink-0 ml-2"
                  aria-label="Tutup menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dropdown Tab Switcher - Allows instant switching between Jelajah, Fasilitas, Informasi */}
              <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar">
                {displayItems
                  .filter((item) => item.is_dropdown && item.children && item.children.length > 0)
                  .map((tab) => {
                    const isCurrent = activeSheetItem.id === tab.id;
                    const TabIcon = allIcons[tab.icon] || LinkIcon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSheetItem(tab)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap active:scale-95 ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                        }`}
                      >
                        <TabIcon className="w-3.5 h-3.5" />
                        <span>{getShortLabel(tab)}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-muted-foreground/15 text-muted-foreground'
                        }`}>
                          {tab.children?.length || 0}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Menu List - Fluid flex-1 min-h-0 with dedicated overflow-y-auto and touch pan */}
            <div 
              className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-4 pt-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col gap-2"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }}
            >
              {activeSheetItem.children?.map((child) => {
                const childExternalUrl = getExternalUrl(child);
                const ChildIcon = allIcons[child.icon] || LinkIcon;
                const childActive = isActive(child.path) && !childExternalUrl;
                const childLabel = getLabel(child);

                const itemClass = `flex items-center justify-between py-2.5 px-3.5 rounded-2xl border transition-all active:scale-[0.99] flex-shrink-0 ${
                  childActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                    : 'bg-muted/30 hover:bg-primary/10 text-foreground border-border/70 hover:border-primary/30'
                }`;

                if (childExternalUrl) {
                  return (
                    <a
                      key={child.id}
                      href={childExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setActiveSheetItem(null)}
                      className={itemClass}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 border ${
                          childActive
                            ? 'bg-white/20 text-white border-white/20'
                            : 'bg-background text-primary border-border/60 shadow-2xs'
                        }`}>
                          <ChildIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold truncate">{childLabel}</span>
                      </div>
                      <ExternalLink className={`w-4 h-4 shrink-0 ml-2 ${childActive ? 'text-white' : 'text-muted-foreground'}`} />
                    </a>
                  );
                }

                return (
                  <Link
                    key={child.id}
                    href={getPath(child)}
                    onClick={() => setActiveSheetItem(null)}
                    className={itemClass}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 border ${
                        childActive
                          ? 'bg-white/20 text-white border-white/20'
                          : 'bg-background text-primary border-border/60 shadow-2xs'
                      }`}>
                        <ChildIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold truncate">{childLabel}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ml-2 ${childActive ? 'text-white' : 'text-muted-foreground'}`} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar - Floating Pill with auto-hide on scroll */}
      <div className={`md:hidden fixed bottom-[calc(0.85rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[94%] max-w-[420px] z-40 transition-all duration-300 ease-spring ${
        (!isScrollVisible && !activeSheetItem)
          ? 'translate-y-28 opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}>
        <nav className="relative bg-[#94be2d]/80 backdrop-blur-xl border border-white/25 rounded-full shadow-lg">
          <div className="flex items-center justify-around h-16 px-1">
            {displayItems.map((item, index) => {
              const Icon = allIcons[item.icon] || LinkIcon;
              const externalUrl = getExternalUrl(item);
              const active = isActive(item.path) && !externalUrl;
              const isDropdown = !!(item.is_dropdown && item.children && item.children.length > 0);
              const anyChildActive = item.children?.some((c) => isActive(c.path)) ?? false;
              const isItemActive = active || anyChildActive;
              const isSheetOpen = activeSheetItem?.id === item.id;
              const shortLabel = getShortLabel(item);

              // Center elevated button
              const isCenter = index === Math.floor(displayItems.length / 2);

              if (isCenter) {
                const centerCircle = (
                  <div className="w-12 h-12 rounded-full bg-white text-[#94be2d] flex items-center justify-center shadow-md ring-4 ring-[#94be2d] transition-transform active:scale-95">
                    <Icon className="w-5 h-5 text-[#94be2d]" />
                  </div>
                );
                const centerLabel = (
                  <span className="text-[10px] font-medium text-white tracking-tight leading-none mt-1">
                    {shortLabel}
                  </span>
                );

                if (isDropdown) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSheetItem(isSheetOpen ? null : item)}
                      className="relative -top-3 flex flex-col items-center justify-center group focus:outline-none"
                    >
                      {centerCircle}
                      {centerLabel}
                    </button>
                  );
                }
                if (externalUrl) {
                  return (
                    <a key={item.id} href={externalUrl} target="_blank" rel="noopener noreferrer"
                      className="relative -top-3 flex flex-col items-center justify-center group focus:outline-none">
                      {centerCircle}
                      {centerLabel}
                    </a>
                  );
                }
                return (
                  <Link key={item.id} href={getPath(item)}
                    className="relative -top-3 flex flex-col items-center justify-center group focus:outline-none">
                    {centerCircle}
                    {centerLabel}
                  </Link>
                );
              }

              // Dropdown item
              if (isDropdown) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSheetItem(isSheetOpen ? null : item)}
                    className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-full transition-colors min-w-[54px] active:scale-95 ${
                      isItemActive || isSheetOpen
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-white/85 hover:text-white'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                      <ChevronUp className={`w-3 h-3 absolute -top-1.5 -right-2 text-white/90 transition-transform ${isSheetOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <span className="text-[10px] tracking-tight leading-none text-center truncate max-w-[58px]">
                      {shortLabel}
                    </span>
                  </button>
                );
              }

              // External link item
              if (externalUrl) {
                return (
                  <a
                    key={item.id}
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-full transition-colors min-w-[54px] text-white/85 hover:text-white active:scale-95"
                  >
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-[10px] tracking-tight leading-none text-center truncate max-w-[58px]">
                      {shortLabel}
                    </span>
                  </a>
                );
              }

              // Regular link item
              return (
                <Link
                  key={item.id}
                  href={getPath(item)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-full transition-colors min-w-[54px] active:scale-95 ${
                    active 
                      ? 'bg-white/20 text-white font-semibold' 
                      : 'text-white/85 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-[10px] tracking-tight leading-none text-center truncate max-w-[58px]">
                    {shortLabel}
                  </span>
                  {active && (
                    <span className="absolute -bottom-0.5 w-1 h-1 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
