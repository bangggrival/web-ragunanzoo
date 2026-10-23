#!/bin/bash
# ============================================================
# Deploy ke Server — Web Ragunan Zoo
# Script ini akan sync file lokal ke server dan rebuild Docker
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─────────── Konfigurasi ───────────
SERVER_USER="${DEPLOY_USER:-yaninfo}"
SERVER_IP="${DEPLOY_IP:-10.41.20.245}"
SERVER_DIR="${DEPLOY_DIR:-/home/yaninfo/web-ragunanzoo}"

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}🚀 DEPLOY KE SERVER ${SERVER_IP}${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo -e "  User: ${YELLOW}${SERVER_USER}${NC}"
echo -e "  Path: ${YELLOW}${SERVER_DIR}${NC}"

# ─────────── Pre-check ───────────
echo -e "\n${YELLOW}[0/5]${NC} 🔍 Pre-check..."

# Check .env files exist
if [ ! -f .env ]; then
  echo -e "  ${RED}❌${NC} File .env tidak ditemukan di root project!"
  echo -e "  ${YELLOW}💡${NC} Jalankan: cp .env.example .env"
  exit 1
fi
if [ ! -f server/.env ]; then
  echo -e "  ${RED}❌${NC} File server/.env tidak ditemukan!"
  echo -e "  ${YELLOW}💡${NC} Jalankan: cp server/.env.example server/.env"
  exit 1
fi
echo -e "  ${GREEN}✅${NC} File .env ditemukan"

# Test SSH connection
echo -n "  🔌 Menguji koneksi SSH..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} "echo ok" &> /dev/null; then
  echo -e " ${GREEN}✅${NC}"
else
  echo -e " ${RED}❌${NC}"
  echo -e "  ${YELLOW}💡${NC} Pastikan SSH key sudah di-setup atau password tersedia."
  exit 1
fi

# ─────────── 1. Sync files ───────────
echo -e "\n${YELLOW}[1/5]${NC} 📦 Menyinkronkan file ke server..."
rsync -rlvz --delete --size-only --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'server/node_modules' \
  --exclude 'server/uploads' \
  --exclude 'deploy-to-server.sh' \
  --exclude 'tsconfig.tsbuildinfo' \
  --exclude 'bun.lockb' \
  ./ ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/

if [ $? -ne 0 ]; then
  echo -e "  ${RED}❌${NC} Gagal menyinkronkan file!"
  exit 1
fi
echo -e "  ${GREEN}✅${NC} File berhasil disinkronkan"

# ─────────── 2. Ensure .env files exist on server ───────────
echo -e "\n${YELLOW}[2/6]${NC} 📄 Memastikan .env files ada di server..."
ssh ${SERVER_USER}@${SERVER_IP} "
  cd ${SERVER_DIR}
  if [ ! -f .env ]; then cp .env.example .env; echo 'Created .env'; fi
  if [ ! -f server/.env ]; then cp server/.env.example server/.env; echo 'Created server/.env'; fi
  sed -i 's|NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=http://${SERVER_IP}:5005|g' .env
  sed -i 's|PORT=.*|PORT=3002|g' .env
  sed -i 's|WEB_PORT=.*|WEB_PORT=3002|g' .env
  mkdir -p server/uploads
"
echo -e "  ${GREEN}✅${NC} Environment files siap (Port set ke 3002, Backend API set ke http://${SERVER_IP}:5005)"

# ─────────── 3. Stop containers & Start Postgres ───────────
echo -e "\n${YELLOW}[3/6]${NC} 🛑 Menghentikan container web & api lama..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_DIR} && docker compose down ragunan-web ragunan-api 2>/dev/null || true"
echo -e "  ${GREEN}✅${NC} Container dihentikan"

# ─────────── 4. Sync Database ───────────
echo -e "\n${YELLOW}[4/6]${NC} 🗄️ Sinkronisasi database PostgreSQL..."
ssh ${SERVER_USER}@${SERVER_IP} "
  cd ${SERVER_DIR}
  docker compose up -d postgres
  for i in \$(seq 1 30); do
    if docker exec ragunan-db pg_isready -U postgres -d ragunan_zoo &>/dev/null; then
      break
    fi
    sleep 1
  done
  if [ -f db_backup.sql ]; then
    echo '  📥 Mengimpor skema dan data terbaru dari db_backup.sql...'
    docker exec -i ragunan-db psql -U postgres -d ragunan_zoo < db_backup.sql &>/dev/null || true
    echo '  ✅ Database terupdate!'
  fi
"

# ─────────── 5. Rebuild & Start Containers ───────────
echo -e "\n${YELLOW}[5/6]${NC} 🔨 Membangun ulang dan menjalankan container..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_DIR} && docker compose up -d --build --force-recreate"
echo -e "  ${GREEN}✅${NC} Container baru aktif"

# ─────────── 6. Verification ───────────
echo -e "\n${YELLOW}[6/6]${NC} 🏥 Memeriksa kesehatan service..."
sleep 5
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_DIR} && docker compose ps"

echo -e "\n${GREEN}=========================================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SELESAI & DATABASE TERSINKRONISASI!${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo -e ""
echo -e "Aplikasi berjalan di:"
echo -e "  👉 Frontend Lokal Server: ${BLUE}http://${SERVER_IP}:3002${NC}"
echo -e "  👉 Tailscale Funnel:      ${BLUE}https://yaninfo.tail14acf1.ts.net:10000${NC}"
echo -e "  👉 Backend API:           ${BLUE}http://${SERVER_IP}:5005${NC}"
echo -e "  👉 API Health Check:      ${BLUE}http://${SERVER_IP}:5005/api/health${NC}"
echo -e ""
echo -e "${YELLOW}💡 Catatan Anti-Cache:${NC}"
echo -e "  Header anti-cache telah aktif di server. Jika tampilan browser belum berubah,"
echo -e "  lakukan hard refresh dengan: ${BLUE}Ctrl + Shift + R${NC} (Mac: ${BLUE}Cmd + Shift + R${NC})"
echo -e ""
echo -e "Lihat log sistem:"
echo -e "  ${BLUE}ssh ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_DIR} && docker compose logs -f'${NC}"

