@echo off
echo ===================================================
echo Memulai PostgreSQL Lokal - Ragunan Zoo
echo Host: 127.0.0.1 ^| Port: 5433 ^| Database: ragunan_zoo
echo ===================================================

powershell -Command "$p = Test-NetConnection -ComputerName 127.0.0.1 -Port 5433 -InformationLevel Quiet; if ($p) { Write-Host 'PostgreSQL sudah berjalan di port 5433!' } else { $bin = if (Test-Path '.\pgsql\bin\postgres.exe') { '.\pgsql' } else { 'C:\Users\Ahmad Rivaldi\Documents\pgsql' }; Start-Process -FilePath \"$bin\bin\postgres.exe\" -ArgumentList \"-D `\"$bin\data`\" -p 5433\" -WindowStyle Hidden; Write-Host 'PostgreSQL berhasil dijalankan di background pada port 5433!' }"
pause
