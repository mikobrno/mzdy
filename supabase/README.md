# Supabase Migrations (minimal core)

- Apply with `supabase db reset` (local) or `supabase db push` (verify policies first).
- Tables: `public.health_insurance`, `public.svj`, optional `public.svj_health_insurance`.
- RLS: enabled on all tables; default policies = creator-only.
- RPC: `public.generate_bank_order(uuid)`, `public.generate_pdf(text,jsonb)` stubs exist; replace internals with real logic.

**Verify before deploy:**
- Compare columns with existing schema in Supabase Table Editor.
- Ensure FE/BE callers expect the same shapes as returned by RPC functions.
