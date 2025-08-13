# Nasazení na Netlify

Tento projekt je serverová ASP.NET Core MVC aplikace. Netlify neumí přímo hostovat .NET backend, ale lze jej použít jako reverzní proxy/front-door:

- Netlify bude hostovat statický kořen (prázdný placeholder/HTML) a všechny cesty přesměruje na běžící backend (Docker / VM / Appwrite / Azure / Render).
- Konfigurace probíhá přes `netlify.toml`.

## 1) Připrav backend

Backend musí být veřejně dostupný přes HTTPS. Např.:
- Docker kontejner na vlastním VPS: `https://portal.mojedomena.cz`
- Appwrite Function/Container za doménou: `https://svj-portal.mojedomena.cz`
- Render/Fly.io/Azure WebApp: libovolná veřejná URL

Aplikace už podporuje PathBase a reverzní proxy hlavičky.

Potřebné proměnné prostředí pro backend:
- `ASPNETCORE_ENVIRONMENT=Production`
- `ASPNETCORE_URLS=http://+:3000` (jen v kontejneru)
- `ASPNETCORE_PATHBASE` (pokud nasazujete pod subcestou)
- `ConnectionStrings__DefaultConnection`
- `EmailSettings__SmtpServer`, `EmailSettings__SmtpUsername`, `EmailSettings__SmtpPassword`

## 2) Konfigurace Netlify

V kořeni repozitáře je `netlify.toml`. Otevřete a nastavte backend URL:

```
[[redirects]]
  from = "/*"
  to = "https://REPLACE_WITH_BACKEND_HOST/:splat"  # <--- ZMĚŇTE NA SVŮJ BACKEND
  status = 200
  force = true
```

Volitelně upravte CSP v sekci `[[headers]]`, pokud přidáte další CDN.

## 3) Vytvoření Netlify site

1. Přihlašte se do Netlify a zvolte "Add new site" → "Import an existing project".
2. Připojte GitHub/GitLab/Bitbucket repo s tímto projektem.
3. Build command: `echo Netlify build` (nebo prázdné); Publish directory: `.`
4. Deploy. Netlify bude sloužit statický obsah (nic) a všechny požadavky podle `[[redirects]]` pošle na váš backend.

## 4) Ověření

- Otevřete Netlify URL (např. `https://svj-portal.netlify.app`).
- Zkontrolujte v DevTools → Network, že požadavky chodí na backend doménu a vrací 200/302.
- Pokud uvidíte 404 na `favicon.ico` nebo assety, je to řešeno v kódu (base href + favicon redirect), nic dalšího není třeba.

## 5) Časté problémy

- 404 z Netlify: Ujistěte se, že `redirects` používá `status = 200` (SPA-like fallback) a `to` má platný backend.
- CORS: Přidejte na backend CORS povolení pro Netlify doménu (pokud budete volat API přes fetch/XHR). Pro plně server-rendered HTML proxované Netlify to obvykle není potřeba.
- Subpath: Pokud Netlify přidá subcestu, nastavte na backendu `ASPNETCORE_PATHBASE` shodně; aplikace už PathBase respektuje.

## 6) Alternativa: hostovat přímo backend

Můžete zcela vynechat Netlify a přímo nasadit Docker image (port 3000 → reverse proxy Nginx/Traefik) na vlastní doméně.

```text
svj-portal:latest → :3000 → Nginx (443/TLS) → veřejný internet
```

Tento přístup je jednodušší a bez double-proxy.
