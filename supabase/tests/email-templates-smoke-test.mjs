import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Starting Email templates smoke test...')
  try {
    const payload = { name: 'smoke_email_' + Date.now(), subject: 'Smoke test', body: 'Hello' }
    const { data: created, error: cErr } = await supabase.from('email_templates').insert([payload]).select().single()
    if (cErr) throw cErr
    console.log('Created email_template id=', created.id)

    const { data: updated, error: uErr } = await supabase.from('email_templates').update({ subject: created.subject + ' - updated' }).eq('id', created.id).select().single()
    if (uErr) throw uErr
    console.log('Updated email_template:', updated.id)

    const { data: read, error: rErr } = await supabase.from('email_templates').select('*').eq('id', created.id).single()
    if (rErr) throw rErr
    console.log('Read email_template:', read.name)

    const { error: delErr } = await supabase.from('email_templates').delete().eq('id', created.id)
    if (delErr) console.warn('Cleanup failed', delErr)
    else console.log('Cleanup ok')

    console.log('Email templates smoke test finished OK')
  } catch (err) {
    console.error('Email templates smoke test error', err.message || err)
    process.exitCode = 2
  }
}

run()
