CREATE TABLE "executions" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "employee_id" uuid NOT NULL REFERENCES "employees" ("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "variable_symbol" text,
    "total_amount" decimal(12, 2) NOT NULL,
    "monthly_deduction" decimal(12, 2) NOT NULL,
    "priority" int NOT NULL,
    "status" text CHECK ("status" IN ('active', 'paused', 'finished')) NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL
);
