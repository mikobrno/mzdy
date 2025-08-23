-- Krok 1: Vytvoření pouze dynamic_variables tabulky
-- Spustit v Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.dynamic_variables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  value text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.dynamic_variables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_dynamic_variables" ON public.dynamic_variables USING (true);

INSERT INTO public.dynamic_variables (name, description, value) VALUES 
('obdobi_vyuctovani', 'Období vyúčtování', '01.01.2025 - 31.12.2025'),
('rok_zuctovani', 'Rok vyúčtování', '2025')
ON CONFLICT (name) DO NOTHING;

SELECT 'Dynamic variables tabulka vytvořena ✅' AS result;
