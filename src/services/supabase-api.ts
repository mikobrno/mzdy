import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Pokud nastavíte VITE_DISABLE_LOCAL_FALLBACK=true, žádné localStorage fallbacky se nepoužijí
// a při absenci konfigurace / RLS chybách se vyhodí chyba místo tichého použití mock dat.
const DISABLE_LOCAL_FALLBACK = import.meta.env.VITE_DISABLE_LOCAL_FALLBACK === 'true'

// Lokální fallback struktury
type LocalSvj = { id: string; name?: string; ico?: string; address?: string; created_at?: string }
type LocalEmployee = {
  id: string; svj_id: string; full_name: string; email: string; phone_number?: string;
  employment_type?: string | null; salary_amount?: number; health_insurance_company_id?: string | null;
  is_active?: boolean; created_at?: string; executions?: unknown[]; has_pink_declaration?: boolean
}
// Rozšířený frontend typ tak, aby pokryl volání ve zbytku kódu (volitelná pole)
export interface FrontendSvj {
  id: string
  name: string
  ico: string
  address: string
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
  contactPerson?: string
  contactEmail?: string
  quickDescription?: string
  dataBoxId?: string
  bankAccount?: string
  reportDeliveryMethod?: 'manager' | 'client'
  registryData?: {
    officialName?: string
    isVerified?: boolean
    verificationDate?: string | Date
  }
  [key: string]: unknown // fallback pro další doposud nemapovaná pole
}

export interface FrontendEmployee {
  id: string
  svjId: string | null
  firstName: string
  lastName: string
  full_name?: string
  email: string
  salary: number
  isActive: boolean
  createdAt: Date
  contractType?: 'dpp' | 'committee_member' | 'full_time' | null
  phone?: string
  executions?: unknown[]
  hasPinkDeclaration?: boolean
  healthInsurance?: string
  startDate?: string | Date
  bankAccount?: string
  [key: string]: unknown
}
// Lehká DB / servisní rozhraní
export interface SvjRecord { id: string; name?: string; ico?: string; address?: string; created_at?: string; is_active?: boolean; createdAt?: string | Date }
// Rozšíření (aliasy používané ve stránkách)
export interface SvjRecord { id: string; name?: string; ico?: string; address?: string; created_at?: string; updated_at?: string; is_active?: boolean; 
  createdAt?: string | Date; updatedAt?: string | Date; registryData?: { officialName?: string; isVerified?: boolean; verificationDate?: string | Date }; quickDescription?: string;
  contactPerson?: string; contactEmail?: string; dataBoxId?: string; bankAccount?: string; reportDeliveryMethod?: 'manager' | 'client'; [k: string]: unknown }
export interface EmployeeRecord { id: string; svj_id?: string | null; full_name?: string; email?: string; phone_number?: string; employment_type?: 'dpp' | 'committee_member' | 'full_time' | null; salary_amount?: number | string; is_active?: boolean; created_at?: string;
  contractType?: 'dpp' | 'committee_member' | 'full_time' | null; salary?: number | string; executions?: unknown[]; hasPinkDeclaration?: boolean; healthInsurance?: string; health_insurance_company_id?: string | null; healthInsuranceCompanyId?: string | null; startDate?: string; bankAccount?: string; personal_id_number?: string; bank_account?: string; address?: string }
export interface HealthInsuranceCompany { id: string; name: string; code: string; xml_export_format?: string; pdfTemplateId?: string | number | null; pdf_template_id?: string | number | null; xmlExportType?: string; [k: string]: unknown }
export interface NotificationRecord { id: string; title?: string; message?: string; category?: string; is_read?: boolean; priority?: string; created_at?: string; type?: string; is_archived?: boolean }
export interface UserProfile { id: string; name?: string; email?: string; role?: string; status?: string; last_login?: string }
export interface PayrollRecord { id: string; month?: number; year?: number; employee_name?: string | null; base_salary?: number; gross_wage?: number; net_wage?: number; status?: string; created_at?: string;
  employee_id?: string; netSalary?: number; createdAt?: string; health_insurance_amount?: number; social_insurance_amount?: number; tax_advance?: number; [k: string]: unknown }
