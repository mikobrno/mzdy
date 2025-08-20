CREATE TABLE "payrolls" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "employee_id" uuid NOT NULL REFERENCES "employees" ("id") ON DELETE CASCADE,
    "month" int NOT NULL,
    "year" int NOT NULL,
    "status" text CHECK ("status" IN ('pending', 'approved')) NOT NULL,
    "base_salary" decimal(12, 2) NOT NULL,
    "bonuses" decimal(12, 2),
    "gross_salary" decimal(12, 2),
    "health_insurance_base" decimal(12, 2),
    "social_insurance_base" decimal(12, 2),
    "health_insurance_amount" decimal(12, 2),
    "social_insurance_amount" decimal(12, 2),
    "tax_advance" decimal(12, 2),
    "net_salary" decimal(12, 2),
    "created_at" timestamptz DEFAULT now() NOT NULL
);
