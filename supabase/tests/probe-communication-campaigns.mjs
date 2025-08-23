import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

const candidates = ['id','name','title','subject','content','description','body','created_at']

async function probe() {
  console.log('Probing communication_campaigns columns...')
  const results = {}
  for (const col of candidates) {
    try {
      const res = await supabase.from('communication_campaigns').select(col).limit(1)
      if (res.error) {
        results[col] = { ok: false, error: res.error.message }
      } else {
        results[col] = { ok: true }
      }
    } catch (err) {
      results[col] = { ok: false, error: err.message || String(err) }
    }
  }
  console.log(JSON.stringify(results, null, 2))
}

probe()
