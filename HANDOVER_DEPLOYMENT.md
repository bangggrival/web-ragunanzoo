# 🦁 DOKUMEN SERAH TERIMA DEPLOYMENT (HANDOVER RUNBOOK)
**Aplikasi Web Resmi Taman Margasatwa Ragunan**
*Versi: 1.0.0 Production-Ready* | *Tanggal: Oktober 2026*

Dokumen ini ditujukan kepada **Tim DevOps / System Administrator / Tim Infrastruktur** yang bertanggung jawab melakukan deployment aplikasi ke server produksi.

---

## 📌 Ringkasan Arsitektur Sistem

Aplikasi ini menggunakan arsitektur micro-services terisolasi dalam Docker container:

| Komponen | Teknologi | Port Internal | Port Host (Loopback) | Port Publik |
|---|---|---|---|---|
| **Frontend Web** | Next.js 16 (Standalone Output, React 19) | `3002` | `127.0.0.1:3002` | *Lewat Nginx* |
| **Backend API** | Node.js 20 + Express.js | `5005` | `127.0.0.1:5005` | *Lewat Nginx* |
| **Database** | PostgreSQL 14 (Alpine Linux) | `5432` | *Tidak diekspos* | **TERISOLASI** |
| **Reverse Proxy** | Nginx + Certbot Let's Encrypt | `80, 443` | `80, 443` | `80, 443 (HTTP/S)` |

```text
Pengunjung (Internet)
       │  HTTPS (Port 443)
       ▼
┌──────────────────────────────────────┐
│       Nginx Reverse Proxy            │ (SSL Termination, Rate Limit, Caching)
└──────────────┬───────────────────────┘
               │
      ┌────────┴─────────────────┐
      ▼ (Loopback 127.0.0.1)      ▼ (Loopback 127.0.0.1)
  ragunan-web:3002           ragunan-api:5005
                                  │
                                  ▼ (Bridge Network 'ragunan-internal')
                            ragunan-db:5432 (Terisolasi dari luar)
```

---

## 🛠️ Prasyarat Server (VPS / Cloud VM)

* **Sistem Operasi**: Ubuntu 22.04 LTS atau Ubuntu 24.04 LTS (x86_64)
* **Spesifikasi Minimum**: 2 vCPU, 4 GB RAM, 25 GB SSD Storage
* **Spesifikasi Rekomendasi**: 4 vCPU, 8 GB RAM, 50 GB SSD Storage
* **Perangkat Lunak Terpasang**:
  * Docker Engine (v24+) & Docker Compose Plugin (v2+)
  * Nginx (`sudo apt install nginx -y`)
  * Certbot (`sudo apt install certbot python3-certbot-nginx -y`)
  * Git & cURL

---

## 🚀 Prosedur Deployment Langkah demi Langkah

### Langkah 1: Clone Repositori di Server
```bash
cd /opt
sudo git clone <URL_REPOSITORI_GIT> web-ragunanzoo
sudo chown -R $USER:$USER web-ragunanzoo
cd web-ragunanzoo
```

### Langkah 2: Konfigurasi File Environment Produksi
Salin template konfigurasi:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

**Edit `.env` (Frontend):**
```env
NEXT_PUBLIC_BACKEND_URL=https://ragunanzoo.jakarta.go.id
INTERNAL_BACKEND_URL=http://ragunan-api:5005
WEB_PORT=3002
JWT_SECRET="<GENERATE_RANDOM_SECRET_64_CHARS>"
NODE_ENV=production
```

**Edit `server/.env` (Backend API):**
```env
PGHOST=postgres
PGPORT=5432
PGDATABASE=ragunan_zoo
PGUSER=postgres
PGPASSWORD="<PASSWORD_DATABASE_KUAT_DAN_ACAK>"
PORT=5005
NODE_ENV=production
JWT_SECRET="<HARUS_SAMA_DENGAN_JWT_SECRET_DI_ATAS>"
FRONTEND_URL=https://ragunanzoo.jakarta.go.id,https://www.ragunanzoo.jakarta.go.id
UPLOAD_DIR=uploads
```
> 💡 *Generate token acak untuk JWT Secret via terminal:*
> `openssl rand -hex 32`

