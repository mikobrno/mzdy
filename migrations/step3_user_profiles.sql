-- Krok 3: Vytvoření user_profiles tabulky
-- Spustit v Supabase SQL Editor

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

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_user_profiles" ON public.user_profiles USING (true);

INSERT INTO public.user_profiles (name, email, role, status) VALUES 
('Test Admin', 'admin@example.com', 'super_admin', 'active')
ON CONFLICT (id) DO NOTHING;

SELECT 'User profiles tabulka vytvořena ✅' AS result;
