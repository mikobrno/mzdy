// Shim over Supabase — keeps old imports working while routing everything to Supabase.
import { supabase } from '@/supabaseClient'
import { getUserId } from '@/lib/auth'
import { uploadToBucket, getSignedUrl } from '@/lib/storage'

export type SignInParams = { email: string; password: string }
export type SignUpParams = { email: string; password: string; metadata?: Record<string, unknown> }

export async function signIn({ email, password }: SignInParams) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp({ email, password, metadata }: SignUpParams) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// Minimal upload API compatible with previous callers
export async function uploadPrivatePdf(path: string, file: Blob | File | Uint8Array | ArrayBuffer) {
  // Use our existing storage helpers; bucket is fixed to 'pdf'
  return uploadToBucket('pdf', path, file, 'application/pdf')
}

export async function getPrivatePdfUrl(path: string, ttlSeconds = 3600) {
  return getSignedUrl('pdf', path, ttlSeconds)
}

// Example: build per-user path (reuse existing helper if needed)
export async function buildUserScopedPath(fileNameBase: string) {
  const userId = await getUserId()
  const safe = fileNameBase.replace(/[^a-zA-Z0-9._-]/g, '_')
  const ts = Date.now()
  return `user/${userId}/${ts}-${safe}`
}
// @ts-expect-error legacy package types unavailable
import { NhostClient } from '@nhost/nhost-js';

const nhost = new NhostClient({
  subdomain: 'sthlcibuwuamdyqoowmm',
  region: 'eu-central-1',
});

export { nhost };
