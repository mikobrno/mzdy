CREATE TABLE "health_insurance_companies" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" text NOT NULL,
    "code" text NOT NULL,
    "xml_export_format" text CHECK ("xml_export_format" IN ('vzp', 'zpmv', 'ozp')) NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL
);
