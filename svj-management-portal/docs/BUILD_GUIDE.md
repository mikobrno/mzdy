# SVJ Management Portal - Návod k sestavení a spuštění

## Požadavky

### Systémové požadavky:
- .NET 8.0 SDK nebo vyšší
- Visual Studio 2022 nebo Visual Studio Code
- SQL Server nebo SQL Server LocalDB
- IIS Express (pro vývoj)

### Volitelné:
- Git pro správu verzí
- Azure účet pro deployment

## Instalace

### 1. Nainstalujte .NET 8.0 SDK
Stáhněte a nainstalujte z: https://dotnet.microsoft.com/download

### 2. Ověřte instalaci
```bash
dotnet --version
```

### 3. Klonujte nebo stáhněte projekt
```bash
git clone <repository-url>
cd svj-management-portal
```

## Konfigurace

### 1. Databáze
V souboru `src/SVJPortal.Web/appsettings.json` upravte connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SVJPortalDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### 2. E-mail konfigurace
Nastavte SMTP server pro odesílání e-mailů:

```json
{
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "Username": "your_email@gmail.com",
    "Password": "your_app_password",
    "EnableSsl": true,
    "DisplayName": "SVJ Management Portal"
  }
}
```

### 3. API klíče bank (volitelné)
Pro automatické odesílání plateb nastavte API klíče bank:

```json
{
  "BankApiSettings": {
    "FioBank": {
      "ApiToken": "your_fio_api_token",
      "ApiUrl": "https://www.fio.cz/ib_api/rest"
    }
  }
}
```

## Sestavení a spuštění

### 1. Obnovte NuGet balíčky
```bash
dotnet restore
```

### 2. Sestavte projekt
```bash
dotnet build
```

### 3. Vytvořte databázi
```bash
cd src/SVJPortal.Web
dotnet ef database update
```

### 4. Spusťte aplikaci
```bash
dotnet run
```

Aplikace bude dostupná na: `https://localhost:5001`

## Přihlašovací údaje

### Výchozí administrátor:
- E-mail: `admin@svjportal.cz`
- Heslo: `Admin123!`

## Struktura projektu

```
svj-management-portal/
├── src/
│   ├── SVJPortal.Web/          # Hlavní webová aplikace
│   ├── SVJPortal.Core/         # Core business logika
│   └── SVJPortal.Tests/        # Testy
├── docs/                       # Dokumentace
└── README.md
```

## Testování

### Spuštění testů
```bash
dotnet test
```

## Deployment

### Azure App Service
1. Vytvořte Azure App Service
2. Nastavte connection string v Azure Portal
3. Publikujte pomocí Visual Studio nebo Azure CLI

### IIS
1. Publikujte aplikaci: `dotnet publish -c Release`
2. Nakopírujte obsah `bin/Release/net8.0/publish/` na IIS server
3. Vytvořte Application Pool s .NET CLR verze "No Managed Code"
4. Nastavte správné oprávnění pro IIS_IUSRS

## Funkce systému

### Dashboard
- Přehled všech SVJ
- Stav zpracování mezd
- Rychlé akce

### Správa SVJ
- Evidence základních údajů
- IČO, IBAN, datová schránka
- Kontaktní informace

### Správa zaměstnanců
- Osobní a smluvní údaje
- Mzdové údaje
- Historie změn

### Mzdový proces
- Automatické generování mezd
- Dvoufázové schvalování
- Výpočet odvodů a daní
- Generování výplatních pásek
- Export pro banky a úřady

### Komunikační modul
- E-mailové šablony s proměnnými
- Automatické přílohy z cloudu
- Historie odeslaných e-mailů

### Bezpečnost
- Role-based autorizace
- Auditní stopa všech změn
- Šifrování citlivých dat

## Troubleshooting

### Časté problémy:

1. **Chyba připojení k databázi**
   - Zkontrolujte connection string
   - Ujistěte se, že SQL Server běží

2. **Chyba při odesílání e-mailů**
   - Zkontrolujte SMTP nastavení
   - Použijte app password pro Gmail

3. **Chyba při sestavení**
   - Zkontrolujte verzi .NET SDK
   - Spusťte `dotnet restore`

## Podpora

Pro technickou podporu nebo hlášení chyb vytvořte issue v repository.
