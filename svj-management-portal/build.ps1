# Build script pro SVJ Portal
Write-Host "🔨 Building SVJ Portal..." -ForegroundColor Green

# Kontrola, zda je nainstalovaný Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker je dostupný" -ForegroundColor Green
    
    # Build pomocí Dockeru
    Write-Host "🐳 Buildování pomocí Docker..." -ForegroundColor Yellow
    docker build -t svj-portal .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker build úspěšný!" -ForegroundColor Green
        Write-Host "🚀 Pro spuštění použijte: docker run -p 8080:80 svj-portal" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Docker build selhal" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Docker není dostupný" -ForegroundColor Red
    Write-Host "💡 Možnosti řešení:" -ForegroundColor Yellow
    Write-Host "1. Nainstalujte Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "2. Nainstalujte .NET 8.0 SDK: https://dotnet.microsoft.com/download" -ForegroundColor White
    Write-Host "3. Použijte Appwrite deployment (není potřeba lokální build)" -ForegroundColor White
}

Write-Host "`n📋 Další kroky pro nasazení na Appwrite:" -ForegroundColor Yellow
Write-Host "1. Nainstalujte Appwrite CLI: npm install -g appwrite-cli" -ForegroundColor White
Write-Host "2. Spusťte: .\deploy-appwrite.ps1" -ForegroundColor White
Write-Host "3. Nebo postupujte podle docs\APPWRITE_DEPLOYMENT.md" -ForegroundColor White
