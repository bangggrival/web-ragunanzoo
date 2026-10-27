"use client";

import React, { memo } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/^-+/, '');
}

// Lucide icon name to Iconify identifier mapping
const LUCIDE_TO_ICONIFY: Record<string, string> = {
  // Flora & Fauna (Natural, Realistic Flat Iconify sets)
  PawPrint: 'fluent-emoji-flat:paw-prints',
  Leaf: 'fluent-emoji-flat:herb',
  TreeDeciduous: 'fluent-emoji-flat:deciduous-tree',
  Flower2: 'fluent-emoji-flat:cherry-blossom',
  Fish: 'fluent-emoji-flat:tropical-fish',
  Bird: 'fluent-emoji-flat:eagle',
  Bug: 'fluent-emoji-flat:lady-beetle',
  Sprout: 'fluent-emoji-flat:seedling',

  // Navigation & Places
  Home: 'solar:home-2-bold-duotone',
  Map: 'solar:map-bold-duotone',
  MapPin: 'solar:map-point-bold-duotone',
  Compass: 'solar:compass-bold-duotone',
  Navigation: 'solar:routing-2-bold-duotone',
  Landmark: 'solar:city-bold-duotone',
  Building2: 'solar:buildings-bold-duotone',

  // UI Actions & Common
  Plus: 'solar:add-circle-bold',
  Trash: 'solar:trash-bin-trash-bold-duotone',
  Trash2: 'solar:trash-bin-trash-bold-duotone',
  Edit: 'solar:pen-new-square-bold-duotone',
  Edit2: 'solar:pen-new-square-bold-duotone',
  Edit3: 'solar:pen-new-square-bold-duotone',
  Search: 'solar:magnifer-linear',
  Settings: 'solar:settings-bold-duotone',
  Check: 'solar:check-read-bold',
  CheckCircle: 'solar:check-circle-bold-duotone',
  CheckCircle2: 'solar:check-circle-bold-duotone',
  CheckCheck: 'solar:check-read-bold-duotone',
  X: 'solar:close-circle-bold',
  XCircle: 'solar:close-circle-bold',
  Circle: 'solar:record-circle-bold',
  ChevronRight: 'solar:alt-arrow-right-linear',
  ChevronLeft: 'solar:alt-arrow-left-linear',
  ChevronDown: 'solar:alt-arrow-down-linear',
  ChevronUp: 'solar:alt-arrow-up-linear',
  ArrowRight: 'solar:arrow-right-linear',
  ArrowLeft: 'solar:arrow-left-linear',
  ArrowUp: 'solar:arrow-up-linear',
  ArrowDown: 'solar:arrow-down-linear',
  Eye: 'solar:eye-bold-duotone',
  EyeOff: 'solar:eye-closed-bold-duotone',
  Filter: 'solar:filter-bold-duotone',
  Download: 'solar:download-minimalistic-bold-duotone',
  Upload: 'solar:upload-minimalistic-bold-duotone',
  Share2: 'solar:share-circle-bold-duotone',
  Copy: 'solar:copy-bold-duotone',
  RefreshCw: 'solar:restart-bold',
  RotateCw: 'solar:restart-bold',
  RotateCcw: 'solar:restart-bold',
  Loader2: 'solar:spinner-linear',
  ExternalLink: 'solar:link-circle-bold-duotone',
  Link: 'solar:link-bold-duotone',
  Menu: 'solar:hamburger-menu-linear',
  LogOut: 'solar:logout-2-bold-duotone',
  LogIn: 'solar:login-2-bold-duotone',
  Lock: 'solar:lock-bold-duotone',
  Unlock: 'solar:lock-unlocked-bold-duotone',

  // Information & Feedback
  Info: 'solar:info-circle-bold-duotone',
  AlertCircle: 'solar:danger-circle-bold-duotone',
  AlertTriangle: 'solar:danger-triangle-bold-duotone',
  HelpCircle: 'solar:question-circle-bold-duotone',
  Shield: 'solar:shield-check-bold-duotone',
  ShieldCheck: 'solar:shield-check-bold-duotone',
  ShieldAlert: 'solar:shield-warning-bold-duotone',
  Sparkles: 'solar:magic-stick-3-bold-duotone',
  Heart: 'solar:heart-bold-duotone',
  Star: 'solar:star-bold-duotone',

  // Commerce & Content
  Ticket: 'solar:ticket-bold-duotone',
  Calendar: 'solar:calendar-bold-duotone',
  CalendarDays: 'solar:calendar-date-bold-duotone',
  Clock: 'solar:clock-circle-bold-duotone',
  Newspaper: 'solar:document-text-bold-duotone',
  FileText: 'solar:document-text-bold-duotone',
  Book: 'solar:book-bookmark-bold-duotone',
  BookOpen: 'solar:book-bookmark-bold-duotone',
  DollarSign: 'solar:dollar-bold',
  QrCode: 'solar:qr-code-bold-duotone',
  Scale: 'solar:scale-bold-duotone',
  Box: 'solar:box-bold-duotone',

  // Media & Devices
  Camera: 'solar:camera-bold-duotone',
  Video: 'solar:videocamera-bold-duotone',
  Music: 'solar:music-notes-bold-duotone',
  Headphones: 'solar:headphones-round-bold-duotone',
  Volume2: 'solar:volume-loud-bold-duotone',
  VolumeX: 'solar:volume-cross-bold-duotone',
  Play: 'solar:play-bold',
  Pause: 'solar:pause-bold',
  Smartphone: 'solar:smartphone-bold-duotone',

  // Communication & Users
  Users: 'solar:users-group-two-rounded-bold-duotone',
  User: 'solar:user-bold-duotone',
  Phone: 'solar:phone-bold-duotone',
  Mail: 'solar:letter-bold-duotone',
  Bell: 'solar:bell-bold-duotone',
  MessageCircle: 'solar:chat-round-dots-bold-duotone',
  MessageSquare: 'solar:chat-square-bold-duotone',

  // Weather
  Sun: 'solar:sun-bold-duotone',
  Moon: 'solar:moon-bold-duotone',
  Cloud: 'solar:cloud-bold-duotone',
};

