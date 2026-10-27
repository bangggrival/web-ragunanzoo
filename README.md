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

### Menjalankan dengan Docker Compose
```bash
# Build dan jalankan seluruh container di background
docker compose up -d --build

# Periksa status container
docker compose ps

# Cek logs
docker compose logs -f
```

Ports dan Endpoint Akses:
- **Frontend Web**: `http://localhost:3002`
- **Backend API**: `http://localhost:5005`
- **Database PostgreSQL**: Port 5432 (Internal bridge network `ragunan-internal`, terisolasi dari publik)

---

## 🚀 Panduan Deploy Produksi (Clean Production Deployment)

Untuk deployment ke server VPS produksi, gunakan arsitektur terisolasi dengan reverse proxy Nginx dan backup otomatis:

### 1. Salin Berkas Environment Produksi
```bash
cp .env.example .env
cp server/.env.example server/.env
```
> **Penting**: Ubah `PGPASSWORD`, `JWT_SECRET` (minimal 64 karakter), serta ganti `NEXT_PUBLIC_BACKEND_URL` dan `FRONTEND_URL` dengan domain publik HTTPS asli Anda.

### 2. Jalankan Container Produksi
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
*Catatan keamanan: Pada mode produksi, port 3002 dan 5005 terikat khusus ke `127.0.0.1` (loopback), sehingga hanya Nginx yang dapat meneruskan lalu lintas web dari internet.*

### 3. Konfigurasi Nginx Reverse Proxy & SSL
Gunakan berkas konfigurasi siap pakai di `nginx/ragunan.conf`:
```bash
sudo cp nginx/ragunan.conf /etc/nginx/sites-available/ragunan.conf
sudo ln -s /etc/nginx/sites-available/ragunan.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Pasang sertifikat SSL gratis via Certbot Let's Encrypt:
sudo certbot --nginx -d ragunanzoo.jakarta.go.id -d www.ragunanzoo.jakarta.go.id
```

### 4. Pasang Jadwal Backup Database Otomatis (Cron Job)
Gunakan skrip yang telah disediakan di `scripts/backup_database.sh`:
```bash
chmod +x scripts/backup_database.sh

# Tambahkan ke crontab (eksekusi setiap jam 02:00 pagi WIB dengan retensi 14 hari):
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/backup_database.sh >> /var/log/ragunan_backup.log 2>&1") | crontab -
```

---

## 🧪 Pengujian & Verifikasi Kualitas

Proyek dilengkapi dengan verifikasi kualitas kode:

```bash
# 1. Jalankan TypeScript Type Checking (0 errors)
npm run typecheck

# 2. Jalankan Linter ESLint (0 errors, 0 warnings)
npm run lint
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
└── docker-compose.yml      # Multi-container orchestration (DB, API, Web)
```

---

## 🔐 Keamanan & Akun Administratif

Pada saat inisialisasi basis data awal di server produksi:
1. Pastikan Anda segera membuat akun administrator melalui skrip `server/scripts/rotate_admin_passwords.js` atau registrasi awal yang terlindungi.
2. Gunakan kata sandi yang kuat (minimal 12 karakter kombinasi alfanumerik & simbol).
3. Selalu simpan kredensial administratif di dalam *Secret Manager* atau berkas `.env` privat server yang terlindungi hak aksesnya (`chmod 600`).

---

*Hak Cipta © 2026 Taman Margasatwa Ragunan.*

