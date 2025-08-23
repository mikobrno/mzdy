import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Starting notifications smoke test...')
  try {
  const payload = { title: 'smoke_notification_' + Date.now(), message: 'Hello', type: 'system', is_read: false, category: 'system' }
    const { data: created, error: cErr } = await supabase.from('notifications').insert([payload]).select().single()
    if (cErr) throw cErr
    console.log('Created notification id=', created.id)

    const { data: updated, error: uErr } = await supabase.from('notifications').update({ title: created.title + ' - updated' }).eq('id', created.id).select().single()
    if (uErr) throw uErr
    console.log('Updated notification:', updated.id)

    const { data: read, error: rErr } = await supabase.from('notifications').select('*').eq('id', created.id).single()
    if (rErr) throw rErr
    console.log('Read notification:', read.title)

    const { error: delErr } = await supabase.from('notifications').delete().eq('id', created.id)
    if (delErr) console.warn('Cleanup failed', delErr)
    else console.log('Cleanup ok')

    console.log('Notifications smoke test finished OK')
  } catch (err) {
    console.error('Notifications smoke test error', err.message || err)
    process.exitCode = 2
  }
}

run()
