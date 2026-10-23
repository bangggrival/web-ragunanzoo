# 🛡️ Dokumentasi Keamanan & Arsitektur Pertahanan — Web Ragunan Zoo

## Status Keamanan: 🟢 Enterprise Hardened (Phase 1 & Phase 2 Verified)
**Standar Kepatuhan**: OWASP Top 10, UU No. 27 Tahun 2022 (Pelindungan Data Pribadi / PDP), CIS Benchmarks.  
**Terakhir Diperbarui**: Oktober 2026.

---

## 1. Ringkasan Eksekutif Keamanan

Aplikasi web Taman Margasatwa Ragunan mengimplementasikan arsitektur keamanan berlapis (**Defense-in-Depth**). Setiap lapisan sistem (jaringan, proksi tepi, perutean, logika bisnis, penyimpanan berkas, dan basis data) memiliki mekanisme validasi independen sehingga kegagalan pada satu lapisan tidak mengakibatkan kompromi sistem secara keseluruhan.

```
[ Pengunjung / Penyerang ]
          │
          ▼ ── Layer 1: Network & Docker Isolation (Bridge Network, No Public DB Port)
[ Reverse Proxy / Edge ]
          │
          ▼ ── Layer 2: Next.js Edge Route Guard (HMAC-SHA256 Timing-Safe + Role Check)
[ Next.js Application ]
          │
          ▼ ── Layer 3: Express API Middleware (Rate Limit, Helmet, Token Revocation Check)
[ REST API & Query Compiler ]
          │
          ▼ ── Layer 4: BOLA / IDOR Defense & AST Query Sanitization (No Raw Subqueries)
[ Storage & Realtime Stream ]
          │
          ▼ ── Layer 5: Magic Bytes Binary Validation & SSE Channel Whitelisting
[ PostgreSQL Database ]
```

---

## 2. Matriks Pertahanan OWASP Top 10

| Kategori OWASP | Kerentanan Potensial | Mitigasi yang Diimplementasikan | Status |
|---|---|---|:---:|
| **A01: Broken Access Control** | Bypass dashboard `/manager`, kebocoran data warga via BOLA/IDOR | - Validasi kriptografis HMAC di `src/proxy.ts`<br>- Wajib `tracking_code` pada `service_registrations`<br>- Isolasi total `wbs_submissions` dari publik | 🟢 **Aman** |
| **A02: Cryptographic Failures** | Kebocoran token sesi, timing attacks | - `crypto.timingSafeEqual` pada verifikasi token<br>- Enkripsi kata sandi via bcrypt salt 10<br>- Cookies `HttpOnly`, `SameSite=Lax` | 🟢 **Aman** |
| **A03: Injection** | SQL Injection via parameter `selects` dinamis | - Sanitasi identifier ketat (`"${col}"`) di `server/queryCompiler.js`<br>- Penolakan subquery `(SELECT ...)` dan blind timing attacks | 🟢 **Aman** |
| **A04: Insecure Design** | Realtime stream membocorkan data perubahan sensitif | - Whitelist tabel publik di `/api/realtime`<br>- Data masking pada konfigurasi pemeliharaan sistem | 🟢 **Aman** |
| **A05: Security Misconfiguration** | Port PostgreSQL terbuka, wildcard host pada image proxy | - Bridge network internal `ragunan-internal` (Port 5432 tertutup)<br>- Whitelist `remotePatterns` pada `next.config.mjs` | 🟢 **Aman** |
| **A06: Vulnerable & Outdated Components** | CVE pada dependensi npm pihak ketiga | - Resolusi 100% `npm audit fix` di root & server<br>- Nol kerentanan kritis / tinggi | 🟢 **Aman** |
| **A07: Identification & Auth Failures** | Token replay setelah logout, brute-force | - Active Token Revocation Store (Blacklist) dengan pembersihan TTL<br>- Rate limiting pada `/api/auth/` | 🟢 **Aman** |
| **A08: Software & Data Integrity Failures** | Upload file berbahaya / Stored XSS / Polyglot | - Pemeriksaan Magic Bytes biner asli (JPEG, PNG, WebP, PDF)<br>- Penghapusan otomatis file tidak valid dari disk | 🟢 **Aman** |
| **A09: Security Logging & Monitoring** | Serangan tidak terdeteksi | - Structured JSON logging via Morgan<br>- Pencatatan timestamp, IP, status code, response time | 🟢 **Aman** |
| **A10: Server-Side Request Forgery (SSRF)** | Eksploitasi image optimization proxy | - Penghapusan wildcard `hostname: '**'` pada Next.js image config<br>- Restriksi domain media resmi Ragunan & CDN terverifikasi | 🟢 **Aman** |

---

## 3. Rincian Teknis Implementasi Pertahanan

### 3.1. Pencegahan SQL Injection & AST Query Compiler
* **File**: `server/queryCompiler.js`
* Seluruh kolom pada klausa `SELECT` divalidasi dengan regex identifier resmi PostgreSQL `/^[a-zA-Z0-9_.*]+$/`.
* Setiap nama kolom dibungkus dengan tanda kutip ganda PostgreSQL:
  ```javascript
  // Sanitasi identifier
  return `"${col}"`;
  ```
