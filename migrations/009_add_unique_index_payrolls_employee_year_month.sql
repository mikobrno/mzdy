-- Ensure unique constraint for upserts on payrolls
-- Safe to run multiple times thanks to IF NOT EXISTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'uq_payrolls_employee_year_month'
  ) THEN
    CREATE UNIQUE INDEX uq_payrolls_employee_year_month
      ON public.payrolls(employee_id, year, month);
  END IF;
END$$;
