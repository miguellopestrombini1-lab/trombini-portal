@echo off
title TROMBINY PORTAL - Inicializador
cls
echo.
echo  =====================================================
echo           🚀 TROMBINY PORTAL - INICIALIZADOR
echo  =====================================================
echo.
echo  1. Verificando conexao e atualizacoes...
git pull origin main

echo.
echo  2. Instalando ferramentas necessarias (isso so demora na primeira vez)...
call npm install --no-audit --no-fund

echo.
echo  3. Iniciando o servidor...
echo     (Aguarde alguns segundos ate aparecer "Ready" ou "Local: http://localhost:3000")
echo.
echo  💡 DICA: Mantenha esta janela aberta enquanto estiver usando o site!
echo.
start http://localhost:3000
npm run dev

pause
