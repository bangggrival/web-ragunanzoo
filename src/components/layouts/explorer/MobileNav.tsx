import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, User, LogOut, Shield, ExternalLink, Accessibility } from 'lucide-react';
import { type NavbarItem } from '@/hooks/useNavbarItems';
import { useAuth } from '@/hooks/useAuth';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { allIcons } from '@/components/ui/IconPicker';

interface MobileNavProps {
  items: NavbarItem[];
  isActive: (path: string) => boolean;
  getLabel: (item: { label_id: string; label_en: string | null }) => string;
  getPath: (item: { path: string; path_en?: string | null }) => string;
  getExternalUrl: (item: { path: string; path_en?: string | null }) => string | null;
  onClose: () => void;
}

export default function MobileNav({
  items,
  isActive,
  getLabel,
  getPath,
  getExternalUrl,
  onClose
}: MobileNavProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const { isAuthenticated, user, signOut, userRole } = useAuth();
  const { openMenu } = useAccessibility();

  // Lock body scroll when mobile menu is open to prevent background bleed
  useEffect(() => {
    const origBody = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origBody;
    };
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="md:hidden fixed inset-x-0 top-[60px] sm:top-[64px] bottom-0 z-50 flex flex-col overflow-hidden">
      {/* Editorial mobile menu backdrop */}
      <div 
        className="fixed inset-0 top-[60px] sm:top-[64px] bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="flex-1 min-h-0 bg-card dark:bg-[#0A120E] border-t border-border shadow-2xl shadow-black/30 overflow-y-auto overscroll-contain animate-in slide-in-from-top-2 duration-200"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        <div className="px-4 py-4 flex flex-col gap-1.5 pb-28">
          {items.map((item) => {
            const externalUrl = getExternalUrl(item);
            const isDropdown = !!(item.is_dropdown && item.children && item.children.length > 0);
            const expanded = !!expandedIds[item.id];
            const ItemIcon = allIcons[item.icon] || User;

            // Mobile dropdown item
            if (isDropdown) {
              const anyChildActive = item.children?.some((c) => isActive(c.path)) ?? false;
              const parentActive = isActive(item.path) && !externalUrl;
              const active = anyChildActive || parentActive;

              return (
                <div key={item.id} className="rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => toggleExpanded(item.id)}
                    aria-haspopup="menu"
                    aria-expanded={expanded}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        active ? 'bg-white/20' : 'bg-primary/10'
                      }`}>
                        <ItemIcon className={`w-4 h-4 ${active ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <span className="truncate">{getLabel(item)}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''} ${
                        active ? 'text-white/90' : 'text-muted-foreground'
                      }`}
                    />
                  </button>

                  {expanded && (
                    <div
                      role="menu"
                      className="mt-1 ml-4 pl-3 border-l-2 border-primary/25 flex flex-col gap-1"
                    >
                      {item.children?.map((child) => {
                        const childExternalUrl = getExternalUrl(child);
                        const childActive = isActive(child.path) && !childExternalUrl;
                        const ChildIcon = allIcons[child.icon] || User;

                        const childClass = `flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          childActive
                            ? 'bg-primary/15 text-primary shadow-2xs'
                            : 'text-foreground hover:text-primary hover:bg-primary/10'
                        }`;

                        if (childExternalUrl) {
                          return (
                            <a
                              key={child.id}
                              href={childExternalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={childClass}
                              onClick={onClose}
                            >
                              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                <ChildIcon className="w-3.5 h-3.5 text-primary" />
                              </span>
                              <span className="flex-1 truncate">{getLabel(child)}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={child.id}
                            href={getPath(child)}
                            className={childClass}
                            onClick={onClose}
                          >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              childActive ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                            }`}>
                              <ChildIcon className="w-3.5 h-3.5" />
                            </span>
                            <span className="flex-1 truncate">{getLabel(child)}</span>
                            <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${childActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
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
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  onClick={onClose}
                >
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ItemIcon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="flex-1 truncate">{getLabel(item)}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </a>
              );
            }

            // Regular link item
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                href={getPath(item)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-foreground hover:text-primary hover:bg-primary/10'
                }`}
                onClick={onClose}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  active ? 'bg-white/20' : 'bg-primary/10'
                }`}>
                  <ItemIcon className={`w-4 h-4 ${active ? 'text-white' : 'text-primary'}`} />
                </div>
                <span className="flex-1 truncate">{getLabel(item)}</span>
                {active && <ChevronRight className="w-4 h-4 text-white/90 flex-shrink-0" />}
              </Link>
            );
          })}

          {/* Accessibility Option */}
          <div className="pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => {
                onClose();
                openMenu();
              }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-foreground hover:bg-muted/70 transition-all w-full text-left active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Accessibility className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-foreground">Menu Aksesibilitas</span>
            </button>
          </div>

          {/* Auth Section */}
          <div className="mt-1 pt-2 border-t border-border/50">
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                {/* User card */}
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-muted/40 border border-border/50">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name || user?.username}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 capitalize mt-0.5">
                      <Shield className="w-3 h-3" />
                      {userRole || 'Visitor'}
                    </p>
                  </div>
                </div>

                {(userRole === 'admin' || userRole === 'staff') && (
                  <Link
                    href="/manager"
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all"
                    onClick={onClose}
                  >
                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-violet-500" />
                    </div>
                    Panel Pengelola
                  </Link>
                )}

                <button
                  onClick={() => { signOut(); onClose(); }}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-medium text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-all w-full"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-rose-500" />
                  </div>
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold bg-primary text-primary-foreground shadow-[0_4px_16px_-4px_rgba(5,150,105,0.4)] hover:shadow-[0_6px_20px_-4px_rgba(5,150,105,0.5)] hover:brightness-105 transition-all active:scale-[0.98]"
                onClick={onClose}
              >
                <User className="w-4 h-4" />
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </div>
    </div>
  );
}
