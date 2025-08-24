import { getSupabaseClientFromEnv } from './testUtils'

const client = getSupabaseClientFromEnv()

describe('Supabase svj CRUD (integration)', () => {
  if (!client) {
    it('skips tests when TEST_SUPABASE_URL/ANON_KEY are not set', () => {
      expect(process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL).toBeFalsy()
    })
    return
  }

  let createdId: string | null = null

  it('creates an svj', async () => {
    const payload = {
      name: `itest-svj-${Date.now()}`,
      address: 'Test address'
    }
    const { data, error } = await client.from('svj').insert([payload]).select().single()
    expect(error).toBeNull()
    expect(data).toBeDefined()
    createdId = (data as any).id
    expect(createdId).toBeTruthy()
  })

  it('updates the svj', async () => {
    if (!createdId) return
    const { data, error } = await client.from('svj').update({ name: 'Updated SVJ Name' }).eq('id', createdId).select().single()
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect((data as any).name).toBe('Updated SVJ Name')
  })

  it('deletes the svj', async () => {
    if (!createdId) return
    const { error } = await client.from('svj').delete().eq('id', createdId)
    expect(error).toBeNull()
    const { data: after } = await client.from('svj').select('*').eq('id', createdId)
    expect((after as any[])?.length).toBe(0)
  })
})
