# Panduan Lengkap Deployment & Migrasi Database Web Ragunan Zoo

Panduan ini dibuat untuk tim IT / Developer yang akan melakukan instalasi atau update ke server baru (misalnya server Diskominfo).

Proses pemindahan (deployment) terdiri dari **2 tahap utama**:
1. Memindahkan Kode Aplikasi (Source Code) & Build Docker
2. Memindahkan Data (Migrasi Database)

---

## 1. Memindahkan Kode Aplikasi (Source Code)

Proses ini menyalin seluruh kode dari komputer Anda ke server tujuan. Anda dapat melakukannya melalui Git atau menggunakan script Rsync otomatis.

### Cara Menggunakan Script Otomatis:
Jika Anda bekerja dari Linux/Mac/WSL, Anda bisa langsung menggunakan script yang sudah disiapkan:

1. Buka file `deploy-to-server.sh` dengan text editor.
2. Sesuaikan IP dan Username server tujuan:
   ```bash
   SERVER_USER="username_server_diskominfo"
   SERVER_IP="10.x.x.x"
   SERVER_DIR="/path/ke/folder/tujuan"
   ```
3. Jalankan script:
   ```bash
   ./deploy-to-server.sh
   ```
   *(Script ini akan secara otomatis membersihkan cache, mengirim file, dan membangun ulang container Docker di server tujuan).*

---

## 2. Memindahkan Data Database (Migrasi)

Seperti standar aplikasi modern, data disimpan secara terpisah dari kode (di dalam Docker Volume). Karena itu, setelah kode dipindahkan, aplikasi akan menyala dengan **keadaan database kosong**.

Untuk memindahkan data riil yang sudah Anda input, ikuti 2 langkah mudah ini:

### Langkah A: Ekspor (Backup) Data dari Laptop/Server Lama
Jalankan script ekspor di komputer/server yang databasenya **sudah terisi**:

```bash
./export-data-db.sh
```
Script ini akan menghasilkan sebuah file bernama `db_backup.sql`. File ini berisi seluruh isi struktur dan data aplikasi Anda (satwa, fasilitas, konfigurasi, dll).

### Langkah B: Impor (Restore) Data ke Server Baru
Setelah file `db_backup.sql` tercipta, kirim file tersebut dan suntikkan ke server tujuan menggunakan script impor:

```bash
# Format: ./import-data-db.sh [IP_SERVER_TUJUAN] [USERNAME_SERVER_TUJUAN]
./import-data-db.sh 10.x.x.x username_diskominfo
```

Script ini akan otomatis:
1. Mengirim file `db_backup.sql` ke server tujuan.
2. Memerintahkan Docker di server tujuan untuk "menelan" file SQL tersebut dan mengganti isi databasenya secara total.

---

## ✅ Catatan Penting untuk Tim Server (Diskominfo)

1. **Standalone Next.js**: Aplikasi frontend telah dikonfigurasi menggunakan mode *Standalone* bawaan Next.js. Ukuran image sangat efisien dan sangat aman untuk level produksi.
2. **Environment (.env)**: Jangan lupa untuk menyalin file `.env` di direktori utama dan `./server/.env` secara manual atau menambahkannya ke server environment, karena file-file ini tidak ikut dikirim secara otomatis demi keamanan.
3. **Database Kosong**: Sangat normal jika web awalnya terlihat berantakan atau kekurangan menu jika database belum di-restore. Data navigasi web (menu header) seluruhnya dirender secara dinamis dari database (tabel `navbar_items`), bukan di-hardcode. Pastikan Tahap 2 dijalankan dengan sukses.
