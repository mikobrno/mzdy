# SVJ Management Portal

## 🏢 Specializovaný portál pro správu mzdové a komunikační agendy SVJ

SVJ Management Portal je moderní webová aplikace určená pro efektivní a automatizovanou správu mzdové a komunikační agendy pro více subjektů typu Společenství vlastníků jednotek (SVJ). Systém klade důraz na **bezpečnost**, **transparentnost**, **eliminaci chyb** a **uživatelskou přívětivost**.

## ✨ Klíčové funkce

### 🏠 Správa bytových domů (SVJ)
- **Kompletní karta SVJ** s oficiálními údaji (název, IČO, adresa, IBAN, datová schránka)
- **Automatické načítání dat** z veřejných rejstříků podle IČO
- **Uživatelská pole** pro rychlou orientaci a konfiguraci způsobu odesílání výkazů
- **Aktivní dashboard** s vizuálním přehledem stavu mezd (mřížka 12 měsíců)

### 👥 Správa zaměstnanců
- **Detailní karty zaměstnanců** s osobními, smluvními a mzdovými údaji
- **Flexibilní typy úvazků** (DPP, člen výboru, správce, úklidová služba)
- **Řízené ukončování** pracovních poměrů s automatickým generováním výstupních dokumentů
- **Kontrola limitů** (např. DPP limity) s upozorněními

### 💰 Měsíční mzdový proces
- **Automatické vytváření** pracovních kopií mezd k 1. dni měsíce
- **Real-time výpočty** odvodů, daní a čisté mzdy s kontrolou zákonných limitů
- **Dvoufázový schvalovací proces** (Mzdová účetní → Hlavní účetní)
- **Generování výstupů**:
  - 📄 Výplatní pásky (PDF)
  - 🏦 Hromadné příkazy k úhradě (XML/ABO s přímým API napojením na banky)
  - 📊 XML podklady pro ČSSZ a zdravotní pojišťovny

### 📧 Komunikační modul
- **Šablony e-mailů** s pokročilou personalizací pomocí proměnných
- **Typy proměnných**:
  - *Statické*: Globální hodnoty (např. {{rok}})
  - *Dynamické*: Specifické pro SVJ (např. {{osloveni_vyboru}})
  - *Systémové*: Automaticky generované (např. {{aktualni_mesic}})
- **Správa příloh**:
  - Manuální nahrávání souborů
  - Systémové přílohy (výplatní pásky, výkazy)
  - **Cloud automatizace** (Google Drive/OneDrive s automatickým párováním podle IČO)

### 🛡️ Bezpečnost a auditní stopa
- **Role-based autorizace** (Super-admin, Hlavní účetní, Mzdová účetní, Člen výboru, Zaměstnanec)
- **Detailní auditní stopa** všech klíčových změn s informacemi o tom, kdo, kdy a jaké změny provedl
- **Bezpečná archivace** dat po dobu minimálně 10 let

### 🌐 Technické vlastnosti
- **Bankovní API integrace** (Fio banka, Česká spořitelna, ČSOB, Komerční banka, Raiffeisenbank)
- **CSV import** dat pro prvotní nastavení
- **Připravenost na API rozšíření** pro budoucí integracje
- **Roční agenda** s podporou pro roční zúčtování daně

## 🏗️ Technická architektura

### Backend
- **.NET 8.0** Web API
- **Entity Framework Core** s SQL Server
- **ASP.NET Core Identity** pro autentifikaci a autorizaci
- **Clean Architecture** se separací concerns

### Frontend
- **ASP.NET Core MVC** s Razor Pages
- **Bootstrap 5** pro responzivní design
- **jQuery** pro interaktivní elementy
- **Chart.js** pro vizualizace

### Databáze
- **SQL Server** s migracijemi Entity Framework
- **Indexované vyhledávání** pro výkon
- **Auditní tabulky** pro sledování změn

### Integrace
- **SMTP** pro odesílání e-mailů
- **REST API** pro bankovní služby
- **OAuth2** pro cloud storage služby
- **XML generátory** pro úřady

## 🚀 Rychlý start

### Požadavky
- .NET 8.0 SDK
- SQL Server nebo SQL Server LocalDB
- Visual Studio 2022 nebo VS Code

### Instalace
```bash
# 1. Klonování repository
git clone <repository-url>
cd svj-management-portal

# 2. Obnovení balíčků
dotnet restore

# 3. Aktualizace databáze
cd src/SVJPortal.Web
dotnet ef database update

# 4. Spuštění aplikace
dotnet run
```

### Přihlašovací údaje
- **E-mail:** admin@svjportal.cz
- **Heslo:** Admin123!

## 📁 Struktura projektu

```
svj-management-portal/
├── src/
│   ├── SVJPortal.Web/           # 🌐 Hlavní webová aplikace
│   │   ├── Controllers/         # MVC kontrolery
│   │   ├── Models/             # Modely a ViewModely
│   │   ├── Views/              # Razor šablony
│   │   ├── Services/           # Aplikační služby
│   │   ├── Data/               # DbContext a migrace
│   │   └── wwwroot/            # Statické soubory
│   ├── SVJPortal.Core/         # 🔧 Core business logika
│   │   ├── Entities/           # Doménové entity
│   │   ├── Interfaces/         # Abstrakce služeb
│   │   └── Services/           # Implementace business logiky
│   └── SVJPortal.Tests/        # 🧪 Automatizované testy
├── docs/                       # 📚 Dokumentace
└── README.md
```

## 🎯 Roadmapa

### Verze 1.0 (Aktuální)
- ✅ Základní správa SVJ a zaměstnanců
- ✅ Automatizovaný mzdový proces
- ✅ E-mailové šablony a komunikace
- ✅ Auditní stopa a bezpečnost

### Verze 1.1 (Plánováno)
- 🔄 Rozšířená bankovní API integrace
- 🔄 Pokročilé reportování a analytics
- 🔄 Mobile aplikace
- 🔄 API pro třetí strany

### Verze 2.0 (Budoucnost)
- 📱 PWA (Progressive Web App)
- 🤖 AI asistent pro mzdy
- 📊 Business Intelligence dashboard
- 🌍 Multi-tenancy architektura

## 🤝 Příspívání

Příspěvky jsou vítány! Pokud máte nápady na vylepšení nebo naleznete chybu:

1. Vytvořte issue pro diskusi
2. Forkněte repository
3. Vytvořte feature branch
4. Pošlete pull request

## 📄 Licencování

Tento projekt je licencován pod **MIT licencí** - viz [LICENSE](LICENSE) soubor pro detaily.

## 📞 Podpora

- 📧 **E-mail:** support@svjportal.cz
- 🐛 **Bug reporty:** [GitHub Issues](issues)
- 📖 **Dokumentace:** [Wiki](wiki)

---

*Vytvořeno s ❤️ pro efektivní správu SVJ v České republice*