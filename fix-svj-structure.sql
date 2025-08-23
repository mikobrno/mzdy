-- Quick fix: Add missing columns to SVJ and insert complete seed data

-- Add missing columns if they don't exist
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS contact_person text;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.svj ADD COLUMN IF NOT EXISTS note text;

-- Update existing SVJ record with missing data
UPDATE public.svj SET
  email = 'info@svj-krasna-vyhlida.cz',
  phone_number = '+420123456789',
  contact_person = 'Správce SVJ',
  note = 'Hlavní testovací SVJ'
WHERE id = '11111111-1111-1111-1111-111111111111' AND email IS NULL;
