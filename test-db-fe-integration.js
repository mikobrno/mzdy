#!/usr/bin/env node

/**
 * Automated DB ↔ FE Integration Test Suite
 * Tests Supabase connection, CRUD operations, and data flow
 * 
 * Usage: node test-db-fe-integration.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load environment variables from .env.local if exists
function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      let currentKey = null
      let currentValue = ''
      
      envContent.split('\n').forEach(line => {
        line = line.trim()
        if (!line || line.startsWith('#')) return
        
        if (line.includes('=') && !currentKey) {
          const [key, ...valueParts] = line.split('=')
          currentKey = key.trim()
          currentValue = valueParts.join('=').trim()
          
          if (!process.env[currentKey]) {
            process.env[currentKey] = currentValue
          }
          currentKey = null
          currentValue = ''
        }
      })
    }
  } catch (error) {
    console.error('Error loading .env.local:', error.message)
  }
}

loadEnvLocal()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://46.28.108.221:8000'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY not found in environment')
  console.log('Set it in .env.local or export VITE_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

// Initialize Supabase client (same as FE)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test counters
let passed = 0
let failed = 0
let testResults = []

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().slice(11, 19)
  const prefix = {
    info: '🔍',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📝'
  
  console.log(`[${timestamp}] ${prefix} ${message}`)
}

function assert(condition, message) {
  if (condition) {
    passed++
    log(`PASS: ${message}`, 'success')
    testResults.push({ status: 'PASS', message })
  } else {
    failed++
    log(`FAIL: ${message}`, 'error')
    testResults.push({ status: 'FAIL', message })
  }
}

function assertDeepEqual(actual, expected, message) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected)
  assert(isEqual, `${message} (got: ${JSON.stringify(actual)}, expected: ${JSON.stringify(expected)})`)
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Test suite
async function runTests() {
  log('🚀 Starting DB ↔ FE Integration Test Suite')
  log(`Testing Supabase at: ${SUPABASE_URL}`)
  
  try {
    // Test 1: Basic Connection
    log('Test 1: Basic Supabase Connection')
    const { data: healthCheck, error: healthError } = await supabase
      .from('svj')
      .select('count', { count: 'exact', head: true })
    
    assert(!healthError, `Supabase connection working (${healthError?.message || 'OK'})`)
    log(`SVJ table has ${healthCheck || 0} records`)

    // Test 2: SVJ Operations (mimicking FE apiService)
    log('\nTest 2: SVJ CRUD Operations')
    
    const testSVJ = {
      id: '99999999-9999-9999-9999-999999999999',
      name: 'Test SVJ Integration',
      ico: '99999999',
      address: 'Test Address 123',
      email: 'test@example.com',
      is_active: true
    }

    // CREATE
    const { data: createdSVJ, error: createError } = await supabase
      .from('svj')
      .insert([testSVJ])
      .select()
      .single()

    assert(!createError, `SVJ CREATE operation successful (${createError?.message || 'OK'})`)
    if (createdSVJ) {
      assert(createdSVJ.name === testSVJ.name, 'Created SVJ has correct name')
      assert(createdSVJ.ico === testSVJ.ico, 'Created SVJ has correct ICO')
    }

    // READ
    const { data: fetchedSVJ, error: fetchError } = await supabase
      .from('svj')
      .select('*')
      .eq('id', testSVJ.id)
      .single()

    assert(!fetchError, `SVJ READ operation successful (${fetchError?.message || 'OK'})`)
    if (fetchedSVJ) {
      assert(fetchedSVJ.name === testSVJ.name, 'Fetched SVJ matches created data')
    }

    // UPDATE
    const updateData = { name: 'Updated Test SVJ' }
    const { data: updatedSVJ, error: updateError } = await supabase
      .from('svj')
      .update(updateData)
      .eq('id', testSVJ.id)
      .select()
      .single()

    assert(!updateError, `SVJ UPDATE operation successful (${updateError?.message || 'OK'})`)
    if (updatedSVJ) {
      assert(updatedSVJ.name === updateData.name, 'SVJ name updated correctly')
    }

    // Test 3: Employee Operations (with FK relationship)
    log('\nTest 3: Employee Operations with FK Relationships')
    
    const testEmployee = {
      id: '88888888-8888-8888-8888-888888888888',
      svj_id: testSVJ.id,
      full_name: 'Test Employee',
      employment_type: 'vybor',
      salary_amount: 30000.00,
      is_active: true
    }

    const { data: createdEmployee, error: empCreateError } = await supabase
      .from('employees')
      .insert([testEmployee])
      .select(`
        *,
        svj:svj_id (
          id,
          name
        )
      `)
      .single()

    assert(!empCreateError, `Employee CREATE with FK successful (${empCreateError?.message || 'OK'})`)
    if (createdEmployee) {
      assert(createdEmployee.svj_id === testSVJ.id, 'Employee linked to correct SVJ')
      assert(createdEmployee.svj?.name === updateData.name, 'Employee JOIN returns correct SVJ data')
    }

    // Test 4: Payroll Operations (complex relationships)
    log('\nTest 4: Payroll Operations with Complex Joins')
    
    const testPayroll = {
      id: '77777777-7777-7777-7777-777777777777',
      employee_id: testEmployee.id,
      month: 8,
      year: 2025,
      status: 'pending',
      base_salary: 30000.00,
      gross_salary: 30000.00,
      net_salary: 24000.00
    }

    const { data: createdPayroll, error: payrollCreateError } = await supabase
      .from('payrolls')
      .insert([testPayroll])
      .select()
      .single()

    assert(!payrollCreateError, `Payroll CREATE successful (${payrollCreateError?.message || 'OK'})`)

    // Test view query (mimicking FE dashboard)
    const { data: payrollsOverview, error: viewError } = await supabase
      .from('v_payrolls_overview')
      .select('*')
      .eq('employee_id', testEmployee.id)

    assert(!viewError, `Payrolls overview view query successful (${viewError?.message || 'OK'})`)
    if (payrollsOverview && payrollsOverview.length > 0) {
      const payroll = payrollsOverview[0]
      assert(payroll.employee_name === testEmployee.full_name, 'View returns correct employee name')
      assert(payroll.net_salary === testPayroll.net_salary, 'View returns correct salary data')
    }

    // Test 5: Dashboard Stats (mimicking FE queries)
    log('\nTest 5: Dashboard Statistics Queries')
    
    const { data: svjCount } = await supabase
      .from('svj')
      .select('*', { count: 'exact', head: true })
    
    const { data: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
    
    const { data: payrollCount } = await supabase
      .from('payrolls')
      .select('*', { count: 'exact', head: true })

    assert(typeof svjCount === 'number' && svjCount >= 1, `SVJ count query returns valid number (${svjCount})`)
    assert(typeof employeeCount === 'number' && employeeCount >= 1, `Employee count query returns valid number (${employeeCount})`)
    assert(typeof payrollCount === 'number' && payrollCount >= 1, `Payroll count query returns valid number (${payrollCount})`)

    // Test 6: Error Handling (invalid queries)
    log('\nTest 6: Error Handling')
    
    const { error: invalidError } = await supabase
      .from('nonexistent_table')
      .select('*')
    
    assert(invalidError !== null, 'Invalid table query returns proper error')

    // Test 7: RLS Policies (if enabled)
    log('\nTest 7: Row Level Security')
    
    const { data: rlsTestData, error: rlsError } = await supabase
      .from('svj')
      .select('*')
      .limit(1)

    assert(!rlsError, `RLS allows SELECT queries (${rlsError?.message || 'OK'})`)

    // Cleanup: Delete test data
    log('\nCleanup: Removing test data')
    
    await supabase.from('payrolls').delete().eq('id', testPayroll.id)
    await supabase.from('employees').delete().eq('id', testEmployee.id)
    const { error: cleanupError } = await supabase.from('svj').delete().eq('id', testSVJ.id)
    
    assert(!cleanupError, `Cleanup successful (${cleanupError?.message || 'OK'})`)

  } catch (error) {
    log(`Unexpected error: ${error.message}`, 'error')
    failed++
  }

  // Test Summary
  log('\n' + '='.repeat(50))
  log(`🏁 Test Suite Complete`)
  log(`✅ Passed: ${passed}`)
  log(`❌ Failed: ${failed}`)
  log(`📊 Success Rate: ${passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0}%`)

  if (failed === 0) {
    log('🎉 All tests passed! DB ↔ FE integration is working correctly.', 'success')
  } else {
    log('🚨 Some tests failed. Check the issues above.', 'error')
    
    // Output detailed results for debugging
    console.log('\nDetailed Results:')
    testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.status}: ${result.message}`)
    })
  }

  return failed === 0
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Test suite crashed:', error)
      process.exit(1)
    })
}

export { runTests }
