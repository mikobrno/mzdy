-- Oprawa RLS politik - povolit operace bez autentizace
-- Spustit v Supabase SQL Editor

-- SVJ tabulka - povolit všem operace
DROP POLICY IF EXISTS "svj_policy" ON public.svj;
CREATE POLICY "svj_allow_all" ON public.svj USING (true);

-- Employees tabulka - povolit všem operace  
DROP POLICY IF EXISTS "employees_policy" ON public.employees;
CREATE POLICY "employees_allow_all" ON public.employees USING (true);

-- Payrolls tabulka - povolit všem operace
DROP POLICY IF EXISTS "payrolls_policy" ON public.payrolls;
CREATE POLICY "payrolls_allow_all" ON public.payrolls USING (true);

-- Health insurance companies - povolit všem operace
DROP POLICY IF EXISTS "health_insurance_companies_policy" ON public.health_insurance_companies;
CREATE POLICY "health_insurance_allow_all" ON public.health_insurance_companies USING (true);

SELECT 'RLS politiky opraveny - teď můžeš vytvářet SVJ bez přihlášení! ✅' AS result;
