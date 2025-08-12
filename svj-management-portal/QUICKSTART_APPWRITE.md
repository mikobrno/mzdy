# 🚀 Krok za krokem: Nasazení SVJ Portal na Appwrite

## Problém s lokálním buildem
Pokud máte problém s lokálním buildem (.NET SDK není nainstalovaný), nevadí! 
Appwrite může sestavit aplikaci přímo na jejich serverech.

## ✅ Řešení: Nasazení přímo na Appwrite

### 1. Instalace Appwrite CLI

```powershell
# Nainstalujte Node.js (pokud nemáte): https://nodejs.org
npm install -g appwrite-cli
```

### 2. Vytvoření Appwrite účtu
1. Jděte na https://cloud.appwrite.io
2. Zaregistrujte se / přihlaste se
3. Vytvořte nový projekt s názvem "SVJ Portal"

### 3. Získání API přístupů
V Appwrite konzoli:
1. Jděte do Settings → API Keys
2. Vytvořte nový API klíč s oprávněními pro Functions
3. Poznamenejte si Project ID z URL

### 4. Nastavení CLI

```powershell
# Přihlášení
appwrite login

# Nastavení projektu
appwrite client --endpoint https://cloud.appwrite.io/v1 --project YOUR_PROJECT_ID --key YOUR_API_KEY
```

### 5. Inicializace funkce

```powershell
# Ve složce projektu
cd "d:\Projekty\mzdy\svj-management-portal"

# Inicializace funkce
appwrite init function
```

Nastavení při inicializaci:
- **Function ID**: `svj-portal-web`
- **Function Name**: `SVJ Management Portal`
- **Runtime**: `dotnet-8.0`
- **Entrypoint**: `src/SVJPortal.Web/SVJPortal.Web.csproj`

### 6. Konfigurace appwrite.json

Editujte soubor `appwrite.json`:

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "functions": [
    {
      "$id": "svj-portal-web",
      "name": "SVJ Management Portal",
      "runtime": "dotnet-8.0",
      "execute": ["any"],
      "events": [],
      "schedule": "",
      "timeout": 900,
      "enabled": true,
      "logging": true,
      "entrypoint": "src/SVJPortal.Web/SVJPortal.Web.csproj",
      "commands": "dotnet restore && dotnet publish -c Release -o published",
      "ignore": [
        "node_modules",
        ".git",
        ".vscode",
        "bin",
        "obj",
        ".vs"
      ]
    }
  ]
}
```

### 7. Nasazení funkce

```powershell
# Deploy aplikace
appwrite deploy function

# Nebo manuálně
appwrite functions createDeployment --functionId svj-portal-web --entrypoint "src/SVJPortal.Web/SVJPortal.Web.csproj" --code .
```

### 8. Nastavení proměnných prostředí

V Appwrite konzoli nebo pomocí CLI:

```powershell
# Základní konfigurace
appwrite functions updateVar --functionId svj-portal-web --key ASPNETCORE_ENVIRONMENT --value Production
appwrite functions updateVar --functionId svj-portal-web --key ASPNETCORE_URLS --value "http://+:3000"

# Databáze (použijte externí SQL Server)
appwrite functions updateVar --functionId svj-portal-web --key "ConnectionStrings__DefaultConnection" --value "YOUR_DATABASE_CONNECTION_STRING"

# Email nastavení
appwrite functions updateVar --functionId svj-portal-web --key "EmailSettings__SmtpServer" --value "smtp.gmail.com"
appwrite functions updateVar --functionId svj-portal-web --key "EmailSettings__SmtpPort" --value "587"
appwrite functions updateVar --functionId svj-portal-web --key "EmailSettings__SmtpUsername" --value "YOUR_EMAIL"
appwrite functions updateVar --functionId svj-portal-web --key "EmailSettings__SmtpPassword" --value "YOUR_APP_PASSWORD"
```

### 9. Testování

Po nasazení:
1. Jděte do Appwrite konzole → Functions → svj-portal-web
2. V záložce "Executions" spusťte test
3. Aplikace bude dostupná na URL kterou vám Appwrite poskytne

### 10. Custom doména (volitelné)

1. V Appwrite konzoli jděte do Settings → Domains
2. Přidejte svou doménu
3. Nastavte DNS CNAME záznam podle instrukcí

## 🗄️ Databáze

Pro produkční použití doporučujeme externí databázi:

### Azure SQL Database
```
Server=your-server.database.windows.net;Database=SVJPortal;User Id=your-user;Password=your-password;Encrypt=true;TrustServerCertificate=false;
```

### AWS RDS SQL Server
```
Server=your-instance.region.rds.amazonaws.com;Database=SVJPortal;User Id=your-user;Password=your-password;Encrypt=true;
```

### Google Cloud SQL
```
Server=your-instance-ip;Database=SVJPortal;User Id=your-user;Password=your-password;Encrypt=true;
```

## ❌ Řešení problémů

### Function timeout
- Zvyšte timeout na 900 sekund
- Optimalizujte startup kód

### Memory limit exceeded
- Appwrite má limit 512MB
- Optimalizujte dependencies

### Build errors
- Zkontrolujte že všechny soubory jsou v repository
- Ověřte .csproj soubory

### Database connection errors
- Ověřte connection string
- Zkontrolujte firewall pravidla pro databázi

## 📞 Podpora

- **Appwrite docs**: https://appwrite.io/docs/functions
- **Discord**: https://discord.gg/GSeTUeA
- **Stack Overflow**: Tag `appwrite`

## 🎉 Hotovo!

Po úspěšném nasazení budete mít:
- ✅ Funkční SVJ Management Portal
- ✅ Automatické HTTPS
- ✅ Škálování podle zátěže
- ✅ Monitoring a logy
- ✅ Backup a recovery

**URL aplikace**: https://YOUR_PROJECT_ID.appwrite.org/functions/svj-portal-web/

Gratulujeme! 🎉
