#!/bin/bash

# Default values
SERVER_IP=${1:-"10.41.20.245"}
SERVER_USER=${2:-"yaninfo"}

echo "=========================================================="
echo "🚀 MENGIMPOR DATABASE KE SERVER: $SERVER_IP"
echo "=========================================================="

# 1. Cek apakah file backup ada
if [ ! -f "db_backup.sql" ]; then
    echo "❌ ERROR: File db_backup.sql tidak ditemukan!"
    echo "💡 Silakan jalankan './export-data-db.sh' terlebih dahulu di komputer yang memiliki data."
    exit 1
fi

# 2. Mengirim file backup ke server tujuan via SCP
echo -e "\n[1/2] Mengirim file backup ke server $SERVER_IP..."
scp db_backup.sql $SERVER_USER@$SERVER_IP:/tmp/db_backup.sql
if [ $? -ne 0 ]; then
    echo "❌ Gagal mengirim file ke server. Periksa koneksi atau password Anda."
    exit 1
fi

# 3. Mengimpor (Restore) data ke dalam container Docker PostgreSQL di server
echo -e "\n[2/2] Mengimpor data ke dalam Docker Database di server..."
# Perhatikan tanda '<' yang berarti kita mengirim isi file ke dalam psql di container
ssh $SERVER_USER@$SERVER_IP "docker exec -i ragunan-db psql -U postgres -d ragunan_zoo < /tmp/db_backup.sql"

if [ $? -eq 0 ]; then
    echo "=========================================================="
    echo "✅ IMPORT SELESAI! Database berhasil dimigrasi ke server."
    echo "=========================================================="
else
    echo "❌ Gagal mengimpor data ke dalam database server."
    exit 1
fi
