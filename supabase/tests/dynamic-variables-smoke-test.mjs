import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Starting dynamic variables smoke test...')
  try {
    const payload = { name: 'smoke_var_' + Date.now(), value: 'test-' + Math.random().toString(36).slice(2,8) }
    const { data: created, error: cErr } = await supabase.from('dynamic_variables').insert([payload]).select().single()
    if (cErr) throw cErr
    console.log('Created variable id=', created.id)

    const { data: updated, error: uErr } = await supabase.from('dynamic_variables').update({ value: 'updated-' + Date.now() }).eq('id', created.id).select().single()
    if (uErr) throw uErr
    console.log('Updated variable:', updated.id)

    const { data: read, error: rErr } = await supabase.from('dynamic_variables').select('*').eq('id', created.id).single()
    if (rErr) throw rErr
    console.log('Read variable:', read.name)

    const { error: delErr } = await supabase.from('dynamic_variables').delete().eq('id', created.id)
    if (delErr) console.warn('Cleanup failed', delErr)
    else console.log('Cleanup ok')

    console.log('Dynamic variables smoke test finished OK')
  } catch (err) {
    console.error('Dynamic variables smoke test error', err.message || err)
    process.exitCode = 2
  }
}

run()
