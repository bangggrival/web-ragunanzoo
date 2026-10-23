#!/bin/bash

echo "=========================================================="
echo "📦 MENGEKSPOR DATABASE DARI LOCALHOST"
echo "=========================================================="

# Ekspor database menggunakan pg_dump di dalam container Docker lokal
# Flag --clean memastikan bahwa database tujuan nantinya akan ditimpa bersih
docker exec ragunan-db pg_dump -U postgres -d ragunan_zoo --clean > db_backup.sql

if [ $? -eq 0 ]; then
    echo "✅ Selesai! File backup database telah dibuat dengan nama: db_backup.sql"
    echo "File ini sekarang siap untuk dikirim ke server tujuan."
else
    echo "❌ Gagal mengekspor database. Pastikan Docker container 'ragunan-db' sedang berjalan di komputer ini."
fi
