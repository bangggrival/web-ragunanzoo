"use client";

import { useState, useMemo } from 'react';
import { Input } from './input';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { AppIcon } from './AppIcon';
import { cn } from '@/lib/utils';

// Iconify curated collections for wildlife & nature
export const ICONIFY_FAUNA_PRESETS = [
  { id: 'fluent-emoji-flat:lion', name: 'Singa (Lion)' },
  { id: 'fluent-emoji-flat:tiger-face', name: 'Harimau (Tiger)' },
  { id: 'fluent-emoji-flat:elephant', name: 'Gajah (Elephant)' },
  { id: 'fluent-emoji-flat:giraffe', name: 'Jerapah (Giraffe)' },
  { id: 'fluent-emoji-flat:monkey-face', name: 'Primata / Kera (Primate)' },
  { id: 'fluent-emoji-flat:gorilla', name: 'Gorila (Gorilla)' },
  { id: 'fluent-emoji-flat:lizard', name: 'Reptil / Kadal (Lizard)' },
  { id: 'fluent-emoji-flat:crocodile', name: 'Buaya (Crocodile)' },
  { id: 'fluent-emoji-flat:snake', name: 'Ular (Snake)' },
  { id: 'fluent-emoji-flat:turtle', name: 'Kura-kura (Turtle)' },
  { id: 'fluent-emoji-flat:eagle', name: 'Burung Elang (Eagle)' },
  { id: 'fluent-emoji-flat:parrot', name: 'Burung Kakaktua (Parrot)' },
  { id: 'fluent-emoji-flat:flamingo', name: 'Flamingo' },
  { id: 'fluent-emoji-flat:peacock', name: 'Merak / Unggas (Peacock)' },
  { id: 'fluent-emoji-flat:tropical-fish', name: 'Ikan Tropis (Fish)' },
  { id: 'fluent-emoji-flat:shark', name: 'Hiu (Shark)' },
  { id: 'fluent-emoji-flat:frog', name: 'Amfibi / Katak (Frog)' },
  { id: 'fluent-emoji-flat:butterfly', name: 'Kupu-kupu (Butterfly)' },
  { id: 'fluent-emoji-flat:honeybee', name: 'Lebah (Honeybee)' },
  { id: 'fluent-emoji-flat:rhinoceros', name: 'Badak (Rhino)' },
  { id: 'fluent-emoji-flat:camel', name: 'Unta (Camel)' },
  { id: 'fluent-emoji-flat:deer', name: 'Rusa (Deer)' },
  { id: 'fluent-emoji-flat:paw-prints', name: 'Jejak Kaki (Paws)' },
];

export const ICONIFY_FLORA_PRESETS = [
  { id: 'fluent-emoji-flat:deciduous-tree', name: 'Pohon Peneduh (Tree)' },
  { id: 'fluent-emoji-flat:evergreen-tree', name: 'Pohon Cemara (Evergreen)' },
  { id: 'fluent-emoji-flat:palm-tree', name: 'Taman Palem (Palm Tree)' },
  { id: 'fluent-emoji-flat:cherry-blossom', name: 'Bunga Sakura (Flower)' },
  { id: 'fluent-emoji-flat:hibiscus', name: 'Bunga Sepatu (Hibiscus)' },
  { id: 'fluent-emoji-flat:lotus', name: 'Bunga Teratai / Anggrek (Lotus)' },
  { id: 'fluent-emoji-flat:sunflower', name: 'Bunga Matahari (Sunflower)' },
  { id: 'fluent-emoji-flat:seedling', name: 'Tunas / Tanaman Langka (Seedling)' },
  { id: 'fluent-emoji-flat:bamboo', name: 'Bambu (Bamboo)' },
  { id: 'fluent-emoji-flat:cactus', name: 'Kaktus (Cactus)' },
  { id: 'fluent-emoji-flat:potted-plant', name: 'Tanaman Pot / Karnivora' },
  { id: 'fluent-emoji-flat:herb', name: 'Herbal (Herb)' },
];

