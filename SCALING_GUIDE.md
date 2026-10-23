# Panduan Skalabilitas: Kesiapan Menghadapi Jutaan Pengunjung

Dokumen ini berisi analisis mengenai kesiapan arsitektur proyek **Ragunan Web** untuk menangani trafik berskala masif (jutaan pengunjung per bulan atau ratusan ribu *concurrent users*).

## 1. Analisis Kondisi Saat Ini (As-Is)

Secara umum, fondasi *coding* (software) aplikasi ini sudah sangat baik, namun infrastruktur server saat ini memiliki beberapa keterbatasan (leher botol) yang rawan membuat server lumpuh apabila terjadi lonjakan trafik.

### ✅ Kelebihan (Apa yang sudah bagus)
- **Next.js Static Generation:** Aplikasi dibangun menggunakan kerangka kerja Next.js. Sebagian besar halaman utama (61 halaman) sudah di-*generate* menjadi HTML statis pada saat *build*. Halaman statis tidak membebani server karena tidak memerlukan proses komputasi ulang setiap kali diakses.

### ⚠️ Kekurangan / Leher Botol (Bottlenecks)
- **Single Core Processing (PM2 Fork Mode):** 
  Backend API (`ragunan-api`) dan Frontend (`ragunan-web`) saat ini dijalankan oleh PM2 dalam mode `fork`. Artinya, aplikasi Node.js hanya menggunakan **1 inti CPU (1 Core)** dari seluruh spesifikasi server Ubuntu Anda.
- **Single Point of Failure (SPOF):** 
  Website (Frontend), API (Backend), dan Database (PostgreSQL) semuanya ditumpuk di **1 server fisik/virtual yang sama**. Jika server kehabisan memori (RAM) akibat lonjakan pengunjung, keseluruhan sistem (web, tiket, dan admin) akan mati secara bersamaan.
- **Beban Bandwidth Media Besar (Video Autoplay):** 
  Terdapat *carousel* video di halaman depan. Jika server Ubuntu dipaksa untuk mendistribusikan aliran video (streaming) secara langsung ke 10.000+ pengguna secara bersamaan, *bandwidth* internet server akan habis seketika.
- **Tidak Ada Lapisan Caching Database:** 
  Tanpa adanya *caching* (seperti Redis), setiap pengguna akan memaksa server mengeksekusi koneksi (query) baru ke PostgreSQL. Konfigurasi bawaan PostgreSQL memiliki batasan koneksi (biasanya 100 max connections), yang akan langsung memunculkan *error connection timeout* jika diserbu ribuan pengunjung.

---

## 2. Peta Jalan Peningkatan (To-Be)

Berikut adalah daftar persiapan teknis yang harus dilakukan secara bertahap untuk memastikan sistem siap menampung jutaan pengguna tanpa tumbang.

### A. Jangka Pendek (Paling Mudah & Wajib)
Langkah ini harus segera dilakukan sebelum website dirilis secara publik (Grand Launching).

1. **Pasang Content Delivery Network (CDN) - (Gunakan Cloudflare)**
   - **Tindakan:** Arahkan DNS domain ke Cloudflare (bisa mulai dari versi gratis). Aktifkan fitur *Caching* dan perlindungan DDoS.
   - **Alasan:** Cloudflare akan mengambil alih tugas melayani file gambar, video, dan HTML statis. Ini mengurangi beban server Ubuntu Anda hingga 80-90%.
2. **Aktifkan Mode Cluster di PM2**
   - **Tindakan:** Ubah perintah start pada PM2 untuk menjalankan API dan Web di seluruh inti CPU.
   - *Perintah:* `pm2 start ragunan-api -i max` dan `pm2 start ragunan-web -i max`
   - **Alasan:** Jika server Anda memiliki 8 Core CPU, aplikasi akan otomatis membelah dirinya menjadi 8 *worker* yang bekerja secara paralel.

### B. Jangka Menengah (Bila Trafik Mulai Stabil di Angka Tinggi)
Langkah ini dilakukan ketika penggunaan CPU server Ubuntu sudah sering menyentuh angka 70%+.

1. **Gunakan Object Storage untuk Media**
   - **Tindakan:** Pindahkan semua file unggahan (gambar/video besar) dari folder lokal server ke *S3-compatible Object Storage* (seperti AWS S3, DigitalOcean Spaces, atau Supabase Storage).
   - **Alasan:** Folder lokal `/uploads` sangat membebani I/O *storage* server dan sulit untuk direplikasi (di-backup).
2. **Implementasi Redis (In-Memory Caching)**
   - **Tindakan:** Pasang server Redis. Ubah kode di Backend (`ragunan-api`) agar menyimpan data yang jarang berubah (seperti harga tiket, jadwal acara, jam buka) di Redis selama beberapa menit.
   - **Alasan:** Redis dapat merespon permintaan dalam hitungan milidetik tanpa menyentuh PostgreSQL sama sekali.

### C. Jangka Panjang (Skala Jutaan Enterprise)
Langkah ini dilakukan jika arsitektur tunggal (1 Server) sudah tidak mungkin lagi dipertahankan.

1. **Pisahkan Database dari Server Aplikasi**
   - **Tindakan:** Gunakan *Managed Database* (AWS RDS, Google Cloud SQL, atau Supabase Cloud) yang khusus hanya melayani koneksi database.
2. **Implementasi Load Balancer**
   - **Tindakan:** Sewa 2 atau lebih server Ubuntu. Letakkan sebuah *Load Balancer* (Nginx/HAProxy/AWS ALB) di depan server-server tersebut untuk membagi rata pengunjung ke server A, server B, dan seterusnya.

---
*Dokumen ini dibuat otomatis sebagai referensi teknis pengembangan sistem.*
