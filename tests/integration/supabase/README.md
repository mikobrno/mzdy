Supabase integration tests

How to run

- Set test Supabase credentials in environment (recommended):

  TEST_SUPABASE_URL=https://your-supabase-url
  TEST_SUPABASE_ANON_KEY=your-anon-key

- Or export VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY used by the app.

- Run:

  npm test -- tests/integration/supabase/employees.integration.test.ts

Notes

- Tests will be skipped automatically if the environment variables are not provided.
- Do NOT run these tests against a production database. They create/update/delete real rows.
