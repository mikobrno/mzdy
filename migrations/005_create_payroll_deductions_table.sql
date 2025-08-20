CREATE TABLE "payroll_deductions" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "payroll_id" uuid NOT NULL REFERENCES "payrolls" ("id") ON DELETE CASCADE,
    "execution_id" uuid NOT NULL REFERENCES "executions" ("id") ON DELETE CASCADE,
    "amount_deducted" decimal(12, 2) NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL
);
