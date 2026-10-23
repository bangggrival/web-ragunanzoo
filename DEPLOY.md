# 🦁 Panduan Deployment Komprehensif — Web Ragunan Zoo

Panduan resmi deployment aplikasi web Taman Margasatwa Ragunan (Next.js 16 + Express + PostgreSQL 14+) ke server staging maupun production (*Cloud / VPS / Server On-Premise Diskominfo*).

---

## 📋 Daftar Isi
1. [Spesifikasi Server & Prasyarat](#1-spesifikasi-server--prasyarat)
2. [Arsitektur Deployment & Jaringan](#2-arsitektur-deployment--jaringan)
3. [Konfigurasi Environment Variables](#3-konfigurasi-environment-variables)
4. [Deployment Cepat via Docker (Direkomendasikan)](#4-deployment-cepat-via-docker-direkomendasikan)
5. [Deployment Manual / Hybrid (Node.js + PM2 + Systemd)](#5-deployment-manual--hybrid-nodejs--pm2--systemd)
6. [Konfigurasi Reverse Proxy Nginx & SSL/TLS (HTTPS)](#6-konfigurasi-reverse-proxy-nginx--ssltls-https)
7. [Checklist Keamanan Go-Live (Wajib Audit)](#7-checklist-keamanan-go-live-wajib-audit)
8. [Pemeliharaan, Backup & Troubleshooting](#8-pemeliharaan-backup--troubleshooting)

---

## 1. Spesifikasi Server & Prasyarat

### Rekomendasi Spesifikasi Server (Production)
- **OS**: Ubuntu Server 22.04 LTS atau 24.04 LTS (64-bit)
- **CPU**: 2 Core (vCPU) atau lebih
- **RAM**: Minimal 4 GB (Disarankan 8 GB untuk build Next.js dan PostgreSQL buffer pool)
- **Storage**: SSD minimal 40 GB
- **Software Prasyarat**:
  - **Docker Engine**: v24.0+
  - **Docker Compose**: v2.20+
  - **Node.js**: v20.x LTS (jika deploy tanpa Docker)
  - **PostgreSQL**: v14.x atau v16.x (jika deploy native)

---

## 2. Arsitektur Deployment & Jaringan

Aplikasi menggunakan arsitektur container terisolasi (*Bridge Network*):

```
                       INTERNET (Pengunjung / Staf)
                                   │
                                   ▼ [Port 80 / 443]
                     ┌───────────────────────────┐
                     │     Nginx Reverse Proxy   │ (SSL, Rate Limit, WAF)
                     └─────────────┬─────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
                 ▼ [Port 3000]                       ▼ [Port 5005]
      ┌─────────────────────┐             ┌─────────────────────┐
      │     ragunan-web     │             │     ragunan-api     │
      │  (Next.js 16 App)   │             │   (Express Backend) │
      └──────────┬──────────┘             └──────────┬──────────┘
                 │                                   │
                 │   [Internal Bridge: ragunan-internal]
                 │                                   │
                 └───────────────┐   ┌───────────────┘
                                 ▼   ▼ [Port 5432 Internal]
                     ┌───────────────────────────┐
                     │         ragunan-db        │ (TIDAK terekspos ke publik)
                     │     (PostgreSQL 14)       │
                     └───────────────────────────┘
```

> 🔒 **Keamanan Port**: Port 5432 PostgreSQL hanya dapat diakses antar container di dalam network `ragunan-internal` dan **tidak terekspos langsung ke IP publik server**, melindungi database dari serangan brute-force internet.

---

## 3. Konfigurasi Environment Variables

Sebelum menyalakan server, siapkan file `.env` di **Root** dan file `server/.env` di **Backend**.

### Frontend Environment (`.env`)
```bash
# URL backend yang dapat diakses oleh browser pengunjung
NEXT_PUBLIC_BACKEND_URL=https://ragunanzoo.jakarta.go.id

# URL backend internal untuk Next.js server-side rewrites & Edge Proxy
# - Di Docker: http://ragunan-api:5005
# - Di Local/PM2: http://127.0.0.1:5005
INTERNAL_BACKEND_URL=http://ragunan-api:5005

# Port web container (Default: 3000)
WEB_PORT=3000

# Kunci JWT untuk verifikasi route guard Next.js (Wajib sama persis dengan server/.env)
# Gunakan tanda kutip ganda ("...") agar karakter spesial tidak terpotong!
JWT_SECRET="ragunan_super_secret_production_key_2026_xYz987!@#"

# Mode lingkungan
NODE_ENV=production
```

### Backend Environment (`server/.env`)
```bash
# Koneksi Database
# - Di Docker Compose: PGHOST=postgres
# - Di Server Lokal: PGHOST=127.0.0.1
PGHOST=postgres
PGPORT=5432
PGDATABASE=ragunan_zoo
PGUSER=postgres
PGPASSWORD="ganti_dengan_password_db_yang_sangat_kuat"

# Port Express API
PORT=5005
NODE_ENV=production

# JWT Secret (Wajib diganti di production dan gunakan kutip ganda!)
JWT_SECRET="ragunan_super_secret_production_key_2026_xYz987!@#"

# Whitelist CORS (Daftar origin frontend yang diizinkan, pisahkan dengan koma)
FRONTEND_URL=https://ragunanzoo.jakarta.go.id,http://localhost:3000

# Folder penyimpanan upload lokal
UPLOAD_DIR=uploads

# S3 Object Storage (Opsional: kosongkan jika menggunakan Local Disk Storage)
S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-1
S3_ENDPOINT=
```

---

## 4. Deployment Cepat via Docker (Direkomendasikan)

### A. Deploy Pertama Kali di Server

1. **Clone repository ke server**:
   ```bash
   git clone <repo-url> /opt/web-ragunanzoo
   cd /opt/web-ragunanzoo
   ```

2. **Buat file environment production**:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env

   # Edit kredensial dengan nano / vim
   nano .env
   nano server/.env
   ```

3. **Jalankan script setup otomatis**:
   ```bash
   bash setup-docker.sh
   ```
   Script akan:
   - Memeriksa Docker & Docker Compose
   - Membuat folder `server/uploads`
   - Membangun container `ragunan-db`, `ragunan-api`, dan `ragunan-web`
   - Menunggu status *healthcheck* lulus (100% OK)
   - Menawarkan opsi import backup database (`db_backup.sql`)

### B. Deploy Update dari PC Lokal

Untuk mengirimkan pembaruan kode dari PC developer ke server remote:
```bash
# Format: DEPLOY_IP=<IP_SERVER> DEPLOY_USER=<USERNAME> bash deploy-to-server.sh
DEPLOY_IP=10.41.20.200 DEPLOY_USER=admin bash deploy-to-server.sh
```

---

## 5. Deployment Manual / Hybrid (Node.js + PM2 + Systemd)

Jika server menggunakan PostgreSQL native tanpa Docker:

### 1. Inisialisasi Database PostgreSQL
```bash
sudo -u postgres psql -c "CREATE DATABASE ragunan_zoo;"
sudo -u postgres psql -c "CREATE USER ragunan_admin WITH ENCRYPTED PASSWORD 'password_kuat';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ragunan_zoo TO ragunan_admin;"
sudo -u postgres psql -d ragunan_zoo < server/init_database.sql
```

### 2. Jalankan Backend dengan PM2
```bash
cd /opt/web-ragunanzoo/server
npm ci --omit=dev
pm2 start index.js --name "ragunan-api" --instances 2 --max-memory-restart 500M
```

### 3. Build & Jalankan Frontend Next.js
```bash
cd /opt/web-ragunanzoo
npm ci
npm run build
pm2 start npm --name "ragunan-web" -- start -- -p 3000
pm2 save
pm2 startup
```

---

## 6. Konfigurasi Reverse Proxy Nginx & SSL/TLS (HTTPS)

Buat file konfigurasi Nginx di `/etc/nginx/sites-available/ragunanzoo`:

```nginx
# Rate Limiting Zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=5r/s;

server {
    listen 80;
    listen [::]:80;
    server_name ragunanzoo.jakarta.go.id www.ragunanzoo.jakarta.go.id;

    # Redirect seluruh HTTP ke HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ragunanzoo.jakarta.go.id www.ragunanzoo.jakarta.go.id;

    # SSL Certificates (Certbot Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/ragunanzoo.jakarta.go.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ragunanzoo.jakarta.go.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 1. Frontend Next.js Application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 2. Backend REST API
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # 3. Realtime Server-Sent Events (SSE)
    location /api/realtime {
        proxy_pass http://127.0.0.1:5005/api/realtime;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 24h;
        chunked_transfer_encoding off;
    }

    # 4. Storage & Static Media Uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:5005/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Aktifkan konfigurasi dan pasang sertifikat SSL:
```bash
sudo ln -s /etc/nginx/sites-available/ragunanzoo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Pasang SSL gratis via Certbot
sudo certbot --nginx -d ragunanzoo.jakarta.go.id -d www.ragunanzoo.jakarta.go.id
```

---

## 7. Checklist Keamanan Go-Live (Wajib Audit)

Sebelum membuka situs untuk publik, pastikan poin-poin berikut telah diverifikasi:

- [ ] **Ganti Kredensial Default**: Akun `admin_rival` atau `admin` telah diganti dengan kata sandi baru yang kuat.
- [ ] **Kunci Rahasia JWT**: `JWT_SECRET` pada `.env` dan `server/.env` telah diganti dengan string acak unik minimal 48 karakter dan dibungkus tanda kutip ganda.
- [ ] **CORS Terbatas**: Parameter `FRONTEND_URL` hanya berisi domain resmi (bukan wildcard `*`).
- [ ] **Port PostgreSQL Terisolasi**: Port 5432 tidak dibuka pada firewall server (`sudo ufw status`).
- [ ] **Pengecekan Magic Bytes Aktif**: Upload file hanya menerima gambar asli dan PDF nyata.
- [ ] **SSL/TLS Aktif**: Seluruh trafik dialihkan ke HTTPS (`301 Moved Permanently`).
- [ ] **Uji Otomatis Lulus**: Menjalankan `node scratch/verify_audit.mjs` dan `node scratch/verify_phase2.mjs` dengan hasil 100% PASS.

---

## 8. Pemeliharaan, Backup & Troubleshooting

### Backup Database Otomatis
Buat script cron harian di server (`/usr/local/bin/backup-ragunan-db.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ragunan_db"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker exec ragunan-db pg_dump -U postgres ragunan_zoo | gzip > "$BACKUP_DIR/ragunan_zoo_$TIMESTAMP.sql.gz"
# Hapus backup lebih dari 30 hari
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
```
Tambahkan ke cron (`crontab -e`):
```bash
0 2 * * * /usr/local/bin/backup-ragunan-db.sh
```

### Restore Database dari File Backup
```bash
# Dari file SQL biasa:
docker exec -i ragunan-db psql -U postgres -d ragunan_zoo < db_backup.sql

# Dari file gzip:
gunzip -c backup.sql.gz | docker exec -i ragunan-db psql -U postgres -d ragunan_zoo
```

### Pemantauan Log Container
```bash
# Log seluruh sistem secara realtime
docker compose logs -f

# Log API backend saja
docker compose logs -f ragunan-api

# Log Frontend Next.js saja
docker compose logs -f ragunan-web
```

---

## 9. Deployment Staging & Akses Remote via Tailscale Funnel

Server staging Ragunan Zoo dapat diakses secara publik menggunakan Tailscale Funnel dengan enkripsi HTTPS valid dari Let's Encrypt:

- **Alamat Publik Tailscale**: `https://yaninfo.tail14acf1.ts.net:10000`
- **IP Server Lokal (Host)**: `10.41.20.245`
- **Port Frontend Host**: `3002` (dipetakan ke port 3002 container `ragunan-web`)
- **Port Backend Host**: `5005` (dipetakan ke port 5005 container `ragunan-api`)

### Cara Kerja Tailscale Funnel:
```
Publik / Internet
       │
       ▼ [HTTPS Port 10000]
yaninfo.tail14acf1.ts.net
       │
       ▼ (Tailscale Funnel daemon pada host 10.41.20.245)
http://127.0.0.1:3002 (Next.js 16 ragunan-web)
       │
       ├── /api/* & /uploads/* (Next.js Rewrites) ──► http://ragunan-api:5005
       └── Database Queries ────────────────────────► PostgreSQL 14 (ragunan-db)
```

### Konfigurasi Tailscale pada Server Host:
```bash
# Mengecek status Funnel
tailscale funnel status

# Mengaktifkan Funnel pada port 10000 menuju port 3002
tailscale funnel --bg 10000 http://127.0.0.1:3002
```

### Pengujian Otomatis Endpoint:
Jalankan script verifikasi lengkap:
```bash
python scratch/test_tailscale_endpoint.py
```

---

*Panduan ini terakhir diperbarui: Oktober 2026 (Versi Produksi).*
