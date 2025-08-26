import { supabase } from '@/supabaseClient'
import { DashboardStats } from '@/types'

class SupabaseApiService {
  async getSVJList(): Promise<unknown[]> {
    const { data, error } = await supabase.from('svj').select('*')
    if (error) throw error
    return (data as unknown[]) || []
  }

  async getSVJ(id: string): Promise<unknown | null> {
    const { data, error } = await supabase.from('svj').select('*').eq('id', id).single()
    if (error) throw error
    return data || null
  }

  async createSVJ(payload: Record<string, unknown>): Promise<unknown> {
    // If created_by not provided, try to fill from current session user id
    const toInsert: Record<string, unknown> = { ...(payload as unknown as Record<string, unknown>) }
    if (!toInsert.created_by) {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        let userId = (sessionData as unknown as { user?: { id?: string } })?.user?.id
        
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

  async updateSVJ(id: string, payload: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('svj').update(payload as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async getEmployees(svjId?: string): Promise<unknown[]> {
    let query = supabase.from('employees').select('*')
    if (svjId) query = query.eq('svj_id', svjId)
    const { data, error } = await query
    if (error) throw error
    return (data as unknown[]) || []
  }

  async getHealthInsuranceCompanies(): Promise<unknown[]> {
    const { data, error } = await supabase.from('health_insurance_companies').select('id, name, code')
    if (error) throw error
    return (data as unknown[]) || []
  }

  async getEmployee(id: string): Promise<unknown | null> {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single()
    if (error) throw error
    return data || null
  }

  async createEmployee(payload: Record<string, unknown>): Promise<unknown> {
  // Map UI field names to actual DB column names to avoid schema-mismatch errors
  const p = payload as unknown as Record<string, unknown>
  const toInsert: Record<string, unknown> = {}

  // Required/primary fields
  if (p['svj_id']) toInsert['svj_id'] = p['svj_id']
  // Accept both `full_name` or `name` from older UI variants
  toInsert['full_name'] = p['full_name'] ?? p['name'] ?? null
  if (p['email']) toInsert['email'] = p['email']

  // Map phone -> phone_number
  if (p['phone'] !== undefined) toInsert['phone_number'] = p['phone']
  else if (p['phone_number'] !== undefined) toInsert['phone_number'] = p['phone_number']

  // Employment type
  if (p['employment_type']) toInsert['employment_type'] = p['employment_type']

  // Salary amount: accept several aliases and ensure number
  const salaryRaw = p['salary_amount'] ?? p['salary'] ?? p['gross_wage'] ?? p['gross_salary']
  if (salaryRaw !== undefined && salaryRaw !== null && salaryRaw !== '') toInsert['salary_amount'] = Number(salaryRaw as unknown) || 0

  // Optional fields
  if (p['health_insurance_company_id']) toInsert['health_insurance_company_id'] = p['health_insurance_company_id']
  if (p['bank_account']) toInsert['bank_account'] = p['bank_account']
  if (p['personal_id_number']) toInsert['personal_id_number'] = p['personal_id_number']
  if (p['address']) toInsert['address'] = p['address']
  if (p['note']) toInsert['note'] = p['note']

  // Default is_active to true if not provided
  if (p['is_active'] !== undefined) toInsert['is_active'] = p['is_active']
  else toInsert['is_active'] = true

  const { data, error } = await supabase.from('employees').insert([toInsert]).select().single()
  if (error) throw error
  return data
  }

  async updateEmployee(id: string, payload: Record<string, unknown>): Promise<unknown> {
  // Map incoming payload fields to DB columns to avoid schema mismatch
  const p = payload as unknown as Record<string, unknown>
  const toUpdate: Record<string, unknown> = {}

  if (p['svj_id']) toUpdate['svj_id'] = p['svj_id']

  // prefer explicit full_name, otherwise accept name or firstName+lastName
  if (p['full_name']) toUpdate['full_name'] = p['full_name']
  else if (p['name']) toUpdate['full_name'] = p['name']
  else if (p['firstName'] || p['lastName']) toUpdate['full_name'] = `${p['firstName'] ?? ''}${p['firstName'] && p['lastName'] ? ' ' : ''}${p['lastName'] ?? ''}`.trim()

  if (p['email'] !== undefined) toUpdate['email'] = p['email']

  if (p['phone'] !== undefined) toUpdate['phone_number'] = p['phone']
  else if (p['phone_number'] !== undefined) toUpdate['phone_number'] = p['phone_number']

  if (p['employment_type']) toUpdate['employment_type'] = p['employment_type']

  const salaryRaw = p['salary_amount'] ?? p['salary'] ?? p['gross_wage'] ?? p['gross_salary']
  if (salaryRaw !== undefined && salaryRaw !== null && salaryRaw !== '') toUpdate['salary_amount'] = Number(salaryRaw as unknown) || 0

  if (p['health_insurance_company_id']) toUpdate['health_insurance_company_id'] = p['health_insurance_company_id']
  if (p['bank_account']) toUpdate['bank_account'] = p['bank_account']
  if (p['personal_id_number']) toUpdate['personal_id_number'] = p['personal_id_number']
  if (p['address']) toUpdate['address'] = p['address']
  if (p['note']) toUpdate['note'] = p['note']

  if (p['is_active'] !== undefined) toUpdate['is_active'] = p['is_active']

  const { data, error } = await supabase.from('employees').update(toUpdate as unknown as object).eq('id', id).select().single()
  if (error) throw error
  return data
  }

  async terminateEmployee(employeeId: string): Promise<void> {
    await supabase.from('employees').update({ is_active: false, end_date: new Date().toISOString() }).eq('id', employeeId)
  }

  async getSalaryRecords(svjId: string, year: number, month?: number): Promise<unknown[]> {
    // payrolls don't have svj_id directly. Fetch employees for svj and then payrolls.
    const { data: employees, error: eErr } = await supabase.from('employees').select('id, full_name').eq('svj_id', svjId)
    if (eErr) throw eErr
  const empArr = (employees as unknown as Record<string, unknown>[]) || []
  const ids = empArr.map(e => e['id']).filter(Boolean)
    if (ids.length === 0) return []
  // supabase query type is dynamic; keep inference and avoid explicit `any`
  let q = supabase.from('payrolls').select('*').in('employee_id', ids).eq('year', year)
  if (month) q = q.eq('month', month)
  const { data, error } = await q
    if (error) throw error
  const empMap = empArr.reduce((acc: Record<string, unknown>, e) => ({ ...acc, [String(e['id'])]: e['full_name'] }), {} as Record<string, unknown>)
    return ((data as unknown[]) || []).map((p) => ({
      ...(p as Record<string, unknown>),
      employee_name: (empMap[String((p as Record<string, unknown>)['employee_id'])] as unknown) ?? null,
      gross_wage: (p as Record<string, unknown>)['gross_salary'] ?? (p as Record<string, unknown>)['base_salary'] ?? 0,
      net_wage: (p as Record<string, unknown>)['net_salary'] ?? 0
    }))
  }

  async getPayrollsByEmployee(employeeId: string, year: number, month?: number): Promise<unknown[]> {
    let q = supabase.from('payrolls').select('*').eq('employee_id', employeeId).eq('year', year)
    if (month) q = q.eq('month', month)
    const { data, error } = await q
    if (error) throw error
    return (data as unknown[]) || []
  }

  async createSalaryRecord(payload: Record<string, unknown>): Promise<unknown> {
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

  async getAllPayrolls(): Promise<unknown[]> {
    // Prefer the read-only view for joined payroll+employee data. If the view
    // doesn't exist (migration not run), fall back to reading payrolls and
    // then querying employees to assemble employee_name.
    try {
      const { data, error } = await supabase.from('v_payrolls_overview').select('*').order('year', { ascending: false }).order('month', { ascending: false })
      if (error) throw error
      return (data as unknown[]).map((r: unknown) => ({
        id: (r as Record<string, unknown>)['id'],
        month: (r as Record<string, unknown>)['month'],
        year: (r as Record<string, unknown>)['year'],
        employee_name: (r as Record<string, unknown>)['employee_name'],
        gross_wage: (r as Record<string, unknown>)['base_salary'] ?? (r as Record<string, unknown>)['gross_salary'] ?? 0,
        net_wage: (r as Record<string, unknown>)['net_salary'] ?? 0,
        status: (r as Record<string, unknown>)['status']
      }))
    } catch (err: unknown) {
      // If view missing or other error, fallback to direct tables
  // Prefer safe extraction of message from unknown error
  console.warn('v_payrolls_overview not available, falling back to direct payrolls fetch:', (err as unknown && (err as { message?: string }).message) || String(err))
      const { data: payrolls, error: pErr } = await supabase.from('payrolls').select('*').order('year', { ascending: false }).order('month', { ascending: false })
      if (pErr) throw pErr
      const ids = Array.from(new Set(((payrolls as unknown[]) || []).map((p) => (p as Record<string, unknown>)['employee_id']).filter(Boolean)))
  const employeesMap: Record<string, string> = {}
      if (ids.length > 0) {
        const { data: employees, error: eErr } = await supabase.from('employees').select('id, full_name').in('id', ids)
        if (eErr) throw eErr
        const arr = (employees as unknown[]) || []
        for (const e of arr) {
          const rec = e as Record<string, unknown>
          const idVal = rec['id']
          const nameVal = rec['full_name']
          if (idVal) employeesMap[String(idVal)] = String(nameVal ?? '')
        }
      }
      return ((payrolls as unknown[]) || []).map((r) => ({
        id: (r as Record<string, unknown>)['id'],
        month: (r as Record<string, unknown>)['month'],
        year: (r as Record<string, unknown>)['year'],
        employee_name: employeesMap[String((r as Record<string, unknown>)['employee_id'])] ?? null,
        gross_wage: (r as Record<string, unknown>)['base_salary'] ?? (r as Record<string, unknown>)['gross_salary'] ?? 0,
        net_wage: (r as Record<string, unknown>)['net_salary'] ?? 0,
        status: (r as Record<string, unknown>)['status']
      }))
    }
  }

  async getPayrollById(id: string): Promise<unknown | null> {
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
  } catch (err: unknown) {
      console.warn('v_payrolls_overview not available for getPayrollById, falling back:', (err as { message?: string })?.message ?? String(err))
      const { data: p, error: pErr } = await supabase.from('payrolls').select('*').eq('id', id).single()
      if (pErr) throw pErr
      if (!p) return null
      let employee_name: string | null = null
          if (p.employee_id) {
            const { data: e, error: eErr } = await supabase.from('employees').select('full_name').eq('id', p.employee_id).single()
            if (eErr) throw eErr
            if (e) employee_name = String((e as Record<string, unknown>)['full_name']) ?? null
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

  async updatePayroll(id: string, payload: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('payrolls').update(payload as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async updatePayrollStatus(id: string, status: string): Promise<unknown> {
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
  totalSvj: (svjData as unknown as unknown[])?.length || 0,
  totalEmployees: (empData as unknown as unknown[])?.length || 0,
  pendingSalaries: (pendingData as unknown as unknown[])?.length || 0,
  completedSalariesThisMonth: (completedData as unknown as unknown[])?.length || 0,
      pendingCampaigns: 0,
      recentActivities: [],
      userNote: ''
    }
  }

  // PDF templates CRUD
  async getPdfTemplates(): Promise<unknown[]> {
    const { data, error } = await supabase.from('pdf_templates').select('*').order('name', { ascending: true })
    if (error) throw error
    return (data as unknown[]) || []
  }

  async createPdfTemplate(payload: Record<string, unknown>): Promise<unknown> {
    // Map incoming payload fields from frontend to actual DB column names
    const p = payload as unknown as Record<string, unknown>
    const toInsert: Record<string, unknown> = {
      name: p['name'],
      // DB stores the file location/path. If frontend provided fileBase64 but no storage,
      // store original filename in file_path as a fallback (empty string not allowed by schema)
      file_path: p['file_path'] ?? p['fileName'] ?? p['file_name'] ?? '',
      // field_mappings is jsonb NOT NULL in the schema
      field_mappings: p['field_mappings'] ?? p['mapping'] ?? p['field_mappings'] ?? {},
    }
    // If frontend provided file_base64 or fileBase64, store it as well (some deployments may accept it)
    if (p['file_base64'] !== undefined) toInsert['file_base64'] = p['file_base64']
    if (p['fileBase64'] !== undefined) toInsert['file_base64'] = p['fileBase64']

    const { data, error } = await supabase.from('pdf_templates').insert([toInsert]).select().single()
    if (error) throw error
    return data
  }

  async updatePdfTemplate(id: string, patch: Record<string, unknown>): Promise<unknown> {
  // Map patch fields to DB columns
  const p = patch as unknown as Record<string, unknown>
  const toUpdate: Record<string, unknown> = {}
  if (p['name'] !== undefined) toUpdate['name'] = p['name']
  if (p['file_name'] !== undefined) toUpdate['file_path'] = p['file_name']
  if (p['fileName'] !== undefined) toUpdate['file_path'] = p['fileName']
  if (p['file_base64'] !== undefined) toUpdate['file_base64'] = p['file_base64']
  if (p['fileBase64'] !== undefined) toUpdate['file_base64'] = p['fileBase64']
  if (p['mapping'] !== undefined) toUpdate['field_mappings'] = p['mapping']
  if (p['field_mappings'] !== undefined) toUpdate['field_mappings'] = p['field_mappings']

  const { data, error } = await supabase.from('pdf_templates').update(toUpdate as unknown as object).eq('id', id).select().single()
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
  let userId = (session as unknown as { user?: { id?: string } })?.user?.id
    
    // Fallback pro mock uživatele - používáme pevné ID pro vývoj
    if (!userId) {
      userId = '123e4567-e89b-12d3-a456-426614174000' // ID našeho mock uživatele
      console.log('🔧 Používám mock user ID pro poznámku')
    }
    
    if (!userId) throw new Error('No user')
    await supabase.from('user_notes').upsert({ user_id: userId, note })
  }

  // DYNAMIC VARIABLES API
  async getDynamicVariables(): Promise<unknown[]> {
    const { data, error } = await supabase.from('dynamic_variables').select('*').order('name')
    if (error) throw error
    return (data as unknown[]) || []
  }

  async createDynamicVariable(variable: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('dynamic_variables').insert(variable as unknown as object).select().single()
    if (error) throw error
    return data
  }

  async updateDynamicVariable(id: string, patch: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('dynamic_variables').update(patch as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteDynamicVariable(id: string): Promise<void> {
    const { error } = await supabase.from('dynamic_variables').delete().eq('id', id)
    if (error) throw error
  }

  // NOTIFICATIONS API
  async getNotifications(): Promise<unknown[]> {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data as unknown[]) || []
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
  async getUsers(): Promise<unknown[]> {
    const { data, error } = await supabase.from('user_profiles').select('*').order('name')
    if (error) throw error
    return (data as unknown[]) || []
  }

  async createUser(user: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('user_profiles').insert(user as unknown as object).select().single()
    if (error) throw error
    return data
  }

  async updateUser(id: string, patch: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('user_profiles').update(patch as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('user_profiles').delete().eq('id', id)
    if (error) throw error
  }

  // COMMUNICATION CAMPAIGNS API
  async getCommunicationCampaigns(): Promise<unknown[]> {
    const { data, error } = await supabase.from('communication_campaigns').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data as unknown[]) || []
  }

  async createCommunicationCampaign(campaign: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('communication_campaigns').insert(campaign as unknown as object).select().single()
    if (error) throw error
    return data
  }

  async updateCommunicationCampaign(id: string, patch: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('communication_campaigns').update(patch as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteCommunicationCampaign(id: string): Promise<void> {
    const { error } = await supabase.from('communication_campaigns').delete().eq('id', id)
    if (error) throw error
  }

  // EMAIL TEMPLATES API
  async getEmailTemplates(): Promise<unknown[]> {
    const { data, error } = await supabase.from('email_templates').select('*').order('name')
    if (error) throw error
    return (data as unknown[]) || []
  }

  async createEmailTemplate(template: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('email_templates').insert(template as unknown as object).select().single()
    if (error) throw error
    return data
  }

  async updateEmailTemplate(id: string, patch: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await supabase.from('email_templates').update(patch as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    const { error } = await supabase.from('email_templates').delete().eq('id', id)
    if (error) throw error
  }

  // Bank order generation (server-side function or RPC)
  async generateBankOrder(svjId: string, opts: { month: number; year: number }): Promise<unknown> {
    // Try RPC first
    try {
      const { data, error } = await supabase.rpc('generate_bank_order', { svj_id: svjId, month: opts.month, year: opts.year })
  if (error) throw error
  return (data as unknown) ?? ''
    } catch (e) {
      // Fallback: if RPC not available, return empty string to let caller show error
      return ''
    }
  }

  // HEALTH INSURANCE COMPANIES CRUD + export
  async createHealthInsuranceCompany(payload: Record<string, unknown>): Promise<unknown> {
    const p = payload as unknown as Record<string, unknown>
    const toInsert = {
      name: p['name'],
      code: p['code'],
      xml_export_format: p['xmlExportType'] ?? p['xml_export_format'] ?? null,
      pdf_template_id: p['pdfTemplateId'] ?? p['pdf_template_id'] ?? null,
    }
    const { data, error } = await supabase.from('health_insurance_companies').insert([toInsert]).select().single()
    if (error) throw error
    return data
  }

  async updateHealthInsuranceCompany(id: string, payload: Record<string, unknown>): Promise<unknown> {
    const p = payload as unknown as Record<string, unknown>
    const toUpdate: Record<string, unknown> = {}
    if (p['name'] !== undefined) toUpdate['name'] = p['name']
    if (p['code'] !== undefined) toUpdate['code'] = p['code']
    if (p['xmlExportType'] !== undefined) toUpdate['xml_export_format'] = p['xmlExportType']
    if (p['xml_export_format'] !== undefined) toUpdate['xml_export_format'] = p['xml_export_format']
    if (p['pdfTemplateId'] !== undefined) toUpdate['pdf_template_id'] = p['pdfTemplateId']

    const { data, error } = await supabase.from('health_insurance_companies').update(toUpdate as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteHealthInsuranceCompany(id: string): Promise<void> {
    const { error } = await supabase.from('health_insurance_companies').delete().eq('id', id)
    if (error) throw error
  }

  async exportHealthInsuranceData(svjId: string, period: string): Promise<unknown[]> {
    // If there is a database function for export, call it via rpc; otherwise assemble on client
    try {
  const { data, error } = await supabase.rpc('export_health_insurance', { svj_id: svjId, period })
      if (error) throw error
  return (data as unknown[]) || []
    } catch (e) {
      // Fallback: return empty array and let caller handle
      return []
    }
  }
}

export const supabaseApiService = new SupabaseApiService()
export default supabaseApiService
