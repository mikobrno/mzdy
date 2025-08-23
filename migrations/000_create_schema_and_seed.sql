-- Combined schema creation + seed data for local Supabase
-- Run this in Supabase SQL editor (Project -> SQL Editor).

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- SVJ table
CREATE TABLE IF NOT EXISTS public.svj (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  ico text,
  address text,
  bank_account text,
  data_box_id text,
  email text,
  phone_number text,
  contact_person text,
  is_active boolean DEFAULT true NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  note text,
  created_by uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Helpful index for quick lookup by ICO
CREATE INDEX IF NOT EXISTS idx_svj_ico ON public.svj(ico);

-- Health insurance companies (moved before employees so FK exists on first run)
CREATE TABLE IF NOT EXISTS public.health_insurance_companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,
  xml_export_format text CHECK (xml_export_format IN ('vzp','zpmv','ozp')) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  svj_id uuid NOT NULL REFERENCES public.svj(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  address text,
  personal_id_number text,
  email text,
  phone_number text,
  employment_type text CHECK (employment_type IN ('dpp', 'vybor')) NOT NULL,
  salary_amount decimal(12,2) NOT NULL,
  bank_account text,
  health_insurance_company_id uuid REFERENCES public.health_insurance_companies(id),
  has_signed_tax_declaration boolean DEFAULT false,
  is_active boolean DEFAULT true,
  note text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Defensive: If a previous run created `employees` without some optional columns,
-- add them now so the seed INSERTs won't fail on older/partial schemas.
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS personal_id_number text;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS employment_type text;

-- Defensive: If a previous run created `svj` without some optional columns,
-- add them now so the seed INSERTs won't fail on older/partial schemas.
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS contact_person text;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS note text;

-- Employees seed (idempotent): insert only if id or email not present
INSERT INTO public.employees (id, svj_id, full_name, address, personal_id_number, email, phone_number, employment_type, salary_amount, bank_account, health_insurance_company_id, has_signed_tax_declaration, is_active, note, created_at)
SELECT v.id, v.svj_id, v.full_name, v.address, v.personal_id_number, v.email, v.phone_number, v.employment_type, v.salary_amount, v.bank_account, v.health_insurance_company_id, v.has_signed_tax_declaration, v.is_active, v.note, now()
FROM (VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Jan Novák',
  'Ulice 2, Město',
  '800101/1234',
  'jan.novak@example.com',
  '+420600000001',
  'vybor',
  25000.00,
  'CZ650800000000123456789',
  '22222222-2222-2222-2222-222222222222'::uuid,
  false,
  true,
  'První zaměstnanec'
)) AS v(id, svj_id, full_name, address, personal_id_number, email, phone_number, employment_type, salary_amount, bank_account, health_insurance_company_id, has_signed_tax_declaration, is_active, note)
WHERE NOT EXISTS (
  SELECT 1 FROM public.employees e WHERE e.id = v.id OR (v.email IS NOT NULL AND e.email = v.email)
)
  AND EXISTS (SELECT 1 FROM public.svj s WHERE s.id = v.svj_id)
  AND (v.health_insurance_company_id IS NULL OR EXISTS (SELECT 1 FROM public.health_insurance_companies h WHERE h.id = v.health_insurance_company_id));

-- Payrolls
CREATE TABLE IF NOT EXISTS public.payrolls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month int NOT NULL,
  year int NOT NULL,
  status text CHECK (status IN ('pending', 'approved')) NOT NULL,
  base_salary decimal(12,2) NOT NULL,
  bonuses decimal(12,2),
  gross_salary decimal(12,2),
  health_insurance_base decimal(12,2),
  social_insurance_base decimal(12,2),
  health_insurance_amount decimal(12,2),
  social_insurance_amount decimal(12,2),
  tax_advance decimal(12,2),
  net_salary decimal(12,2),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Executions (exekuce)
CREATE TABLE IF NOT EXISTS public.executions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  variable_symbol text,
  total_amount decimal(12,2) NOT NULL,
  monthly_deduction decimal(12,2) NOT NULL,
  priority int NOT NULL,
  status text CHECK (status IN ('active','paused','finished')) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Payroll deductions (link payrolls <-> executions)
CREATE TABLE IF NOT EXISTS public.payroll_deductions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_id uuid NOT NULL REFERENCES public.payrolls(id) ON DELETE CASCADE,
  execution_id uuid NOT NULL REFERENCES public.executions(id) ON DELETE CASCADE,
  amount_deducted decimal(12,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Health insurance companies
-- ...health_insurance_companies created earlier above employees...

-- PDF templates
CREATE TABLE IF NOT EXISTS public.pdf_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  file_path text NOT NULL,
  field_mappings jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- user_notes for dashboard user note
CREATE TABLE IF NOT EXISTS public.user_notes (
  user_id uuid PRIMARY KEY,
  note text,
  updated_at timestamptz DEFAULT now()
);

-- Dynamic variables for system configuration
CREATE TABLE IF NOT EXISTS public.dynamic_variables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  value text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Notifications for system events
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('security', 'payroll', 'system', 'user', 'api', 'document', 'deadline')),
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  category text NOT NULL,
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  user_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- User profiles for extended user management
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'accountant', 'manager', 'viewer')),
  status text NOT NULL CHECK (status IN ('active', 'pending', 'suspended')) DEFAULT 'pending',
  permissions jsonb DEFAULT '[]'::jsonb,
  svj_access jsonb DEFAULT '[]'::jsonb,
  last_login timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Communication campaigns
