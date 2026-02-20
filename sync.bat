@echo off
echo Sincronizando Trombiny Portal...
git add .
git commit -m "Atualizacao automatica"
git push
echo Pronto! Site sendo atualizado na Vercel.
pause
