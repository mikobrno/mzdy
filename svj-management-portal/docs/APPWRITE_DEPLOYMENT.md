# Nasazení SVJ Portal na Appwrite

Tento návod vám pomůže nasadit SVJ Management Portal na Appwrite platformu.

## 🔧 Předpoklady

1. **Appwrite CLI** nainstalované:
   ```bash
   npm install -g appwrite-cli
   ```

2. **Appwrite účet** a projekt na [cloud.appwrite.io](https://cloud.appwrite.io)

3. **Docker** (volitelné, pro lokální testování)

## 🚀 Rychlé nasazení

### 1. Nastavení proměnných prostředí

```bash
# Windows PowerShell
$env:APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1"
$env:APPWRITE_PROJECT_ID = "your-project-id"
$env:APPWRITE_API_KEY = "your-api-key"
$env:DATABASE_CONNECTION_STRING = "your-database-connection"

# Linux/Mac
export APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
export APPWRITE_PROJECT_ID="your-project-id"
export APPWRITE_API_KEY="your-api-key"
export DATABASE_CONNECTION_STRING="your-database-connection"
```

### 2. Spuštění deployment scriptu

```bash
# Windows
.\deploy-appwrite.ps1

# Linux/Mac
chmod +x deploy-appwrite.sh
./deploy-appwrite.sh
```

## 🔧 Manuální nasazení

### 1. Přihlášení do Appwrite CLI

```bash
appwrite login
```

### 2. Vytvoření projektu

```bash
appwrite init project
```

Zvolte:
- Project ID: `svj-portal`
- Project Name: `SVJ Management Portal`

### 3. Vytvoření funkce

```bash
appwrite init function
```

Nastavení:
- Function ID: `svj-portal-web`
- Function Name: `SVJ Portal Web App`
- Runtime: `dotnet-8.0`
- Entrypoint: `src/SVJPortal.Web/SVJPortal.Web.csproj`

### 4. Konfigurace proměnných prostředí

V Appwrite konzoli nebo pomocí CLI:

```bash
appwrite functions updateVar \
  --functionId svj-portal-web \
  --key ASPNETCORE_ENVIRONMENT \
  --value Production

appwrite functions updateVar \
  --functionId svj-portal-web \
  --key ConnectionStrings__DefaultConnection \
  --value "your-connection-string"
```

### 5. Nasazení kódu

```bash
appwrite functions createDeployment \
  --functionId svj-portal-web \
  --entrypoint "src/SVJPortal.Web/SVJPortal.Web.csproj" \
  --code .
```

## 🗄️ Databázová konfigurace

### Option 1: Appwrite Database

Appwrite nabízí vlastní NoSQL databázi. Pro relační databáze budete potřebovat externí službu.

### Option 2: Externí SQL Server

Doporučené služby:
- **Azure SQL Database**
- **AWS RDS SQL Server**
- **Google Cloud SQL**
- **PlanetScale** (MySQL)

Příklad connection stringu:
```
Server=your-server.database.windows.net;Database=SVJPortal;User Id=your-user;Password=your-password;Encrypt=true;
```

## 🔒 Bezpečnostní konfigurace

### 1. Proměnné prostředí

Nastavte tyto proměnné v Appwrite konzoli:

```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=your-db-connection
EmailSettings__SmtpServer=smtp.gmail.com
EmailSettings__SmtpUsername=your-email
EmailSettings__SmtpPassword=your-app-password
BankingAPIs__FioBank__Token=your-fio-token
Security__JwtSecret=your-jwt-secret-key
Security__EncryptionKey=your-encryption-key
```

### 2. HTTPS konfigurace

Appwrite automaticky poskytuje HTTPS certifikáty.

### 3. CORS nastavení

```bash
appwrite projects updateCORS \
  --origin "https://your-domain.com" \
  --methods "GET,POST,PUT,DELETE" \
  --headers "Content-Type,Authorization"
```

## 🌐 Custom doména

### 1. Nastavení DNS

Přidejte CNAME záznam:
```
CNAME: your-domain.com -> your-project-id.appwrite.org
```

### 2. SSL certifikát

Appwrite automaticky vygeneruje Let's Encrypt certifikát.

## 📊 Monitoring a logy

### 1. Přístup k logům

```bash
appwrite functions listExecutions --functionId svj-portal-web
```

### 2. Metrics

V Appwrite konzoli najdete:
- CPU využití
- Memory využití
- Request count
- Error rate

## 🔧 Řešení problémů

### Častí problémy:

1. **Function timeout**
   - Zvyšte timeout na 900 sekund
   - Optimalizujte startup time

2. **Database connection error**
   - Zkontrolujte connection string
   - Ověřte firewall pravidla

3. **Memory limit**
   - Appwrite má limit 512MB RAM
   - Optimalizujte aplikaci

4. **Build errors**
   - Zkontrolujte .dockerignore
   - Ověřte dependency versions

### Debug commands:

```bash
# Zobrazit logy
appwrite functions getExecution \
  --functionId svj-portal-web \
  --executionId execution-id

# Restart funkce
appwrite functions update \
  --functionId svj-portal-web \
  --enabled false

appwrite functions update \
  --functionId svj-portal-web \
  --enabled true
```

## 📋 Checklist před nasazením

- [ ] Appwrite CLI nainstalované
- [ ] Projekt vytvořen v Appwrite konzoli
- [ ] API klíč vygenerován
- [ ] Databáze nakonfigurována
- [ ] Proměnné prostředí nastaveny
- [ ] SMTP server nakonfigurován
- [ ] Banking API tokeny připraveny
- [ ] Custom doména nakonfigurována (volitelné)

## 🆘 Podpora

Pokud narazíte na problémy:

1. **Appwrite dokumentace**: https://appwrite.io/docs
2. **Appwrite Discord**: https://discord.gg/GSeTUeA
3. **GitHub Issues**: Pro problémy s touto aplikací

## 📝 Poznámky

- Appwrite má limit 1GB storage pro free tier
- Functions mají limit 512MB RAM
- Doporučujeme použít external databázi pro produkci
- Pravidelně zálohujte databázi
- Monitorujte využití resources