CREATE TABLE IF NOT EXISTS public.communication_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  status text NOT NULL CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed')) DEFAULT 'draft',
  target_audience jsonb DEFAULT '{}'::jsonb,
  template_id uuid,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb DEFAULT '{}'::jsonb,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Ensure created_by exists on svj (safe if file re-run)
-- (created_by column is defined on initial CREATE TABLE above)

-- Enable RLS on svj and add safe policies
ALTER TABLE public.svj ENABLE ROW LEVEL SECURITY;

-- Create policies (idempotent: drop if exists then create)
DROP POLICY IF EXISTS svj_select_all ON public.svj;
CREATE POLICY svj_select_all ON public.svj FOR SELECT USING (true);

DROP POLICY IF EXISTS svj_insert_owner ON public.svj;
CREATE POLICY svj_insert_owner ON public.svj FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS svj_update_owner ON public.svj;
CREATE POLICY svj_update_owner ON public.svj FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS svj_delete_owner ON public.svj;
CREATE POLICY svj_delete_owner ON public.svj FOR DELETE USING (created_by = auth.uid());

-- -----------------------------
-- Payrolls RLS + policies (dev-friendly)
-- -----------------------------

-- Enable RLS on payrolls and related tables so policies apply
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_deductions ENABLE ROW LEVEL SECURITY;

-- Payrolls: allow any authenticated user to SELECT (dev mode)
DROP POLICY IF EXISTS payrolls_select_all ON public.payrolls;
CREATE POLICY payrolls_select_all ON public.payrolls FOR SELECT USING (true);

-- Payrolls: allow authenticated users to INSERT/UPDATE/DELETE in dev mode
DROP POLICY IF EXISTS payrolls_insert_auth ON public.payrolls;
CREATE POLICY payrolls_insert_auth ON public.payrolls FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS payrolls_update_auth ON public.payrolls;
CREATE POLICY payrolls_update_auth ON public.payrolls FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS payrolls_delete_auth ON public.payrolls;
CREATE POLICY payrolls_delete_auth ON public.payrolls FOR DELETE USING (auth.role() = 'authenticated');

-- Executions: allow SELECT for all, insert/update/delete for authenticated (dev)
DROP POLICY IF EXISTS executions_select_all ON public.executions;
CREATE POLICY executions_select_all ON public.executions FOR SELECT USING (true);

DROP POLICY IF EXISTS executions_insert_auth ON public.executions;
CREATE POLICY executions_insert_auth ON public.executions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS executions_update_auth ON public.executions;
CREATE POLICY executions_update_auth ON public.executions FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS executions_delete_auth ON public.executions;
CREATE POLICY executions_delete_auth ON public.executions FOR DELETE USING (auth.role() = 'authenticated');

-- Payroll deductions: similar dev policies
DROP POLICY IF EXISTS payroll_deductions_select_all ON public.payroll_deductions;
CREATE POLICY payroll_deductions_select_all ON public.payroll_deductions FOR SELECT USING (true);

DROP POLICY IF EXISTS payroll_deductions_insert_auth ON public.payroll_deductions;
CREATE POLICY payroll_deductions_insert_auth ON public.payroll_deductions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS payroll_deductions_update_auth ON public.payroll_deductions;
CREATE POLICY payroll_deductions_update_auth ON public.payroll_deductions FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS payroll_deductions_delete_auth ON public.payroll_deductions;
CREATE POLICY payroll_deductions_delete_auth ON public.payroll_deductions FOR DELETE USING (auth.role() = 'authenticated');

