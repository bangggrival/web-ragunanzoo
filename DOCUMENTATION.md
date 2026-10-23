# 🦁 Ragunan Zoo Web Application

## Dokumentasi Project

Aplikasi web untuk Taman Margasatwa Ragunan dengan dua mode utama: **Explorer** (untuk pengunjung) dan **Manager** (untuk admin/staf).

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Struktur Project](#struktur-project)
4. [Database Schema](#database-schema)
5. [Storage Buckets](#storage-buckets)
6. [Edge Functions](#edge-functions)
7. [Fitur Aplikasi](#fitur-aplikasi)
8. [Komponen Utama](#komponen-utama)
9. [Routing](#routing)
10. [Autentikasi & Roles](#autentikasi--roles)
11. [API Abstraction Layer](#api-abstraction-layer) ⭐ NEW
12. [Integrasi Supabase](#integrasi-supabase)
13. [Panduan Deployment](#panduan-deployment) ⭐ NEW
14. [Cara Menjalankan](#cara-menjalankan)
15. [Catatan Pengembangan](#catatan-pengembangan-selanjutnya)

---

## Overview

Ragunan Zoo Web adalah aplikasi web modern untuk Taman Margasatwa Ragunan yang menyediakan:

- **Mode Explorer**: Aplikasi mobile-first untuk pengunjung dengan fitur peta, informasi satwa, pembelian tiket, jadwal acara, donasi, dan QR scanner.
- **Mode Manager**: Dashboard admin untuk mengelola data satwa, tiket, acara, donasi, sewa tempat, branding, dan pengguna.

### Desain

- **Explorer Mode**: Warna hijau cerah (#4CAF50) dengan nuansa oranye (#FF9800), desain playful dan mobile-friendly
- **Manager Mode**: Warna hijau tua (#1B5E20) dengan abu-abu (#ECEFF1) dan biru (#2196F3), desain profesional untuk dashboard

---

## Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **Next.js 16** | Frontend framework (App Router, Turbopack, Standalone Output) |
| **React 19** | UI components & concurrent rendering |
| **TypeScript** | Static typing & type safety |
| **Express.js (Node.js 20+)** | Backend REST API & authentication server |
| **PostgreSQL 14+** | Relational Database Management System |
| **Tailwind CSS** | Design system, token styling & `.ease-spring` micro-animations |
| **shadcn/ui & Radix UI** | Accessible UI primitives |
| **TanStack Query** | Data fetching, caching & state synchronization |
| **Three.js / React Three Fiber** | 3D visual rendering satwa |
| **Lucide React** | Modern iconography |
| **Recharts** | Interactive charts & analytics dashboard |
| **html5-qrcode & qrcode.react** | QR code scanning & generator |
| **Helmet & Rate Limit** | HTTP headers protection & anti-brute force |
| **Magic Bytes Validator** | Binary inspection anti-polyglot/file spoofing |
| **Docker & Docker Compose** | Multi-container production deployment |

---

## Struktur Project

```
src/
├── assets/                    # Gambar dan media
│   ├── animals/              # Foto satwa
│   ├── hero-banner.jpg
│   ├── explorer-hero-bg.jpg
│   └── tiger-mascot.png
│
├── components/
│   ├── ar/                   # Komponen AR/3D
│   │   └── ARViewer.tsx
│   ├── audio/                # Audio player
│   │   └── AnimalAudioPlayer.tsx
│   ├── layouts/              # Layout components
│   │   ├── ExplorerLayout.tsx
│   │   └── ManagerLayout.tsx
│   ├── modals/               # Modal dialogs
│   │   ├── AnimalFormModal.tsx
│   │   ├── DonationFormModal.tsx
│   │   ├── EventFormModal.tsx
│   │   └── VenueFormModal.tsx      # NEW: Form sewa tempat
│   ├── qr/                   # QR Code components
│   │   ├── QRScanner.tsx
│   │   ├── QRCodeGenerator.tsx
│   │   └── QRCodeBulkGenerator.tsx
│   ├── ui/                   # shadcn/ui components
│   │   ├── skeleton.tsx      # Loading skeletons dengan shimmer
│   │   ├── StatCard.tsx
│   │   └── ... (shadcn components)
│   ├── NavLink.tsx
│   └── ProtectedRoute.tsx
│
├── hooks/                    # Custom React hooks
│   ├── useAnimals.ts         # CRUD satwa
│   ├── useAuth.tsx           # Authentication
│   ├── useDashboardStats.ts  # Dashboard statistics
│   ├── useDonations.ts       # CRUD donasi
│   ├── useEvents.ts          # CRUD events
│   ├── useReminders.ts       # Event reminders
│   ├── useSiteSettings.ts    # NEW: Site branding settings
│   ├── useTickets.ts         # CRUD tiket
│   ├── useVenues.ts          # NEW: CRUD sewa tempat
│   └── useWeather.ts         # Weather API
│
├── integrations/
│   └── supabase/
│       ├── client.ts         # Supabase client (auto-generated)
│       └── types.ts          # Database types (auto-generated)
│
├── pages/
│   ├── explorer/             # Halaman mode Explorer
│   │   ├── ExplorerHome.tsx  # Homepage pengunjung (dynamic images)
│   │   ├── Animals.tsx       # Daftar satwa
│   │   ├── AnimalDetail.tsx  # Detail satwa
│   │   ├── Map.tsx           # Peta interaktif
│   │   ├── Tickets.tsx       # Pembelian tiket
│   │   ├── Events.tsx        # Jadwal acara
│   │   ├── Venues.tsx        # NEW: Katalog sewa tempat pengunjung
│   │   ├── Donate.tsx        # Halaman donasi
│   │   ├── Gallery3D.tsx     # Galeri 3D
│   │   ├── QRScan.tsx        # QR Scanner
│   │   └── Profile.tsx       # Profil pengguna
│   │
│   ├── manager/              # Halaman mode Manager
│   │   ├── Dashboard.tsx     # Dashboard admin
│   │   ├── ManageAnimals.tsx # Kelola satwa
│   │   ├── ManageBranding.tsx # NEW: Kelola logo/gambar
│   │   ├── ManageDonations.tsx # Kelola donasi
│   │   ├── ManageEvents.tsx  # Kelola events
│   │   ├── ManageTickets.tsx # Kelola tiket
│   │   ├── ManageUsers.tsx   # Kelola users
│   │   └── ManageVenues.tsx  # NEW: Kelola sewa tempat
│   │
│   ├── Auth.tsx              # Login/Register
│   ├── Index.tsx             # Landing page
│   └── NotFound.tsx          # 404 page
│
├── App.tsx                   # Root component & routing
├── main.tsx                  # Entry point
└── index.css                 # Global styles & CSS variables

supabase/
├── config.toml               # Supabase configuration
└── functions/
    └── get-weather/          # Edge function untuk cuaca
        └── index.ts
```

---

## Database Schema

### Enum Types

```sql
CREATE TYPE public.app_role AS ENUM ('visitor', 'staff', 'admin');
```

### Tables

#### `animals`
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key (auto-increment) |
| name | text | Nama satwa (required) |
| latin_name | text | Nama latin |
| species | text | Spesies |
| description | text | Deskripsi |
| image_url | text | URL gambar |
| model_url | text | URL model 3D |
| audio_url | text | URL audio suara |
| location | text | Lokasi kandang |
| zone | text | Zona kebun binatang |
| habitat | text | Habitat alami |
| status | text | Status konservasi (default: 'Dilindungi') |
| health_status | text | Status kesehatan (default: 'Sehat') |
| is_featured | boolean | Tampil di homepage (default: false) |
| latitude | double | Koordinat latitude |
| longitude | double | Koordinat longitude |
| created_at | timestamp | Waktu dibuat |

#### `events`
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| title | text | Judul acara (required) |
| description | text | Deskripsi |
| event_date | date | Tanggal acara |
| time | text | Waktu acara |
| type | text | Tipe (feeding/show/education) |
| location | text | Lokasi |
| zone | text | Zona |
| created_at | timestamp | Waktu dibuat |

#### `tickets`
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| user_id | uuid | Foreign key ke auth.users (required) |
| code | text | Kode tiket (auto-generated) |
| ticket_type | text | Tipe tiket (default: 'regular') |
| visit_date | date | Tanggal kunjungan (required) |
| quantity | integer | Jumlah tiket (default: 1) |
| price | numeric | Harga satuan (required) |
| total | numeric | Total harga (required) |
| status | text | Status tiket (default: 'active') |
| created_at | timestamp | Waktu dibuat |

#### `donations`
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| user_id | uuid | Foreign key ke auth.users (required) |
| animal_id | integer | Foreign key ke animals |
| amount | numeric | Jumlah donasi (required) |
| donor_name | text | Nama donatur |
| message | text | Pesan |
| created_at | timestamp | Waktu dibuat |

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (sama dengan auth.users.id) |
| email | text | Email |
| name | text | Nama |
| child_mode | boolean | Mode anak (default: false) |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu update |

#### `user_roles`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key ke auth.users (required, unique) |
| role | app_role | Role (default: 'visitor') |

#### `reminders`
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| user_id | uuid | Foreign key ke auth.users (required) |
| event_id | integer | Foreign key ke events (required) |
| created_at | timestamp | Waktu dibuat |

#### `venues` (NEW)
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| name | text | Nama tempat (required) |
| description | text | Deskripsi |
| capacity | integer | Kapasitas orang |
| price_per_hour | numeric(12,2) | Harga per jam |
| price_per_day | numeric(12,2) | Harga per hari |
| image_url | text | URL gambar tempat |
| facilities | text[] | Array fasilitas (AC, Proyektor, dll) |
| is_available | boolean | Tersedia untuk disewa (default: true) |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu update |

#### `site_settings` (NEW)
| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (default: 'main') |
| logo_url | text | URL logo/maskot navbar |
| hero_image_url | text | URL gambar hero banner |
| mascot_image_url | text | URL gambar maskot harimau |
| site_name | text | Nama situs (default: 'Taman Margasatwa Ragunan') |
| updated_at | timestamp | Waktu update |
| updated_by | uuid | User yang terakhir update |

### Database Functions

| Function | Description |
|----------|-------------|
| `has_role(user_id, role)` | Cek apakah user memiliki role tertentu |
| `get_user_role(user_id)` | Ambil role user |
| `handle_new_user()` | Trigger saat user baru register (buat profile & role visitor) |
| `generate_ticket_code()` | Generate kode tiket otomatis (format: TKT-XXXXXX-YYMMDD) |
| `update_updated_at_column()` | Update timestamp otomatis |

### RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| animals | Public | Staff/Admin | Staff/Admin | Admin only |
| events | Public | Staff/Admin | Staff/Admin | Admin only |
| tickets | Own + Staff/Admin | Own | ❌ | ❌ |
| donations | Own + Staff/Admin | Own | ❌ | ❌ |
| profiles | Own | Own | Own | ❌ |
| user_roles | Own | ❌ | ❌ | ❌ |
| reminders | Own | Own | ❌ | Own |
| venues | Public | Staff/Admin | Staff/Admin | Staff/Admin |
| site_settings | Public | Admin | Admin | ❌ |

---

## Storage Buckets

| Bucket | Public | Description | Access |
|--------|--------|-------------|--------|
| `animal-models` | ✅ | File model 3D satwa (.glb, .gltf) | Public read |
| `animal-audio` | ✅ | File audio suara satwa (.mp3) | Public read |
| `venue-images` | ✅ | Gambar tempat sewa | Staff/Admin upload |
| `branding` | ✅ | Logo, hero banner, maskot | Admin upload |

---

## Edge Functions

### `get-weather`
Mengambil data cuaca realtime dari Open-Meteo API untuk koordinat Ragunan Zoo.

**Features:**
- Retry logic dengan exponential backoff (3x percobaan)
- Timeout 10 detik per request
- Fallback data jika API gagal
- Mapping weather code ke deskripsi bahasa Indonesia

**Endpoint:** `GET /functions/v1/get-weather`

**Response:**
```json
{
  "temperature": 28,
  "humidity": 75,
  "windSpeed": 5,
  "description": "Berawan",
  "icon": "cloud",
  "location": "Taman Margasatwa Ragunan",
  "coordinates": { "latitude": -6.3025, "longitude": 106.8274 },
  "lastUpdated": "2026-01-24T13:00:00.000Z",
  "isFallback": false
}
```

---

## Fitur Aplikasi

### 🌿 Mode Explorer (Pengunjung)

| Fitur | Deskripsi | Route |
|-------|-----------|-------|
| **Homepage** | Cuaca realtime, satwa unggulan, event hari ini | `/explorer` |
| **Satwa & Edukasi** | Daftar satwa dengan search & filter | `/explorer/animals` |
| **Detail Satwa** | Info satwa, AR viewer, audio suara | `/explorer/animals/:id` |
| **Peta Interaktif** | Peta kebun binatang dengan marker | `/explorer/map` |
| **Tiket** | Pembelian tiket dengan pilihan tipe & tanggal | `/explorer/tickets` |
| **Jadwal & Acara** | Daftar event dengan filter kategori | `/explorer/events` |
| **Sewa Tempat** | Katalog venue tersedia untuk disewa | `/explorer/venues` |
| **Donasi** | Donasi untuk satwa pilihan | `/explorer/donate` |
| **Galeri 3D** | Tampilan model 3D satwa | `/explorer/gallery-3d` |
| **QR Scanner** | Scan QR di kandang untuk info satwa | `/explorer/qr-scan` |
| **Profil** | Info user, riwayat tiket | `/explorer/profile` |

### 👔 Mode Manager (Admin/Staf)

| Fitur | Deskripsi | Route | Access |
|-------|-----------|-------|--------|
| **Dashboard** | Statistik, grafik penjualan, agenda hari ini | `/manager` | Staff/Admin |
| **Kelola Satwa** | CRUD satwa, generate QR code | `/manager/animals` | Staff/Admin |
| **Kelola Tiket** | Lihat semua tiket | `/manager/tickets` | Staff/Admin |
| **Kelola Events** | CRUD jadwal acara | `/manager/events` | Staff/Admin |
| **Sewa Tempat** | CRUD katalog venue dengan harga & fasilitas | `/manager/venues` | Staff/Admin |
| **Kelola Donasi** | Lihat semua donasi | `/manager/donations` | Staff/Admin |
| **Kelola Users** | Lihat pengguna & roles | `/manager/users` | Staff/Admin |
| **Branding** | Edit logo, hero banner, maskot | `/manager/branding` | Admin only |

---

## Komponen Utama

### Layouts

```tsx
// ExplorerLayout.tsx - Layout untuk mode pengunjung
// - Header dengan navigasi desktop (pill tabs)
// - Bottom navigation untuk mobile
// - Dynamic logo dari site_settings
// - Outlet untuk nested routes

// ManagerLayout.tsx - Layout untuk mode admin
// - Tab navigation dengan icons
// - Header dengan user info
// - Mobile sidebar menu
// - Responsive design
```

### QR Code Components

```tsx
// QRScanner.tsx - Scanner QR code menggunakan kamera
// - Akses kamera device (preferensi back camera)
// - Parse URL/ID satwa
// - Navigate ke detail satwa
// - experimentalFeatures.useBarCodeDetectorIfSupported untuk iOS Safari

// QRCodeGenerator.tsx - Generate QR untuk satu satwa
// - Preview QR code
// - Download PNG
// - Print

// QRCodeBulkGenerator.tsx - Generate QR massal
// - Pilih multiple satwa
// - Preview grid
// - Print semua sekaligus
```

### Protected Route

```tsx
// ProtectedRoute.tsx
// - Cek autentikasi
// - Cek role user (visitor/staff/admin)
// - Redirect ke /auth jika tidak authorized
// Props: allowedRoles: ('visitor' | 'staff' | 'admin')[]
```

### Custom Hooks

```tsx
// useAuth.tsx - Authentication state management
// - user, userRole, loading, signIn, signOut

// useAnimals.ts - CRUD animals
// - animals, loading, error, fetchAnimals

// useSiteSettings.ts - Branding settings
// - settings, loading, updateSettings

// useVenues.ts - CRUD venues
// - venues, loading, fetchVenues

// useWeather.ts - Weather data
// - weather, loading, refetch
```

---

## Routing

```tsx
// Public Routes
/                     → Landing page
/auth                 → Login/Register

// Explorer Routes (Public)
/explorer             → Homepage pengunjung
/explorer/map         → Peta interaktif
/explorer/animals     → Daftar satwa
/explorer/animals/:id → Detail satwa
/explorer/tickets     → Pembelian tiket
/explorer/events      → Jadwal acara
/explorer/venues      → Katalog sewa tempat (pengunjung)
/explorer/donate      → Halaman donasi
/explorer/gallery-3d  → Galeri 3D
/explorer/qr-scan     → QR Scanner
/explorer/profile     → Profil user

// Manager Routes (Protected: staff/admin only)
/manager              → Dashboard
/manager/animals      → Kelola satwa
/manager/tickets      → Kelola tiket
/manager/events       → Kelola events
/manager/venues       → Katalog sewa tempat (NEW)
/manager/donations    → Kelola donasi
/manager/users        → Kelola users
/manager/branding     → Pengaturan branding (NEW, admin only)
```

---

## Autentikasi & Roles

### Roles

| Role | Akses |
|------|-------|
| `visitor` | Mode Explorer saja |
| `staff` | Mode Explorer + Manager (kecuali branding) |
| `admin` | Mode Explorer + Manager + Branding + full CRUD |

### Flow Autentikasi

1. User register → `handle_new_user()` trigger membuat profile & role `visitor`
2. Login → Supabase Auth
3. Cek role → `get_user_role()` atau `has_role()`
4. Route protection → `ProtectedRoute` component

### Cara Assign Role Admin

```sql
-- Cari user_id dari email
SELECT id FROM auth.users WHERE email = 'admin@example.com';

-- Assign role admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-id-here', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

---

## API Abstraction Layer

Project ini menggunakan **API Abstraction Layer** untuk memudahkan migrasi backend dari Supabase ke sistem lain.

### Struktur

```
src/lib/api/
├── index.ts              # Entry point utama
├── types.ts              # Interface definitions untuk semua entities
└── providers/
    └── supabase/         # Implementasi Supabase (saat ini aktif)
        ├── auth.ts       # Authentication & profiles
        ├── animals.ts    # CRUD satwa
        ├── events.ts     # CRUD events
        ├── tickets.ts    # CRUD tiket
        ├── donations.ts  # CRUD donasi
        ├── venues.ts     # CRUD venues
        ├── settings.ts   # Site settings
        └── storage.ts    # File storage
```

### Cara Menggunakan

```tsx
// Import dari API layer (bukan langsung dari supabase client)
import { getAnimals, createAnimal, signIn, uploadFile } from '@/lib/api';

// Semua fungsi mengembalikan format konsisten:
// { data: T | null, error: string | null }
const { data: animals, error } = await getAnimals();
```

### Fungsi yang Tersedia

| Module | Functions |
|--------|-----------|
| **auth** | `getSession()`, `signIn()`, `signUp()`, `signOut()`, `getUserRole()`, `getProfile()`, `updateProfile()` |
| **animals** | `getAnimals()`, `getAnimalById()`, `getFeaturedAnimals()`, `createAnimal()`, `updateAnimal()`, `deleteAnimal()` |
| **events** | `getEvents()`, `getEventById()`, `getUpcomingEvents()`, `createEvent()`, `updateEvent()`, `deleteEvent()` |
| **tickets** | `getTicketsByUser()`, `getAllTickets()`, `getTicketById()`, `createTicket()`, `updateTicketStatus()` |
| **donations** | `getDonationsByUser()`, `getAllDonations()`, `createDonation()`, `getDonationStats()` |
| **venues** | `getVenues()`, `getAvailableVenues()`, `getVenueById()`, `createVenue()`, `updateVenue()`, `deleteVenue()` |
| **settings** | `getSiteSettings()`, `updateSiteSettings()` |
| **storage** | `uploadFile()`, `deleteFile()`, `getPublicUrl()`, `listFiles()` |

### Migrasi ke Backend Lain

Untuk mengganti Supabase ke backend lain (REST API, GraphQL, dll):

1. **Buat folder provider baru:**
   ```
   src/lib/api/providers/rest-api/
   ```

2. **Implementasikan semua fungsi dengan signature yang sama:**
   ```tsx
   // src/lib/api/providers/rest-api/animals.ts
   export async function getAnimals(): Promise<ApiListResponse<Animal>> {
     const response = await fetch('/api/animals');
     const data = await response.json();
     return { data, error: null };
   }
   ```

3. **Ubah import di `src/lib/api/index.ts`:**
   ```tsx
   // Ganti dari:
   export * from './providers/supabase/animals';
   // Menjadi:
   export * from './providers/rest-api/animals';
   ```

4. **Tidak perlu mengubah hooks atau komponen!**

---

## Integrasi Supabase

### Client Setup

```tsx
// src/integrations/supabase/client.ts (auto-generated, jangan edit)
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)
```

### Environment Variables

```env
# Auto-configured by Supabase
VITE_SUPABASE_URL=<supabase_url>
VITE_SUPABASE_PUBLISHABLE_KEY=<anon_key>
VITE_SUPABASE_PROJECT_ID=<project_id>
```

### Files yang Auto-Generated (JANGAN EDIT)

- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `.env`
- `supabase/config.toml`

---

## Cara Menjalankan

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Panduan Deployment

### A. Deploy ke Domain Custom (Tanpa Supabase)

Panduan ini untuk deploy ke server sendiri seperti **jakarta.go.id**.

#### 1. Export Kode dari Proyek ini

```bash
# Via GitHub Integration
1. Settings → GitHub → Connect
2. Create Repository
3. Clone repository ke lokal:
git clone https://github.com/your-repo/ragunan-zoo-web.git
cd ragunan-zoo-web
```

#### 2. Migrasi Database

Buat database PostgreSQL baru dengan skema yang sama:

```sql
-- Jalankan semua migration dari folder supabase/migrations/
-- Buat tabel: animals, events, tickets, donations, profiles, user_roles, reminders, venues, site_settings
-- Buat functions: has_role, get_user_role, handle_new_user, generate_ticket_code
```

#### 3. Ganti Backend Provider

Ikuti panduan di bagian [API Abstraction Layer](#api-abstraction-layer):

1. Buat provider baru di `src/lib/api/providers/rest-api/`
2. Implementasikan semua fungsi dengan endpoint API baru
3. Update import di `src/lib/api/index.ts`

#### 4. Konfigurasi Environment

Buat file `.env.production`:

```env
VITE_API_BASE_URL=https://api.jakarta.go.id/ragunan
VITE_STORAGE_URL=https://storage.jakarta.go.id/ragunan
```

#### 5. Build & Deploy

```bash
# Install dependencies
npm install

# Build untuk production
npm run build

# Output ada di folder 'dist/'
# Upload folder dist ke server
```

#### 6. Konfigurasi Web Server

**Nginx:**
```nginx
server {
    listen 80;
    server_name ragunan.jakarta.go.id;
    root /var/www/ragunan-zoo/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 7. Setup DNS

Di DNS manager domain jakarta.go.id:
```
A     ragunan     <IP_SERVER>
CNAME www.ragunan ragunan.jakarta.go.id
```

### B. Checklist Migrasi Backend

| Step | Task | Status |
|------|------|--------|
| 1 | Export kode via GitHub | ⬜ |
| 2 | Setup PostgreSQL database | ⬜ |
| 3 | Migrasi schema (tabel, functions, triggers) | ⬜ |
| 4 | Migrasi data (jika ada) | ⬜ |
| 5 | Setup file storage (S3/MinIO/lokal) | ⬜ |
| 6 | Buat REST API untuk semua endpoints | ⬜ |
| 7 | Implementasi auth (JWT/session) | ⬜ |
| 8 | Buat provider API baru di `src/lib/api/providers/` | ⬜ |
| 9 | Update environment variables | ⬜ |
| 10 | Build & test | ⬜ |
| 11 | Deploy ke server | ⬜ |
| 12 | Setup SSL (https) | ⬜ |
| 13 | Konfigurasi DNS | ⬜ |

### C. Endpoints API yang Perlu Dibuat

Jika membuat REST API sendiri, berikut endpoints yang diperlukan:

```
# Auth
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session
GET    /api/auth/profile/:userId
PUT    /api/auth/profile/:userId

# Animals
GET    /api/animals
GET    /api/animals/:id
GET    /api/animals/featured
POST   /api/animals          (staff/admin)
PUT    /api/animals/:id      (staff/admin)
DELETE /api/animals/:id      (admin)

# Events
GET    /api/events
GET    /api/events/:id
GET    /api/events/upcoming
POST   /api/events           (staff/admin)
PUT    /api/events/:id       (staff/admin)
DELETE /api/events/:id       (admin)

# Tickets
GET    /api/tickets/user/:userId
GET    /api/tickets          (staff/admin)
GET    /api/tickets/:id
POST   /api/tickets
PUT    /api/tickets/:id/status

# Donations
GET    /api/donations/user/:userId
GET    /api/donations        (staff/admin)
POST   /api/donations
GET    /api/donations/stats

# Venues
GET    /api/venues
GET    /api/venues/available
GET    /api/venues/:id
POST   /api/venues           (staff/admin)
PUT    /api/venues/:id       (staff/admin)
DELETE /api/venues/:id       (staff/admin)

# Site Settings
GET    /api/settings
PUT    /api/settings         (admin)

# Storage
POST   /api/storage/upload
DELETE /api/storage/:bucket/:path
GET    /api/storage/:bucket/:path
```

---

## Panduan Deployment

### 1. Arsitektur Deployment Server Staging & Produksi

Aplikasi menggunakan arsitektur container terisolasi (*Docker Bridge Network*) yang berjalan pada host Ubuntu Server:

- **IP Host Server**: `10.41.20.245` (User: `yaninfo`)
- **Port Frontend (`ragunan-web`)**: `3002` (Next.js 16 Standalone Output)
- **Port Backend API (`ragunan-api`)**: `5005` (Express.js Engine)
- **Database (`ragunan-db`)**: PostgreSQL 14 Alpine (Port internal `5432` terisolasi)
- **Public Remote Access (HTTPS)**: `https://yaninfo.tail14acf1.ts.net:10000` (Tailscale Funnel bersertifikat SSL Let's Encrypt)

```
                            INTERNET / PUBLIK
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼ [HTTPS: 10000]                                  ▼ [HTTP: 3002]
https://yaninfo.tail14acf1.ts.net:10000             http://10.41.20.245:3002
           │                                                 │
           └────────────────────────┬────────────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │     ragunan-web     │ (Next.js 16 Standalone)
                         │  [Port Host: 3002]  │ (Anti-Cache Headers Active)
                         └──────────┬──────────┘
                                    │
                                    │ [Internal Proxy Rewrites: /api/* & /uploads/*]
                                    ▼
                         ┌─────────────────────┐
                         │     ragunan-api     │ (Express.js API Engine)
                         │  [Port Host: 5005]  │ (Helmet, Rate Limit, Magic Bytes)
                         └──────────┬──────────┘
                                    │
                                    │ [Internal Bridge Network: ragunan-internal]
                                    ▼
                         ┌─────────────────────┐
                         │     ragunan-db      │ (PostgreSQL 14 Alpine)
                         │ [Port: 5432 Internal]│ (48 Tabel Skema Lengkap)
                         └─────────────────────┘
```

### 2. Konfigurasi Khusus Staging & Tailscale Funnel

1. **Next.js Image Whitelist ([next.config.mjs](file:///c:/Users/Ahmad%20Rivaldi/.gemini/antigravity-ide/scratch/web-ragunanzoo/next.config.mjs))**:
   Domain `yaninfo.tail14acf1.ts.net` dan wildcard `*.ts.net` terdaftar di `images.remotePatterns` untuk mencegah kegagalan Next.js Image Optimization saat diakses melalui Tailscale.
2. **Anti-Stale Cache ([next.config.mjs](file:///c:/Users/Ahmad%20Rivaldi/.gemini/antigravity-ide/scratch/web-ragunanzoo/next.config.mjs))**:
   Header `Cache-Control: no-cache, no-store, max-age=0, must-revalidate` diterapkan pada seluruh halaman HTML dinamis, memastikan browser pengunjung langsung menampilkan versi terbaru tanpa terjebak browser disk cache.
3. **Container Healthcheck ([Dockerfile](file:///c:/Users/Ahmad%20Rivaldi/.gemini/antigravity-ide/scratch/web-ragunanzoo/Dockerfile))**:
   Menggunakan `http://127.0.0.1:3002` (IPv4) untuk menghindari kegagalan resolusi IPv6 pada Alpine Linux.
4. **Prosedur Migrasi & Restore Database**:
   Seluruh 48 tabel database lokal beserta data terupdate diekspor ke `db_backup.sql` dan diimpor otomatis saat proses deploy:
   ```bash
   # Ekspor lokal
   ./export-data-db.sh
   # Impor ke server
   ./import-data-db.sh 10.41.20.245 yaninfo
   ```

### 3. Skrip Deployment Tersedia

- **`./deploy-to-server.sh`**: Skrip bash otomatis untuk rsync, stop container, import database, build image, dan verifikasi status container.
- **`python scratch/test_tailscale_endpoint.py`**: Skrip verifikasi menyeluruh untuk menguji 12 rute frontend, API probe, database query `/api/db`, asset media proxy `/uploads/`, proteksi SQL injection, dan microservice cuaca via Tailscale Funnel.

---

## Catatan Pengembangan Selanjutnya

### Fitur Baru yang Sudah Ditambahkan

- ✅ Katalog Sewa Tempat dengan CRUD lengkap (Manager)
- ✅ Halaman Katalog Sewa Tempat untuk pengunjung (Explorer)
- ✅ Pengaturan Branding (logo, hero, maskot)
- ✅ Dynamic images di Explorer dari database
- ✅ Weather API dengan retry dan fallback
- ✅ QR Scanner dengan dukungan iOS Safari

### TODO / Potential Improvements

- [ ] Fitur booking/reservasi tempat dengan form tanggal
- [ ] Push notifications untuk event reminder
- [ ] Payment gateway integration untuk tiket & donasi
- [ ] Offline mode dengan service worker (PWA)
- [ ] Multi-language support
- [ ] Analytics dashboard yang lebih detail
- [ ] Export laporan ke PDF/Excel
- [ ] Social media sharing
- [ ] Review & rating satwa
- [ ] Gamification (badges, points)

### Known Issues & Batasan Sistem

- AR Viewer menggunakan model 3D Three.js glTF teroptimasi
- Batas unggahan berkas default 5MB per berkas (dapat disesuaikan di `server/index.js`)
- Diperlukan sertifikat SSL/TLS (HTTPS) pada lingkungan produksi agar fitur kamera QR Scanner dan GPS geolocation dapat diakses oleh browser modern

---

## Tips untuk Pengembangan & Deployment

1. **Struktur Route Next.js**: Tambahkan rute publik di `src/app/(explorer)/` dan rute manajemen staf di `src/app/manager/`.
2. **Edge Route Guarding**: Pengaturan hak akses rute terproteksi dikelola di `src/proxy.ts`.
3. **Desain & Micro-Animations**: Gunakan token semantic color dari `index.css` dan transisi resmi `ease-spring`.
4. **Keamanan Query**: Gunakan parameter sanitasi atau abstraction layer di `src/lib/api.ts` dan hindari penulisan raw SQL di client.
5. **Manajemen Environment**: Selalu pastikan `JWT_SECRET` pada `.env` dan `server/.env` identik dan dibungkus tanda kutip ganda.

---

---

## 🛡️ Audit & Security Hardening (5 Pilar Utama - 2026)

Telah dilakukan audit menyeluruh dan perbaikan komprehensif pada **5 Pilar Utama Arsitektur & Keamanan**:

### 1. Keamanan & Proteksi Kerentanan (Security Hardening)
- **SQL Injection Defense**: Sanitasi ketat parameter `selects` dan validasi regex identifier di `server/queryCompiler.js`. Menghilangkan celah subquery `(SELECT ...)`, `pg_sleep()`, dan komentar SQL.
- **Sensitive Data & Role Isolation**: Tabel `user_roles` dan `user_permissions` diisolasi di `server/index.js` dengan proteksi autentikasi wajib dan filter user context.
- **Next.js Edge Proxy Route Guarding**: `src/proxy.ts` mengimplementasikan verifikasi kriptografis HMAC-SHA256 dengan `crypto.timingSafeEqual` dan verifikasi payload role (`admin`, `staff`, `manager`) sebelum mengizinkan akses ke area internal `/manager`.
- **Upload Whitelisting & Rate Limiting**: Endpoint `/api/storage/upload` membatasi bucket publik (`wbs-evidence`, `facility-reports`) dengan rate limiter ketat (`submissionLimiter`) dan mewajibkan autentikasi JWT untuk bucket internal (`branding`, `venues`, `events`, `flora`, `animals`).
- **CORS & Network Isolation**: Docker Compose memisahkan port PostgreSQL (5432) ke internal bridge network `ragunan-internal` tanpa mengekspos port ke host internet secara terbuka.

### 2. Arsitektur & Kualitas Kode (Architecture & Code Quality)
- **Non-blocking Database Execution**: Menghapus `execSync` yang memblokir Event Loop Node.js pada inisialisasi database di `server/db.js`, digantikan oleh `spawn` asynchronous non-blocking.
- **Secure Cookie Management**: Token JWT diset via HTTP header cookies dengan flag `HttpOnly`, `SameSite=Lax`, dan `Path=/` untuk mencegah token leakage via XSS atau URL query parameters.

### 3. Performa & Optimasi Frontend (Performance & Build Optimization)
- **Standardized Tailwind Easing**: Menghapus peringatan class ambiguous `ease-[cubic-bezier(0.16,1,0.3,1)]` dan mengintegrasikannya ke dalam `tailwind.config.ts` sebagai utility `ease-spring`.
- **Code-Splitting & Dynamic Imports**: Library berat seperti `xlsx` (SheetJS) diimpor secara dinamis (`await import('xlsx')`) hanya saat user mengekspor data Excel, mereduksi bundle size halaman `service-registrations`.

### 4. Dependensi Pihak Ketiga & CVE (Dependency Vulnerabilities)
- **Zero Vulnerabilities Audit**: Dilakukan mitigasi `npm audit fix` pada backend dan frontend. Mengeliminasi celah keamanan berisiko tinggi pada paket eksternal (`jspdf`, `minimatch`, `nanoid`, `postcss`, `sharp`, `ws`) dengan kompatibilitas penuh terhadap React 19 dan Next.js 16.

### 5. Pengujian & Verifikasi Komprehensif (End-to-End Verification)
- TypeScript strict checking lulus (`npx tsc --noEmit` = 0 errors).
- ESLint checks lulus (`npm run lint` = 0 errors).
- Automated audit verification suite lulus 100% (Backend health, SQL injection defense, data leak isolation, Edge proxy authentication, fake token rejection, dan bucket upload protection).

### 🛡️ Phase 2: Enterprise-Grade Advanced Security Hardening (Oktober 2026)
Telah diterapkan pengamanan lapis kedua (*defense-in-depth*) untuk standar enterprise:
1. **BOLA / IDOR Defense on Citizen Services**:
   - Menutup celah kebocoran data pendaftaran warga (`service_registrations`). Non-staff/non-admin wajib menyertakan parameter `tracking_code` valid (`403 Forbidden` jika mencoba dumping seluruh data).
   - Mengunci tabel `wbs_submissions` secara total dari akses non-staff/auditor (`403 Forbidden`).
2. **Realtime SSE Stream Isolation (`/api/realtime`)**:
   - Membatasi broadcast database hanya untuk tabel publik (`animals`, `events`, `flora`, `venues`, `gps_pois`, `tram_route_points`, `ticket_types`, `page_views`).
   - Mencegah kebocoran data sensitif (roles, credentials, laporan WBS, identitas pemohon) ke klien EventStream yang belum diautentikasi.
   - Mengganti wildcard `Access-Control-Allow-Origin: *` dengan origin validation dinamis.
3. **Magic Bytes (Binary File Signature) Validation**:
   - Pengecekan signature biner nyata file pada upload storage (`validateMagicBytes`) untuk JPEG (`\xFF\xD8\xFF`), PNG (`\x89PNG`), WebP (`RIFF...WEBP`), dan PDF (`%PDF`).
   - Otomatis menolak file *spoofed* / *polyglot* (seperti HTML/executable yang menyamar sebagai file `.jpg`).
4. **Session Invalidation & Token Revocation List (Blacklist)**:
   - Mekanisme pembatalan sesi instan saat `POST /api/auth/logout`.
   - Token yang telah di-logout dimasukkan ke dalam daftar revocation list aktif dengan auto-cleanup TTL, sehingga token yang telah dicabut tidak dapat digunakan kembali meskipun masa berlaku JWT belum habis.
5. **Next.js Image Optimizer SSRF Defense**:
   - Menghapus wildcard `hostname: '**'` pada `next.config.mjs` dan menerapkan whitelist ketat domain media resmi Ragunan Zoo, Unsplash, Instagram CDN, QR server, dan Supabase storage.

---

*Dokumentasi ini terakhir diupdate: Oktober 2026 (Phase 1 & Phase 2 Hardening Complete)*


