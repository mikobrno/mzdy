import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Starting communication campaigns smoke test...')
  try {
    // use 'description' column (exists) instead of name/subject
    const probe = await supabase.from('communication_campaigns').select('id').limit(1)
    if (probe.error) {
      throw new Error('communication_campaigns table not available or schema incompatible: ' + probe.error.message)
    }
  const payload = { campaign_name: 'smoke_campaign_' + Date.now(), description: 'smoke_campaign_description_' + Date.now() }
    const { data: created, error: cErr } = await supabase.from('communication_campaigns').insert([payload]).select().single()
    if (cErr) throw cErr
    console.log('Created campaign id=', created.id)

  const { data: updated, error: uErr } = await supabase.from('communication_campaigns').update({ campaign_name: (created.campaign_name || 'campaign') + ' - updated' }).eq('id', created.id).select().single()
    if (uErr) throw uErr
    console.log('Updated campaign:', updated.id)

  const { data: read, error: rErr } = await supabase.from('communication_campaigns').select('*').eq('id', created.id).single()
  if (rErr) throw rErr
  console.log('Read campaign:', read.campaign_name || read.description || '<no-name>')

    const { error: delErr } = await supabase.from('communication_campaigns').delete().eq('id', created.id)
    if (delErr) console.warn('Cleanup failed', delErr)
    else console.log('Cleanup ok')

    console.log('Communication campaigns smoke test finished OK')
  } catch (err) {
    console.error('Communication campaigns smoke test error', err.message || err)
    process.exitCode = 2
  }
}

run()
