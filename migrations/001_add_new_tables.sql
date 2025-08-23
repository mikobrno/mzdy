-- Nové tabulky pro rozšířenou funkcionalnost
-- Spustit v Supabase SQL Editor

-- Dynamic variables for system configuration
CREATE TABLE IF NOT EXISTS public.dynamic_variables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
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
  campaign_name text NOT NULL,
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

-- Enable RLS on new tables
ALTER TABLE public.dynamic_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "dynamic_variables_select" ON public.dynamic_variables;
DROP POLICY IF EXISTS "dynamic_variables_insert" ON public.dynamic_variables;
DROP POLICY IF EXISTS "dynamic_variables_update" ON public.dynamic_variables;
DROP POLICY IF EXISTS "dynamic_variables_delete" ON public.dynamic_variables;

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;

DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles;

DROP POLICY IF EXISTS "campaigns_select" ON public.communication_campaigns;
DROP POLICY IF EXISTS "campaigns_insert" ON public.communication_campaigns;
DROP POLICY IF EXISTS "campaigns_update" ON public.communication_campaigns;
DROP POLICY IF EXISTS "campaigns_delete" ON public.communication_campaigns;

DROP POLICY IF EXISTS "email_templates_select" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_insert" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_update" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_delete" ON public.email_templates;

-- Dev-friendly policies (allow all operations for authenticated users)
-- Dynamic Variables policies
CREATE POLICY "dynamic_variables_select" ON public.dynamic_variables FOR SELECT USING (true);
CREATE POLICY "dynamic_variables_insert" ON public.dynamic_variables FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "dynamic_variables_update" ON public.dynamic_variables FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "dynamic_variables_delete" ON public.dynamic_variables FOR DELETE USING (auth.role() = 'authenticated');

-- Notifications policies
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "notifications_delete" ON public.notifications FOR DELETE USING (auth.role() = 'authenticated');

-- User Profiles policies
CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "user_profiles_delete" ON public.user_profiles FOR DELETE USING (auth.role() = 'authenticated');

-- Communication Campaigns policies
CREATE POLICY "campaigns_select" ON public.communication_campaigns FOR SELECT USING (true);
CREATE POLICY "campaigns_insert" ON public.communication_campaigns FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "campaigns_update" ON public.communication_campaigns FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "campaigns_delete" ON public.communication_campaigns FOR DELETE USING (auth.role() = 'authenticated');

-- Email Templates policies
CREATE POLICY "email_templates_select" ON public.email_templates FOR SELECT USING (true);
CREATE POLICY "email_templates_insert" ON public.email_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "email_templates_update" ON public.email_templates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "email_templates_delete" ON public.email_templates FOR DELETE USING (auth.role() = 'authenticated');

-- Sample seed data
INSERT INTO public.dynamic_variables (id, name, description, value, created_at, updated_at)
VALUES 
('aaaa1111-1111-1111-1111-111111111111', 'obdobi_vyuctovani', 'Období vyúčtování', '01.01.2025 - 31.12.2025', now(), now()),
('aaaa2222-2222-2222-2222-222222222222', 'rok_zuctovani', 'Rok vyúčtování', '2025', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, type, title, message, priority, category, is_read, user_id, created_at)
VALUES 
('bbbb1111-1111-1111-1111-111111111111', 'payroll', 'Mzdy připraveny ke schválení', 'Mzdové výpočty pro SVJ Nové Město jsou připraveny ke kontrole a schválení', 'high', 'Mzdová agenda', false, '11111111-1111-1111-1111-111111111111', now()),
('bbbb2222-2222-2222-2222-222222222222', 'system', 'Automatická záloha dokončena', 'Denní záloha systému byla úspěšně dokončena. Velikost zálohy: 2.4 GB', 'medium', 'Systém', true, '11111111-1111-1111-1111-111111111111', now()),
('bbbb3333-3333-3333-3333-333333333333', 'security', 'Neúspěšný pokus o přihlášení', 'Zaznamenaný neúspěšný pokus o přihlášení z IP adresy 203.0.113.15', 'high', 'Zabezpečení', false, '11111111-1111-1111-1111-111111111111', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (id, auth_user_id, name, email, role, status, permissions, svj_access, created_at)
VALUES 
('cccc1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Test Admin', 'admin@example.com', 'super_admin', 'active', '["all"]'::jsonb, '["all"]'::jsonb, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.email_templates (id, name, subject, body, variables, category, created_at)
VALUES 
('dddd1111-1111-1111-1111-111111111111', 'Výplatní páska', 'Výplatní páska za {{month}}/{{year}}', 'Dobrý den,\n\nv příloze zasíláme výplatní pásku za období {{month}}/{{year}}.\n\nS pozdravem,\nMzdová účetní', '{"month":"", "year":"", "employee_name":""}'::jsonb, 'Mzdy', now()),
('dddd2222-2222-2222-2222-222222222222', 'Vítací email', 'Vítejte v systému', 'Vítejte v našem mzdovém systému {{employee_name}}!\n\nVáš přístup byl aktivován.', '{"employee_name":""}'::jsonb, 'Systém', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.communication_campaigns (id, campaign_name, description, type, status, template_id, created_at)
VALUES 
('eeee1111-1111-1111-1111-111111111111', 'Rozesílání výplatních pásek', 'Automatické rozesílání výplatních pásek všem zaměstnancům', 'email', 'draft', 'dddd1111-1111-1111-1111-111111111111', now())
ON CONFLICT (id) DO NOTHING;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dynamic_variables_name ON public.dynamic_variables(name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_communication_campaigns_status ON public.communication_campaigns(status);

-- Trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_dynamic_variables_updated_at ON public.dynamic_variables;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_communication_campaigns_updated_at ON public.communication_campaigns;
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;

CREATE TRIGGER update_dynamic_variables_updated_at BEFORE UPDATE ON public.dynamic_variables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_communication_campaigns_updated_at BEFORE UPDATE ON public.communication_campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Nové tabulky byly úspěšně vytvořeny! 🎉' AS result;