-- Helpful indexes for payrolls queries
CREATE INDEX IF NOT EXISTS idx_payrolls_employee_id ON public.payrolls(employee_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_month_year ON public.payrolls(month, year);

-- View to join payroll + employee basic data for UI (read-only)
DROP VIEW IF EXISTS public.v_payrolls_overview;
CREATE VIEW public.v_payrolls_overview AS
SELECT p.id,
       p.employee_id,
       e.full_name AS employee_name,
       p.month,
       p.year,
       p.status,
       p.base_salary,
       p.gross_salary,
       p.net_salary,
       p.created_at
FROM public.payrolls p
LEFT JOIN public.employees e ON e.id = p.employee_id;


-- Sample seed data (IDs chosen stable so UIs can reference)
-- SVJ
-- Insert SVJ safely: only insert if neither id nor ico already exist.
INSERT INTO public.svj (id, name, ico, address, bank_account, data_box_id, email, phone_number, contact_person, is_active, note, created_at, created_by)
SELECT v.id, v.name, v.ico, v.address, v.bank_account, v.data_box_id, v.email, v.phone_number, v.contact_person, v.is_active, v.note, v.created_at, v.created_by
FROM (VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'SVJ Krásná vyhlídka',
  '12345678',
  'Ulice 1, Město',
  '123456789/0100',
  'db-0001',
  'info@svj-krasna-vyhlida.cz',
  '+420123456789',
  'Správce SVJ',
  true,
  'Hlavní testovací SVJ',
  now(),
  '11111111-1111-1111-1111-111111111111'::uuid
)) AS v(id, name, ico, address, bank_account, data_box_id, email, phone_number, contact_person, is_active, note, created_at, created_by)
WHERE NOT EXISTS (
  SELECT 1 FROM public.svj s WHERE s.id = v.id OR (v.ico IS NOT NULL AND s.ico = v.ico)
);

-- Health insurance companies
INSERT INTO public.health_insurance_companies (id, name, code, xml_export_format)
VALUES
('22222222-2222-2222-2222-222222222222', 'VZP', '111', 'vzp')
ON CONFLICT (id) DO NOTHING;


-- Payrolls (sample) - idempotent and guarded by existing employee
INSERT INTO public.payrolls (id, employee_id, month, year, status, base_salary, bonuses, gross_salary, net_salary, created_at)
SELECT v.id, v.employee_id, v.month, v.year, v.status, v.base_salary, v.bonuses, v.gross_salary, v.net_salary, now()
FROM (VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  8,
  2025,
  'pending',
  25000.00,
  0.00,
  25000.00,
  20000.00
)) AS v(id, employee_id, month, year, status, base_salary, bonuses, gross_salary, net_salary)
WHERE NOT EXISTS (SELECT 1 FROM public.payrolls p WHERE p.id = v.id)
  AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = v.employee_id);

INSERT INTO public.executions (id, employee_id, name, variable_symbol, total_amount, monthly_deduction, priority, status, created_at)
SELECT v.id, v.employee_id, v.name, v.variable_symbol, v.total_amount, v.monthly_deduction, v.priority, v.status, now()
FROM (VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Exekuce ABC',
  '0001',
  12000.00,
  1000.00,
  1,
  'active'
)) AS v(id, employee_id, name, variable_symbol, total_amount, monthly_deduction, priority, status)
WHERE NOT EXISTS (SELECT 1 FROM public.executions ex WHERE ex.id = v.id)
  AND EXISTS (SELECT 1 FROM public.employees e WHERE e.id = v.employee_id);

INSERT INTO public.payroll_deductions (id, payroll_id, execution_id, amount_deducted, created_at)
SELECT v.id, v.payroll_id, v.execution_id, v.amount_deducted, now()
FROM (VALUES (
  '66666666-6666-6666-6666-666666666666'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  '55555555-5555-5555-5555-555555555555'::uuid,
  1000.00
)) AS v(id, payroll_id, execution_id, amount_deducted)
WHERE NOT EXISTS (SELECT 1 FROM public.payroll_deductions pd WHERE pd.id = v.id)
  AND EXISTS (SELECT 1 FROM public.payrolls p WHERE p.id = v.payroll_id)
  AND EXISTS (SELECT 1 FROM public.executions ex WHERE ex.id = v.execution_id);

