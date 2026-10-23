"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  PawPrint, 
  Leaf, 
  Calendar, 
  Newspaper, 
  Ticket, 
  FileText, 
  Map, 
  Settings, 
  ExternalLink,
  Users,
  Building2,
  Megaphone,
  BookOpen,
  History,
  Activity,
  Bot,
  MessageCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  path: string;
  icon: any;
  keywords?: string[];
  isExternal?: boolean;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Utama
  { id: 'dash', title: 'Dashboard Utama', category: 'Utama', path: '/manager', icon: Activity, keywords: ['beranda', 'home', 'ringkasan', 'statistik'] },
  { id: 'analytics', title: 'Website Analytics & Trafik', category: 'Utama', path: '/manager/website-analytics', icon: Activity, keywords: ['pengunjung', 'tayangan', 'statistik', 'grafik'] },
  
  // Konten
  { id: 'animals', title: 'Kelola Data Satwa (Fauna)', category: 'Konten', path: '/manager/animals', icon: PawPrint, keywords: ['hewan', 'spesies', 'fauna', 'mamalia', 'burung', 'reptil'] },
  { id: 'plants', title: 'Kelola Data Flora & Pohon', category: 'Konten', path: '/manager/plants', icon: Leaf, keywords: ['tanaman', 'pohon', 'konservasi', 'flora', 'tumbuhan'] },
  { id: 'feeding', title: 'Jadwal Makan Satwa (Feeding)', category: 'Konten', path: '/manager/feeding-schedules', icon: PawPrint, keywords: ['makan', 'jadwal', 'keeper', 'nutrisi'] },
  { id: 'events', title: 'Jadwal & Acara Publik', category: 'Konten', path: '/manager/events', icon: Calendar, keywords: ['atraksi', 'event', 'show', 'pertunjukan'] },
  { id: 'categories', title: 'Kategori Satwa & Flora', category: 'Konten', path: '/manager/categories', icon: PawPrint, keywords: ['kelompok', 'klasifikasi', 'ordo', 'famili'] },
  { id: 'news', title: 'Berita & Artikel Publik', category: 'Konten', path: '/manager/news', icon: Newspaper, keywords: ['artikel', 'rilis', 'berita', 'kabar'] },
  { id: 'announcements', title: 'Pengumuman Penting', category: 'Komunikasi', path: '/manager/announcements', icon: Megaphone, keywords: ['notifikasi', 'informasi', 'pemberitahuan'] },
  { id: 'trivia', title: 'Kuis & Trivia Edukasi', category: 'Konten', path: '/manager/trivia', icon: HelpCircle, keywords: ['game', 'edukasi', 'pertanyaan', 'kuis'] },
  { id: 'venues', title: 'Sewa Tempat & Venue', category: 'Konten', path: '/manager/venues', icon: Building2, keywords: ['lokasi', 'sewa', 'gedung', 'lapangan'] },
  { id: 'library', title: 'Perpustakaan Digital', category: 'Konten', path: '/manager/library', icon: BookOpen, keywords: ['buku', 'jurnal', 'katalog', 'pustaka'] },
  { id: 'jdih', title: 'JDIH Dokumen Hukum', category: 'Konten', path: '/manager/jdih', icon: FileText, keywords: ['hukum', 'regulasi', 'peraturan', 'sk'] },
  { id: 'tickets', title: 'Tarif & Tiket Masuk', category: 'Sistem', path: '/manager/tickets', icon: Ticket, keywords: ['harga', 'jakcard', 'wahana', 'biaya'] },
  { id: 'ticket-content', title: 'Ketentuan & Info Tiket', category: 'Konten', path: '/manager/ticket-content', icon: Ticket, keywords: ['panduan', 'syarat', 'tata cara'] },
  { id: 'custom-pages', title: 'Halaman Kustom Website', category: 'Konten', path: '/manager/custom-pages', icon: FileText, keywords: ['page', 'konten dinamis', 'html'] },
  { id: 'history', title: 'Sejarah Ragunan Zoo', category: 'Konten', path: '/manager/history', icon: History, keywords: ['timeline', 'sejarah', 'raden saleh', 'cikini'] },

  // Peta & Tampilan
  { id: 'map', title: 'Peta Interaktif Kebun Binatang', category: 'Peta', path: '/manager/map', icon: Map, keywords: ['denah', 'lokasi', 'gis', 'gps'] },
  { id: 'map-markers', title: 'Marker Titik & Zona Peta', category: 'Peta', path: '/manager/map-markers', icon: Map, keywords: ['titik', 'pin', 'posisi', 'koordinat'] },
  { id: 'gps-map', title: 'Peta GPS Interaktif (Leaflet)', category: 'Peta', path: '/manager/gps-map', icon: Map, keywords: ['gps', 'leaflet', 'poi', 'satwa', 'fasilitas', 'tram', 'rute', 'jalur'] },
  { id: 'hero-banner', title: 'Hero Banner Depan', category: 'Tampilan', path: '/manager/hero-banner', icon: Sparkles, keywords: ['slide', 'gambar utama', 'carousel'] },
  { id: 'branding', title: 'Branding & Logo Website', category: 'Tampilan', path: '/manager/branding', icon: Settings, keywords: ['warna', 'logo', 'favicon', 'identitas'] },

  // Komunikasi & Layanan
  { id: 'chatbot', title: 'FAQ & Tanya Jawab Chatbot', category: 'Komunikasi', path: '/manager/chatbot-faqs', icon: Bot, keywords: ['ai', 'bot', 'jawaban', 'otomatis'] },
  { id: 'wa-templates', title: 'Template Pesan WhatsApp', category: 'Komunikasi', path: '/manager/whatsapp-templates', icon: MessageCircle, keywords: ['wa', 'chat', 'template', 'respon'] },
  { id: 'registrations', title: 'Permohonan PKL & Riset', category: 'Sistem', path: '/manager/service-registrations', icon: FileText, keywords: ['magang', 'penelitian', 'kampus', 'mahasiswa'] },
  { id: 'wbs', title: 'Laporan WBS (Whistleblowing)', category: 'Sistem', path: '/manager/wbs', icon: Megaphone, keywords: ['aduan', 'laporan', 'pengaduan', 'pelanggaran'] },
  { id: 'users', title: 'Manajemen Pengguna & Staf', category: 'Sistem', path: '/manager/users', icon: Users, keywords: ['admin', 'staff', 'role', 'akses'] },
  { id: 'system-configs', title: 'Konfigurasi Sistem & Cache', category: 'Sistem', path: '/manager/system-configs', icon: Settings, keywords: ['maintenance', 'pengaturan', 'mode', 'backup'] },

  // Quick Action Explorer
  { id: 'public-site', title: 'Lihat Website Publik Ragunan', category: 'Aksi Cepat', path: '/fauna', icon: ExternalLink, keywords: ['portal', 'pengunjung', 'explorer'], isExternal: true },
];

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items based on search query
  const filteredItems = COMMAND_ITEMS.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((item: CommandItem) => {
    onClose();
    if (item.isExternal) {
      window.open(item.path, '_blank');
    } else {
      router.push(item.path);
    }
  }, [onClose, router]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari modul atau aksi (misal: Satwa, Tiket, WBS, Peta)..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-[10px] font-bold text-muted-foreground">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all",
                    isSelected 
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold translate-x-1" 
                      : "text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                      isSelected 
                        ? "bg-emerald-500 text-white shadow-sm" 
                        : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                        Tekan Enter <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-500" />
              <p className="text-sm font-medium">Tidak ada modul yang cocok dengan &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Coba kata kunci lain seperti &quot;satwa&quot;, &quot;flora&quot;, atau &quot;tiket&quot;</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[10px]">↓</kbd>
              Navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[10px]">↵</kbd>
              Pilih
            </span>
          </div>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ragunan Zoo Manager</span>
        </div>
      </div>
    </div>
  );
}
