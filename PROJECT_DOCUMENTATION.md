# Dokumentasi Project: Ragunan Zoo Web Application

## 📋 Ringkasan Project

Aplikasi web untuk **Taman Margasatwa Ragunan** dengan dua mode utama:
1. **Explorer Mode** (`/`) - Antarmuka untuk pengunjung/wisatawan
2. **Manager Mode** (`/manager`) - Dashboard admin untuk pengelolaan konten

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State Management | TanStack React Query |
| Routing | React Router DOM v6 |
| Backend | Supabase |
| Database | PostgreSQL (via Supabase) |
| Authentication | Supabase Auth |
| 3D/AR | React Three Fiber, Three.js |
| QR Code | html5-qrcode, qrcode.react |
| Notifications | Web Push API |

---

## 📁 Struktur Project

```
src/
├── assets/                    # Gambar & asset statis
│   └── animals/               # Gambar satwa
├── components/
│   ├── ar/                    # Komponen AR Viewer
│   ├── audio/                 # Audio player untuk suara satwa
│   ├── explorer/              # Komponen khusus Explorer mode
│   │   ├── AnnouncementPopup.tsx
│   │   ├── FloatingTicketButton.tsx
│   │   ├── HeroCarousel.tsx   # Carousel dengan dukungan video
│   │   ├── WhatsNewCarousel.tsx # ⭐ NEW: Carousel What's New
│   │   └── NewsSection.tsx
│   ├── layouts/
│   │   ├── ExplorerLayout.tsx # Layout untuk pengunjung
│   │   └── ManagerLayout.tsx  # Layout untuk admin
│   ├── map/                   # Komponen peta interaktif
│   ├── modals/                # Form modals (Animal, Event, Venue, dll)
│   ├── notifications/         # Push notification components
│   ├── qr/                    # QR Scanner & Generator
│   ├── search/                # ⭐ NEW: Global Search component
│   │   └── GlobalSearch.tsx
│   └── ui/                    # shadcn/ui components
├── contexts/
│   └── LanguageContext.tsx    # Context untuk multi-bahasa (ID/EN)
├── hooks/
│   ├── useAuth.tsx            # Authentication hook
│   ├── useAnimals.ts          # CRUD satwa
│   ├── useEvents.ts           # CRUD event/jadwal
│   ├── useNews.ts             # CRUD berita
│   ├── useVenues.ts           # CRUD venue
│   ├── useSiteSettings.ts     # Pengaturan branding + carousel duration
│   ├── useGlobalSearch.ts     # ⭐ NEW: Global search hook
│   ├── usePushNotifications.ts # Web push notifications
│   └── ...                    # Hook lainnya
├── lib/
│   └── api/
│       ├── types.ts           # TypeScript interfaces
│       ├── index.ts           # API exports
│       └── providers/
│           └── supabase/      # Supabase provider implementations
├── pages/
│   ├── explorer/              # Halaman mode Explorer
│   │   ├── ExplorerHome.tsx   # Beranda
│   │   ├── Animals.tsx        # Daftar satwa
│   │   ├── AnimalDetail.tsx   # Detail satwa + AR
│   │   ├── Events.tsx         # Jadwal acara
│   │   ├── Map.tsx            # Peta interaktif
│   │   ├── Tickets.tsx        # Pembelian tiket
│   │   ├── Venues.tsx         # Penyewaan tempat
│   │   ├── Donate.tsx         # Donasi
│   │   ├── Gallery3D.tsx      # Galeri 3D
│   │   └── ...
│   └── manager/               # Halaman mode Manager
│       ├── Dashboard.tsx      # Dashboard statistik
│       ├── ManageAnimals.tsx  # Kelola satwa
│       ├── ManageEvents.tsx   # Kelola jadwal
│       ├── ManageNews.tsx     # Kelola berita
│       ├── ManageBranding.tsx # Kelola branding
│       └── ...
└── integrations/
    └── supabase/
        ├── client.ts          # Supabase client (auto-generated)
        └── types.ts           # Database types (auto-generated)
```

---

## 🗄️ Database Schema

### Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `animals` | Data satwa (nama, spesies, zona, gambar, audio, model 3D) |
| `events` | Jadwal acara (feeding, edukasi, show) |
| `news` | Berita/artikel (bilingual ID/EN) |
| `venues` | Tempat sewa (kapasitas, harga, fasilitas) |
| `tickets` | Transaksi tiket pengunjung |
| `donations` | Donasi untuk satwa |
| `announcements` | Popup pengumuman (bilingual) |
| `hero_banner` | Carousel banner beranda (gambar/video) |
| `navbar_items` | Menu navigasi dinamis |
| `zone_markers` | Marker peta interaktif |
| `site_settings` | Pengaturan branding, tampilan, tombol floating, chat us, venue whatsapp |
| `custom_pages` | Halaman kustom CMS |

### Kolom site_settings (Tombol & Kontak)

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `floating_ticket_enabled` | boolean | Toggle tombol tiket |
| `floating_ticket_text_id/en` | text | Teks tombol tiket |
| `floating_ticket_position` | text | Posisi: left/center/right |
| `ticket_external_url` | text | URL tiket eksternal |
| `chat_us_enabled` | boolean | Toggle tombol Chat Us |
| `chat_us_number` | text | Nomor WhatsApp Chat Us |
| `chat_us_position` | text | Posisi tombol Chat Us |
| `venue_whatsapp_number` | text | Nomor WA khusus sewa tempat |
| `custom_pages` | Halaman kustom CMS |

### Tabel Autentikasi

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | Profil pengguna (nama, email) |
| `user_roles` | Role pengguna (visitor, staff, admin) |
| `push_subscriptions` | Langganan push notification |
| `reminders` | Pengingat event pengguna |

### Role-Based Access Control

```sql
-- Enum untuk role
CREATE TYPE app_role AS ENUM ('visitor', 'staff', 'admin');

-- Fungsi helper untuk cek role
CREATE FUNCTION has_role(_user_id uuid, _role app_role) RETURNS boolean
-- Digunakan di RLS policies
```

**Hak Akses:**
- `visitor` - Hanya bisa melihat data publik, membeli tiket, donasi
- `staff` - Bisa mengelola konten (satwa, event, berita)
- `admin` - Akses penuh termasuk kelola user dan pengaturan

---

## 🔐 Autentikasi

### Flow Login
1. User mendaftar/login via `/auth`
2. Supabase Auth memverifikasi credentials
3. Trigger `handle_new_user()` membuat profile & role default (visitor)
4. Session disimpan dan dikelola oleh Supabase

### Protected Routes
```tsx
<Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
  <Route path="/manager/*" element={<ManagerLayout />} />
</Route>
```

---

## 🌐 Multi-Bahasa (i18n)

Sistem mendukung **Bahasa Indonesia** dan **English**.

### Penggunaan
```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const { language, t, getText } = useLanguage();

// Static text
t('navigation.home') // "Beranda" atau "Home"

// Dynamic content dari database
getText(item.title_id, item.title_en, 'Default')
```

### Kolom Database Bilingual
- `title_id` / `title_en`
- `description_id` / `description_en`
- `content_id` / `content_en`

---

## 🔔 Push Notifications

### Setup
1. VAPID keys sudah dikonfigurasi di secrets
2. Service worker: `public/sw.js`
3. Edge function: `supabase/functions/send-push-notification`

### Penggunaan
```tsx
const { subscribe, unsubscribe, isSubscribed } = usePushNotifications();
```

---

## 📦 Storage Buckets

| Bucket | Penggunaan |
|--------|------------|
| `branding` | Logo, maskot, gambar hero |
| `animal-models` | Model 3D satwa (.glb/.gltf) |
| `animal-audio` | Suara satwa (.mp3/.wav) |
| `venue-images` | Gambar venue |
| `news-images` | Gambar berita |
| `hero-images` | Gambar carousel |
| `announcement-images` | Gambar pengumuman |
| `map-images` | Gambar peta |
| `custom-page-images` | Gambar halaman kustom |

---

## 🎨 Design System

### Warna (Explorer Mode)
- Primary: `#3BA776` (Hijau)
- Accent Orange: `#F7941D`
- Accent Blue: `#53B4E6`
- Background: `#FFF6E8` (Krem)

### Warna (Manager Mode)
- Primary: `#1B5E20` (Hijau Tua)
- Background: `#ECEFF1` (Abu-abu)
- Accent: `#2196F3` (Biru)

### Font
- Display: Poppins
- Body: Nunito / Inter

---

## 🚀 Fitur Utama

