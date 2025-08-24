import { getSupabaseClientFromEnv } from './testUtils'

const client = getSupabaseClientFromEnv()

describe('Supabase pdf_templates CRUD (integration)', () => {
  if (!client) {
    it('skips tests when TEST_SUPABASE_URL/ANON_KEY are not set', () => {
      expect(process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL).toBeFalsy()
    })
    return
  }

  let createdId: string | null = null

  it('creates a pdf_template', async () => {
    const payload = { name: `itest-pdf-${Date.now()}`, template_html: '<div>test</div>' }
    const { data, error } = await client.from('pdf_templates').insert([payload]).select().single()
    expect(error).toBeNull()
    expect(data).toBeDefined()
    createdId = (data as any).id
    expect(createdId).toBeTruthy()
  })

  it('updates pdf_template', async () => {
    if (!createdId) return
    const { data, error } = await client.from('pdf_templates').update({ name: 'Updated PDF' }).eq('id', createdId).select().single()
    expect(error).toBeNull()
    expect((data as any).name).toBe('Updated PDF')
  })

  it('deletes pdf_template', async () => {
    if (!createdId) return
    const { error } = await client.from('pdf_templates').delete().eq('id', createdId)
    expect(error).toBeNull()
  })
})
