/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'
import { toDbStatus } from '../src/lib/payroll-status'

type Args = {
  svjId?: string
  feStatus?: string
  email?: string
  password?: string
  dry?: boolean
}

function parseArgs(): Args {
  const a = process.argv.slice(2)
  const out: Args = {}
  for (let i = 0; i < a.length; i++) {
    const k = a[i]
    if (k === '--svj') out.svjId = a[++i]
    else if (k === '--fe') out.feStatus = a[++i]
    else if (k === '--email') out.email = a[++i]
    else if (k === '--password') out.password = a[++i]
    else if (k === '--dry') out.dry = true
  }
  return out
}

async function main() {
  const { svjId, feStatus, email, password, dry } = parseArgs()
  if (!svjId) {
    console.error('✖ Missing --svj <uuid>')
    process.exit(2)
  }
  const url = process.env.VITE_SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) {
    console.error('✖ Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
    process.exit(2)
  }

  const fe = (feStatus ?? 'draft').toLowerCase()
  const dbExpected = toDbStatus(fe)
  console.log(`∙ FE status "${fe}" → DB status "${dbExpected}"`)

  const supabase = createClient(url, anon)

  if (email && password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { console.error('✖ Sign-in failed:', error.message); process.exit(1) }
    console.log('∙ Signed in OK')
  } else {
    console.log('∙ Anonymous session (RLS may block)')
  }

  if (dry) {
    console.log('✓ DRY RUN: mapping only, no DB write')
    process.exit(0)
  }

  // Minimal insert; adjust fields if your schema requires more columns.
  const toInsert = {
    svj_id: svjId,
    status: dbExpected,
    title: `Status smoke ${Date.now()}`,
  }

  const { data: ins, error: insErr } = await supabase
    .from('payrolls')
    .insert([toInsert])
    .select('id, svj_id, status, created_at')
    .single()

  if (insErr) {
    console.error('✖ Insert error:', insErr.message)
    process.exit(1)
  }
  console.log('✓ Inserted:', ins)

  const { data: row, error: selErr } = await supabase
    .from('payrolls')
    .select('id, svj_id, status, created_at')
    .eq('id', ins!.id)
    .maybeSingle()

  if (selErr) { console.error('✖ Select error:', selErr.message); process.exit(1) }
  if (!row) { console.error('✖ Row not found (RLS?)'); process.exit(1) }

  console.table([row])
  if (row.status !== dbExpected) {
    console.error(`✖ Mismatch: stored="${row.status}" expected="${dbExpected}"`)
    process.exit(1)
  }
  console.log('✓ Mapping verified end-to-end.')
}

main().catch(e => {
  console.error('✖ Unexpected error:', (e as { message?: string })?.message ?? String(e))
  process.exit(1)
})
