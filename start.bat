@echo off
title Guesty Listy - Viding WA Generator
echo ============================================================
echo   Guesty Listy - WhatsApp Template Generator (Viding)
echo ============================================================
echo.
echo Membuka aplikasi di browser (http://localhost:3000)...
timeout /t 2 >nul
start http://localhost:3000
echo.
echo Server sedang berjalan... Jangan tutup jendela command prompt ini.
echo Untuk mematikan server, tekan Ctrl + C.
echo.
node server.js
pause
