-- SCHEMA: minimal core + RLS + RPC stubs
-- Adjust table/column names to match your app.

-- 1) HEALTH INSURANCE
create table if not exists public.health_insurance (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid()
);

-- 2) SVJ (homeowners association)
create table if not exists public.svj (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ico text, -- optional company/registry code
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid()
);

-- 3) Optional link table example (if you join SVJ ↔ health_insurance)
create table if not exists public.svj_health_insurance (
  svj_id uuid not null references public.svj(id) on delete cascade,
  hi_id uuid not null references public.health_insurance(id) on delete restrict,
  primary key (svj_id, hi_id)
);

-- RLS
alter table public.health_insurance enable row level security;
alter table public.svj enable row level security;
alter table public.svj_health_insurance enable row level security;

-- Safe default policies: creator-only (adjust later if you need sharing)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='health_insurance' and policyname='hi_select_own'
  ) then
    create policy hi_select_own on public.health_insurance
      for select using (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='health_insurance' and policyname='hi_modify_own'
  ) then
    create policy hi_modify_own on public.health_insurance
      for all using (created_by = auth.uid()) with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='svj' and policyname='svj_select_own'
  ) then
    create policy svj_select_own on public.svj
      for select using (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='svj' and policyname='svj_modify_own'
  ) then
    create policy svj_modify_own on public.svj
      for all using (created_by = auth.uid()) with check (created_by = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='svj_health_insurance' and policyname='svj_hi_select_own'
  ) then
    create policy svj_hi_select_own on public.svj_health_insurance
      for select using (
        exists (select 1 from public.svj s where s.id = svj_id and s.created_by = auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='svj_health_insurance' and policyname='svj_hi_modify_own'
  ) then
    create policy svj_hi_modify_own on public.svj_health_insurance
      for all using (
        exists (select 1 from public.svj s where s.id = svj_id and s.created_by = auth.uid())
      ) with check (
        exists (select 1 from public.svj s where s.id = svj_id and s.created_by = auth.uid())
      );
  end if;
end $$;

-- RPC: generate_bank_order(svj_id uuid) → json
create or replace function public.generate_bank_order(svj_id uuid)
returns json language plpgsql security definer as $$
declare
  _payload json;
begin
  -- TODO: replace with your real logic; return structure expected by FE.
  -- Example stub ensures RLS via SECURITY DEFINER + check ownership:
  if not exists (select 1 from public.svj s where s.id = svj_id and s.created_by = auth.uid()) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  _payload := json_build_object(
    'svj_id', svj_id,
    'generated_at', now()
  );
  return _payload;
end $$;

-- RPC: generate_pdf(template_id text, payload jsonb) → json { base64: text }
create or replace function public.generate_pdf(template_id text, payload jsonb)
returns json language plpgsql security definer as $$
declare
  _pdf_base64 text;
begin
  -- TODO: plug your PDF generation (or call external via http extension if enabled).
  -- For now, return a tiny empty PDF base64 as stub:
  -- "%PDF-1.4\n%… minimal…"  -> here use an actual minimal PDF if needed.
  _pdf_base64 := encode('\x25504446'::bytea, 'base64'); -- "PDF" header bytes as placeholder
  return json_build_object('base64', _pdf_base64);
end $$;

-- Indexes (minimal)
create index if not exists idx_hi_created_by on public.health_insurance (created_by);
create index if not exists idx_svj_created_by on public.svj (created_by);