export interface ExportResult { insuranceName: string; insuranceCode: string; totalBase: number; totalInsurance: number; [k: string]: unknown }
export interface DynamicVariable { id: string; name: string; description?: string; value?: string; created_at?: string; updated_at?: string }
import { DashboardStats } from '@/types'
import { toDbStatus, DEFAULT_DB_PAYROLL_STATUS } from '@/lib/payroll-status'

class SupabaseApiService {
  // --- Dev fallback (bez backendu / bez RLS povolení) ---
  private LOCAL_KEY_SVJ = 'dev_fallback_svj'
  private LOCAL_KEY_EMP = 'dev_fallback_employees'


  private loadLocal<T>(key: string): T[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  private saveLocal<T>(key: string, data: T[]) {
    if (typeof window === 'undefined') return
    try { window.localStorage.setItem(key, JSON.stringify(data)) } catch { /* ignore */ }
  }

  private generateId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return 'local-' + Math.random().toString(36).slice(2, 11)
  }

  private isPermissionError(err: unknown): boolean {
    const msg = (err as { message?: string })?.message?.toLowerCase() || ''
    return /permission|rls|not allowed|unauthorized/.test(msg)
  }

  async getSVJList(): Promise<FrontendSvj[]> {
    if (!isSupabaseConfigured) {
      if (DISABLE_LOCAL_FALLBACK) throw new Error('Supabase není nakonfigurován (getSVJList) a fallback je vypnut.')
      return this.loadLocal<LocalSvj>(this.LOCAL_KEY_SVJ).map(this.mapSvj)
    }
    try {
      const { data, error } = await supabase.from('svj').select('*')
      if (error) throw error
      const fallback = this.loadLocal<LocalSvj>(this.LOCAL_KEY_SVJ)
      // Sloučení – backend má prioritu, ale doplníme lokální (které nemají kolidující ID)
      const ids = new Set((data || []).map((d: unknown) => (d as { id?: string })?.id).filter(Boolean) as string[])
      const merged = [...(data as unknown[] || []), ...fallback.filter(f => !ids.has(f.id))]
      return merged.map(this.mapSvj)
    } catch (e) {
      if (this.isPermissionError(e) && !DISABLE_LOCAL_FALLBACK) {
        return this.loadLocal<LocalSvj>(this.LOCAL_KEY_SVJ).map(this.mapSvj)
      } else if (this.isPermissionError(e) && DISABLE_LOCAL_FALLBACK) {
        throw new Error('RLS blokuje getSVJList a fallback je vypnut (VITE_DISABLE_LOCAL_FALLBACK=true).')
      }
      throw e
    }
  }

  async getSVJ(id: string): Promise<FrontendSvj | null> {
    if (!isSupabaseConfigured) {
      if (DISABLE_LOCAL_FALLBACK) throw new Error('Supabase není nakonfigurován (getSVJ) a fallback je vypnut.')
      const local = this.loadLocal<LocalSvj>(this.LOCAL_KEY_SVJ).find(l => l.id === id)
      return local ? this.mapSvj(local) : null
    }
    try {
      const { data, error } = await supabase.from('svj').select('*').eq('id', id).single()
      if (error) throw error
      if (!data) return null
      return this.mapSvj(data as Record<string, unknown>)
    } catch (e) {
      if (this.isPermissionError(e) && !DISABLE_LOCAL_FALLBACK) {
        const local = this.loadLocal<LocalSvj>(this.LOCAL_KEY_SVJ).find(l => l.id === id)
        return local ? this.mapSvj(local) : null
      } else if (this.isPermissionError(e) && DISABLE_LOCAL_FALLBACK) {
        throw new Error('RLS blokuje getSVJ a fallback je vypnut.')
      }
      throw e
    }
  }

