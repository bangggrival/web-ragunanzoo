#!/bin/bash
# ============================================================
# Setup Lokal — Web Ragunan Zoo
# Jalankan script ini saat pertama kali clone/pindah device
# Prasyarat: Node.js 20+, PostgreSQL 14+
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}🦁 SETUP LOKAL — WEB RAGUNAN ZOO${NC}"
echo -e "${BLUE}=========================================================${NC}"

# ─────────── 1. Copy .env files ───────────
echo -e "\n${YELLOW}[1/6]${NC} 📄 Menyiapkan file environment..."

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

# ─────────── 2. Install dependencies ───────────
echo -e "\n${YELLOW}[2/6]${NC} 📦 Menginstall dependencies (frontend)..."
npm install --legacy-peer-deps

echo -e "\n${YELLOW}[3/6]${NC} 📦 Menginstall dependencies (backend)..."
cd server && npm install && cd ..

# ─────────── 3. Check PostgreSQL ───────────
echo -e "\n${YELLOW}[4/6]${NC} 🐘 Memeriksa PostgreSQL..."

# Source the env file to get DB credentials
export $(grep -v '^#' server/.env | grep -E '^PG' | xargs)
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-postgres}
PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGDATABASE=${PGDATABASE:-ragunan_zoo}

if command -v psql &> /dev/null; then
  # Check if PostgreSQL is running
  if PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -c "SELECT 1" -d postgres &> /dev/null; then
    echo -e "  ${GREEN}✅${NC} PostgreSQL aktif di ${PGHOST}:${PGPORT}"
  else
    echo -e "  ${RED}❌${NC} PostgreSQL tidak bisa dihubungi di ${PGHOST}:${PGPORT}"
    echo -e "  ${YELLOW}💡${NC} Pastikan PostgreSQL sudah diinstall dan berjalan."
    echo -e "  ${YELLOW}💡${NC} Atau gunakan Docker: ${BLUE}bash setup-docker.sh${NC}"
    exit 1
  fi

  # ─────────── 4. Create database if not exists ───────────
  echo -e "\n${YELLOW}[5/6]${NC} 🗄️  Memeriksa database ${PGDATABASE}..."

  DB_EXISTS=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$PGDATABASE'" 2>/dev/null)
  
  if [ "$DB_EXISTS" != "1" ]; then
    echo -e "  📝 Membuat database ${PGDATABASE}..."
    PGPASSWORD="$PGPASSWORD" createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE"
    echo -e "  ${GREEN}✅${NC} Database ${PGDATABASE} berhasil dibuat"
    
    echo -e "  📝 Menjalankan init_database.sql..."
    PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f server/init_database.sql
    echo -e "  ${GREEN}✅${NC} Database berhasil diinisialisasi"
  else
    echo -e "  ${GREEN}✅${NC} Database ${PGDATABASE} sudah ada"
  fi

  # ─────────── 5. Run seed data ───────────
  echo -e "\n${YELLOW}[6/6]${NC} 🌱 Menjalankan seed data..."
  cd server && node scripts/seed_all.js && cd ..
  echo -e "  ${GREEN}✅${NC} Seed data selesai"

else
  echo -e "  ${YELLOW}⚠️${NC}  psql tidak ditemukan. Skip setup database."
  echo -e "  ${YELLOW}💡${NC} Install PostgreSQL atau gunakan Docker: ${BLUE}bash setup-docker.sh${NC}"
fi

# ─────────── Done ───────────
echo -e "\n${GREEN}=========================================================${NC}"
echo -e "${GREEN}✅ SETUP SELESAI!${NC}"
echo -e "${GREEN}=========================================================${NC}"
echo -e ""
echo -e "Jalankan aplikasi dengan:"
echo -e "  ${BLUE}npm run dev${NC}"
echo -e ""
echo -e "Atau hanya backend:"
echo -e "  ${BLUE}cd server && npm run dev${NC}"
echo -e ""
echo -e "Akses:"
echo -e "  👉 Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "  👉 Backend:  ${BLUE}http://localhost:5005${NC}"
echo -e ""
echo -e "Login Admin:"
echo -e "  👤 Username: ${YELLOW}admin${NC}"
echo -e "  🔑 Password: ${YELLOW}admin123${NC}"
echo -e ""
echo -e "${RED}⚠️  PENTING: Ganti password admin di Production!${NC}"
