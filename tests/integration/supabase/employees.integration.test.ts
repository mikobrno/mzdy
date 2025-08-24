import { getSupabaseClientFromEnv } from './testUtils'

const client = getSupabaseClientFromEnv()

describe('Supabase employees CRUD (integration)', () => {
  if (!client) {
    it('skips tests when TEST_SUPABASE_URL/ANON_KEY are not set', () => {
      expect(process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL).toBeFalsy()
    })
    return
  }

  let createdId: string | null = null

  it('creates an employee', async () => {
    const payload = {
      svj_id: 'test-svj',
      full_name: 'Integration Test User',
      email: `itest-${Date.now()}@example.test`,
      phone_number: '000000000',
      salary_amount: 1000,
      is_active: true
    }

    const { data, error } = await client.from('employees').insert([payload]).select().single()
    expect(error).toBeNull()
    expect(data).toBeDefined()
    createdId = (data as any).id
    expect(createdId).toBeTruthy()
  })

  it('updates the employee', async () => {
    if (!createdId) return
    const { data, error } = await client.from('employees').update({ full_name: 'Updated Name' }).eq('id', createdId).select().single()
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect((data as any).full_name).toBe('Updated Name')
  })

  it('deletes the employee', async () => {
    if (!createdId) return
    const { error } = await client.from('employees').delete().eq('id', createdId)
    expect(error).toBeNull()
    // confirm deletion
    const { data: after } = await client.from('employees').select('*').eq('id', createdId)
    expect((after as any[])?.length).toBe(0)
  })
})