  async createSVJ(payload: Record<string, unknown>): Promise<SvjRecord> {
    const toInsert: Record<string, unknown> = { ...(payload as Record<string, unknown>) }
    // Pokud není konfigurace a fallback povolen → lokální; jinak error
    if (!isSupabaseConfigured) {
      if (DISABLE_LOCAL_FALLBACK) throw new Error('Supabase není nakonfigurován (createSVJ) a fallback je vypnut.')
      const list = this.loadLocal<LocalSvj>(this.LOCAL_KEY_SVJ)
      const rec = { id: this.generateId(), created_at: new Date().toISOString(), ...toInsert }
      list.push(rec)
      this.saveLocal(this.LOCAL_KEY_SVJ, list)
      return rec as SvjRecord
    }
    try {
      if (!toInsert.created_by) {
        try {
          const { data: sessionData } = await supabase.auth.getSession()
          let userId = (sessionData as unknown as { user?: { id?: string } })?.user?.id
          if (!userId) {
            userId = '123e4567-e89b-12d3-a456-426614174000'
            toInsert.created_by = userId
          } else {
            toInsert.created_by = userId
          }
        } catch {/* ignore */}
      }
      const { data, error } = await supabase.from('svj').insert([toInsert]).select().single()
      if (error) throw error
      // Záložní uložení do localStorage pro testy (RLS může blokovat pozdější SELECT)
      try {
        const list = this.loadLocal<LocalSvj>(this.LOCAL_KEY_SVJ)
        const created = data as SvjRecord
        if (!list.find(l => l.id === created?.id)) {
          list.push({ id: created?.id, name: created?.name, ico: created?.ico, address: created?.address, created_at: created?.created_at })
          this.saveLocal(this.LOCAL_KEY_SVJ, list)
        }
      } catch {/* ignore */}
      return data as SvjRecord
    } catch (e) {
      if (this.isPermissionError(e) && !DISABLE_LOCAL_FALLBACK) {
        const list = this.loadLocal<LocalSvj>(this.LOCAL_KEY_SVJ)
        const rec = { id: this.generateId(), created_at: new Date().toISOString(), ...toInsert }
        list.push(rec)
        this.saveLocal(this.LOCAL_KEY_SVJ, list)
        console.warn('⚠️ RLS blokuje createSVJ – fallback použit (povoleno).')
        return rec as SvjRecord
      } else if (this.isPermissionError(e) && DISABLE_LOCAL_FALLBACK) {
        throw new Error('RLS blokuje createSVJ a fallback je vypnut (VITE_DISABLE_LOCAL_FALLBACK=true).')
      }
      throw e
    }
  }

