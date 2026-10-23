@echo off
echo ===================================================
echo Menghentikan PostgreSQL Portable Lokal...
echo ===================================================

.\pgsql\bin\pg_ctl.exe -D .\pgsql\data stop
powershell -Command "Stop-Process -Name postgres -Force -ErrorAction SilentlyContinue"
echo PostgreSQL telah dihentikan.
pause
