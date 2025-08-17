# 🚀 Deployment Checklist

## Před nasazením

### Kód a build
- [x] ✅ TypeScript kompilace bez chyb
- [x] ✅ Build proces (`npm run build`) funguje
- [x] ✅ Všechny importy a závislosti vyřešeny
- [x] ✅ Netlify konfigurace (`netlify.toml`) připravena
- [x] ✅ Environment variables definovány

### Testování
- [x] ✅ Lokální dev server běží (`http://localhost:3000`)
- [ ] 🔄 Test všech hlavních stránek
- [ ] 🔄 Test navigace (React Router)
- [ ] 🔄 Test responsive design
- [ ] 🔄 Test v různých prohlížečích

### Konfigurace
- [x] ✅ `.gitignore` správně nastaven
- [x] ✅ `package.json` obsahuje správné scripty
- [x] ✅ Node.js verze definována (`.nvmrc`)
- [x] ✅ README.md s instrukcemi

## Nasazení na Netlify

### Automatické nasazení (doporučeno)
1. [ ] Pushněte kód do Git repozitáře
2. [ ] Připojte repozitář k Netlify
3. [ ] Ověřte build nastavení:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. [ ] Nastavte environment variables v Netlify
5. [ ] Spusťte deployment

### Manuální nasazení
1. [ ] Spusťte `npm run build`
2. [ ] Nahrajte obsah složky `dist` na Netlify

## Po nasazení

### Verifikace
- [ ] Stránka se načítá bez chyb
- [ ] Všechny route funcioní (při direct URL access)
- [ ] CSS styly se aplikují správně
- [ ] Ikony a obrázky se zobrazují
- [ ] Komponenty fungují interaktivně

### Monitoring
- [ ] Nastavte Netlify Analytics
- [ ] Nastavte error monitoring (volitelně)
- [ ] Zkontrolujte Lighthouse performance score

## Řešení častých problémů

### 404 chyby při direct access
➡️ Zkontrolujte `[[redirects]]` v `netlify.toml`

### Chybějící moduly
➡️ Ověřte imports a `package.json` dependencies

### Build failures
➡️ Zkontrolujte TypeScript chyby a node verzi

### Performance issues
➡️ Analyzujte bundle size a optimalizujte

## 📋 Quick Commands

```bash
# Lokální development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Lint check
npm run lint

# Deploy na Netlify (s CLI)
netlify deploy --prod --dir=dist
```

## 🔗 Užitečné odkazy

- [Netlify Docs](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router v6](https://reactrouter.com/en/main)
- [Tailwind CSS](https://tailwindcss.com/docs)
