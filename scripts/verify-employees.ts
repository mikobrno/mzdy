/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'

/**
 * Facts vs Assumptions:
 * - FACT: FE expects camelCase fields, we recently normalized in supabase-api.ts.
 * - ASSUMPTION: DB table is "employees" with columns like svj_id, full_name, phone_number, salary_amount, is_active.
 * - Adjust SELECT below if your real table/columns differ.
 */

function parseArgs() {
  const args = process.argv.slice(2)
  const out: Record<string, string | boolean> = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--svj' || a === '--svjId') out.svjId = args[++i]
    else if (a === '--email') out.email = args[++i]
    else if (a === '--password') out.password = args[++i]
    else if (a === '--limit') out.limit = args[++i]
    else if (a === '--raw') out.raw = true
  }
  return out
}

type Row = {
  id: string
  svj_id: string | null
  full_name: string | null
  phone_number: string | null
  salary_amount: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

function normalize(r: Row) {
  const [firstName, ...rest] = (r.full_name ?? '').trim().split(/\s+/)
  const lastName = rest.join(' ')
  return {
    id: r.id,
    svjId: r.svj_id ?? null,
    firstName: firstName || '',
    lastName,
    phone: r.phone_number ?? null,
    salary: r.salary_amount ?? null,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at ? new Date(r.created_at) : null,
    updatedAt: r.updated_at ? new Date(r.updated_at) : null,
  }
}

async function main() {
  const { svjId, email, password, limit, raw } = parseArgs()
  const url = process.env.VITE_SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anon) {
    console.error('✖ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
    process.exit(2)
  }
  if (!svjId) {
    console.error('✖ Missing required argument: --svj <svjId>')
    process.exit(2)
  }

  const supabase = createClient(url, anon)

  // Optional: sign in if email/password provided (may be required by RLS)
  if (email && password) {
    const { error } = await supabase.auth.signInWithPassword({ email: String(email), password: String(password) })
    if (error) {
      console.error('✖ Sign-in failed:', (error as any).message)
      process.exit(1)
    }
    console.log('∙ Signed in OK')
  } else {
    console.log('∙ Anonymous session (RLS may hide rows)')
  }

  const q = supabase
    .from('employees') // ← adjust if your real table differs
    .select('id, svj_id, full_name, phone_number, salary_amount, is_active, created_at, updated_at')
    .eq('svj_id', String(svjId))
    .order('created_at', { ascending: false })
    .limit(Number(limit ?? 20))

  const { data, error } = await q
  if (error) {
    console.error('✖ Query error:', (error as any).message)
    process.exit(1)
  }

  console.log(`✓ Rows returned for svj_id=${svjId}:`, (data as any)?.length ?? 0)

  if (raw) {
    console.log('RAW:', data)
  } else {
    const normalized = ((data as Row[]) ?? []).map(normalize)
    console.table(normalized)
  }

  // Heuristics: if you just inserted a row and don’t see it here,
  // likely causes are: wrong svj_id on insert, RLS blocking SELECT, or extra FE filters.
}

main().catch((e) => {
  console.error('✖ Unexpected error:', (e as any)?.message || e)
  process.exit(1)
})
