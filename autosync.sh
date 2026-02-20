#!/bin/bash
echo "🚀 Monitorando alterações no Trombiny Portal (Mac)..."

while true; do
    # Tenta puxar as atualizações primeiro
    git pull origin main --quiet
    if [ $? -ne 0 ]; then
        echo "⚠️ Conflito ou erro detectado ao puxar! Abortando mesclagem para proteger o código."
        git merge --abort 2>/dev/null
        git rebase --abort 2>/dev/null
        sleep 1800
        continue
    fi

    # Checa se houve mudança local
    if [ -n "$(git status --short)" ]; then
        echo "✨ Mudanças detectadas! Sincronizando..."
        git add .
        git commit -m "Auto-sync: $(date +'%H:%M:%S')" --quiet
        git push origin main --quiet
        if [ $? -ne 0 ]; then
            echo "⚠️ Falha ao enviar para a nuvem. Tentaremos no próximo ciclo."
        else
            echo "✅ Tudo sincronizado e online na Vercel!"
        fi
    fi
    
    sleep 1800 # 30 minutos
done