  async updateSVJ(id: string, payload: Record<string, unknown>): Promise<SvjRecord> {
    const { data, error } = await supabase.from('svj').update(payload as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data as SvjRecord
  }

  async getEmployees(svjId?: string): Promise<FrontendEmployee[]> {
    if (!isSupabaseConfigured) {
      if (DISABLE_LOCAL_FALLBACK) throw new Error('Supabase není nakonfigurován (getEmployees) a fallback je vypnut.')
      const loc = this.loadLocal<LocalEmployee>(this.LOCAL_KEY_EMP)
      const filtered = svjId ? loc.filter(e => e.svj_id === svjId) : loc
      return this.mapEmployeeRows(filtered)
    }
    try {
      let query = supabase.from('employees').select('*')
      if (svjId) query = query.eq('svj_id', svjId)
      const { data, error } = await query
      if (error) throw error
      const rows = (data as unknown[]) || []
      // Sloučit s lokální fallback sadou (např. pokud některé byly vytvořeny offline)
      const localRows = this.loadLocal<LocalEmployee>(this.LOCAL_KEY_EMP)
      const ids = new Set(rows.map((r: unknown) => (r as { id?: string })?.id).filter(Boolean) as string[])
      const merged = [...rows, ...localRows.filter(l => !ids.has(l.id))]
      return this.mapEmployeeRows(merged)
    } catch (e) {
      if (this.isPermissionError(e) && !DISABLE_LOCAL_FALLBACK) {
        const loc = this.loadLocal<LocalEmployee>(this.LOCAL_KEY_EMP)
        const filtered = svjId ? loc.filter(e => e.svj_id === svjId) : loc
        return this.mapEmployeeRows(filtered)
      } else if (this.isPermissionError(e) && DISABLE_LOCAL_FALLBACK) {
        throw new Error('RLS blokuje getEmployees a fallback je vypnut.')
      }
      throw e
    }
  }

  private mapSvj = (recAny: LocalSvj | Record<string, unknown>): FrontendSvj => {
    const r = recAny as Record<string, unknown>
    return {
      id: String(r['id']),
      name: String(r['name'] ?? 'Bez názvu'),
      ico: String(r['ico'] ?? ''),
  address: String(r['address'] ?? ''),
      isActive: r['is_active'] === undefined ? true : !!r['is_active'],
      createdAt: r['created_at'] ? new Date(String(r['created_at'])) : new Date(),
      updatedAt: r['updated_at'] ? new Date(String(r['updated_at'])) : undefined,
      reportDeliveryMethod: ((): 'manager' | 'client' | undefined => {
        const val = r['reportDeliveryMethod'] ?? r['report_delivery_method']
        if (!val) return undefined
        return val === 'manager' || val === 'client' ? val : undefined
      })()
    }
  }

  private mapEmployeeRows(rows: unknown[]): FrontendEmployee[] {
  return rows.map((r): FrontendEmployee => {
      const rec = r as Record<string, unknown>
      const full = String(rec['full_name'] ?? rec['name'] ?? '')
      const parts = full.trim() ? full.split(/\s+/) : ['']
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || ''
      return {
        id: String(rec['id']),
        svjId: rec['svj_id'] ? String(rec['svj_id']) : (rec['svjId'] ? String(rec['svjId']) : null),
        firstName,
        lastName,
        full_name: full,
        email: rec['email'] ? String(rec['email']) : '',
        salary: Number(String(rec['salary_amount'] ?? rec['salary'] ?? 0)) || 0,
        isActive: rec['is_active'] === undefined ? true : !!rec['is_active'],
  createdAt: rec['created_at'] ? new Date(String(rec['created_at'])) : new Date(),
  executions: Array.isArray(rec['executions']) ? rec['executions'] as unknown[] : undefined,
  hasPinkDeclaration: rec['has_pink_declaration'] === undefined ? undefined : !!rec['has_pink_declaration'],
  healthInsurance: rec['healthInsurance'] ? String(rec['healthInsurance']) : undefined,
  startDate: rec['startDate'] ? String(rec['startDate']) : undefined,
  bankAccount: rec['bank_account'] ? String(rec['bank_account']) : undefined
      }
    })
  }

  async getHealthInsuranceCompanies(): Promise<HealthInsuranceCompany[]> {
    const { data, error } = await supabase.from('health_insurance_companies').select('id, name, code')
    if (error) throw error
    return (data as HealthInsuranceCompany[]) || []
  }

  async getEmployee(id: string): Promise<EmployeeRecord | null> {
    if (!id) throw new Error('Chybí ID zaměstnance')
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).maybeSingle()
    if (error) {
      // Přeformuluj známou supabase hlášku na srozumitelnější text
      const msg = (error as { message?: string })?.message || ''
      if (/json object requested/i.test(msg)) {
        throw new Error('Zaměstnanec nenalezen nebo nemáte oprávnění.')
      }
      throw error
    }
    return (data as EmployeeRecord) || null
  }

