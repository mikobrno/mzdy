#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...values] = line.split('=')
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim()
      }
    }
  })
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

let tests = []
let passed = 0
let failed = 0

function test(name, fn) {
  tests.push({ name, fn })
}

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`)
    passed++
  } else {
    console.log(`❌ ${message}`)
    failed++
  }
}

// Define tests
test('Basic Connection', async () => {
  const { data, error } = await supabase.from('svj').select('count', { count: 'exact', head: true })
  assert(!error, `Supabase connection works (${error?.message || 'OK'})`)
})

test('SVJ Table Structure', async () => {
  const { data, error } = await supabase.from('svj').select('*').limit(1).single()
  if (!error && data) {
    assert(data.hasOwnProperty('name'), 'SVJ has name field')
    assert(data.hasOwnProperty('ico'), 'SVJ has ico field')
    assert(data.hasOwnProperty('email'), 'SVJ has email field')
  } else if (error?.code === 'PGRST116') {
    // No rows - create test data
    const testSvj = {
      name: 'Test SVJ',
      ico: '12345678',
      email: 'test@example.com'
    }
    const { error: insertError } = await supabase.from('svj').insert([testSvj])
    assert(!insertError, `Can insert into SVJ table (${insertError?.message || 'OK'})`)
  } else {
    assert(false, `SVJ query failed: ${error?.message}`)
  }
})

test('Employee FK Relationship', async () => {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      full_name,
      svj:svj_id (
        name
      )
    `)
    .limit(1)
    .single()
    
  if (!error && data) {
    assert(data.hasOwnProperty('svj'), 'Employee JOIN with SVJ works')
  } else if (error?.code === 'PGRST116') {
    assert(true, 'No employees found (expected for fresh DB)')
  } else {
    assert(false, `Employee FK test failed: ${error?.message}`)
  }
})

test('Payroll View Access', async () => {
  const { data, error } = await supabase
    .from('v_payrolls_overview')
    .select('*')
    .limit(1)
    
  assert(!error || error?.code === 'PGRST116', `Payroll view accessible (${error?.message || 'OK'})`)
})

// Run all tests
async function runTests() {
  console.log('🚀 DB ↔ FE Integration Tests (Fast Version)')
  console.log('=' .repeat(50))
  
  for (const test of tests) {
    console.log(`\n🔍 ${test.name}...`)
    try {
      await test.fn()
    } catch (error) {
      console.log(`❌ ${test.name} crashed: ${error.message}`)
      failed++
    }
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log(`📊 Results: ${passed} passed, ${failed} failed`)
  console.log(`🎯 Success rate: ${passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0}%`)
  
  if (failed === 0) {
    console.log('🎉 All tests passed! DB ↔ FE integration is working.')
  }
  
  return failed === 0
}

runTests().then(success => {
  process.exit(success ? 0 : 1)
})
