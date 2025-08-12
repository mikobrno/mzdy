# SVJ Management Portal

Komplexní webový portál pro správu mzdové a komunikační agendy Společenství vlastníků jednotek (SVJ).

## 🎯 Hlavní funkcionalita

### 📋 Správa SVJ
- Registrace a správa více SVJ v jednom systému
- Kompletní evidence údajů (IČO, DIČ, IBAN, datová schránka)
- Organizace podle způsobu odesílání dokumentů (email, datová schránka, pošta)

### 👥 Správa zaměstnanců
- Evidence všech typů pracovních poměrů (HPP, DPP, DPČ)
- Správa údajů včetně rodného čísla a zdravotní pojišťovny
- Sledování členů výboru a jejich funkcí
- Historie změn a ukončení pracovních poměrů

### 💰 Mzdová agenda
- Automatický výpočet hrubé a čisté mzdy
- Kalkulace sociálního a zdravotního pojištění
- Výpočet daně z příjmu s uplatněním slev
- Sledování limitů pro DPP (10.000 Kč měsíčně, 120.000 Kč ročně)
- Workflow schvalování a vyplácení mezd
- Export do bankovních formátů (Fio, ČS, ČSOB, KB, RB)

### 📧 Komunikační systém
- Flexibilní systém email šablon s proměnnými
- Automatické generování dokumentů (výplatní pásky, potvrzení)
- Integrace s cloud úložišti (Google Drive, OneDrive)
- Sledování historie odeslaných emailů
- Hromadné odesílání s personalizací

### 🔐 Bezpečnost a audit
- Role-based autorizace (SuperAdministrator, HlavníÚčetní, MzdováÚčetní, ČlenVýboru, Zaměstnanec)
- Kompletní audit trail všech akcí
- Šifrování citlivých dat
- Bezpečné ukládání hesel a API klíčů

## 🏗️ Architektura

### Backend (.NET 8.0)
```
SVJPortal.Core/          # Business logic a entity
├── Entities/           # Doménové modely
├── Interfaces/         # Abstrakce služeb
└── Services/          # Business logika

SVJPortal.Web/          # Web aplikace
├── Controllers/        # MVC controllery
├── Data/              # EF Core context
├── Models/            # ViewModely
├── Services/          # Aplikační služby
└── Views/             # Razor views

SVJPortal.Tests/        # Testy
├── Unit/              # Unit testy
└── Integration/       # Integrační testy
```

### Frontend
- **Bootstrap 5** - Responzivní UI framework
- **jQuery** - JavaScript funkcionalita
- **Font Awesome** - Ikony
- **Chart.js** - Grafy a reporty

### Databáze
- **SQL Server** s LocalDB pro vývoj
- **Entity Framework Core** ORM
- Automatické migrace a seeding

## 🚀 Instalace a spuštění

### Možnost 1: Nasazení na Appwrite (doporučeno)

**Rychlé nasazení bez lokální instalace .NET:**

1. **Registrace na Appwrite**
   - Jděte na https://cloud.appwrite.io
   - Vytvořte účet a nový projekt

2. **Instalace Appwrite CLI**
   ```bash
   npm install -g appwrite-cli
   ```

3. **Jednoduché nasazení**
   ```bash
   appwrite login
   appwrite init function
   appwrite deploy function
   ```

📖 **Detailní návod**: Viz [QUICKSTART_APPWRITE.md](QUICKSTART_APPWRITE.md)

### Možnost 2: Lokální vývoj

#### Požadavky
- .NET 8.0 SDK
- SQL Server nebo LocalDB
- Visual Studio 2022 nebo VS Code

#### Kroky instalace

1. **Klonování repository**
```bash
git clone [repository-url]
cd svj-management-portal
```

2. **Instalace .NET SDK**
- Stáhněte z https://dotnet.microsoft.com/download
- Nainstalujte verzi 8.0 nebo vyšší

3. **Konfigurace databáze**
```bash
cd src/SVJPortal.Web
dotnet ef database update
```

4. **Spuštění aplikace**
```bash
dotnet run
```

5. **Přístup k aplikaci**
- Otevřete prohlížeč na `https://localhost:5001`
- Přihlaste se s admin účtem (detaily v dokumentaci)

### Možnost 3: Docker

```bash
docker build -t svj-portal .
docker run -p 8080:80 svj-portal
```