  async createEmployee(payload: Record<string, unknown>): Promise<FrontendEmployee> {
    // Lokální fallback pokud není konfigurace nebo očekáváme RLS chybu
    const handleLocal = () => {
      const p = payload as Record<string, unknown>
  const list = this.loadLocal<LocalEmployee>(this.LOCAL_KEY_EMP)
      const rec: LocalEmployee = {
        id: this.generateId(),
        svj_id: String(p['svj_id'] || ''),
        full_name: String(p['full_name'] ?? p['name'] ?? ''),
        email: String(p['email'] ?? ''),
        phone_number: p['phone'] ? String(p['phone']) : undefined,
        employment_type: p['employment_type'] ? String(p['employment_type']) : null,
        salary_amount: typeof p['salary_amount'] === 'number' ? p['salary_amount'] as number : Number(p['salary_amount'] ?? 0) || 0,
        health_insurance_company_id: p['health_insurance_company_id'] ? String(p['health_insurance_company_id']) : null,
        is_active: true,
        created_at: new Date().toISOString(),
        executions: [],
        has_pink_declaration: false
      }
      list.push(rec)
      this.saveLocal(this.LOCAL_KEY_EMP, list)
  return this.mapEmployeeRows([rec])[0]
    }
    if (!isSupabaseConfigured) {
      if (DISABLE_LOCAL_FALLBACK) throw new Error('Supabase není nakonfigurován (createEmployee) a fallback je vypnut.')
      return handleLocal()
    }
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

    try {
      const { data, error } = await supabase.from('employees').insert([toInsert]).select().single()
      if (error) throw error
      const rec = (data as Record<string, unknown>) || {}
      const full = String(rec['full_name'] ?? rec['name'] ?? '')
      const parts = full.trim() ? full.split(/\s+/) : ['']
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || ''
      return {
        id: String(rec['id'] ?? ''),
        svjId: rec['svj_id'] ? String(rec['svj_id']) : (rec['svjId'] ? String(rec['svjId']) : null),
        firstName,
        lastName,
        full_name: full,
        email: rec['email'] ? String(rec['email']) : '',
  phone: rec['phone_number'] ? String(rec['phone_number']) : (rec['phone'] ? String(rec['phone']) : ''),
        contractType: ((): ('dpp' | 'committee_member' | 'full_time' | null) => {
          const raw = (rec['employment_type'] ?? rec['contract_type']) as string | undefined
          if (!raw) return null
          const allowed = ['dpp','committee_member','full_time'] as const
          return (allowed as readonly string[]).includes(raw) ? raw as ('dpp'|'committee_member'|'full_time') : null
        })(),
        salary: Number(String(rec['salary_amount'] ?? rec['salary'] ?? 0)) || 0,
        isActive: rec['is_active'] === undefined ? true : !!rec['is_active'],
        createdAt: rec['created_at'] ? new Date(String(rec['created_at'])) : new Date(),
        executions: Array.isArray(rec['executions']) ? rec['executions'] as unknown[] : undefined,
        hasPinkDeclaration: rec['has_pink_declaration'] === undefined ? undefined : !!rec['has_pink_declaration'],
        healthInsurance: rec['healthInsurance'] ? String(rec['healthInsurance']) : undefined,
        startDate: rec['startDate'] ? String(rec['startDate']) : undefined,
        bankAccount: rec['bank_account'] ? String(rec['bank_account']) : undefined
      }
    } catch (e) {
      if (this.isPermissionError(e) && !DISABLE_LOCAL_FALLBACK) {
        console.warn('⚠️ RLS blokuje createEmployee – fallback použit (povoleno).')
        return handleLocal()
      } else if (this.isPermissionError(e) && DISABLE_LOCAL_FALLBACK) {
        throw new Error('RLS blokuje createEmployee a fallback je vypnut (VITE_DISABLE_LOCAL_FALLBACK=true).')
      }
      throw e
    }
  }

