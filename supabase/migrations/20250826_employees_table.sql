-- Employees core table + RLS (creator-only baseline)
create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  svj_id uuid not null references public.svj(id) on delete cascade,
  full_name text not null,
  phone_number text,
  salary_amount numeric,
  is_active boolean not null default true,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_employees_set_updated_at on public.employees;
create trigger trg_employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

-- helpful indexes
create index if not exists idx_employees_svj on public.employees(svj_id);
create index if not exists idx_employees_created_by on public.employees(created_by);
create index if not exists idx_employees_svj_created_at on public.employees(svj_id, created_at desc);

-- RLS (enable + creator-only baseline)
alter table public.employees enable row level security;

-- re-create policies idempotently
drop policy if exists employees_select_own on public.employees;
drop policy if exists employees_insert_own on public.employees;
drop policy if exists employees_update_own on public.employees;
drop policy if exists employees_delete_own on public.employees;

create policy employees_select_own
on public.employees
for select
using (created_by = auth.uid());

create policy employees_insert_own
on public.employees
for insert
with check (created_by = auth.uid());

create policy employees_update_own
on public.employees
for update
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy employees_delete_own
on public.employees
for delete
using (created_by = auth.uid());
