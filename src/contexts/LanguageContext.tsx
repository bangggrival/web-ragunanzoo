import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getText: (textId: string | null | undefined, textEn: string | null | undefined, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Static translations for UI elements
const translations: Record<Language, Record<string, string>> = {
  id: {
    // Common
    'welcome': 'Selamat Datang',
    'see_map': 'Lihat Peta',
    'buy_tickets': 'Beli Tiket',
    'see_schedule': 'Lihat Jadwal',
    'close': 'Tutup',
    'understand': 'Mengerti',
    'announcement': 'Pengumuman',
    'back': 'Kembali',
    'share': 'Bagikan',
    'loading': 'Memuat...',
    'not_found': 'Tidak ditemukan',
    'view_all': 'Lihat Semua',
    'see_all': 'Lihat Semua',
    'save': 'Simpan',
    'cancel': 'Batal',
    'edit': 'Edit',
    'delete': 'Hapus',
    'add': 'Tambah',
    'search': 'Cari',
    'all': 'Semua',
    'clear_filters': 'Hapus filter',
    'showing': 'Menampilkan',
    
    // Navigation
    'home': 'Beranda',
    'map': 'Peta',
    'animals': 'Satwa',
    'flora': 'Flora',
    'tickets': 'Tiket',
    'events': 'Jadwal',
    'profile': 'Profil',
    'scan': 'Scan',
    
    // Explorer Home
    'today_at_ragunan': 'Hari Ini di Ragunan',
    'featured_animals': 'Highlight Satwa',
    'latest_news': 'Berita Terbaru',
    'upcoming_events': 'Event Mendatang',
    'view_all_news': 'Lihat Semua Berita',
    'view_all_animals': 'Lihat Semua Satwa',
    'view_all_events': 'Lihat Semua Event',
    
    // Weather
    'sunny': 'Cerah',
    'cloudy': 'Berawan',
    'rainy': 'Hujan',
    'partly_cloudy': 'Berawan Sebagian',
    
    // News
    'related_news': 'Berita Terkait',
    'published_on': 'Dipublikasikan pada',
    'no_news': 'Belum ada berita',
    
    // Events
    'feeding_time': 'Feeding Time',
    'education': 'Edukasi',
    'show': 'Pertunjukan',
    
    // Animals
    'conservation_status': 'Status Konservasi',
    'habitat': 'Habitat',
    'zone': 'Zona',
    
    // Tickets
    'book_now': 'Pesan Sekarang',
    'visit_date': 'Tanggal Kunjungan',
    'quantity': 'Jumlah',
    'total': 'Total',
    
    // Profile
    'my_profile': 'Profil Saya',
    'logout': 'Keluar',
    'login': 'Masuk',
    'register': 'Daftar',

    // Flora Page
    'flora_collection': 'Koleksi Flora',
    'explore_plants': 'Jelajahi tanaman di Taman Margasatwa Ragunan',
    'explore_by_category': 'Jelajahi per Kategori',
    'search_plants': 'Cari tanaman...',
    'name_az': 'Nama (A-Z)',
    'popularity': 'Popularitas',
    'plants': 'tanaman',
    'featured': 'Unggulan',
    'no_plants_found': 'Tanaman tidak ditemukan',
    'take_quiz': 'Ikuti Kuis',
    'test_knowledge': 'Uji Pengetahuanmu!',
    
    // Quiz
    'quiz': 'Kuis',
    'generating_quiz': 'Membuat pertanyaan kuis...',
    'no_quiz_available': 'Kuis untuk kategori ini belum tersedia.',
    'did_you_know': 'Tahukah kamu?',
    'next_question': 'Pertanyaan Berikutnya',
    'see_results': 'Lihat Hasil',
    'quiz_complete': 'Kuis Selesai!',
    'play_again': 'Main Lagi',
    
    // Events Page
    'schedule_events': 'Jadwal & Acara',
    'dont_miss_events': 'Jangan lewatkan kegiatan seru di Ragunan',
    'no_events_filter': 'Tidak ada acara yang sesuai filter',
    'date_not_set': 'Tanggal belum ditentukan',
    'ticket_booking': 'Pemesanan Tiket',
    
    // Services Page
    'services': 'Layanan',
    'public_services': 'Layanan Publik',
    
    // Service Standards Page
    'service_standards': 'Standar Pelayanan',
    'service_standards_subtitle': 'Informasi standar pelayanan publik untuk menjamin transparansi dan akuntabilitas',
    'requirements': 'Persyaratan',
    'procedure': 'Prosedur/SOP',
    'duration': 'Waktu Penyelesaian',
    'cost': 'Biaya',
    'complaint_mechanism': 'Mekanisme Pengaduan',
    'no_service_standards': 'Belum ada standar pelayanan',
    'no_service_standards_desc': 'Standar pelayanan akan ditampilkan di sini',
  },
  en: {
    // Common
    'welcome': 'Welcome',
    'see_map': 'View Map',
    'buy_tickets': 'Buy Tickets',
    'see_schedule': 'View Schedule',
    'close': 'Close',
    'understand': 'Got it',
    'announcement': 'Announcement',
    'back': 'Back',
    'share': 'Share',
    'loading': 'Loading...',
    'not_found': 'Not found',
    'view_all': 'View All',
    'see_all': 'See All',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'add': 'Add',
    'search': 'Search',
    'all': 'All',
    'clear_filters': 'Clear filters',
    'showing': 'Showing',
    
    // Navigation
    'home': 'Home',
    'map': 'Map',
    'animals': 'Animals',
    'flora': 'Flora',
    'tickets': 'Tickets',
    'events': 'Schedule',
    'profile': 'Profile',
    'scan': 'Scan',
    
    // Explorer Home
    'today_at_ragunan': 'Today at Ragunan',
    'featured_animals': 'Featured Animals',
    'latest_news': 'Latest News',
    'upcoming_events': 'Upcoming Events',
    'view_all_news': 'View All News',
    'view_all_animals': 'View All Animals',
    'view_all_events': 'View All Events',
    
    // Weather
    'sunny': 'Sunny',
    'cloudy': 'Cloudy',
    'rainy': 'Rainy',
    'partly_cloudy': 'Partly Cloudy',
    
    // News
    'related_news': 'Related News',
    'published_on': 'Published on',
    'no_news': 'No news yet',
    
    // Events
    'feeding_time': 'Feeding Time',
    'education': 'Education',
    'show': 'Show',
    
    // Animals
    'conservation_status': 'Conservation Status',
    'habitat': 'Habitat',
    'zone': 'Zone',
    
    // Tickets
    'book_now': 'Book Now',
    'visit_date': 'Visit Date',
    'quantity': 'Quantity',
    'total': 'Total',
    
    // Profile
    'my_profile': 'My Profile',
    'logout': 'Logout',
    'login': 'Login',
    'register': 'Register',

    // Flora Page
    'flora_collection': 'Flora Collection',
    'explore_plants': 'Explore the plants of Ragunan Zoo',
    'explore_by_category': 'Explore by Category',
    'search_plants': 'Search plants...',
    'name_az': 'Name (A-Z)',
    'popularity': 'Popularity',
    'plants': 'plants',
    'featured': 'Featured',
    'no_plants_found': 'No plants found',
    'take_quiz': 'Take Quiz',
    'test_knowledge': 'Test Your Knowledge!',
    
    // Quiz
    'quiz': 'Quiz',
    'generating_quiz': 'Generating quiz questions...',
    'no_quiz_available': 'No quiz available for this category yet.',
    'did_you_know': 'Did you know?',
    'next_question': 'Next Question',
    'see_results': 'See Results',
    'quiz_complete': 'Quiz Complete!',
    'play_again': 'Play Again',
    
    // Events Page
    'schedule_events': 'Schedule & Events',
    'dont_miss_events': 'Don\'t miss the exciting activities at Ragunan',
    'no_events_filter': 'No events match the filter',
    'date_not_set': 'Date not set',
    'ticket_booking': 'Ticket Booking',
    
    // Services Page
    'services': 'Services',
    'public_services': 'Public Services',
    
    // Service Standards Page
    'service_standards': 'Service Standards',
    'service_standards_subtitle': 'Public service standards information to ensure transparency and accountability',
    'requirements': 'Requirements',
    'procedure': 'Procedure/SOP',
    'duration': 'Processing Time',
    'cost': 'Cost',
    'complaint_mechanism': 'Complaint Mechanism',
    'no_service_standards': 'No service standards yet',
    'no_service_standards_desc': 'Service standards will be displayed here',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'id') {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('lang', language);
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translate using static translations
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Get text from database fields (multilingual content)
  const getText = (textId: string | null | undefined, textEn: string | null | undefined, fallback: string = ''): string => {
    if (language === 'en') {
      return textEn || textId || fallback;
    }
    return textId || textEn || fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
