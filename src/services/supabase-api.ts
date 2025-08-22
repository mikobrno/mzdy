import { supabase } from '@/supabaseClient'
import { SVJ, Employee, SalaryRecord, DashboardStats, EmailTemplate } from '@/types'

class SupabaseApiService {
  async getSVJList(): Promise<any[]> {
    const { data, error } = await supabase.from('svj').select('*')
    if (error) throw error
    return data as any[]
  }

  async getSVJ(id: string): Promise<any | null> {
    const { data, error } = await supabase.from('svj').select('*').eq('id', id).single()
    if (error) throw error
    return data || null
  }

  async createSVJ(payload: any): Promise<any> {
    const { data, error } = await supabase.from('svj').insert([payload]).select().single()
    if (error) throw error
    return data
  }

  async updateSVJ(id: string, payload: any): Promise<any> {
    const { data, error } = await supabase.from('svj').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async getEmployees(svjId?: string): Promise<any[]> {
    let query = supabase.from('employees').select('*')
    if (svjId) query = query.eq('svj_id', svjId)
    const { data, error } = await query
    if (error) throw error
    return data as any[]
  }

  async getEmployee(id: string): Promise<any | null> {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single()
    if (error) throw error
    return data || null
  }

  async createEmployee(payload: any): Promise<any> {
    const { data, error } = await supabase.from('employees').insert([payload]).select().single()
    if (error) throw error
    return data
  }

  async updateEmployee(id: string, payload: any): Promise<any> {
    const { data, error } = await supabase.from('employees').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async terminateEmployee(employeeId: string): Promise<void> {
    await supabase.from('employees').update({ is_active: false, end_date: new Date().toISOString() }).eq('id', employeeId)
  }

  async getSalaryRecords(svjId: string, year: number, month?: number): Promise<any[]> {
    let q = supabase.from('payrolls').select('*').eq('svj_id', svjId).eq('year', year)
    if (month) q = q.eq('month', month)
    const { data, error } = await q
    if (error) throw error
    return data as any[]
  }

  async createSalaryRecord(payload: any): Promise<any> {
    const { data, error } = await supabase.from('payrolls').insert([payload]).select().single()
    if (error) throw error
    return data
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const { data: svjData } = await supabase.from('svj').select('id', { count: 'exact' })
    const { data: empData } = await supabase.from('employees').select('id', { count: 'exact' }).eq('is_active', true)
    const { data: pendingData } = await supabase.from('payrolls').select('id', { count: 'exact' }).in('status', ['draft', 'processing'])
    const { data: completedData } = await supabase.from('payrolls').select('id', { count: 'exact' }).eq('status', 'approved')

    return {
      totalSvj: (svjData as any)?.length || 0,
      totalEmployees: (empData as any)?.length || 0,
      pendingSalaries: (pendingData as any)?.length || 0,
      completedSalariesThisMonth: (completedData as any)?.length || 0,
      pendingCampaigns: 0,
      recentActivities: [],
      userNote: ''
    }
  }

  async updateUserNote(note: string): Promise<void> {
    // store in a simple table 'user_notes' with user id from supabase.auth.getUser
    const { data: session } = await supabase.auth.getSession()
    const userId = (session as any)?.user?.id
    if (!userId) throw new Error('No user')
    await supabase.from('user_notes').upsert({ user_id: userId, note })
  }
}

export const supabaseApiService = new SupabaseApiService()
export default supabaseApiService
