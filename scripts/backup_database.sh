#!/bin/bash
# ==============================================================================
# Script Backup Otomatis Database PostgreSQL - Taman Margasatwa Ragunan
# ==============================================================================
# Penggunaan:
# 1. Berikan hak akses eksekusi: chmod +x scripts/backup_database.sh
# 2. Pasang di crontab: crontab -e
#    0 2 * * * /path/to/web-ragunanzoo/scripts/backup_database.sh >> /var/log/ragunan_backup.log 2>&1
# ==============================================================================

set -e

# Konfigurasi
BACKUP_DIR="${BACKUP_DIR:-/var/backups/ragunan_zoo}"
CONTAINER_NAME="${DB_CONTAINER:-ragunan-db}"
DB_NAME="${PGDATABASE:-ragunan_zoo}"
DB_USER="${PGUSER:-postgres}"
RETENTION_DAYS=14

# Format Waktu
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/ragunan_db_${TIMESTAMP}.sql.gz"

# Buat folder backup jika belum ada
mkdir -p "${BACKUP_DIR}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Memulai backup database '${DB_NAME}' dari container '${CONTAINER_NAME}'..."

# Eksekusi pg_dump via Docker & kompresi langsung dengan gzip
docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" --clean --if-exists "${DB_NAME}" | gzip -9 > "${BACKUP_FILE}"

# Periksa hasil backup
FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup berhasil dibuat: ${BACKUP_FILE} (Ukuran: ${FILE_SIZE})"

# Rotasi: Hapus backup yang lebih tua dari RETENTION_DAYS
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧹 Membersihkan backup lama (> ${RETENTION_DAYS} hari)..."
find "${BACKUP_DIR}" -type f -name "ragunan_db_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎉 Proses backup & rotasi selesai sempurna!"
