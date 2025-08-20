CREATE TABLE "pdf_templates" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" text NOT NULL,
    "file_path" text NOT NULL,
    "field_mappings" jsonb NOT NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL
);
