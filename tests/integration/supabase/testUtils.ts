import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function getSupabaseClientFromEnv(): SupabaseClient | null {
  const url = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anon = process.env.TEST_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  return createClient(url, anon)
}

export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClientFromEnv()
  if (!client) throw new Error('Supabase client not configured. Set TEST_SUPABASE_URL and TEST_SUPABASE_ANON_KEY in environment.')
  return client
}
