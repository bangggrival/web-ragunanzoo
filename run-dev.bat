@echo off
echo ===================================================
echo Menjalankan Project Web Ragunan Zoo (Server + Web)
echo ===================================================

call start-local-postgres.bat
npm.cmd run dev
pause