* Ekspresi berbahaya seperti subquery bertingkat `(SELECT current_database())`, pemanggilan fungsi `pg_sleep()`, atau union injection otomatis memicu penolakan seketika dengan `400 Bad Request`.

### 3.2. Next.js Edge Proxy Route Guarding
* **File**: `src/proxy.ts`
* Mengamankan rute internal `/manager/*` langsung di lapisan perutean Next.js.
* Memverifikasi keaslian cookie `sb-token` secara kriptografis menggunakan algoritma HMAC-SHA256.
* Menggunakan `crypto.timingSafeEqual` untuk mencegah serangan analisis jeda waktu (*timing attack*).
* Memeriksa payload klaim peran: hanya peran `admin`, `staff`, dan `manager` yang diizinkan mengakses area manajemen; token palsu atau kedaluwarsa langsung dialihkan (*307 Temporary Redirect*) ke `/auth`.

### 3.3. Broken Object-Level Authorization (BOLA / IDOR) Defense
* **File**: `server/index.js`
* **Layanan Pendaftaran Warga (`service_registrations`)**:
  * Pengguna non-staff dilarang mengambil seluruh data pendaftaran secara massal.
  * Pencarian status pendaftaran wajib menyertakan filter `tracking_code` dengan kondisi sama persis (`eq`).
  * Perubahan status atau penghapusan data pendaftaran dibatasi secara ketat hanya untuk akun staf/administrator terautentikasi.
* **Whistleblowing System (`wbs_submissions`)**:
  * Laporan aduan pelanggaran dikunci secara total dari query `SELECT`, `UPDATE`, atau `DELETE` oleh pengunjung umum maupun akun pengguna biasa.
  * Hanya staf auditor internal terautentikasi yang berhak mengkaji laporan WBS.

### 3.4. Validasi Magic Bytes (Signature Biner Berkas)
* **File**: `server/index.js`
* Filter pengunggahan tidak hanya bergantung pada ekstensi berkas atau header `Content-Type` yang rentan dipalsukan.
* Server membaca 16 byte pertama langsung dari berkas fisik di disk untuk memvalidasi *file signature*:
  - **JPEG**: `0xFF 0xD8 0xFF`
  - **PNG**: `0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A`
  - **WebP**: `RIFF` (bytes 0–3) dan `WEBP` (bytes 8–11)
  - **PDF**: `%PDF-` (bytes 0–4)
* Berkas yang tidak sesuai (misalnya kode skrip PHP/HTML atau berkas biner executable yang dinamai `.jpg`) langsung dihapus secara permanen dari disk dan dikembalikan pesan kesalahan `400 Bad Request`.

### 3.5. Manajemen Sesi & Token Revocation List (Blacklist)
* **File**: `server/index.js`
* Ketika pengguna melakukan logout melalui `POST /api/auth/logout`, token JWT yang digunakan saat itu dicatat ke dalam *Token Revocation Store*.
* Middleware otentikasi memeriksa status pencabutan token pada setiap permintaan. Token yang telah dicabut langsung ditolak (`401 Unauthorized`), mencegah penyerang memanfaatkan kembali token yang pernah dicegat (*anti-token replay attack*).
* Entri blacklist dibersihkan secara otomatis berdasarkan masa berlaku token (*TTL garbage collection*).

### 3.6. Isolasi Realtime SSE Stream & Perlindungan Data Sensitif
* **File**: `server/index.js`
* Endpoint `/api/realtime` tidak lagi mengizinkan CORS terbuka (*wildcard `*`*).
* Diterapkan daftar putih tabel yang boleh disiarkan ke publik (`animals`, `events`, `flora`, `venues`, `gps_pois`, `tram_route_points`, `ticket_types`, `page_views`).
* Data privat dan sensitif (peran pengguna, kredensial, aduan warga, pendaftaran penelitian) **tidak akan pernah dipancarkan** melalui saluran publik.

---

## 4. Hasil Verifikasi Keamanan Otomatis

Seluruh pengujian dilakukan secara independen dan otomatis:

```bash
# Hasil pengujian regresi & audit fase 1 (8 Pengujian)
node scratch/verify_audit.mjs
# Status: 8/8 PASSED (100%)

# Hasil pengujian enterprise hardening fase 2 (9 Pengujian)
node scratch/verify_phase2.mjs
# Status: 9/9 PASSED (100%)

# Hasil audit dependensi
npm audit (Server: 0 Vulnerabilities | Root: 0 Vulnerabilities)
```

---

## 5. Prosedur Pelaporan Kerentanan (Vulnerability Disclosure)

Jika Anda menemukan potensi kerentanan keamanan pada sistem Taman Margasatwa Ragunan, mohon ikuti prinsip **Responsible Disclosure**:
1. Kirimkan laporan detail temuan (termasuk langkah reproduksi dan *Proof of Concept* defensif) melalui email ke: `security@ragunanzoo.jakarta.go.id` atau tim TI pengelola.
2. Berikan waktu minimal 30 hari bagi tim pengembang untuk melakukan remediasi sebelum mempublikasikan informasi mengenai kerentanan.
3. Dilarang melakukan uji penetrasi yang bersifat destruktif (*Denial of Service*, merusak data riil, atau mengganggu layanan publik).

---

*Dokumentasi ini diterbitkan oleh Tim Pengembang & Arsitektur Keamanan Aplikasi Web Ragunan Zoo.*
