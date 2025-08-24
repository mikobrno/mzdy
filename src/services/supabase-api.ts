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
    // If created_by not provided, try to fill from current session user id
    const toInsert = { ...payload }
    if (!toInsert.created_by) {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        let userId = (sessionData as any)?.user?.id
        
        // Fallback pro mock uživatele
        if (!userId) {
          userId = '123e4567-e89b-12d3-a456-426614174000' // ID našeho mock uživatele
          console.log('🔧 Používám mock user ID pro SVJ')
        }
        
        if (userId) toInsert.created_by = userId
      } catch (e) {
        // ignore - we'll let the DB error surface if RLS requires created_by
      }
    }

    const { data, error } = await supabase.from('svj').insert([toInsert]).select().single()
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

  async getHealthInsuranceCompanies(): Promise<any[]> {
    const { data, error } = await supabase.from('health_insurance_companies').select('id, name, code')
    if (error) throw error
    return data as any[]
  }

  async getEmployee(id: string): Promise<any | null> {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single()
    if (error) throw error
    return data || null
  }

  async createEmployee(payload: any): Promise<any> {
  // Map UI field names to actual DB column names to avoid schema-mismatch errors
  const toInsert: any = {}

  // Required/primary fields
  if (payload.svj_id) toInsert.svj_id = payload.svj_id
  // Accept both `full_name` or `name` from older UI variants
  toInsert.full_name = payload.full_name ?? payload.name ?? null
  if (payload.email) toInsert.email = payload.email

  // Map phone -> phone_number
  if (payload.phone !== undefined) toInsert.phone_number = payload.phone
  else if (payload.phone_number !== undefined) toInsert.phone_number = payload.phone_number

  // Employment type
  if (payload.employment_type) toInsert.employment_type = payload.employment_type

  // Salary amount: accept several aliases and ensure number
  const salaryRaw = payload.salary_amount ?? payload.salary ?? payload.gross_wage ?? payload.gross_salary
  if (salaryRaw !== undefined && salaryRaw !== null && salaryRaw !== '') toInsert.salary_amount = Number(salaryRaw) || 0

  // Optional fields
  if (payload.health_insurance_company_id) toInsert.health_insurance_company_id = payload.health_insurance_company_id
  if (payload.bank_account) toInsert.bank_account = payload.bank_account
  if (payload.personal_id_number) toInsert.personal_id_number = payload.personal_id_number
  if (payload.address) toInsert.address = payload.address
  if (payload.note) toInsert.note = payload.note

  // Default is_active to true if not provided
  if (payload.is_active !== undefined) toInsert.is_active = payload.is_active
  else toInsert.is_active = true

  const { data, error } = await supabase.from('employees').insert([toInsert]).select().single()
  if (error) throw error
  return data
  }

  async updateEmployee(id: string, payload: any): Promise<any> {
  // Map incoming payload fields to DB columns to avoid schema mismatch
  const toUpdate: any = {}

  if (payload.svj_id) toUpdate.svj_id = payload.svj_id

  // prefer explicit full_name, otherwise accept name or firstName+lastName
  if (payload.full_name) toUpdate.full_name = payload.full_name
  else if (payload.name) toUpdate.full_name = payload.name
  else if (payload.firstName || payload.lastName) toUpdate.full_name = `${payload.firstName ?? ''}${payload.firstName && payload.lastName ? ' ' : ''}${payload.lastName ?? ''}`.trim()

  if (payload.email !== undefined) toUpdate.email = payload.email

  if (payload.phone !== undefined) toUpdate.phone_number = payload.phone
  else if (payload.phone_number !== undefined) toUpdate.phone_number = payload.phone_number

  if (payload.employment_type) toUpdate.employment_type = payload.employment_type

  const salaryRaw = payload.salary_amount ?? payload.salary ?? payload.gross_wage ?? payload.gross_salary
  if (salaryRaw !== undefined && salaryRaw !== null && salaryRaw !== '') toUpdate.salary_amount = Number(salaryRaw) || 0

  if (payload.health_insurance_company_id) toUpdate.health_insurance_company_id = payload.health_insurance_company_id
  if (payload.bank_account) toUpdate.bank_account = payload.bank_account
  if (payload.personal_id_number) toUpdate.personal_id_number = payload.personal_id_number
  if (payload.address) toUpdate.address = payload.address
  if (payload.note) toUpdate.note = payload.note

  if (payload.is_active !== undefined) toUpdate.is_active = payload.is_active

  const { data, error } = await supabase.from('employees').update(toUpdate).eq('id', id).select().single()
  if (error) throw error
  return data
  }

  async terminateEmployee(employeeId: string): Promise<void> {
    await supabase.from('employees').update({ is_active: false, end_date: new Date().toISOString() }).eq('id', employeeId)
  }

  async getSalaryRecords(svjId: string, year: number, month?: number): Promise<any[]> {
    // payrolls don't have svj_id directly. Fetch employees for svj and then payrolls.
    const { data: employees, error: eErr } = await supabase.from('employees').select('id, full_name').eq('svj_id', svjId)
    if (eErr) throw eErr
    const ids = ((employees as any[]) || []).map(e => e.id).filter(Boolean)
    if (ids.length === 0) return []
    let q: any = supabase.from('payrolls').select('*').in('employee_id', ids).eq('year', year)
    if (month) q = q.eq('month', month)
    const { data, error } = await q
    if (error) throw error
    const empMap = ((employees as any[]) || []).reduce((acc: any, e: any) => ({ ...acc, [e.id]: e.full_name }), {})
    return ((data as any[]) || []).map((p: any) => ({
      ...p,
      employee_name: empMap[p.employee_id] ?? null,
      gross_wage: p.gross_salary ?? p.base_salary ?? 0,
      net_wage: p.net_salary ?? 0
    }))
  }

  async getPayrollsByEmployee(employeeId: string, year: number, month?: number): Promise<any[]> {
    let q = supabase.from('payrolls').select('*').eq('employee_id', employeeId).eq('year', year)
    if (month) q = q.eq('month', month)
    const { data, error } = await q
    if (error) throw error
    return data as any[]
  }

  async createSalaryRecord(payload: any): Promise<any> {
    // Accept both old and new field names
    const toInsert = {
      employee_id: payload.employeeId || payload.employee_id,
      month: payload.month,
      year: payload.year,
      status: payload.status || 'pending',
      base_salary: payload.base_salary ?? payload.gross_wage ?? payload.gross_salary ?? 0,
      bonuses: payload.bonuses ?? 0,
      gross_salary: payload.gross_wage ?? payload.gross_salary ?? payload.base_salary ?? 0,
      net_salary: payload.net_wage ?? payload.net_salary ?? 0
    }
    const { data, error } = await supabase.from('payrolls').insert([toInsert]).select().single()
    if (error) throw error
    return data
  }

  async getAllPayrolls(): Promise<any[]> {
    // Prefer the read-only view for joined payroll+employee data. If the view
    // doesn't exist (migration not run), fall back to reading payrolls and
    // then querying employees to assemble employee_name.
    try {
      const { data, error } = await supabase.from('v_payrolls_overview').select('*').order('year', { ascending: false }).order('month', { ascending: false })
      if (error) throw error
      return (data as any[]).map((r: any) => ({
        id: r.id,
        month: r.month,
        year: r.year,
        employee_name: r.employee_name,
        gross_wage: r.base_salary ?? r.gross_salary ?? 0,
        net_wage: r.net_salary ?? 0,
        status: r.status
      }))
    } catch (err: any) {
      // If view missing or other error, fallback to direct tables
      console.warn('v_payrolls_overview not available, falling back to direct payrolls fetch:', err?.message || err)
      const { data: payrolls, error: pErr } = await supabase.from('payrolls').select('*').order('year', { ascending: false }).order('month', { ascending: false })
      if (pErr) throw pErr
      const ids = Array.from(new Set(((payrolls as any[]) || []).map((p: any) => p.employee_id).filter(Boolean)))
      let employeesMap: Record<string, string> = {}
      if (ids.length > 0) {
        const { data: employees, error: eErr } = await supabase.from('employees').select('id, full_name').in('id', ids)
        if (eErr) throw eErr
        employeesMap = ((employees as any[]) || []).reduce((acc: any, e: any) => ({ ...acc, [e.id]: e.full_name }), {})
      }
      return ((payrolls as any[]) || []).map((r: any) => ({
        id: r.id,
        month: r.month,
        year: r.year,
        employee_name: employeesMap[r.employee_id] ?? null,
        gross_wage: r.base_salary ?? r.gross_salary ?? 0,
        net_wage: r.net_salary ?? 0,
        status: r.status
      }))
    }
  }

  async getPayrollById(id: string): Promise<any | null> {
    // Try the view first; if missing, fetch from payrolls + employees
    try {
      const { data, error } = await supabase.from('v_payrolls_overview').select('*').eq('id', id).single()
      if (error) throw error
      if (!data) return null
      return {
        id: data.id,
        month: data.month,
        year: data.year,
        employee_name: data.employee_name,
        base_salary: data.base_salary,
        gross_wage: data.gross_salary ?? data.base_salary ?? 0,
        net_wage: data.net_salary ?? 0,
        status: data.status,
        created_at: data.created_at
      }
    } catch (err: any) {
      console.warn('v_payrolls_overview not available for getPayrollById, falling back:', err?.message || err)
      const { data: p, error: pErr } = await supabase.from('payrolls').select('*').eq('id', id).single()
      if (pErr) throw pErr
      if (!p) return null
      let employee_name: string | null = null
      if (p.employee_id) {
        const { data: e, error: eErr } = await supabase.from('employees').select('full_name').eq('id', p.employee_id).single()
        if (eErr) throw eErr
        employee_name = (e as any)?.full_name ?? null
      }
      return {
        id: p.id,
        month: p.month,
        year: p.year,
        employee_name,
        base_salary: p.base_salary,
        gross_wage: p.gross_salary ?? p.base_salary ?? 0,
        net_wage: p.net_salary ?? 0,
        status: p.status,
        created_at: p.created_at
      }
    }
  }

  async deletePayroll(id: string): Promise<void> {
    const { error } = await supabase.from('payrolls').delete().eq('id', id)
    if (error) throw error
  }

  async updatePayroll(id: string, payload: any): Promise<any> {
    const { data, error } = await supabase.from('payrolls').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async updatePayrollStatus(id: string, status: string): Promise<any> {
    const { data, error } = await supabase.from('payrolls').update({ status }).eq('id', id).select().single()
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

  // PDF templates CRUD
  async getPdfTemplates(): Promise<any[]> {
    const { data, error } = await supabase.from('pdf_templates').select('*').order('name', { ascending: true })
    if (error) throw error
    return data as any[]
  }

  async createPdfTemplate(payload: any): Promise<any> {
    // Map incoming payload fields from frontend to actual DB column names
    const toInsert: any = {
      name: payload.name,
      // DB stores the file location/path. If frontend provided fileBase64 but no storage,
      // store original filename in file_path as a fallback (empty string not allowed by schema)
      file_path: payload.file_path ?? payload.fileName ?? payload.file_name ?? '',
      // field_mappings is jsonb NOT NULL in the schema
      field_mappings: payload.field_mappings ?? payload.mapping ?? payload.field_mappings ?? {},
    }
    // If frontend provided file_base64 or fileBase64, store it as well (some deployments may accept it)
    if (payload.file_base64 !== undefined) toInsert.file_base64 = payload.file_base64
    if (payload.fileBase64 !== undefined) toInsert.file_base64 = payload.fileBase64

    const { data, error } = await supabase.from('pdf_templates').insert([toInsert]).select().single()
    if (error) throw error
    return data
  }

  async updatePdfTemplate(id: string, patch: any): Promise<any> {
  // Map patch fields to DB columns
  const toUpdate: any = {}
  if (patch.name !== undefined) toUpdate.name = patch.name
  if (patch.file_name !== undefined) toUpdate.file_path = patch.file_name
  if ((patch as any).fileName !== undefined) toUpdate.file_path = (patch as any).fileName
  if ((patch as any).file_base64 !== undefined) toUpdate.file_base64 = (patch as any).file_base64
  if ((patch as any).fileBase64 !== undefined) toUpdate.file_base64 = (patch as any).fileBase64
  if (patch.mapping !== undefined) toUpdate.field_mappings = patch.mapping
  if (patch.field_mappings !== undefined) toUpdate.field_mappings = patch.field_mappings

  const { data, error } = await supabase.from('pdf_templates').update(toUpdate).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deletePdfTemplate(id: string): Promise<void> {
    const { error } = await supabase.from('pdf_templates').delete().eq('id', id)
    if (error) throw error
  }

  async updateUserNote(note: string): Promise<void> {
    // store in a simple table 'user_notes' with user id from supabase.auth.getUser
    const { data: session } = await supabase.auth.getSession()
    let userId = (session as any)?.user?.id
    
    // Fallback pro mock uživatele - používáme pevné ID pro vývoj
    if (!userId) {
      userId = '123e4567-e89b-12d3-a456-426614174000' // ID našeho mock uživatele
      console.log('🔧 Používám mock user ID pro poznámku')
    }
    
    if (!userId) throw new Error('No user')
    await supabase.from('user_notes').upsert({ user_id: userId, note })
  }

  // DYNAMIC VARIABLES API
  async getDynamicVariables(): Promise<any[]> {
    const { data, error } = await supabase.from('dynamic_variables').select('*').order('name')
    if (error) throw error
    return data || []
  }

  async createDynamicVariable(variable: any): Promise<any> {
    const { data, error } = await supabase.from('dynamic_variables').insert(variable).select().single()
    if (error) throw error
    return data
  }

  async updateDynamicVariable(id: string, patch: any): Promise<any> {
    const { data, error } = await supabase.from('dynamic_variables').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteDynamicVariable(id: string): Promise<void> {
    const { error } = await supabase.from('dynamic_variables').delete().eq('id', id)
    if (error) throw error
  }

  // NOTIFICATIONS API
  async getNotifications(): Promise<any[]> {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    if (error) throw error
  }

  async archiveNotification(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_archived: true }).eq('id', id)
    if (error) throw error
  }

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) throw error
  }

  // USERS API
  async getUsers(): Promise<any[]> {
    const { data, error } = await supabase.from('user_profiles').select('*').order('name')
    if (error) throw error
    return data || []
  }

  async createUser(user: any): Promise<any> {
    const { data, error } = await supabase.from('user_profiles').insert(user).select().single()
    if (error) throw error
    return data
  }

  async updateUser(id: string, patch: any): Promise<any> {
    const { data, error } = await supabase.from('user_profiles').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('user_profiles').delete().eq('id', id)
    if (error) throw error
  }

  // COMMUNICATION CAMPAIGNS API
  async getCommunicationCampaigns(): Promise<any[]> {
    const { data, error } = await supabase.from('communication_campaigns').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async createCommunicationCampaign(campaign: any): Promise<any> {
    const { data, error } = await supabase.from('communication_campaigns').insert(campaign).select().single()
    if (error) throw error
    return data
  }

  async updateCommunicationCampaign(id: string, patch: any): Promise<any> {
    const { data, error } = await supabase.from('communication_campaigns').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteCommunicationCampaign(id: string): Promise<void> {
    const { error } = await supabase.from('communication_campaigns').delete().eq('id', id)
    if (error) throw error
  }

  // EMAIL TEMPLATES API
  async getEmailTemplates(): Promise<any[]> {
    const { data, error } = await supabase.from('email_templates').select('*').order('name')
    if (error) throw error
    return data || []
  }

  async createEmailTemplate(template: any): Promise<any> {
    const { data, error } = await supabase.from('email_templates').insert(template).select().single()
    if (error) throw error
    return data
  }

  async updateEmailTemplate(id: string, patch: any): Promise<any> {
    const { data, error } = await supabase.from('email_templates').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    const { error } = await supabase.from('email_templates').delete().eq('id', id)
    if (error) throw error
  }
}

export const supabaseApiService = new SupabaseApiService()
export default supabaseApiService
