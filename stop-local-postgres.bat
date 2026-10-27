@echo off
echo Menghentikan PostgreSQL pada port 5433...
powershell -Command "Get-Process postgres -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*pgsql*' } | Stop-Process -Force; Write-Host 'PostgreSQL dihentikan.'"
pause
