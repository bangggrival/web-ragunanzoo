#!/bin/bash

# =================================================================
# SCRIPT DEPLOYMENT OTOMATIS - TAMAN MARGASATWA RAGUNAN
# =================================================================

set -e

echo "🚀 [1/4] Memulai One-Command Deployment..."

# 1. Pastikan docker & docker compose tersedia
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker belum terinstall di server ini."
    exit 1
fi

# 2. Hentikan container lama jika sedang berjalan
echo "🔄 [2/4] Menghentikan container lama..."
docker compose down || true

# 3. Build & Jalankan seluruh service (Frontend, Backend, Postgres)
echo "🏗️ [3/4] Membangun image & menyalakan service..."
docker compose up -d --build

# 4. Cek status container
echo "📊 [4/4] Memeriksa status service..."
docker compose ps

echo ""
echo "========================================================="
echo "✅ DEPLOYMENT BERHASIL! Website Ragunan Zoo Siap Digunakan."
echo "========================================================="
