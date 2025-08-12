# Build script pro SVJ Portal
Write-Host "Build SVJ Portal..." -ForegroundColor Green

# Kontrola, zda je nainstalovan Docker
try {
    docker --version | Out-Null
    Write-Host "Docker je dostupny" -ForegroundColor Green
    
    # Build pomoci Dockeru
    Write-Host "Buildovani pomoci Docker..." -ForegroundColor Yellow
    docker build -t svj-portal .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker build uspesny!" -ForegroundColor Green
        Write-Host "Pro spusteni pouzijte: docker run -p 8080:80 svj-portal" -ForegroundColor Cyan
    } else {
        Write-Host "Docker build selhal" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Docker neni dostupny" -ForegroundColor Red
    Write-Host "Moznosti reseni:" -ForegroundColor Yellow
    Write-Host "1. Nainstalujte Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "2. Nainstalujte .NET 8.0 SDK: https://dotnet.microsoft.com/download" -ForegroundColor White
    Write-Host "3. Pouzijte Appwrite deployment (neni potreba lokalni build)" -ForegroundColor White
}

Write-Host "" 
Write-Host "Dalsi kroky pro nasazeni na Appwrite:" -ForegroundColor Yellow
Write-Host "1. Nainstalujte Appwrite CLI: npm install -g appwrite-cli" -ForegroundColor White
Write-Host "2. Spustte: deploy-appwrite.ps1" -ForegroundColor White
Write-Host "3. Nebo postupujte podle docs/APPWRITE_DEPLOYMENT.md" -ForegroundColor White
