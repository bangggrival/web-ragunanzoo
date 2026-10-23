@echo off
echo ===================================================
echo Memulai PostgreSQL Portable Lokal - Ragunan Zoo
echo Host: 127.0.0.1 ^| Port: 5433 ^| Database: ragunan_zoo
echo ===================================================

powershell -Command "$p = Test-NetConnection -ComputerName 127.0.0.1 -Port 5433 -InformationLevel Quiet; if ($p) { Write-Host 'PostgreSQL portable sudah berjalan di port 5433!' } else { Start-Process -FilePath '.\pgsql\bin\postgres.exe' -ArgumentList '-D .\pgsql\data -p 5433' -WindowStyle Hidden; Write-Host 'PostgreSQL portable berhasil dijalankan di background pada port 5433!' }"
pause
