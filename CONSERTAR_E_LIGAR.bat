@echo off
title CONSERTAR E LIGAR TROMBINY PORTAL
cls
echo.
echo  =====================================================
echo           🛠️ CONSERTANDO E LIGANDO O PORTAL
echo  =====================================================
echo.
echo  1. Baixando correcoes do GitHub...
git pull origin main

echo.
echo  2. Limpando lixo e arquivos temporarios...
rd /s /q .next 2>nul
echo.
echo  3. Instalando ferramentas (so demora na primeira vez)...
call npm install --no-audit --no-fund

echo.
echo  4. Ligando o motor do site...
echo     (Mantenha esta janela aberta!)
echo.
echo  🌐 O site vai abrir em: http://localhost:3000
echo.
start http://localhost:3000
npm run dev

pause
