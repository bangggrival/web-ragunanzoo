#!/bin/bash
# ============================================================
# Setup Docker — Web Ragunan Zoo
# Jalankan script ini untuk deploy via Docker (di server atau lokal)
# Prasyarat: Docker & Docker Compose
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}🐳 SETUP DOCKER — WEB RAGUNAN ZOO${NC}"
echo -e "${BLUE}=========================================================${NC}"

# ─────────── 1. Check Docker ───────────
echo -e "\n${YELLOW}[1/5]${NC} 🔍 Memeriksa Docker..."

if ! command -v docker &> /dev/null; then
  echo -e "  ${RED}❌${NC} Docker tidak ditemukan!"
  echo -e "  ${YELLOW}💡${NC} Install Docker: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo -e "  ${RED}❌${NC} Docker Compose tidak ditemukan!"
  echo -e "  ${YELLOW}💡${NC} Docker Compose biasanya sudah termasuk di Docker Desktop."
  exit 1
fi

echo -e "  ${GREEN}✅${NC} Docker $(docker --version | grep -oP 'version \K[^,]+')"
echo -e "  ${GREEN}✅${NC} Docker Compose $(docker compose version --short)"

# ─────────── 2. Copy .env files ───────────
echo -e "\n${YELLOW}[2/5]${NC} 📄 Menyiapkan file environment..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "  ${GREEN}✅${NC} .env dibuat dari .env.example"
else
  echo -e "  ${YELLOW}⏭️${NC}  .env sudah ada, skip"
fi

if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  echo -e "  ${GREEN}✅${NC} server/.env dibuat dari server/.env.example"
else
  echo -e "  ${YELLOW}⏭️${NC}  server/.env sudah ada, skip"
fi

# ─────────── 3. Create uploads directory ───────────
echo -e "\n${YELLOW}[3/5]${NC} 📁 Menyiapkan direktori uploads..."
mkdir -p server/uploads
echo -e "  ${GREEN}✅${NC} server/uploads siap"

# ─────────── 4. Build & Start ───────────
echo -e "\n${YELLOW}[4/5]${NC} 🔨 Membangun dan menjalankan Docker containers..."
echo -e "  ${YELLOW}⏳${NC} Proses ini bisa memakan waktu 5-10 menit (pertama kali)..."

docker compose up -d --build

# ─────────── 5. Wait for health ───────────
echo -e "\n${YELLOW}[5/5]${NC} 🏥 Menunggu semua container sehat..."

# Wait for database
echo -n "  ⏳ Database..."
for i in $(seq 1 30); do
  if docker exec ragunan-db pg_isready -U postgres -d ragunan_zoo &> /dev/null; then
    echo -e " ${GREEN}✅${NC}"
    break
  fi
  sleep 2
  echo -n "."
  if [ $i -eq 30 ]; then
    echo -e " ${RED}❌ Timeout${NC}"
  fi
done

# Wait for API
echo -n "  ⏳ Backend API..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:5005/api/health &> /dev/null; then
    echo -e " ${GREEN}✅${NC}"
    break
  fi
  sleep 2
  echo -n "."
  if [ $i -eq 30 ]; then
    echo -e " ${RED}❌ Timeout${NC}"
  fi
done

# Wait for Frontend
WEB_PORT="${WEB_PORT:-3000}"
echo -n "  ⏳ Frontend (port ${WEB_PORT})..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:${WEB_PORT} &> /dev/null; then
    echo -e " ${GREEN}✅${NC}"
    break
  fi
  sleep 3
  echo -n "."
  if [ $i -eq 30 ]; then
    echo -e " ${YELLOW}⚠️  Masih loading (Next.js mungkin masih cold start)${NC}"
  fi
done

# ─────────── 6. Run seed or import backup (optional) ───────────
echo ""
if [ -f "db_backup.sql" ]; then
  echo -e "📦 Ditemukan file ${YELLOW}db_backup.sql${NC}."
  read -p "🔄 Apakah Anda ingin mengimpor database dari db_backup.sql? (Y/n): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo -e "  📥 Mengimpor db_backup.sql ke container ragunan-db..."
    docker exec -i ragunan-db psql -U postgres -d ragunan_zoo < db_backup.sql
    echo -e "  ${GREEN}✅${NC} Import database dari db_backup.sql selesai"
  fi
else
  read -p "🌱 Apakah Anda ingin menjalankan seed data default? (y/N): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "  📝 Menjalankan seed data..."
    docker exec ragunan-api node seed_all.js 2>/dev/null || echo -e "  ${YELLOW}⚠️${NC}  Seed gagal (mungkin belum perlu)"
    echo -e "  ${GREEN}✅${NC} Seed selesai"
  fi
fi

# ─────────── Done ───────────
echo -e "\n${GREEN}=========================================================${NC}"
echo -e "${GREEN}✅ DOCKER SETUP SELESAI!${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo -e ""
echo -e "Container Status:"
docker compose ps
echo -e ""
echo -e "Akses:"
echo -e "  👉 Frontend: ${BLUE}http://localhost:${WEB_PORT}${NC}"
echo -e "  👉 Backend:  ${BLUE}http://localhost:5005${NC}"
echo -e "  👉 Health:   ${BLUE}http://localhost:5005/api/health${NC}"
echo -e ""
echo -e "Login Admin:"
echo -e "  👤 Username: ${YELLOW}admin${NC}"
echo -e "  🔑 Password: ${YELLOW}admin123${NC}"
echo -e ""
echo -e "Perintah berguna:"
echo -e "  ${BLUE}docker compose logs -f${NC}          — Lihat log semua container"
echo -e "  ${BLUE}docker compose logs -f ragunan-api${NC} — Lihat log backend saja"
echo -e "  ${BLUE}docker compose down${NC}              — Stop semua container"
echo -e "  ${BLUE}docker compose restart${NC}           — Restart semua"
echo -e ""
echo -e "${RED}⚠️  PENTING: Ganti password admin di Production!${NC}"
