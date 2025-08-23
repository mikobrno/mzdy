-- Krok 4: Vytvoření email_templates tabulky
-- Spustit v Supabase SQL Editor

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

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_email_templates" ON public.email_templates USING (true);

INSERT INTO public.email_templates (name, subject, body, category) VALUES 
('Výplatní páska', 'Výplatní páska za {{month}}/{{year}}', 'Dobrý den,\n\nv příloze zasíláme výplatní pásku.\n\nS pozdravem', 'Mzdy'),
('Vítací email', 'Vítejte v systému', 'Vítejte v našem mzdovém systému!', 'Systém')
ON CONFLICT (id) DO NOTHING;

SELECT 'Email templates tabulka vytvořena ✅' AS result;
