import { getSupabaseClientFromEnv } from './testUtils'

const client = getSupabaseClientFromEnv()

describe('Supabase payrolls CRUD (integration)', () => {
  if (!client) {
    it('skips tests when TEST_SUPABASE_URL/ANON_KEY are not set', () => {
      expect(process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL).toBeFalsy()
    })
    return
  }

  let createdId: string | null = null
  let testEmployeeId: string | null = null

  it('creates a minimal employee for payroll FK', async () => {
    const emp = { svj_id: 'itest-svj', full_name: `pr-${Date.now()}`, is_active: true }
    const { data, error } = await client.from('employees').insert([emp]).select().single()
    expect(error).toBeNull()
    testEmployeeId = (data as any).id
    expect(testEmployeeId).toBeTruthy()
  })

  it('creates a payroll', async () => {
    if (!testEmployeeId) return
    const payload = { employee_id: testEmployeeId, month: 1, year: 2000, base_salary: 1000, status: 'draft' }
    const { data, error } = await client.from('payrolls').insert([payload]).select().single()
    expect(error).toBeNull()
    expect(data).toBeDefined()
    createdId = (data as any).id
    expect(createdId).toBeTruthy()
  })

  it('updates payroll status', async () => {
    if (!createdId) return
    const { data, error } = await client.from('payrolls').update({ status: 'approved' }).eq('id', createdId).select().single()
    expect(error).toBeNull()
    expect((data as any).status).toBe('approved')
  })

  it('deletes payroll and cleanup employee', async () => {
    if (!createdId) return
    const { error } = await client.from('payrolls').delete().eq('id', createdId)
    expect(error).toBeNull()

    if (testEmployeeId) {
      const { error: eErr } = await client.from('employees').delete().eq('id', testEmployeeId)
      expect(eErr).toBeNull()
    }
  })
})
