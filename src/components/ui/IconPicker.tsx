import { useState, useMemo } from 'react';
import { Search, X, type LucideIcon } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import {
  // Navigation & Location
  Home, MapPin, Map, Navigation, Compass, Globe, 
  // Animals & Nature
  PawPrint, Bird, Fish, Bug, Leaf, TreeDeciduous, Flower2, Sprout,
  // Activities & Entertainment
  Ticket, Calendar, QrCode, Camera, Video, Music, Gamepad2, Sparkles, Headphones,
  // Communication
  Newspaper, Mail, Phone, MessageCircle, Bell, Send, Share2, HandHelping,
  // Commerce & Finance
  Heart, Gift, ShoppingBag, ShoppingCart, CreditCard, Wallet,
  // Buildings & Places
  Building2, Building, Store, Warehouse, Church, School, Hospital, Factory,
  // Food & Drink
  Coffee, UtensilsCrossed, Pizza, Apple, Sandwich, IceCream, Wine, Beer,
  // Transport
  Car, Bus, Train, Plane, Bike, Ship,
  // UI & General
  Star, Info, AlertCircle, HelpCircle, Settings, User, Users, Crown,
  Link, ExternalLink, Eye, EyeOff, Lock, Unlock, Key,
  Clock, Timer, CalendarDays, CalendarCheck,
  Image, Images, FileText, Folder, FolderOpen, Download, Upload, 
  Bookmark, BookOpen, GraduationCap, Award, Trophy, Medal, Target,
  Palette, Paintbrush, Scissors, Hammer, Wrench, Zap, Lightbulb,
  Sun, Moon, Cloud, CloudRain, CloudSnow, Umbrella, Wind, Thermometer,
  Wifi, Bluetooth, Battery, Power, Monitor, Smartphone, Tablet, Laptop,
  Volume2, VolumeX, Play, Pause, SkipForward, SkipBack,
  ChevronRight, ChevronDown, ArrowRight, ArrowUp, Move, Maximize,
  Plus, Minus, Check, CheckCircle, AlertTriangle, Book, X as XIcon, RefreshCw, RotateCw,
  Grid, List, Layout, Layers, Box, Circle, Square, Triangle, Hexagon, Pentagon,
  Accessibility, Baby, PersonStanding, Footprints,
  Flame, Droplets, Mountain, Waves, Anchor, Tent, Backpack,
  Binoculars, Flashlight,
  Microscope, Telescope, Atom, Dna, FlaskConical,
  Stethoscope, Pill, Syringe, HeartPulse,
  Shield, ShieldCheck, ShieldAlert, BadgeCheck, BadgeAlert,
  Megaphone, Radio, Tv, Podcast, Rss,
  Coins, PiggyBank, Receipt, Calculator,
  Printer, Scan, ScanLine,
  Scale, Gavel, ScrollText, FileSignature,
  BrainCircuit, Cpu, Database, Server,
  Landmark, Castle, ParkingCircle, TrafficCone, Construction,
  Clapperboard, Film, Popcorn, Drama, Mic, MicOff,
  Dumbbell, Swords, Wand2,
  Rabbit, Cat, Dog, Squirrel, Turtle,
} from 'lucide-react';
import { ReptileIcon, PrimateIcon } from './icons';
import { cn } from '@/lib/utils';