### Explorer Mode
- [x] Beranda dengan Hero Carousel (Gambar & Video)
- [x] ⭐ What's New Carousel (agregasi konten terbaru)
- [x] ⭐ Global Search multibahasa
- [x] ⭐ Durasi Autoplay Carousel yang dapat dikonfigurasi
- [x] Widget Cuaca real-time
- [x] Daftar & Detail Satwa
- [x] Peta Interaktif dengan zoom & GPS
- [x] Jadwal Event dengan Reminder
- [x] Pembelian Tiket
- [x] Penyewaan Venue (WhatsApp)
- [x] Donasi untuk Satwa
- [x] Galeri 3D & AR View
- [x] QR Code Scanner
- [x] Berita & Artikel
- [x] Push Notifications
- [x] Multi-bahasa (ID/EN)
- [x] ⭐ Tombol Chat Us (WhatsApp) terpisah

### Manager Mode
- [x] Dashboard Statistik
- [x] Kelola Data Satwa (+ Audio & 3D Model)
- [x] Kelola Jadwal Acara
- [x] Kelola Berita
- [x] Kelola Venue
- [x] Kelola Pengumuman
- [x] Kelola Hero Banner (Gambar & Video + Durasi Autoplay)
- [x] Kelola Navigasi Dinamis
- [x] Kelola Marker Peta
- [x] Pengaturan Branding
- [x] Generator QR Code Massal
- [x] Kirim Push Notification
- [x] Manajemen User & Role
- [x] Input Data Pengunjung Harian
- [x] Halaman Kustom (CMS)
- [x] ⭐ Pengaturan Tombol & Kontak (Tiket, Chat Us, Venue WA)
- [x] Kelola Marker Peta
- [x] Pengaturan Branding
- [x] Generator QR Code Massal
- [x] Kirim Push Notification
- [x] Manajemen User & Role
- [x] Input Data Pengunjung Harian
- [x] Halaman Kustom (CMS)

---

## 📝 Edge Functions

| Function | Deskripsi |
|----------|-----------|
| `get-weather` | Ambil data cuaca dari OpenWeather API |
| `send-push-notification` | Kirim notifikasi push ke subscribers |
| `scheduled-event-notifications` | Notifikasi terjadwal untuk event |

---

## 🔧 Environment Variables

```env
VITE_SUPABASE_URL=https://xlomeqfopetubzttrecr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=xlomeqfopetubzttrecr
VITE_VAPID_PUBLIC_KEY=... (untuk push notifications)
```

---

## 📖 Cara Melanjutkan Development

### 1. Clone/Remix Project
- Project ini bisa di-remix langsung dari Proyek ini
- Atau clone dari GitHub jika sudah terkoneksi

### 2. Pahami Struktur
- Baca file ini dan `DOCUMENTATION.md`
- Eksplorasi folder `src/hooks/` untuk business logic
- Eksplorasi `src/pages/` untuk halaman UI

### 3. Database
- Schema tersedia di Supabase types (`src/integrations/supabase/types.ts`)
- RLS policies sudah dikonfigurasi untuk keamanan
- Gunakan migration tool untuk perubahan schema

### 4. Menambah Fitur Baru
1. Buat hook baru di `src/hooks/`
2. Buat komponen di `src/components/`
3. Buat halaman di `src/pages/explorer/` atau `src/pages/manager/`
4. Tambahkan route di `src/App.tsx`
5. Update navigasi jika perlu

### 5. API Abstraction Layer
Project ini menggunakan abstraksi API di `src/lib/api/` untuk memudahkan migrasi backend:
```tsx
// Contoh penggunaan
import { getAnimals, createAnimal } from '@/lib/api';
```

---

## 🐛 Troubleshooting

### RLS Policy Error
- Pastikan user sudah login
- Cek role user di tabel `user_roles`
- Gunakan `has_role()` function untuk policy

### File Upload Gagal
- Cek bucket permissions di Supabase Storage
- Pastikan file size tidak melebihi limit

### Push Notification Tidak Bekerja
- Cek VAPID keys di secrets
- Pastikan service worker ter-register
- Cek browser permissions

---

## 📞 Kontak & Referensi

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

*Dokumentasi ini dibuat untuk memudahkan handover dan pengembangan lanjutan project Ragunan Zoo Web Application.*