  async updateEmployee(id: string, payload: Record<string, unknown>): Promise<EmployeeRecord> {
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
  if (p['contractType']) toUpdate['employment_type'] = p['contractType']

  const salaryRaw = p['salary_amount'] ?? p['salary'] ?? p['gross_wage'] ?? p['gross_salary']
  if (salaryRaw !== undefined && salaryRaw !== null && salaryRaw !== '') toUpdate['salary_amount'] = Number(salaryRaw as unknown) || 0

  if (p['health_insurance_company_id']) toUpdate['health_insurance_company_id'] = p['health_insurance_company_id']
  if (p['healthInsurance']) toUpdate['health_insurance_company_id'] = p['healthInsurance']
  if (p['birthNumber']) toUpdate['personal_id_number'] = p['birthNumber']
  if (p['bank_account']) toUpdate['bank_account'] = p['bank_account']
  if (p['personal_id_number']) toUpdate['personal_id_number'] = p['personal_id_number']
  if (p['address']) toUpdate['address'] = p['address']
  if (p['note']) toUpdate['note'] = p['note']

  if (p['is_active'] !== undefined) toUpdate['is_active'] = p['is_active']

  if (Object.keys(toUpdate).length === 0) {
    throw new Error('Žádné změny k uložení.')
  }
  const { data, error } = await supabase.from('employees').update(toUpdate as unknown as object).eq('id', id).select().maybeSingle()
  if (error) {
    const msg = (error as { message?: string })?.message || ''
    if (/json object requested/i.test(msg)) {
      throw new Error('Aktualizace selhala: záznam neexistuje nebo přístup zakázán (RLS).')
    }
    throw error
  }
  if (!data) throw new Error('Zaměstnanec neexistuje nebo nebyl nalezen.')
  return data as EmployeeRecord
  }

  async terminateEmployee(employeeId: string): Promise<void> {
    await supabase.from('employees').update({ is_active: false, end_date: new Date().toISOString() }).eq('id', employeeId)
  }