// Standard Emoji to Fluent Emoji Flat (Natural, High-Res Iconify) mapping
const EMOJI_TO_ICONIFY: Record<string, string> = {
  '🦁': 'fluent-emoji-flat:lion',
  '🐯': 'fluent-emoji-flat:tiger',
  '🐅': 'fluent-emoji-flat:tiger',
  '🐘': 'fluent-emoji-flat:elephant',
  '🦒': 'fluent-emoji-flat:giraffe',
  '🐒': 'fluent-emoji-flat:monkey-face',
  '🐵': 'fluent-emoji-flat:monkey',
  '🦍': 'fluent-emoji-flat:gorilla',
  '🦎': 'fluent-emoji-flat:lizard',
  '🐊': 'fluent-emoji-flat:crocodile',
  '🦅': 'fluent-emoji-flat:eagle',
  '🦜': 'fluent-emoji-flat:parrot',
  '🦩': 'fluent-emoji-flat:flamingo',
  '🦉': 'fluent-emoji-flat:owl',
  '🐟': 'fluent-emoji-flat:tropical-fish',
  '🐠': 'fluent-emoji-flat:tropical-fish',
  '🦈': 'fluent-emoji-flat:shark',
  '🐬': 'fluent-emoji-flat:dolphin',
  '🦋': 'fluent-emoji-flat:butterfly',
  '🐍': 'fluent-emoji-flat:snake',
  '🐢': 'fluent-emoji-flat:turtle',
  '🐸': 'fluent-emoji-flat:frog',
  '🐝': 'fluent-emoji-flat:honeybee',
  '🐞': 'fluent-emoji-flat:lady-beetle',
  '🦚': 'fluent-emoji-flat:peacock',
  '🦏': 'fluent-emoji-flat:rhinoceros',
  '🐫': 'fluent-emoji-flat:camel',
  '🐪': 'fluent-emoji-flat:camel',
  '🦌': 'fluent-emoji-flat:deer',
  '🌳': 'fluent-emoji-flat:deciduous-tree',
  '🌲': 'fluent-emoji-flat:evergreen-tree',
  '🌴': 'fluent-emoji-flat:palm-tree',
  '🌸': 'fluent-emoji-flat:cherry-blossom',
  '🌺': 'fluent-emoji-flat:hibiscus',
  '🌻': 'fluent-emoji-flat:sunflower',
  '🌼': 'fluent-emoji-flat:blossom',
  '🌷': 'fluent-emoji-flat:tulip',
  '🌹': 'fluent-emoji-flat:rose',
  '🪷': 'fluent-emoji-flat:lotus',
  '🌿': 'fluent-emoji-flat:seedling',
  '🌱': 'fluent-emoji-flat:seedling',
  '🍃': 'fluent-emoji-flat:leaf-fluttering-in-wind',
  '🌵': 'fluent-emoji-flat:cactus',
  '🎋': 'fluent-emoji-flat:bamboo',
  '🪴': 'fluent-emoji-flat:potted-plant',
  '🐾': 'fluent-emoji-flat:paw-prints',
  '🪻': 'fluent-emoji-flat:white-flower',
  '💐': 'fluent-emoji-flat:bouquet',
};

