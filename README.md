# Mzdy SVJ Portal

Moderní webová aplikace pro správu mzdové agendy společenství vlastníků jednotek (SVJ).

## 🚀 Technologie

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui komponenty
- **Build**: Vite
- **Deployment**: Netlify
- **State Management**: React Query
- **Routing**: React Router

## 📋 Funkce

- 📊 **Dashboard** s přehledem klíčových metrik
- 🏢 **Správa SVJ** - evidence společenství vlastníků
- 👥 **Správa zaměstnanců** - evidence osob a jejich kontraktů
- 💰 **Mzdová agenda** - výpočty mezd a správa výplat
- 📧 **Komunikační modul** - e-mailové šablony a kampaně
- ⚙️ **Nastavení** - konfigurace systému

## 🛠️ Instalace a spuštění

### Požadavky
- Node.js 18+
- npm nebo yarn

### Lokální vývoj

```bash
# Klonování repozitáře
git clone <repository-url>
cd mzdy

# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev
```

Aplikace bude dostupná na `http://localhost:3000`

### Build pro produkci

```bash
# Vytvoření production buildu
npm run build

# Preview production buildu
npm run preview
```

## 🚀 Nasazení na Netlify

### Automatické nasazení

1. Připojte repozitář k Netlify
2. Netlify automaticky detekuje nastavení z `netlify.toml`
3. Build command: `npm run build`
4. Publish directory: `dist`

### Manuální nasazení

```bash
# Vytvoření buildu
npm run build

# Nahrání dist složky na Netlify
# nebo použití Netlify CLI
npx netlify-cli deploy --prod --dir=dist
```

## 📁 Struktura projektu

```
src/
├── components/          # React komponenty
│   ├── ui/             # Základní UI komponenty (shadcn/ui)
│   ├── layout/         # Layout komponenty
│   └── dashboard/      # Dashboard specifické komponenty
├── hooks/              # Custom React hooks
├── lib/                # Utility funkce
├── pages/              # Stránkové komponenty
├── services/           # API služby
├── types/              # TypeScript definice
├── app.tsx             # Hlavní App komponenta
├── main.tsx            # Entry point
└── index.css           # Globální styly
```

## 🎨 Design System

Projekt používá konzistentní design system založený na:
- **Tailwind CSS** pro utility-first styling
- **shadcn/ui** pro kvalitní, přístupné komponenty
- **Lucide React** pro ikony
- **CSS Variables** pro theming

## 🔧 Konfigurace

### Environment Variables

```env
# V budoucnu můžete přidat:
VITE_API_URL=https://your-api-url.com
VITE_APP_ENV=production
```

### Tailwind CSS

Konfigurace v `tailwind.config.js` zahrnuje:
- Custom color scheme
- Komponenty pro glass morphism efekty
- Animace a přechody
- Responsive breakpoints

## 📝 License

Tento projekt je určen pro vnitřní použití.

## 👥 Kontakt

Pro podporu a otázky kontaktujte vývojový tým.