// Categorized icon collections (mapped to Iconify solar / fluent-emoji identifiers and Lucide aliases)
export const iconCategories: Record<string, string[]> = {
  'Navigasi & Lokasi': [
    'solar:home-2-bold-duotone', 'solar:map-point-bold-duotone', 'solar:map-bold-duotone',
    'solar:compass-bold-duotone', 'solar:global-bold-duotone', 'solar:city-bold-duotone',
    'solar:parking-bold-duotone', 'solar:routing-2-bold-duotone', 'Home', 'MapPin', 'Map', 'Compass',
  ],
  'Satwa & Alam': [
    'fluent-emoji-flat:paw-prints', 'fluent-emoji-flat:lion', 'fluent-emoji-flat:tiger-face',
    'fluent-emoji-flat:elephant', 'fluent-emoji-flat:monkey-face', 'fluent-emoji-flat:giraffe',
    'fluent-emoji-flat:lizard', 'fluent-emoji-flat:crocodile', 'fluent-emoji-flat:turtle',
    'fluent-emoji-flat:eagle', 'fluent-emoji-flat:parrot', 'fluent-emoji-flat:deciduous-tree',
    'fluent-emoji-flat:herb', 'fluent-emoji-flat:seedling', 'PawPrint', 'Bird', 'Fish', 'Bug', 'Leaf',
  ],
  'Aktivitas & Hiburan': [
    'solar:ticket-sale-bold-duotone', 'solar:calendar-bold-duotone', 'solar:qr-code-bold-duotone',
    'solar:camera-bold-duotone', 'solar:videocamera-bold-duotone', 'solar:music-notes-bold-duotone',
    'solar:gamepad-bold-duotone', 'solar:magic-stick-3-bold-duotone', 'solar:cup-bold-duotone',
    'Ticket', 'Calendar', 'QrCode', 'Camera', 'Music',
  ],
  'Komunikasi': [
    'solar:newspaper-bold-duotone', 'solar:letter-bold-duotone', 'solar:phone-bold-duotone',
    'solar:chat-round-dots-bold-duotone', 'solar:bell-bold-duotone', 'solar:plain-bold-duotone',
    'solar:share-circle-bold-duotone', 'Newspaper', 'Mail', 'Phone', 'Bell',
  ],
  'Belanja & Keuangan': [
    'solar:heart-bold-duotone', 'solar:gift-bold-duotone', 'solar:bag-bold-duotone',
    'solar:cart-large-4-bold-duotone', 'solar:card-bold-duotone', 'solar:wallet-money-bold-duotone',
    'Heart', 'Gift', 'ShoppingBag', 'CreditCard',
  ],
  'Bangunan & Fasilitas': [
    'solar:buildings-bold-duotone', 'solar:shop-2-bold-duotone', 'solar:hospital-bold-duotone',
    'solar:banknote-bold-duotone', 'Building2', 'Store', 'Hospital',
  ],
  'Makanan & Minuman': [
    'solar:cup-bold-duotone', 'solar:chef-hat-bold-duotone', 'Coffee', 'UtensilsCrossed',
  ],
  'UI & Umum': [
    'solar:star-bold-duotone', 'solar:info-circle-bold-duotone', 'solar:danger-triangle-bold-duotone',
    'solar:check-circle-bold-duotone', 'solar:settings-bold-duotone', 'solar:user-bold-duotone',
    'solar:users-group-two-rounded-bold-duotone', 'solar:shield-check-bold-duotone',
    'solar:clock-circle-bold-duotone', 'solar:lock-bold-duotone', 'solar:magnifer-linear',
    'Star', 'Info', 'CheckCircle', 'Settings', 'User', 'Users', 'Clock', 'Shield', 'FileText',
  ],
  'Cuaca': [
    'solar:sun-bold-duotone', 'solar:moon-bold-duotone', 'solar:cloud-bold-duotone',
    'solar:cloud-rain-bold-duotone', 'solar:wind-bold-duotone', 'Sun', 'Moon', 'Cloud',
  ],
};

export type IconComponentType = React.ComponentType<{ className?: string; size?: number | string; style?: React.CSSProperties }>;

