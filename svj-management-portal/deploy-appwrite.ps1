# SVJ Portal Deployment Script pro Appwrite (PowerShell)
Write-Host "🚀 Začátek nasazení SVJ Portal na Appwrite..." -ForegroundColor Green

# Kontrola Appwrite CLI
try {
    appwrite --version | Out-Null
    Write-Host "✅ Appwrite CLI je nainstalované" -ForegroundColor Green
} catch {
    Write-Host "❌ Appwrite CLI není nainstalované" -ForegroundColor Red
    Write-Host "📥 Instalace: npm install -g appwrite-cli" -ForegroundColor Yellow
    exit 1
}

# Kontrola proměnných prostředí
if (-not $env:APPWRITE_ENDPOINT) {
    Write-Host "❌ APPWRITE_ENDPOINT není nastavena" -ForegroundColor Red
    exit 1
}

if (-not $env:APPWRITE_PROJECT_ID) {
    Write-Host "❌ APPWRITE_PROJECT_ID není nastavena" -ForegroundColor Red
    exit 1
}

if (-not $env:APPWRITE_API_KEY) {
    Write-Host "❌ APPWRITE_API_KEY není nastavena" -ForegroundColor Red
    exit 1
}

# Přihlášení do Appwrite
Write-Host "🔐 Připojování k Appwrite..." -ForegroundColor Yellow
appwrite client --endpoint $env:APPWRITE_ENDPOINT --project $env:APPWRITE_PROJECT_ID --key $env:APPWRITE_API_KEY

# Vytvoření projektu
Write-Host "📋 Vytváření projektu..." -ForegroundColor Yellow
try {
    appwrite projects create --projectId "svj-portal" --name "SVJ Management Portal"
    Write-Host "✅ Projekt vytvořen" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Projekt už existuje" -ForegroundColor Cyan
}

# Vytvoření funkce
Write-Host "📤 Vytváření funkce..." -ForegroundColor Yellow
try {
    appwrite functions create `
        --functionId "svj-portal-web" `
        --name "SVJ Portal Web App" `
        --runtime "dotnet-8.0" `
        --execute "any" `
        --timeout 900 `
        --enabled true
    Write-Host "✅ Funkce vytvořena" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Funkce už existuje" -ForegroundColor Cyan
}

# Nastavení proměnných prostředí
Write-Host "⚙️ Nastavování proměnných prostředí..." -ForegroundColor Yellow

$variables = @{
    "ASPNETCORE_ENVIRONMENT" = "Production"
    "ASPNETCORE_URLS" = "http://+:3000"
    "ConnectionStrings__DefaultConnection" = $env:DATABASE_CONNECTION_STRING
    "EmailSettings__SmtpServer" = $env:SMTP_SERVER
    "EmailSettings__SmtpUsername" = $env:SMTP_USERNAME
    "EmailSettings__SmtpPassword" = $env:SMTP_PASSWORD
}

foreach ($var in $variables.GetEnumerator()) {
    if ($var.Value) {
        appwrite functions updateVar --functionId "svj-portal-web" --key $var.Key --value $var.Value
        Write-Host "✅ Proměnná $($var.Key) nastavena" -ForegroundColor Green
    }
}

# Vytvoření deployment
Write-Host "🚀 Nasazování kódu..." -ForegroundColor Yellow
appwrite functions createDeployment `
    --functionId "svj-portal-web" `
    --entrypoint "src/SVJPortal.Web/SVJPortal.Web.csproj" `
    --code "."

Write-Host "✅ Nasazení dokončeno!" -ForegroundColor Green
Write-Host "🌐 Aplikace bude dostupná na: https://$($env:APPWRITE_PROJECT_ID).appwrite.org" -ForegroundColor Cyan

# Výpis dalších kroků
Write-Host "`n📋 Další kroky:" -ForegroundColor Yellow
Write-Host "1. Nastavte DNS záznamy pro vaši doménu" -ForegroundColor White
Write-Host "2. Nakonfigurujte SSL certifikáty" -ForegroundColor White
Write-Host "3. Nastavte proměnné prostředí pro produkci" -ForegroundColor White
Write-Host "4. Proveďte database migrace" -ForegroundColor White
