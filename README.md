# 🦁 Taman Margasatwa Ragunan — Web Application

Aplikasi web modern resmi untuk **Taman Margasatwa Ragunan**, dirancang dengan arsitektur micro-service decoupled yang terdiri dari **Portal Explorer** (publik/pengunjung) dan **Portal Manager** (dashboard staf & administrator), didukung oleh backend Express, basis data PostgreSQL, serta sistem keamanan lapis ganda (*Defense-in-Depth*).

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Standalone Output)
- **UI Library**: React 19 & TypeScript
- **Styling**: Vanilla Tailwind CSS & Tailwind Animations (`.ease-spring`)
- **UI Components**: Radix UI / shadcn/ui
- **Media & 3D**: Three.js & React Three Fiber (AR/3D Animals), Lucide Icons, Recharts

### Backend
- **Server**: Express.js (Node.js 20+)
- **Database**: PostgreSQL 14+ dengan Query Compiler & Connection Pooling
- **Storage**: Hybrid File Storage (Local Disk Storage & AWS S3 / MinIO Adapter)
- **Realtime**: Server-Sent Events (SSE) dengan Channel Whitelisting
- **Security**: Helmet, Express Rate Limit, JWT Cryptographic Guard, Magic Bytes Binary Validation, Token Revocation Store

---

## 🛡️ Enterprise Security Hardening (Phase 1 & Phase 2)

Proyek ini telah diaudit dan diperkuat dengan standar keamanan tinggi:
1. **Anti-SQL Injection**: Parsing identifier ketat (`"${col}"`), validasi regex parameter `selects`, dan penolakan subquery/fungsi raw SQL.
2. **Edge Proxy Route Guarding**: Validasi kriptografis HMAC-SHA256 (`crypto.timingSafeEqual`) dan role payload (`admin`, `staff`, `manager`) di Next.js middleware.
3. **BOLA / IDOR Defense**: Perlindungan data pendaftaran warga (`service_registrations`) via `tracking_code`, serta isolasi total laporan aduan WBS (`wbs_submissions`).
4. **Realtime Data Masking**: Penyiaran SSE dibatasi hanya untuk tabel publik (`animals`, `events`, `flora`, dll) dengan proteksi CORS dinamis.
5. **Magic Bytes Validation**: Pengecekan signature biner asli file saat upload untuk mencegah file polyglot / stored XSS.
6. **Token Revocation (Blacklist)**: Pembatalan instan token JWT saat logout dengan pembersihan TTL otomatis.
7. **SSRF Image Protection**: Pembatasan `remotePatterns` Next.js Image Optimizer hanya pada domain media terpercaya.
8. **Network Isolation**: PostgreSQL berjalan di internal Docker bridge network (`ragunan-internal`) tanpa ekspos port publik.

---

## 💻 Panduan Pengembangan Lokal

### Prasyarat
- **Node.js** v20+
- **PostgreSQL** 14+ (lokal atau via container)
- **Git**

### Instalasi & Menjalankan Server

1. **Clone repository**:
   ```bash
   git clone <repo-url> web-ragunanzoo
   cd web-ragunanzoo
   ```

2. **Setup file environment**:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

3. **Install dependensi**:
   ```bash
   # Install dependensi frontend root
   npm install

   # Install dependensi backend
   cd server && npm install && cd ..
   ```

4. **Jalankan aplikasi (Concurrent Backend + Frontend)**:
   ```bash
   npm run dev
   ```

Akses:
- **Frontend Explorer**: [http://localhost:3000](http://localhost:3000)
- **Frontend Manager (Admin)**: [http://localhost:3000/manager](http://localhost:3000/manager)
- **Backend API**: [http://localhost:5005](http://localhost:5005)
- **API Health Check**: [http://localhost:5005/api/health](http://localhost:5005/api/health)

---

## 🐳 Panduan Deploy via Docker

### One-Command Docker Setup
```bash
bash setup-docker.sh
```
Script otomatis akan memeriksa Docker, menyiapkan `.env`, membangun container, dan menunggu database serta API siap.

### Manual Docker Compose
```bash
# Build dan jalankan seluruh container di background
docker compose up -d --build

# Periksa status container
docker compose ps

# Cek logs
docker compose logs -f
```

Ports dan Endpoint Akses:
- **Frontend Lokal Server**: `http://localhost:3000` (atau `http://10.41.20.245:3002` di server staging)
- **Akses Publik Remote**: `https://yaninfo.tail14acf1.ts.net:10000` (Tailscale Funnel SSL)
- **Backend API**: `http://localhost:5005` (atau `http://10.41.20.245:5005`)
- **Database PostgreSQL**: Port 5432 (Internal bridge network `ragunan-internal`, terisolasi dari publik)

---

## 🧪 Pengujian & Verifikasi Kualitas

Proyek dilengkapi dengan test suite otomatis:

```bash
# 1. Jalankan TypeScript Type Checking (0 errors)
npx tsc --noEmit

# 2. Jalankan Linter ESLint (0 errors, 0 warnings)
npm run lint

# 3. Jalankan Automated Audit Verification (Phase 1)
node scratch/verify_audit.mjs

# 4. Jalankan Enterprise Security Verification (Phase 2)
node scratch/verify_phase2.mjs
```

---

## 📂 Struktur Direktori

```
web-ragunanzoo/
├── public/                 # Static assets (images, icons, manifest)
├── server/                 # Express Backend
│   ├── db.js               # PostgreSQL connection pool & async startup
│   ├── queryCompiler.js    # Sanitized SQL compiler & AST parser
│   ├── index.js            # Express API, auth, upload & security middlewares
│   ├── init_database.sql   # PostgreSQL database schema & initial seed
│   ├── uploads/            # Local disk uploads directory
│   └── package.json        # Backend dependencies
├── src/
│   ├── app/                # Next.js 16 App Router
│   │   ├── (explorer)/     # Public visitor portal routes
│   │   ├── manager/        # Protected admin/staff dashboard routes
│   │   └── auth/           # Login / Sign-in route
│   ├── components/         # Reusable React components
│   │   ├── explorer/       # Explorer UI widgets (carousel, feeds, news)
│   │   ├── manager/        # Manager dashboard widgets & tables
│   │   ├── tickets/        # Ticket flow & online booking
│   │   └── ui/             # Radix / shadcn/ui components
│   ├── hooks/              # Custom React hooks (TanStack Query, auth)
│   ├── lib/                # API client abstraction & utilities
│   ├── proxy.ts            # Next.js Edge route guard & HMAC JWT verifier
│   └── index.css           # Design tokens, CSS variables & spring easing
├── Dockerfile              # Multi-stage Next.js production build
├── docker-compose.yml      # Multi-container orchestration (DB, API, Web)
├── DEPLOY.md               # Panduan deployment server production
├── DOCUMENTATION.md        # Dokumentasi arsitektur lengkap
└── SECURITY_DOCUMENTATION.md# Dokumentasi kepatuhan & pengamanan sistem
```

---

## 🔑 Akun Default & Kredensial

| Role | Username | Password Default | Catatan |
|---|---|---|---|
| **Admin** | `admin_rival` / `admin` | `admin123` | Wajib ganti saat pertama kali deploy ke production |

---

*Hak Cipta © 2026 Taman Margasatwa Ragunan.*
