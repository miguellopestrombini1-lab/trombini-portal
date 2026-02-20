$lastHash = ""
Write-Host "🚀 Monitorando alterações no Trombiny Portal..." -ForegroundColor Cyan

while ($true) {
    # Puxa atualizações primeiro para evitar conflitos
    git pull origin main --quiet

    # Checa se houve mudança local
    $status = git status --short
    if ($status) {
        Write-Host "✨ Mudanças detectadas! Sincronizando..." -ForegroundColor Yellow
        git add .
        git commit -m "Auto-sync: $(Get-Date -Format 'HH:mm:ss')" --quiet
        git push origin main --quiet
        Write-Host "✅ Tudo sincronizado e online na Vercel!" -ForegroundColor Green
    }
    
    Start-Sleep -Seconds 10
}
