/* eslint-disable no-console */
import { createClient } from '@supabase/supabase-js'

type Args = {
  svjId?: string
  fullName?: string
  phone?: string
  salary?: string
  email?: string
  password?: string
}

function parseArgs(): Args {
  const a = process.argv.slice(2)
  const out: Args = {}
  for (let i = 0; i < a.length; i++) {
    const k = a[i]
    if (k === '--svj') out.svjId = a[++i]
    else if (k === '--name') out.fullName = a[++i]
    else if (k === '--phone') out.phone = a[++i]
    else if (k === '--salary') out.salary = a[++i]
    else if (k === '--email') out.email = a[++i]
    else if (k === '--password') out.password = a[++i]
  }
  return out
}

function normalize(r: any) {
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
  const args = parseArgs()
  if (!args.svjId) {
    console.error('✖ Missing --svj <svjId>')
    process.exit(2)
  }
  const url = process.env.VITE_SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) {
    console.error('✖ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env')
    process.exit(2)
  }

  const supabase = createClient(url, anon)

  // Optional sign-in (helps pass RLS)
  if (args.email && args.password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: args.email, password: args.password
    })
    if (error) {
      console.error('✖ Sign-in failed:', (error as any).message)
      process.exit(1)
    }
    console.log('∙ Signed in OK')
  } else {
    console.log('∙ Anonymous session (RLS may block insert/select)')
  }

  const nowName = args.fullName ?? `John Doe ${Date.now()}`
  const toInsert = {
    svj_id: args.svjId,
    full_name: nowName,
    phone_number: args.phone ?? null,
    salary_amount: args.salary ? Number(args.salary) : null,
    is_active: true
  }

  // Insert
  const { data: ins, error: insErr } = await supabase
    .from('employees') // adjust if your table name differs
    .insert([toInsert])
    .select('id, svj_id, full_name, phone_number, salary_amount, is_active, created_at, updated_at')
    .single()

  if (insErr) {
    console.error('✖ Insert error:', (insErr as any).message)
    process.exit(1)
  }
  console.log('✓ Inserted:')
  console.table([normalize(ins)])

  // Read-back (confirm visibility)
  const { data: rows, error: selErr } = await supabase
    .from('employees')
    .select('id, svj_id, full_name, phone_number, salary_amount, is_active, created_at, updated_at')
    .eq('svj_id', args.svjId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (selErr) {
    console.error('✖ Select error:', (selErr as any).message)
    process.exit(1)
  }

  console.log(`✓ Latest rows for svj_id=${args.svjId}:`)
  console.table((rows ?? []).map(normalize))
}

main().catch(e => {
  console.error('✖ Unexpected error:', (e as any)?.message || e)
  process.exit(1)
})
