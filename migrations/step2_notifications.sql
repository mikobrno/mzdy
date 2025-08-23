-- Krok 2: Vytvoření notifications tabulky
-- Spustit v Supabase SQL Editor

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

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_notifications" ON public.notifications USING (true);

INSERT INTO public.notifications (type, title, message, priority, category, is_read) VALUES 
('payroll', 'Mzdy připraveny', 'Mzdové výpočty jsou připraveny ke schválení', 'high', 'Mzdová agenda', false),
('system', 'Záloha dokončena', 'Denní záloha byla úspěšně dokončena', 'medium', 'Systém', true)
ON CONFLICT (id) DO NOTHING;

SELECT 'Notifications tabulka vytvořena ✅' AS result;