// Categorized icons for better organization
export const iconCategories = {
  'Navigasi & Lokasi': {
    Home, MapPin, Map, Navigation, Compass, Globe, Landmark, Castle, ParkingCircle,
  },
  'Satwa & Alam': {
    PawPrint, ReptileIcon, Bird, PrimateIcon, Fish, Bug, Leaf, TreeDeciduous, Flower2, Sprout, 
    Mountain, Waves, Anchor, Tent, Flame,
    Rabbit, Cat, Dog, Squirrel, Turtle,
  },
  'Aktivitas & Hiburan': {
    Ticket, Calendar, QrCode, Camera, Video, Music, Gamepad2, Sparkles, Headphones,
    Clapperboard, Film, Popcorn, Drama, Mic,
    Dumbbell, Trophy, Target,
  },
  'Komunikasi': {
    Newspaper, Mail, Phone, MessageCircle, Bell, Send, Share2, Megaphone, Radio, Tv, Podcast, HandHelping,
  },
  'Belanja & Keuangan': {
    Heart, Gift, ShoppingBag, ShoppingCart, CreditCard, Wallet, Coins, PiggyBank, Receipt,
  },
  'Bangunan': {
    Building2, Building, Store, Warehouse, Church, School, Hospital, Factory,
  },
  'Makanan & Minuman': {
    Coffee, UtensilsCrossed, Pizza, Apple, Sandwich, IceCream, Wine, Beer,
  },
  'Transportasi': {
    Car, Bus, Train, Plane, Bike, Ship,
  },
  'UI & Umum': {
    Star, Info, AlertCircle, AlertTriangle, CheckCircle, HelpCircle, Settings, User, Users, Crown,
    Link, ExternalLink, Eye, Lock, Key, Clock, Shield, ShieldCheck, ShieldAlert, Scale, Search,
  },
  'Pendidikan & Penghargaan': {
    Book, BookOpen, GraduationCap, Award, Trophy, Medal, Target, Bookmark,
  },
  'Cuaca': {
    Sun, Moon, Cloud, CloudRain, CloudSnow, Umbrella, Wind, Thermometer,
  },
  'Sains': {
    Microscope, Telescope, Atom, Dna, FlaskConical, BrainCircuit,
  },
  'Bentuk': {
    Circle, Square, Triangle, Hexagon, Pentagon, Box, Layers,
  },
};

// Flatten all icons into a single map
export const allIcons: Record<string, LucideIcon> = Object.values(iconCategories).reduce(
  (acc, category) => ({ ...acc, ...category }),
  {}
);

// Get all icon names
export const allIconNames = Object.keys(allIcons);

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const SelectedIcon = allIcons[value] || Link;

  const filteredIcons = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    if (selectedCategory) {
      const categoryIcons = iconCategories[selectedCategory as keyof typeof iconCategories];
      if (!categoryIcons) return [];
      
      return Object.entries(categoryIcons).filter(([name]) =>
        name.toLowerCase().includes(searchLower)
      );
    }
    
    return Object.entries(allIcons).filter(([name]) =>
      name.toLowerCase().includes(searchLower)
    );
  }, [search, selectedCategory]);

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
            <div className="p-1.5 bg-primary/10 rounded">
              <SelectedIcon className="h-4 w-4 text-primary" />
            </div>
            <span>{value || 'Pilih Icon'}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari icon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearch('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedCategory(null)}
            >
              Semua
            </Button>
            {categoryNames.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>
        
        <ScrollArea className="h-[280px]">
          <div className="p-3">
            {selectedCategory === null && search === '' ? (
              // Show categorized view
              <div className="space-y-4">
                {Object.entries(iconCategories).map(([category, icons]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-8 gap-1.5">
                      {Object.entries(icons).map(([name, Icon]) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            onChange(name);
                            setOpen(false);
                          }}
                          className={cn(
                            "p-2 rounded-lg border-2 transition-all",
                            value === name
                              ? "border-primary bg-primary text-primary-foreground scale-105"
                              : "border-transparent bg-muted/50 hover:border-primary/30 hover:bg-primary/5"
                          )}
                          title={name}
                        >
                          <Icon className="w-4 h-4 mx-auto" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show filtered flat view
              <div className="grid grid-cols-8 gap-1.5">
                {filteredIcons.map(([name, Icon]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all",
                      value === name
                        ? "border-primary bg-primary text-primary-foreground scale-105"
                        : "border-transparent bg-muted/50 hover:border-primary/30 hover:bg-primary/5"
                    )}
                    title={name}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            )}
            
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada icon ditemukan</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-2 border-t bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            {allIconNames.length} icon tersedia
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
    return Object.entries(allIcons).filter(([name]) =>
      name.toLowerCase().includes(searchLower)
    );
  }, [search]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
        {filteredIcons.map(([name, Icon]) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              "p-2 rounded-lg border-2 transition-all",
              value === name
                ? "border-primary bg-primary text-primary-foreground scale-105"
                : "border-transparent bg-background hover:border-primary/30 hover:bg-primary/5"
            )}
            title={name}
          >
            <Icon className="w-5 h-5 mx-auto" />
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
