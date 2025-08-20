CREATE TABLE "svj" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" text NOT NULL,
    "ico" text,
    "address" text,
    "bank_account" text,
    "data_box_id" text,
    "created_at" timestamptz DEFAULT now() NOT NULL
);