export interface AppIconProps {
  icon?: string | null;
  name?: string | null;
  className?: string;
  fallback?: React.ReactNode;
  size?: number | string;
  style?: React.CSSProperties;
  title?: string;
  id?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-label'?: string;
  onClick?: (event: React.MouseEvent<any>) => void;
}

/**
 * IT Security: Validates local path to prevent directory traversal or dangerous protocols
 */
function isSafeLocalSvgPath(path: string): boolean {
  if (!path) return false;
  const trimmed = path.trim().toLowerCase();
  // Strictly prevent dangerous schemes
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.includes('..') ||
    trimmed.includes('\0')
  ) {
    return false;
  }
  // Allow paths in /icons/ or /uploads/ or /images/
  return (
    trimmed.startsWith('/icons/') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('/images/') ||
    trimmed.endsWith('.svg')
  );
}

/**
 * AppIcon
 * Komponen Terpadu Iconify untuk Seluruh Web Ragunan Zoo:
 * 1. Mendukung Iconify identifier langsung (misal: "fluent-emoji-flat:lion", "solar:paw-bold-duotone", "lucide:home")
 * 2. Menerjemahkan emoji database lama (🦁, 🦎, 🦅, dll.) ke Iconify Fluent Emoji Flat berkualitas tinggi
 * 3. Menerjemahkan nama icon Lucide standar (Home, Ticket, Leaf, dll.) ke Iconify atau fallback Lucide
 * 4. Mendukung SVG lokal kustom dari Tim Desain Internal untuk satwa khusus yang belum ada di Iconify (Komodo, Badak Jawa, Kasuari)
 * 5. Aman dari XSS, sanitasi protokol ketat, dan SSR-safe
 */
export const AppIcon = memo(function AppIcon({
  icon,
  name,
  className,
  fallback = null,
  size,
  style,
  title,
  id,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
  onClick,
}: AppIconProps) {
  const targetIcon = icon || name;
  if (!targetIcon) {
    return <>{fallback}</>;
  }

  const trimmed = targetIcon.trim();

  // 1. Cek apakah ini path SVG lokal (dari tim desain internal)
  if (isSafeLocalSvgPath(trimmed)) {
    return (
      <img
        src={trimmed}
        alt={title || "Icon"}
        className={cn('inline-block object-contain select-none transition-transform', className)}
        loading="lazy"
        draggable={false}
        style={style}
        title={title}
        id={id}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
        onClick={onClick}
      />
    );
  }

  const renderIconify = (iconKey: string) => {
    const iconElement = (
      <Icon
        icon={iconKey}
        className={cn('inline-block shrink-0 align-middle', className)}
        width={size}
        height={size}
        style={style}
        id={id}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
        onClick={onClick}
      />
    );

    if (title) {
      return (
        <span title={title} className="inline-flex items-center justify-center">
          {iconElement}
        </span>
      );
    }
    return iconElement;
  };

  // 2. Cek apakah ini Iconify string eksplisit (mengandung titik dua ':', e.g. "fluent-emoji-flat:lion")
  if (trimmed.includes(':')) {
    return renderIconify(trimmed);
  }

  // 3. Cek apakah ini Emoji Unicode (🦁, 🦎, 🦅, dll.) -> petakan ke Iconify
  if (EMOJI_TO_ICONIFY[trimmed]) {
    return renderIconify(EMOJI_TO_ICONIFY[trimmed]);
  }

  // 4. Cek apakah ini nama Lucide yang bisa di-render via Iconify
  if (LUCIDE_TO_ICONIFY[trimmed]) {
    return renderIconify(LUCIDE_TO_ICONIFY[trimmed]);
  }

  // 5. Coba konversi nama PascalCase/camelCase ke kebab-case untuk icon Lucide di Iconify
  const kebab = toKebabCase(trimmed);
  if (kebab) {
    try {
      return renderIconify(`lucide:${kebab}`);
    } catch {
      // Fallback lanjut ke bawah
    }
  }

  // 6. Coba render string langsung via Iconify (siapa tahu nama icon valid)
  try {
    return renderIconify(trimmed);
  } catch {
    return <>{fallback}</>;
  }
});

export default AppIcon;