-- PDF template sample
INSERT INTO public.pdf_templates (id, name, file_path, field_mappings)
VALUES
('77777777-7777-7777-7777-777777777777','Výplatní páska - default','/templates/payslip.pdf', '{"name":"{{full_name}}","net":"{{net_salary}}"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- User note sample (dashboard)
INSERT INTO public.user_notes (user_id, note)
VALUES
('11111111-1111-1111-1111-111111111111','Vítej v testovací databázi')
ON CONFLICT (user_id) DO UPDATE SET note = EXCLUDED.note, updated_at = now();

-- Sample dynamic variables
INSERT INTO public.dynamic_variables (id, name, description, value, created_at, updated_at)
VALUES 
('aaaa1111-1111-1111-1111-111111111111', 'obdobi_vyuctovani', 'Období vyúčtování', '01.01.2025 - 31.12.2025', now(), now()),
('aaaa2222-2222-2222-2222-222222222222', 'rok_zuctovani', 'Rok vyúčtování', '2025', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Sample notifications
INSERT INTO public.notifications (id, type, title, message, priority, category, is_read, user_id, created_at)
VALUES 
('bbbb1111-1111-1111-1111-111111111111', 'payroll', 'Mzdy připraveny ke schválení', 'Mzdové výpočty pro SVJ Nové Město jsou připraveny ke kontrole a schválení', 'high', 'Mzdová agenda', false, '11111111-1111-1111-1111-111111111111', now()),
('bbbb2222-2222-2222-2222-222222222222', 'system', 'Automatická záloha dokončena', 'Denní záloha systému byla úspěšně dokončena. Velikost zálohy: 2.4 GB', 'medium', 'Systém', true, '11111111-1111-1111-1111-111111111111', now()),
('bbbb3333-3333-3333-3333-333333333333', 'security', 'Neúspěšný pokus o přihlášení', 'Zaznamenaný neúspěšný pokus o přihlášení z IP adresy 203.0.113.15', 'high', 'Zabezpečení', false, '11111111-1111-1111-1111-111111111111', now())
ON CONFLICT (id) DO NOTHING;

-- Sample user profile
INSERT INTO public.user_profiles (id, auth_user_id, name, email, role, status, permissions, svj_access, created_at)
VALUES 
('cccc1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Test Admin', 'admin@example.com', 'super_admin', 'active', '["all"]'::jsonb, '["all"]'::jsonb, now())
ON CONFLICT (id) DO NOTHING;

-- Sample email templates
INSERT INTO public.email_templates (id, name, subject, body, variables, category, created_at)
VALUES 
('dddd1111-1111-1111-1111-111111111111', 'Výplatní páska', 'Výplatní páska za {{month}}/{{year}}', 'Dobrý den,\n\nv příloze zasíláme výplatní pásku za období {{month}}/{{year}}.\n\nS pozdravem,\nMzdová účetní', '{"month":"", "year":"", "employee_name":""}'::jsonb, 'Mzdy', now()),
('dddd2222-2222-2222-2222-222222222222', 'Vítací email', 'Vítejte v systému', 'Vítejte v našem mzdovém systému {{employee_name}}!\n\nVáš přístup byl aktivován.', '{"employee_name":""}'::jsonb, 'Systém', now())
ON CONFLICT (id) DO NOTHING;

-- Sample communication campaign
INSERT INTO public.communication_campaigns (id, name, description, type, status, template_id, created_at)
VALUES 
('eeee1111-1111-1111-1111-111111111111', 'Rozesílání výplatních pásek', 'Automatické rozesílání výplatních pásek všem zaměstnancům', 'email', 'draft', 'dddd1111-1111-1111-1111-111111111111', now())
ON CONFLICT (id) DO NOTHING;

-- Done

/*
Notes:
- Run this file in Supabase SQL editor. The editor runs with elevated privileges, so RLS won't block these seed inserts.
- If you prefer a quick dev-only RLS policy that allows any authenticated user to insert without created_by, run instead:

ALTER TABLE public.svj ENABLE ROW LEVEL SECURITY;
-- Dev-only: quick policy that lets any authenticated user insert rows.
-- NOTE: for FOR INSERT a USING clause is not allowed; use WITH CHECK only.
CREATE POLICY svj_dev_insert ON public.svj FOR INSERT WITH CHECK (auth.role() = 'authenticated');

- After running, reload the app UI. If you still see empty lists, open browser console and run network/console checks; report errors and I will help.
*/
