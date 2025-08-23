import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Starting SVJ smoke test...')
  try {
    const payload = {
      name: 'SmokeTest SVJ ' + Date.now(),
      created_by: null
    }

    // attempt to fill created_by from anon session if possible
  const { data: session } = await supabase.auth.getSession()
  const userId = session && session.user ? session.user.id : null
    if (userId) payload.created_by = userId

    // create
    const { data: created, error: createErr } = await supabase.from('svj').insert([payload]).select().single()
    if (createErr) throw createErr
    console.log('Created svj id=', created.id)

    // update
    const { data: updated, error: updateErr } = await supabase.from('svj').update({ name: created.name + ' - updated' }).eq('id', created.id).select().single()
    if (updateErr) throw updateErr
    console.log('Updated svj:', updated.id)

    // read
    const { data: read, error: readErr } = await supabase.from('svj').select('*').eq('id', created.id).single()
    if (readErr) throw readErr
    console.log('Read svj:', read.id)

    // delete
    const { error: delErr } = await supabase.from('svj').delete().eq('id', created.id)
    if (delErr) console.warn('Cleanup failed', delErr)
    else console.log('Cleanup ok')

    console.log('SVJ smoke test finished OK')
  } catch (err) {
    console.error('SVJ smoke test error', err.message || err)
    process.exitCode = 2
  }
}

run()
