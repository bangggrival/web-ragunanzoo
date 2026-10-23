#!/bin/bash
# ============================================================
# Create Master Backup — Web Ragunan Zoo
# Script untuk membuat file ZIP / Archive Master lengkap (Code + DB + Uploads)
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="web-ragunanzoo-master-backup_${TIMESTAMP}"
BACKUP_DIR="../${BACKUP_NAME}"
ARCHIVE_FILE="../${BACKUP_NAME}.tar.gz"

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}📦 MEMBUAT MASTER BACKUP WEB RAGUNAN ZOO${NC}"
echo -e "${BLUE}=========================================================${NC}"

# 1. Export database terbaru jika container running
if docker ps | grep -q ragunan-db; then
  echo -e "\n${YELLOW}[1/3]${NC} 🗄️ Mengekspor database terbaru dari container Docker..."
  docker exec ragunan-db pg_dump -U postgres -d ragunan_zoo --clean > db_backup.sql
  echo -e "  ${GREEN}✅${NC} db_backup.sql berhasil diperbarui"
else
  echo -e "\n${YELLOW}[1/3]${NC} ℹ️ Container ragunan-db tidak berjalan, menggunakan db_backup.sql yang ada."
fi

# 2. Re-pack master archive
echo -e "\n${YELLOW}[2/3]${NC} 📁 Mengompres source code, database, dan uploads..."

tar -czvf ${ARCHIVE_FILE} \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='server/node_modules' \
  --exclude='*.tar.gz' \
  --exclude='*.zip' \
  ./

echo -e "\n${GREEN}=========================================================${NC}"
echo -e "${GREEN}✅ MASTER BACKUP BERHASIL DIBUAT!${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo -e "  📄 Nama File : ${YELLOW}${ARCHIVE_FILE}${NC}"
echo -e "  📍 Lokasi    : ${BLUE}$(readlink -f ${ARCHIVE_FILE})${NC}"
echo -e ""
echo -e "Isi Master Backup ini mencakup:"
echo -e "  1. 💻 Source Code lengkap (Frontend Next.js & Backend Express)"
echo -e "  2. 🗄️ Database Dump (db_backup.sql) - Data lengkap hewan, flora, berita, dll."
echo -e "  3. 🖼️ File Upload Media (server/uploads/) - Foto, denah, logo, dsb."
echo -e "  4. ⚙️ Script Deployment (deploy-to-server.sh, setup.sh, setup-docker.sh)"
echo -e ""
