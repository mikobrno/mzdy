import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Starting user profiles smoke test...')
  try {
    // Try to find any existing user profile
    const { data: users, error: usersErr } = await supabase.from('user_profiles').select('id').limit(1)
    if (usersErr) throw usersErr

    if (users && users.length > 0) {
      console.log('Found existing user profile:', users[0].id)
      console.log('Skipping create to avoid interfering with real users')
      console.log('User profiles smoke test finished OK')
      return
    }

    // No existing user -> create temporary one and delete it
    const { data: created, error: cErr } = await supabase.from('user_profiles').insert({ name: 'Smoke User', email: 'smoke.user.' + Date.now() + '@example.com' }).select().single()
    if (cErr) throw cErr
    console.log('Created temp user', created.id)

    const { error: delErr } = await supabase.from('user_profiles').delete().eq('id', created.id)
    if (delErr) console.warn('Cleanup failed', delErr)
    else console.log('Cleanup ok')

    console.log('User profiles smoke test finished OK')
  } catch (err) {
    console.error('User profiles smoke test error', err.message || err)
    process.exitCode = 2
  }
}

run()
