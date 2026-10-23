import React, { useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Link as LinkIcon, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type NavbarItem } from '@/hooks/useNavbarItems';
import { allIcons } from '@/components/ui/IconPicker';

interface DesktopNavProps {
  items: NavbarItem[];
  isActive: (path: string) => boolean;
  getLabel: (item: { label_id: string; label_en: string | null }) => string;
  getPath: (item: { path: string; path_en?: string | null }) => string;
  getExternalUrl: (item: { path: string; path_en?: string | null }) => string | null;
}

export default function DesktopNav({
  items,
  isActive,
  getLabel,
  getPath,
  getExternalUrl
}: DesktopNavProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close all dropdowns when route changes
  useLayoutEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <nav className="hidden md:flex items-center justify-center flex-1 gap-0.5 lg:gap-1 mx-2 lg:mx-4 xl:mx-8 flex-nowrap overflow-x-auto no-scrollbar py-1 shrink min-w-0">
      {items.map((item) => {
        if (item.is_dropdown && item.children && item.children.length > 0) {
          return (
            <DropdownNavItem
              key={item.id}
              item={item}
              isActive={isActive}
              getLabel={getLabel}
              getPath={getPath}
              getExternalUrl={getExternalUrl}
              isOpen={openDropdown === item.id}
              onOpenChange={(open) => setOpenDropdown(open ? item.id : null)}
            />
          );
        }

        const externalUrl = getExternalUrl(item);
        const isItemActive = isActive(item.path) && !externalUrl;

        if (externalUrl) {
          return (
            <a
              key={item.id}
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-3 lg:px-3.5 xl:px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 text-foreground/90 hover:text-foreground hover:bg-primary/10 whitespace-nowrap"
            >
              {getLabel(item)}
            </a>
          );
        }

        return (
          <Link
            key={item.id}
            href={getPath(item)}
            className={`relative px-3.5 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              isItemActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-foreground/90 hover:text-foreground hover:bg-primary/10'
            }`}
          >
            {getLabel(item)}
          </Link>
        );
      })}
    </nav>
  );
}

// Dropdown Nav Item component
function DropdownNavItem({
  item,
  isActive,
  getLabel,
  getPath,
  getExternalUrl,
  isOpen,
  onOpenChange
}: {
  item: NavbarItem;
  isActive: (path: string) => boolean;
  getLabel: (item: { label_id: string; label_en: string | null }) => string;
  getPath: (item: { path: string; path_en?: string | null }) => string;
  getExternalUrl: (item: { path: string; path_en?: string | null }) => string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isItemActive = item.children?.some(child => isActive(child.path)) || isActive(item.path);

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative px-3.5 lg:px-4 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1.5 whitespace-nowrap ${
            isItemActive
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-foreground/90 hover:text-foreground hover:bg-primary/10'
          }`}
        >
          {getLabel(item)}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="bg-card dark:bg-[#111C16] border border-border/90 shadow-2xl shadow-black/20 rounded-2xl min-w-[240px] max-h-[80vh] overflow-y-auto z-[100] p-2 ring-1 ring-black/5 dark:ring-white/10"
        sideOffset={8}
      >
        {item.children?.map((child) => {
          const childExternalUrl = getExternalUrl(child);
          const ChildIcon = allIcons[child.icon] || Sparkles;
          const childActive = isActive(child.path) && !childExternalUrl;

          if (childExternalUrl) {
            return (
              <DropdownMenuItem
                key={child.id}
                asChild
                onSelect={() => onOpenChange(false)}
              >
                <a
                  href={childExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <ChildIcon className="w-4 h-4 text-primary" />
                  </span>
                  <span>{getLabel(child)}</span>
                </a>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem
              key={child.id}
              asChild
              onSelect={() => onOpenChange(false)}
            >
              <Link
                href={getPath(child)}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  childActive
                    ? 'bg-primary text-white font-semibold shadow-xs'
                    : 'text-foreground hover:text-primary hover:bg-primary/10 font-semibold'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  childActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                }`}>
                  <ChildIcon className="w-4 h-4" />
                </span>
                <span>{getLabel(child)}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
