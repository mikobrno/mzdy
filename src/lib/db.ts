import { supabase } from '@/supabaseClient'

type Where<T> = Partial<Record<keyof T, string | number | boolean | null>>

/** Read many rows with optional equality filters. */
export async function selectAll<T>(table: string, where?: Where<T>): Promise<T[]> {
  let q = supabase.from(table).select('*')
  if (where) {
    for (const [k, v] of Object.entries(where)) q = q.eq(k, v as unknown as string | number | boolean | null)
  }
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as T[]
}

/** Insert one row and return the created record. */
export async function insertOne<T>(table: string, payload: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(payload as unknown as object).select().single()
  if (error) throw error
  return data as T
}

/** Update by id column (default "id") and return the updated record. */
export async function updateById<T>(
  table: string,
  id: string | number,
  payload: Partial<T>,
  idCol = 'id'
): Promise<T> {
  const { data, error } = await supabase.from(table).update(payload as unknown as object).eq(idCol, id).select().single()
  if (error) throw error
  return data as T
}

/** Delete by id column (default "id"). Returns true on success. */
export async function deleteById(
  table: string,
  id: string | number,
  idCol = 'id'
): Promise<boolean> {
  const { error } = await supabase.from(table).delete().eq(idCol, id)
  if (error) throw error
  return true
}
