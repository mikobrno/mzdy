/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('✖ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env.')
  process.exit(2)
}

const supabase = createClient(url, anon)

async function main() {
  try {
    // Lightweight ping: try a cheap select. This does NOT bypass RLS; 401/403 still proves connectivity.
    const { data, error } = await supabase
      .from('svj')
      .select('id')
      .limit(1)

    if (error) {
      console.warn('∙ Connected, but query error (likely RLS if 401/403):', error.message)
      console.log('✓ Supabase reachable (client created, request returned).')
      process.exit(0)
    }

    console.log('✓ Supabase reachable. Sample data length:', data?.length ?? 0)
    process.exit(0)
  } catch (e: any) {
    console.error('✖ Supabase request failed:', e?.message || e)
    process.exit(1)
  }
}

main()
