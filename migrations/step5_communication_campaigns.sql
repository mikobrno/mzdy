-- Krok 5: Vytvoření communication_campaigns tabulky (poslední krok)
-- Spustit v Supabase SQL Editor

-- Nejdříve drop tabulku pokud existuje s chybou
DROP TABLE IF EXISTS public.communication_campaigns;

CREATE TABLE public.communication_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name text NOT NULL,
  description text,
  campaign_type text NOT NULL DEFAULT 'email',
  campaign_status text NOT NULL DEFAULT 'draft',
  target_audience jsonb DEFAULT '{}',
  template_id uuid,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.communication_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_campaigns" ON public.communication_campaigns USING (true);

INSERT INTO public.communication_campaigns (campaign_name, description, campaign_type, campaign_status) VALUES 
('Rozesílání výplatních pásek', 'Automatické rozesílání výplatních pásek', 'email', 'draft');

SELECT 'Communication campaigns tabulka vytvořena ✅ VŠECHNO HOTOVO!' AS result;
