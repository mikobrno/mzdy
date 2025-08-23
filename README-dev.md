Krátký návod pro vývoj a testování lokálně

1) Spusťte dev server:
   npm install
   npm run dev

2) Přihlaste se do Supabase a spusťte migrations/000_create_schema_and_seed.sql (pokud ještě nebylo). To vloží příkladová SVJ, zaměstnance, výplaty a PDF šablony.

3) Otevřete http://localhost:3000 a přejděte do sekce Zaměstnanci -> Přidat zaměstnance.
   - Formulář nyní používá Supabase přes `apiService`.
   - Po vytvoření se zobrazí v seznamu.

4) PDF šablony: v nabídce "PDF šablony" by se měly zobrazit položky z tabulky `pdf_templates`.

Poznámky:
- Pokud některá stránka neukazuje data, ověřte, že jste spustili seed SQL a že `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` v `.env` jsou platné.
- Pokud budete chtít převést i ostatní přímé volání `supabase.from(...)` na `apiService`, dejte vědět.
