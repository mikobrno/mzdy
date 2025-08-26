import { supabase } from '@/supabaseClient'

/** Call a Postgres function (rpc) with optional args. */
export async function callRpc<T = unknown>(
  fn: string,
  args?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args ?? {})
  if (error) throw error
  return data as T
}

/** Call a Supabase Edge Function by name (if you use them). */
export async function callFunction<T = unknown>(
  name: string,
  body?: unknown
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) throw error
  return data as T
}