  async getSalaryRecords(svjId: string, year: number, month?: number): Promise<PayrollRecord[]> {
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
      id: (p as Record<string, unknown>)['id'] as string,
      month: (p as Record<string, unknown>)['month'] as number | undefined,
      year: (p as Record<string, unknown>)['year'] as number | undefined,
      employee_name: empMap[String((p as Record<string, unknown>)['employee_id'])] ?? null,
      gross_wage: (p as Record<string, unknown>)['gross_salary'] as number ?? (p as Record<string, unknown>)['base_salary'] as number ?? 0,
      net_wage: (p as Record<string, unknown>)['net_salary'] as number ?? 0,
      status: (p as Record<string, unknown>)['status'] as string | undefined
    })) as PayrollRecord[]
  }

  async getPayrollsByEmployee(employeeId: string, year: number, month?: number): Promise<PayrollRecord[]> {
    let q = supabase.from('payrolls').select('*').eq('employee_id', employeeId).eq('year', year)
    if (month) q = q.eq('month', month)
    const { data, error } = await q
    if (error) throw error
    return ((data as unknown[]) || []).map(p => ({
      id: (p as Record<string, unknown>)['id'] as string,
      month: (p as Record<string, unknown>)['month'] as number | undefined,
      year: (p as Record<string, unknown>)['year'] as number | undefined,
      employee_name: (p as Record<string, unknown>)['employee_name'] as string | undefined,
      gross_wage: (p as Record<string, unknown>)['gross_salary'] as number | undefined,
      net_wage: (p as Record<string, unknown>)['net_salary'] as number | undefined,
      status: (p as Record<string, unknown>)['status'] as string | undefined
    })) as PayrollRecord[]
  }

  async createSalaryRecord(payload: Record<string, unknown>): Promise<PayrollRecord> {
    // Accept both old and new field names
    const incoming = (payload.status as string) ?? (payload['status'] as string) ?? undefined
    const status = toDbStatus(incoming ?? DEFAULT_DB_PAYROLL_STATUS)

    // Support saving extended calculated fields; frontend may send camelCase or legacy snake_case
    const healthBase = payload['health_insurance_base'] ?? payload['healthInsuranceBase'] ?? null
    const socialBase = payload['social_insurance_base'] ?? payload['socialInsuranceBase'] ?? null
    const healthAmt = payload['health_insurance_amount'] ?? payload['healthInsurance'] ?? null
    const socialAmt = payload['social_insurance_amount'] ?? payload['socialInsurance'] ?? null
    const taxAdv = payload['tax_advance'] ?? payload['tax'] ?? null

    const toInsert = {
      employee_id: payload.employeeId || payload.employee_id,
      month: payload.month,
      year: payload.year,
      status,
      base_salary: payload.base_salary ?? payload.gross_wage ?? payload.gross_salary ?? 0,
      bonuses: payload.bonuses ?? 0,
      gross_salary: payload.gross_wage ?? payload.gross_salary ?? payload.base_salary ?? 0,
      net_salary: payload.net_wage ?? payload.net_salary ?? 0,
      health_insurance_base: healthBase,
      social_insurance_base: socialBase,
      health_insurance_amount: healthAmt,
      social_insurance_amount: socialAmt,
      tax_advance: taxAdv
    }

    // Upsert by (employee_id, year, month) so opakované ukládání nepřidává duplicity
    const { data, error } = await supabase.from('payrolls')
      .upsert([toInsert], { onConflict: 'employee_id,year,month' })
      .select()
      .single()
    if (error) {
      const msg = (error as { message?: string })?.message ?? String(error)
      if (/status.*check/i.test(msg)) {
        throw new Error('Invalid payroll status. Allowed: "pending" or "approved". The app will auto-normalize from draft/prepared/paid.')
      }
      throw error
    }
    return data as PayrollRecord
  }

  async getAllPayrolls(): Promise<PayrollRecord[]> {
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
  })) as PayrollRecord[]
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
    })) as PayrollRecord[]
    }
  }

  async getPayrollById(id: string): Promise<PayrollRecord | null> {
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
  } as PayrollRecord
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
  } as PayrollRecord
    }
  }

  async deletePayroll(id: string): Promise<void> {
    const { error } = await supabase.from('payrolls').delete().eq('id', id)
    if (error) throw error
  }

  async updatePayroll(id: string, payload: Record<string, unknown>): Promise<PayrollRecord> {
    const { data, error } = await supabase.from('payrolls').update(payload as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data as PayrollRecord
  }

  async updatePayrollStatus(id: string, status: string): Promise<PayrollRecord> {
    const { data, error } = await supabase.from('payrolls').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data as PayrollRecord
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const { data: svjData } = await supabase.from('svj').select('id')
    const { data: empData } = await supabase.from('employees').select('id').eq('is_active', true)
    // DB povoluje pouze 'pending' a 'approved' => pending = status pending
    const { data: pendingData } = await supabase.from('payrolls').select('id').eq('status', 'pending')
    const { data: completedData } = await supabase.from('payrolls').select('id').eq('status', 'approved')
    return {
      totalSvj: (svjData as unknown[] | null)?.length || 0,
      totalEmployees: (empData as unknown[] | null)?.length || 0,
      pendingSalaries: (pendingData as unknown[] | null)?.length || 0,
      completedSalariesThisMonth: (completedData as unknown[] | null)?.length || 0,
      pendingCampaigns: 0,
      recentActivities: [],
      userNote: ''
    }
  }

  // PDF templates CRUD
  async getPdfTemplates(): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase.from('pdf_templates').select('*').order('name', { ascending: true })
    if (error) throw error
  return (data as Record<string, unknown>[]) || []
  }

  async createPdfTemplate(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
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

  async updatePdfTemplate(id: string, patch: Record<string, unknown>): Promise<Record<string, unknown>> {
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
  async getDynamicVariables(): Promise<DynamicVariable[]> {
    const { data, error } = await supabase.from('dynamic_variables').select('*').order('name')
    if (error) throw error
    return (data as DynamicVariable[]) || []
  }

  async createDynamicVariable(variable: Record<string, unknown>): Promise<DynamicVariable> {
    const { data, error } = await supabase.from('dynamic_variables').insert(variable as unknown as object).select().single()
    if (error) throw error
    return data as DynamicVariable
  }

  async updateDynamicVariable(id: string, patch: Record<string, unknown>): Promise<DynamicVariable> {
    const { data, error } = await supabase.from('dynamic_variables').update(patch as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data as DynamicVariable
  }

  async deleteDynamicVariable(id: string): Promise<void> {
    const { error } = await supabase.from('dynamic_variables').delete().eq('id', id)
    if (error) throw error
  }

  // NOTIFICATIONS API
  async getNotifications(): Promise<NotificationRecord[]> {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
    if (error) throw error
  return (data as NotificationRecord[]) || []
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
  async getUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from('user_profiles').select('*').order('name')
    if (error) throw error
  return (data as UserProfile[]) || []
  }

  async createUser(user: Record<string, unknown>): Promise<UserProfile> {
    const { data, error } = await supabase.from('user_profiles').insert(user as unknown as object).select().single()
    if (error) throw error
  return data as UserProfile
  }

  async updateUser(id: string, patch: Record<string, unknown>): Promise<UserProfile> {
    const { data, error } = await supabase.from('user_profiles').update(patch as unknown as object).eq('id', id).select().single()
    if (error) throw error
  return data as UserProfile
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('user_profiles').delete().eq('id', id)
    if (error) throw error
  }

  // COMMUNICATION CAMPAIGNS API
  async getCommunicationCampaigns(): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase.from('communication_campaigns').select('*').order('created_at', { ascending: false })
    if (error) throw error
  return (data as Record<string, unknown>[]) || []
  }

  async createCommunicationCampaign(campaign: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data, error } = await supabase.from('communication_campaigns').insert(campaign as unknown as object).select().single()
    if (error) throw error
    return data
  }

  async updateCommunicationCampaign(id: string, patch: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data, error } = await supabase.from('communication_campaigns').update(patch as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteCommunicationCampaign(id: string): Promise<void> {
    const { error } = await supabase.from('communication_campaigns').delete().eq('id', id)
    if (error) throw error
  }

  // EMAIL TEMPLATES API
  async getEmailTemplates(): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase.from('email_templates').select('*').order('name')
    if (error) throw error
  return (data as Record<string, unknown>[]) || []
  }

  async createEmailTemplate(template: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data, error } = await supabase.from('email_templates').insert(template as unknown as object).select().single()
    if (error) throw error
    return data
  }

  async updateEmailTemplate(id: string, patch: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data, error } = await supabase.from('email_templates').update(patch as unknown as object).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    const { error } = await supabase.from('email_templates').delete().eq('id', id)
    if (error) throw error
  }

  // Bank order generation (server-side function or RPC)
  async generateBankOrder(svjId: string, opts: { month: number; year: number }): Promise<string> {
    // Try RPC first
    try {
      const { data, error } = await supabase.rpc('generate_bank_order', { svj_id: svjId, month: opts.month, year: opts.year })
  if (error) throw error
  return (data as string) ?? ''
    } catch (e) {
      // Fallback: if RPC not available, return empty string to let caller show error
      return ''
    }
  }

  // HEALTH INSURANCE COMPANIES CRUD + export
  async createHealthInsuranceCompany(payload: Record<string, unknown>): Promise<HealthInsuranceCompany> {
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

  async updateHealthInsuranceCompany(id: string, payload: Partial<HealthInsuranceCompany> & Record<string, unknown>): Promise<HealthInsuranceCompany> {
    const p = payload as Record<string, unknown>
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

  async exportHealthInsuranceData(svjId: string, period: string): Promise<ExportResult[]> {
    // If there is a database function for export, call it via rpc; otherwise assemble on client
    try {
  const { data, error } = await supabase.rpc('export_health_insurance', { svj_id: svjId, period })
      if (error) throw error
	return (data as ExportResult[]) || []
    } catch (e) {
      // Fallback: return empty array and let caller handle
      return []
    }
  }
}

export const supabaseApiService = new SupabaseApiService()
export default supabaseApiService