const createIconWrapper = (iconIdentifier: string): IconComponentType => {
  const IconComp = ({ className, size, style, ...props }: any) => (
    <AppIcon icon={iconIdentifier} className={className} size={size} style={style} {...props} />
  );
  IconComp.displayName = `AppIcon_${iconIdentifier}`;
  return IconComp;
};

// Flatten all icons into a deduplicated list
const allIconNameSet = new Set<string>();
Object.values(iconCategories).forEach((list) => {
  list.forEach((iconName) => allIconNameSet.add(iconName));
});
ICONIFY_FAUNA_PRESETS.forEach((p) => allIconNameSet.add(p.id));
ICONIFY_FLORA_PRESETS.forEach((p) => allIconNameSet.add(p.id));

export const allIconNames = Array.from(allIconNameSet);

// Proxy for allIcons so any iconName requested returns a component rendering AppIcon
export const allIcons: Record<string, IconComponentType> = new Proxy(
  {},
  {
    get: (_target, prop: string) => {
      if (typeof prop !== 'string' || prop === 'then') return undefined;
      return createIconWrapper(prop);
    },
    has: () => true,
    ownKeys: () => allIconNames,
    getOwnPropertyDescriptor: (_target, prop) => ({
      value: createIconWrapper(String(prop)),
      enumerable: true,
      configurable: true,
    }),
  }
);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredIcons = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    if (selectedCategory && iconCategories[selectedCategory]) {
      return iconCategories[selectedCategory].filter((name) =>
        name.toLowerCase().includes(searchLower)
      );
    }
    
    return allIconNames.filter((name) =>
      name.toLowerCase().includes(searchLower)
    );
  }, [search, selectedCategory]);

  const filteredFaunaPresets = useMemo(() => {
    if (!search) return ICONIFY_FAUNA_PRESETS;
    const searchLower = search.toLowerCase();
    return ICONIFY_FAUNA_PRESETS.filter(
      p => p.id.toLowerCase().includes(searchLower) || p.name.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const filteredFloraPresets = useMemo(() => {
    if (!search) return ICONIFY_FLORA_PRESETS;
    const searchLower = search.toLowerCase();
    return ICONIFY_FLORA_PRESETS.filter(
      p => p.id.toLowerCase().includes(searchLower) || p.name.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const categoryNames = Object.keys(iconCategories);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded flex items-center justify-center w-7 h-7">
              <AppIcon icon={value} className="h-4 w-4 text-primary" fallback={<AppIcon icon="solar:link-bold-duotone" className="h-4 w-4 text-primary" />} />
            </div>
            <span className="truncate max-w-[200px]">{value || 'Pilih Icon'}</span>
          </div>
          <AppIcon icon="solar:alt-arrow-down-linear" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <AppIcon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari icon atau ketik Iconify (e.g. fluent-emoji-flat:tiger)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 text-xs"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearch('')}
              >
                <AppIcon icon="solar:close-circle-bold" className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Quick Custom Iconify Input Option */}
          {search.includes(':') && (
            <div className="mt-2 p-2 bg-primary/10 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <AppIcon icon={search.trim()} className="w-5 h-5 shrink-0" fallback={<AppIcon icon="solar:magic-stick-3-bold-duotone" className="w-4 h-4 text-primary" />} />
                <span className="text-xs font-medium truncate">{search.trim()}</span>
              </div>
              <Button
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => {
                  onChange(search.trim());
                  setOpen(false);
                }}
              >
                Gunakan Icon
              </Button>
            </div>
          )}
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1 mt-2.5 max-h-20 overflow-y-auto">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() => setSelectedCategory(null)}
            >
              Semua
            </Button>
            <Button
              variant={selectedCategory === 'Iconify Fauna' ? "default" : "outline"}
              size="sm"
              className="h-6 text-[11px] px-2 text-emerald-600 dark:text-emerald-400 font-semibold"
              onClick={() => setSelectedCategory('Iconify Fauna')}
            >
              Satwa (Iconify)
            </Button>
            <Button
              variant={selectedCategory === 'Iconify Flora' ? "default" : "outline"}
              size="sm"
              className="h-6 text-[11px] px-2 text-emerald-600 dark:text-emerald-400 font-semibold"
              onClick={() => setSelectedCategory('Iconify Flora')}
            >
              Flora (Iconify)
            </Button>
            {categoryNames.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="h-6 text-[11px] px-2"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>
        
        <ScrollArea className="h-[280px]">
          <div className="p-3">
            {/* 1. Iconify Fauna Section */}
            {(selectedCategory === null || selectedCategory === 'Iconify Fauna') && filteredFaunaPresets.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                  <AppIcon icon="fluent-emoji-flat:lion" className="w-3.5 h-3.5" />
                  Koleksi Satwa (Iconify Natural Flat)
                </h4>
                <div className="grid grid-cols-7 gap-1.5">
                  {filteredFaunaPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onChange(preset.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "p-1.5 rounded-lg border-2 transition-all flex flex-col items-center justify-center",
                        value === preset.id
                          ? "border-primary bg-primary/20 scale-105"
                          : "border-transparent bg-muted/40 hover:border-primary/40 hover:bg-primary/5"
                      )}
                      title={preset.name}
                    >
                      <AppIcon icon={preset.id} className="w-6 h-6 object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Iconify Flora Section */}
            {(selectedCategory === null || selectedCategory === 'Iconify Flora') && filteredFloraPresets.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                  <AppIcon icon="fluent-emoji-flat:deciduous-tree" className="w-3.5 h-3.5" />
                  Koleksi Flora & Botani (Iconify Natural Flat)
                </h4>
                <div className="grid grid-cols-7 gap-1.5">
                  {filteredFloraPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onChange(preset.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "p-1.5 rounded-lg border-2 transition-all flex flex-col items-center justify-center",
                        value === preset.id
                          ? "border-primary bg-primary/20 scale-105"
                          : "border-transparent bg-muted/40 hover:border-primary/40 hover:bg-primary/5"
                      )}
                      title={preset.name}
                    >
                      <AppIcon icon={preset.id} className="w-6 h-6 object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. General & Modern Icons Section */}
            {selectedCategory !== 'Iconify Fauna' && selectedCategory !== 'Iconify Flora' && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  Ikon UI Terpadu
                </h4>
                <div className="grid grid-cols-8 gap-1.5">
                  {filteredIcons.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                      className={cn(
                        "p-2 rounded-lg border-2 transition-all flex items-center justify-center",
                        value === name
                          ? "border-primary bg-primary text-primary-foreground scale-105"
                          : "border-transparent bg-muted/50 hover:border-primary/30 hover:bg-primary/5"
                      )}
                      title={name}
                    >
                      <AppIcon icon={name} className="w-4 h-4 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {filteredIcons.length === 0 && filteredFaunaPresets.length === 0 && filteredFloraPresets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AppIcon icon="solar:magnifer-linear" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada icon ditemukan</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-2 border-t bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            Mendukung Iconify & ratusan icon vektor
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Export a simple inline icon picker grid for use in dialogs
export function IconPickerGrid({
  value,
  onChange,
  maxHeight = '200px',
}: {
  value: string;
  onChange: (iconName: string) => void;
  maxHeight?: string;
}) {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    const searchLower = search.toLowerCase();
    return allIconNames.filter((name) =>
      name.toLowerCase().includes(searchLower)
    );
  }, [search]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <AppIcon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari icon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div 
        className="grid grid-cols-8 gap-2 p-3 bg-muted/50 rounded-lg overflow-y-auto"
        style={{ maxHeight }}
      >
        {filteredIcons.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              "p-2 rounded-lg border-2 transition-all flex items-center justify-center",
              value === name
                ? "border-primary bg-primary text-primary-foreground scale-105"
                : "border-transparent bg-background hover:border-primary/30 hover:bg-primary/5"
            )}
            title={name}
          >
            <AppIcon icon={name} className="w-5 h-5 mx-auto" />
          </button>
        ))}
        {filteredIcons.length === 0 && (
          <div className="col-span-8 text-center py-4 text-muted-foreground text-sm">
            Tidak ada icon ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