## ☁️ Cloud deployment

### Appwrite Functions
- ✅ **Automatické buildování** - žádný lokální .NET SDK
- ✅ **HTTPS certifikáty** zdarma  
- ✅ **Custom domény**
- ✅ **Auto-scaling**
- ✅ **Monitoring a logy**

### Další platformy
- **Azure App Service**
- **AWS Elastic Beanstalk** 
- **Google Cloud Run**
- **Heroku**

## ⚙️ Konfigurace

### Hlavní nastavení (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SVJPortal;Trusted_Connection=true"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "EnableSsl": true
  },
  "BankingAPIs": {
    "FioBank": {
      "Token": "your-fio-token"
    }
  }
}
```

### Uživatelské role
- **SuperAdministrator** - Plný přístup ke všem funkcím
- **HlavníÚčetní** - Správa SVJ, zaměstnanců, schvalování mezd
- **MzdováÚčetní** - Zpracování mezd, generování dokumentů
- **ČlenVýboru** - Přístup k datům vlastního SVJ
- **Zaměstnanec** - Zobrazení vlastních údajů

## 📊 Hlavní funkce

### Dashboard
- Přehled všech SVJ na jednom místě
- Statistiky zaměstnanců a mezd
- Kalendář mzdových termínů
- Rychlé akce a notifikace

### Mzdové zpracování
```csharp
// Příklad výpočtu čisté mzdy
var cistaMzda = hrubaMzda 
    - socialniPojisteni 
    - zdravotniPojisteni 
    - danZPrijmu 
    + slevyNaDani;
```

### Email šablony
- Dynamické proměnné: `{JmenoZamestnance}`, `{CastkaKVyplate}`
- Statické proměnné: `{NazevSVJ}`, `{DatumVyplaceni}`
- Systémové proměnné: `{AktualniDatum}`, `{UzivatelskeJmeno}`

### API integrace
- **Bankovní API** pro export plateb
- **Datové schránky** pro odesílání dokumentů
- **Cloud storage** pro zálohy a sdílení

## 🧪 Testování

### Spuštění testů
```bash
dotnet test
```

### Testovací data
- Automatické generování testovacích SVJ a zaměstnanců
- Simulace mzdových procesů
- Testování email šablon

## 📈 Monitoring a reporting

### Auditní záznamy
- Kdo, kdy, co změnil
- Historie všech operací
- Export auditních záznamů

### Reporty
- Měsíční mzdové výkazy
- Roční přehledy na zaměstnance
- Statistiky podle SVJ
- Export do PDF/Excel

## 🔧 Vývoj

### Přidání nové funkcionality
1. Vytvoření entity v `Core/Entities`
2. Aktualizace DbContext
3. Vytvoření migrace
4. Implementace služby
5. Přidání controlleru a views

### Coding standardy
- C# naming conventions
- SOLID principy
- Repository pattern
- Dependency injection

## 🚀 Deployment

### Produkční prostředí
1. Publikování aplikace
```bash
dotnet publish -c Release
```

2. Konfigurace IIS/Nginx
3. Nastavení SSL certifikátů
4. Konfigurace produkční databáze

### Backup strategie
- Denní zálohy databáze
- Záloha konfiguračních souborů
- Archivace auditních záznamů

## 📞 Podpora

### Časté problémy
- **Problém s připojením k databázi**: Zkontrolujte connection string
- **Chyby při odesílání emailů**: Ověřte SMTP nastavení
- **Problém s autorizací**: Zkontrolujte uživatelské role

### Technická podpora
- Email: support@svjportal.cz
- Dokumentace: https://docs.svjportal.cz
- Issue tracker: GitHub Issues

## 📝 Changelog

### Verze 1.0.0 (2024-01-01)
- Základní funkcionalita SVJ správy
- Mzdový systém
- Email komunikace
- Uživatelské role
- Audit systém

### Plánované funkce
- [ ] Mobile aplikace
- [ ] API pro externí systémy
- [ ] Rozšířené reporty
- [ ] Integration s účetními systémy

## 📄 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor.

## 🤝 Přispívání

1. Fork projektu
2. Vytvoření feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změn (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevření Pull Request

---

**SVJ Management Portal** - Moderní řešení pro efektivní správu SVJ
Verze 1.0.0 | © 2024 | Vytvořeno s ❤️ pro česká SVJ
