CREATE TABLE "employees" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "svj_id" uuid NOT NULL REFERENCES "svj" ("id") ON DELETE CASCADE,
    "full_name" text NOT NULL,
    "address" text,
    "personal_id_number" text,
    "email" text,
    "phone_number" text,
    "employment_type" text CHECK ("employment_type" IN ('dpp', 'vybor')) NOT NULL,
    "salary_amount" decimal(12, 2) NOT NULL,
    "bank_account" text,
    "health_insurance_company_id" uuid REFERENCES "health_insurance_companies" ("id"),
    "has_signed_tax_declaration" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamptz DEFAULT now() NOT NULL
);
