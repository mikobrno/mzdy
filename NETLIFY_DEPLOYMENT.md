# Netlify Deployment Guide

## Automatické nasazení

### 1. Připojení repozitáře

1. Přihlašte se do [Netlify](https://netlify.com)
2. Klikněte na "Add new site" → "Import from Git"
3. Vyberte GitHub/GitLab/Bitbucket a připojte váš repozitář
4. Vyberte branch `main` (nebo váš produkční branch)

### 2. Konfigurace build nastavení

Netlify automaticky detekuje nastavení z `netlify.toml`, ale ověřte:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: 18.x (v souboru `.nvmrc` nebo environment variables)

### 3. Environment Variables

V Netlify Admin Panel → Site Settings → Environment Variables přidejte:

```
VITE_APP_ENV=production
VITE_API_URL=/api
VITE_APP_NAME=Mzdy SVJ Portal
```

## Manuální nasazení

### Přes Netlify CLI

```bash
# Instalace Netlify CLI (jednou)
npm install -g netlify-cli

# Přihlášení
netlify login

# Build projektu
npm run build

# Nasazení
netlify deploy --prod --dir=dist
```

### Přes Drag & Drop

1. Spusťte `npm run build`
2. Jděte na [netlify.com/drop](https://app.netlify.com/drop)
3. Přetáhněte složku `dist` na stránku

## Ověření nasazení

1. Otevřete URL poskytnutou Netlify
2. Zkontrolujte:
   - ✅ Stránka se načítá
   - ✅ Navigace funguje (React Router)
   - ✅ Všechny obrázky a ikony se zobrazují
   - ✅ CSS styly jsou aplikovány

## Troubleshooting

### Problém: 404 při přímém přístupu na URL

**Řešení**: Ověřte, že máte v `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Problém: "Module not found" chyby

**Řešení**: 
1. Zkontrolujte case-sensitivity v importech
2. Ověřte, že všechny závislosti jsou v `package.json`
3. Vyčistěte node_modules: `rm -rf node_modules && npm install`

### Problém: Dlouhé build časy

**Řešení**:
1. Přidejte `.nvmrc` soubor s verzí Node.js
2. Optimalizujte závislosti
3. Použijte Netlify build cache

## Build optimalizace

### Zmenšení bundle size

```bash
# Analýza bundle size
npm install -g webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer dist/assets/*.js
```

### Performance optimalizace

- Lazy loading komponent
- Code splitting
- Image optimization
- CDN pro statické assets

## Monitoring

### Netlify Analytics

Aktivujte v Admin Panel → Analytics pro sledování:
- Page views
- Performance metriky
- Error tracking

### Error Monitoring

Doporučujeme integraci s:
- Sentry.io
- LogRocket
- Datadog RUM
