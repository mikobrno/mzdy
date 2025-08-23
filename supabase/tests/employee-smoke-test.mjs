import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU1NzI3MjAwLCJleHAiOjE5MTM0OTM2MDB9.kZqyzIkCdcw27-gtH3r4qQmiQ_Mxlt9Ps6fak3iXuhs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function run() {
  console.log('Starting employee smoke test...')
  const payload1 = {
  svj_id: null,
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    phone: '+420123456789',
    salary: 12345,
    contractType: 'dpp',
    address: 'Ulice 1',
    personal_id_number: '850101/1234'
  }

  try {
    // Ensure we have a valid svj_id (svj.svj_id is NOT NULL in schema)
    let svjId = payload1.svj_id
    if (!svjId) {
      const svjList = await supabase.from('svj').select('id').limit(1)
      if (svjList.error) throw svjList.error
      if (!svjList.data || svjList.data.length === 0) throw new Error('No SVJ found in DB; cannot create employee without svj_id')
      svjId = svjList.data[0].id
      console.log('Using existing svj_id=', svjId)
    }

    const createRes = await supabase.from('employees').insert([{
      svj_id: svjId,
      full_name: payload1.firstName + ' ' + payload1.lastName,
      email: payload1.email,
      phone_number: payload1.phone,
      salary_amount: payload1.salary,
      employment_type: payload1.contractType,
      address: payload1.address,
      personal_id_number: payload1.personal_id_number,
      is_active: true
    }]).select().single()

    if (createRes.error) throw createRes.error
    console.log('Created employee id=', createRes.data.id)

    const eid = createRes.data.id

    const updatePayload = { phone: '+420987654321', salary: 20000, note: 'updated-by-smoke-test' }
    const updateRes = await supabase.from('employees').update({ phone_number: updatePayload.phone, salary_amount: updatePayload.salary, note: updatePayload.note }).eq('id', eid).select().single()
    if (updateRes.error) throw updateRes.error
    console.log('Updated employee:', updateRes.data)

    const { data: readData, error: readErr } = await supabase.from('employees').select('*').eq('id', eid).single()
    if (readErr) throw readErr
    console.log('Readback employee:', readData)

    const del = await supabase.from('employees').delete().eq('id', eid)
    if (del.error) console.warn('Cleanup failed', del.error)
    else console.log('Cleanup ok')

    console.log('Employee smoke test finished OK')
  } catch (err) {
    console.error('Smoke test error', err.message || err)
    process.exitCode = 2
  }
}

run()
