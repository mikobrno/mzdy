import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Starting user notes smoke test...')
  try {
    // try to locate a user id; fallback to inserting a temporary user profile
  let userId = null
  const { data: users, error: usersErr } = await supabase.from('user_profiles').select('id').limit(1)
    if (!usersErr && users && users.length > 0) userId = users[0].id

    let createdTempUser = null
    if (!userId) {
      const { data: cu, error: cuErr } = await supabase.from('user_profiles').insert({ name: 'Smoke Tester', email: 'smoke.user@example.com' }).select().single()
      if (cuErr) throw cuErr
      createdTempUser = cu
      userId = cu.id
    }

    const note = 'smoke-note-' + Date.now()
    const { data: upserted, error: upErr } = await supabase.from('user_notes').upsert({ user_id: userId, note }).select().single()
    if (upErr) throw upErr
    console.log('Upserted note for user=', userId)

    const { data: read, error: readErr } = await supabase.from('user_notes').select('*').eq('user_id', userId).single()
    if (readErr) throw readErr
    console.log('Read note:', read.note)

    // cleanup: if we created a temp user, remove it (user_notes entry will cascade if FK set)
    if (createdTempUser) {
      const { error: delU } = await supabase.from('user_profiles').delete().eq('id', createdTempUser.id)
      if (delU) console.warn('Failed to remove temp user', delU)
    }

    console.log('User notes smoke test finished OK')
  } catch (err) {
    console.error('User notes smoke test error', err.message || err)
    process.exitCode = 2
  }
}

run()
