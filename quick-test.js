#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple .env.local loader
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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Quick Connection Test')
console.log('URL:', SUPABASE_URL)
console.log('Key length:', SUPABASE_ANON_KEY?.length || 0)

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log('❌ Missing credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🚀 Testing connection...')

try {
  const { data, error } = await supabase.from('svj').select('count', { count: 'exact', head: true })
  
  if (error) {
    console.log('❌ Connection failed:', error.message)
  } else {
    console.log('✅ Connection successful!')
    console.log('📊 SVJ table has', data, 'records')
  }
} catch (err) {
  console.log('❌ Exception:', err.message)
}