### Langkah 3: Build & Jalankan Container
Gunakan file `docker-compose.prod.yml`:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Periksa status seluruh container (pastikan semua berstatus `Up (healthy)`):
```bash
docker compose -f docker-compose.prod.yml ps
```

*Catatan Otomasi Database:*
Saat container `ragunan-db` pertama kali dibuat, basis data akan otomatis terinisialisasi secara utuh menggunakan berkas `server/init_database.sql` (Master Kategori, Banner, Pengaturan Sistem, Hak Akses Akun).

### Langkah 4: Pasang Nginx Reverse Proxy & SSL
Proyek sudah menyertakan berkas konfigurasi Nginx siap pakai di folder `nginx/ragunan.conf`.

1. Salin konfigurasi ke direktori Nginx:
   ```bash
   sudo cp nginx/ragunan.conf /etc/nginx/sites-available/ragunan.conf
   ```
2. Buka berkas `/etc/nginx/sites-available/ragunan.conf` dan sesuaikan nama domain (`server_name`):
   ```nginx
   server_name ragunanzoo.jakarta.go.id www.ragunanzoo.jakarta.go.id;
   ```
3. Aktifkan konfigurasi dan reload Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ragunan.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
4. Pasang Sertifikat SSL Gratis (HTTPS) via Let's Encrypt:
   ```bash
   sudo certbot --nginx -d ragunanzoo.jakarta.go.id -d www.ragunanzoo.jakarta.go.id
   ```

### Langkah 5: Pasang Otomasi Backup Harian (Cron Job)
Skrip backup otomatis dengan kompresi gzip dan retensi 14 hari sudah tersedia di `scripts/backup_database.sh`:

```bash
chmod +x scripts/backup_database.sh

# Pasang cron job harian pada pukul 02:00 WIB
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/backup_database.sh >> /var/log/ragunan_backup.log 2>&1") | crontab -
```

---

## 🔑 Akses Administrator & Rotasi Password

Setelah instalasi selesai, akun bawaan superadmin yang tersedia:
* **Username**: `admin_rival` atau `admin_kp3`
* **URL Login Manager**: `https://domain-anda.com/auth` atau `https://domain-anda.com/manager`

**WAJIB LAKUKAN ROTASI PASSWORD ADMIN SEBELUM GO-LIVE:**
Jalankan skrip rotasi password terenkripsi bcrypt dari terminal server:
```bash
docker exec -it ragunan-api node scripts/rotate_admin_passwords.js admin_rival "PasswordBaruKuat2026!#"
```

---

## 🔍 Smoke Test & Verifikasi Kesehatan Sistem

Jalankan perintah ini di server untuk memvalidasi seluruh service:

1. **API Health Check**:
   ```bash
   curl -s http://127.0.0.1:5005/api/health
   # Output yang benar: {"status":"OK","database":"Connected","timestamp":"..."}
   ```
2. **Web Frontend Health Check**:
   ```bash
   curl -s -I http://127.0.0.1:3002
   # Output yang benar: HTTP/1.1 200 OK
   ```
3. **Domain Publik HTTPS**:
   ```bash
   curl -s -I https://ragunanzoo.jakarta.go.id
   # Output yang benar: HTTP/2 200
   ```

---

## 🛡️ Checklist Keamanan (Security Audit Passed)

- [x] **Database Isolation**: Port PostgreSQL 5432 tidak terekspos ke internet.
- [x] **Rate Limiting**: Terpasang di level API Express dan Nginx.
- [x] **File Upload Security**: Magic-bytes validation aktif di backend; folder `uploads/` hanya menyajikan media statis tanpa eksekusi skrip.
- [x] **Edge Route Guarding**: Validasi sesi JWT HMAC-SHA256 dengan `crypto.timingSafeEqual` pada middleware Next.js.
- [x] **Container Log Limits**: Log dibatasi maksimal 20MB per container mencegah disk *out-of-space*.
- [x] **Zero Code Lints & Zero Type Errors**: Lolos 100% `tsc --noEmit` dan `eslint .`.

---
*Dokumen ini disusun sebagai panduan resmi serah terima teknis aplikasi Taman Margasatwa Ragunan.*
