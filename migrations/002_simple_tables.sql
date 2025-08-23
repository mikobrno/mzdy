-- Jednoduché vytvoření tabulek bez chyb
-- Spustit v Supabase SQL Editor

-- Dynamic variables
CREATE TABLE IF NOT EXISTS public.dynamic_variables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  value text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  category text NOT NULL,
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  user_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- User profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'pending',
  permissions jsonb DEFAULT '[]',
  svj_access jsonb DEFAULT '[]',
  last_login timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Communication campaigns
CREATE TABLE IF NOT EXISTS public.communication_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'draft',
  target_audience jsonb DEFAULT '{}',
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
  variables jsonb DEFAULT '{}',
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.dynamic_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Simple policies - allow all for authenticated users
CREATE POLICY "allow_all_dynamic_variables" ON public.dynamic_variables USING (true);
CREATE POLICY "allow_all_notifications" ON public.notifications USING (true);
CREATE POLICY "allow_all_user_profiles" ON public.user_profiles USING (true);
CREATE POLICY "allow_all_campaigns" ON public.communication_campaigns USING (true);
CREATE POLICY "allow_all_email_templates" ON public.email_templates USING (true);

-- Sample data
INSERT INTO public.dynamic_variables (name, description, value) VALUES 
('obdobi_vyuctovani', 'Období vyúčtování', '01.01.2025 - 31.12.2025'),
('rok_zuctovani', 'Rok vyúčtování', '2025')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.notifications (type, title, message, priority, category, is_read) VALUES 
('payroll', 'Mzdy připraveny', 'Mzdové výpočty jsou připraveny ke schválení', 'high', 'Mzdová agenda', false),
('system', 'Záloha dokončena', 'Denní záloha byla úspěšně dokončena', 'medium', 'Systém', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_profiles (name, email, role, status) VALUES 
('Test Admin', 'admin@example.com', 'super_admin', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.email_templates (name, subject, body, category) VALUES 
('Výplatní páska', 'Výplatní páska za {{month}}/{{year}}', 'Dobrý den,\n\nv příloze zasíláme výplatní pásku.\n\nS pozdravem', 'Mzdy'),
('Vítací email', 'Vítejte v systému', 'Vítejte v našem mzdovém systému!', 'Systém')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.communication_campaigns (name, description, type, status) VALUES 
('Rozesílání výplatních pásek', 'Automatické rozesílání výplatních pásek', 'email', 'draft')
ON CONFLICT (id) DO NOTHING;

-- Success
SELECT 'Všechny tabulky byly úspěšně vytvořeny! ✅' AS result;
