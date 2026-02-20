$lastHash = ""
Write-Host "🚀 Monitorando alterações no Trombiny Portal..." -ForegroundColor Cyan

while ($true) {
    # Puxa atualizações primeiro para evitar conflitos
    git pull origin main --quiet 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Conflito detectado ao puxar! Abortando mesclagem para proteger o código e não travar o sistema." -ForegroundColor Red
        git merge --abort 2>$null
        git rebase --abort 2>$null
        Start-Sleep -Seconds 1800
        continue
    }

    # Checa se houve mudança local
    $status = git status --short
    if ($status) {
        Write-Host "✨ Mudanças detectadas! Sincronizando..." -ForegroundColor Yellow
        git add .
        git commit -m "Auto-sync: $(Get-Date -Format 'HH:mm:ss')" --quiet
        git push origin main --quiet 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️ Falha ao enviar para a nuvem. O sistema tentará novamente no próximo ciclo." -ForegroundColor Red
        }
        else {
            Write-Host "✅ Tudo sincronizado e online na Vercel!" -ForegroundColor Green
        }
    }
    
    Start-Sleep -Seconds 1800 # 30 minutos
}
