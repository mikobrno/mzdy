import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft,
  Calculator, 
  Download,
  FileText,
  Check,
  X,
  Edit,
  Eye,
  AlertTriangle,
  Clock,
  Plus,
  Save,
  Mail,
  CreditCard,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/services/api'
import { useToast } from '@/components/ui/toast'
import { SalaryRecord } from '@/types'
import { toDbStatus, DEFAULT_DB_PAYROLL_STATUS } from '@/lib/payroll-status'
// import { cn } from '@/lib/utils' (unused)
import { templatesService } from '@/services/templates'
import { employeeMessagingService } from '@/services/employeeMessaging'

type PayrollEmployee = {
  id: string
  firstName: string
  lastName: string
  contractType: string
  salary: number
  healthInsurance: string
  salaryRecord?: {
    id?: string
    employeeId?: string
    svjId?: string
    year?: number
    month?: number
    grossSalary?: number
    netSalary?: number
    healthInsurance?: number
    socialInsurance?: number
    tax?: number
    status?: string
    createdBy?: string
    createdAt?: Date
  }
}

// No more mock data - will fetch from Supabase

export default function PayrollMonthly() {
  const { svjId, year, month } = useParams<{ svjId: string; year: string; month: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SalaryRecord>>({})
  const [sendEmpId, setSendEmpId] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [includeSlip, setIncludeSlip] = useState<boolean>(true)
  const [uploads, setUploads] = useState<{ id?: string; name: string; mime: string; size: number; dataBase64: string }[]>([])
  const [emailSubject, setEmailSubject] = useState<string>('')
  const [emailBody, setEmailBody] = useState<string>('')
  const [includeSettlement, setIncludeSettlement] = useState<boolean>(false)
  const [includeDppXml, setIncludeDppXml] = useState<boolean>(false)
  const [includeDppPdf, setIncludeDppPdf] = useState<boolean>(false)

  const { data: svj } = useQuery({
    queryKey: ['svj', svjId],
    queryFn: () => apiService.getSVJ(svjId!),
    enabled: !!svjId
  })

  // Real query for payroll data from Supabase
  const { data: employees } = useQuery({
    queryKey: ['employees', svjId],
    queryFn: () => apiService.getEmployees(svjId!),
    enabled: !!svjId
  })

  const { data: salaryRecords } = useQuery({
    queryKey: ['salary-records', svjId, year, month],
    queryFn: () => apiService.getSalaryRecords(svjId!, parseInt(year!), parseInt(month!)),
    enabled: !!svjId && !!year && !!month
  })

  // Transform data to match UI expectations
  const payrollData = useMemo(() => {
    if (!employees || !year || !month) return null
    
    const enrichedEmployees = (employees as unknown[]).map((empUnk) => {
      const emp = empUnk as Record<string, unknown>
      const salaryRecord = (salaryRecords as unknown[] | undefined)?.find((srUnk) => (srUnk as Record<string, unknown>)['employee_id'] === emp['id']) as Record<string, unknown> | undefined
      const fullStr = String(emp['full_name'] ?? '')
      const fname = fullStr.trim() ? fullStr.split(' ')[0] : ''
      const lname = fullStr.trim() ? fullStr.split(' ').slice(1).join(' ') : ''
      return {
        id: String(emp['id'] ?? ''),
        firstName: fname,
        lastName: lname,
        contractType: String(emp['employment_type'] ?? 'dpp') === 'vybor' ? 'committee_member' : 'dpp',
        salary: Number(emp['salary_amount'] ?? 0) || 0,
        healthInsurance: '111', // Default - could be mapped from emp.health_insurance_company_id
        salaryRecord: salaryRecord ? {
          id: salaryRecord.id,
            employeeId: salaryRecord.employee_id,
          svjId: svjId!,
          year: parseInt(year!),
          month: parseInt(month!),
          grossSalary: (salaryRecord as Record<string, unknown>)['gross_wage'] ?? (salaryRecord as Record<string, unknown>)['base_salary'] ?? 0,
          netSalary: (salaryRecord as Record<string, unknown>)['net_wage'] ?? 0,
          healthInsurance: (salaryRecord as Record<string, unknown>)['health_insurance_amount'] ?? 0,
          socialInsurance: (salaryRecord as Record<string, unknown>)['social_insurance_amount'] ?? 0,
          tax: (salaryRecord as Record<string, unknown>)['tax_advance'] ?? 0,
    status: (salaryRecord as Record<string, unknown>)['status'] ?? 'draft',
          createdBy: 'system',
          createdAt: new Date(String((salaryRecord as Record<string, unknown>)['created_at'] ?? Date.now()))
        } : undefined
      }
    })

    return {
      svjId: svjId!,
      year: parseInt(year!),
      month: parseInt(month!),
      status: 'ready_for_approval',
      employees: enrichedEmployees
    } as unknown as { svjId: string; year: number; month: number; status: string; employees: PayrollEmployee[] }
  }, [employees, salaryRecords, svjId, year, month])

  const isLoading = !payrollData

  const updateSalaryMutation = useMutation({
    mutationFn: (data: Partial<SalaryRecord>) => apiService.createSalaryRecord(data as Partial<SalaryRecord>),
    onSuccess: () => {
  // Refresh the salary records query so the UI shows the newly created/updated payroll
  queryClient.invalidateQueries({ queryKey: ['salary-records', svjId, year, month] })
  // Also refresh any general payroll list views
  queryClient.invalidateQueries({ queryKey: ['payroll', svjId, year, month] })
      setEditingEmployee(null)
    }
  })

  const approveSalariesMutation = useMutation({
    mutationFn: () => {
      // Mock API call
      return new Promise(resolve => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', svjId, year, month] })
    }
  })

  const handleEditEmployee = (employee: PayrollEmployee) => {
  setEditingEmployee(employee.id)
  setEditForm((employee.salaryRecord as unknown as Partial<SalaryRecord>) || {
      employeeId: employee.id,
      svjId: svjId!,
      year: parseInt(year!),
      month: parseInt(month!),
      grossSalary: employee.salary,
      netSalary: 0,
      healthInsurance: 0,
      socialInsurance: 0,
      tax: 0,
  status: 'draft',
      createdBy: 'current_user'
    })
  }

  // Basic payroll calculator (placeholder - adjust rules as needed)
  const computeFromGross = (gross: number) => {
    const tax = Math.round(gross * 0.15)
    const healthInsurance = Math.round(gross * 0.045)
    const socialInsurance = Math.round(gross * 0.065)
    const netSalary = Math.max(0, gross - tax - healthInsurance - socialInsurance)
    return { grossSalary: gross, netSalary, tax, healthInsurance, socialInsurance }
  }

  const handleRecalculateForEmployee = (employee: PayrollEmployee) => {
    // open edit mode and prefill computed values from employee.salary (fallback)
    const baseGross = employee.salaryRecord?.grossSalary ?? employee.salary ?? 0
    const computed = computeFromGross(baseGross)
    setEditingEmployee(employee.id)
    setEditForm((employee.salaryRecord as unknown as Partial<SalaryRecord>) || {
      employeeId: employee.id,
      svjId: svjId!,
      year: parseInt(year!),
      month: parseInt(month!),
      ...computed,
  status: 'draft',
      createdBy: 'current_user'
    })
  }

  const { success, error: toastError } = useToast()

  const handleSaveEmployee = async () => {
    try {
      // find employee object from current payrollData
  const emp = payrollData.employees.find((e: unknown) => (e as Record<string, unknown>)['id'] === editingEmployee) as unknown as PayrollEmployee | undefined

      // Ensure we have a real UUID employee id for Supabase
  const employeeIdRaw = (editForm as unknown as Record<string, unknown>)['employeeId'] ?? (editForm as unknown as Record<string, unknown>)['employee_id'] ?? editingEmployee
  let employeeId = typeof employeeIdRaw === 'string' ? employeeIdRaw : String(employeeIdRaw)
  const isUuid = typeof employeeId === 'string' && /^[0-9a-fA-F-]{36}$/.test(employeeId)

      if (!isUuid) {
        // Create minimal employee in Supabase so FK constraints pass
        const name = emp ? `${emp.firstName} ${emp.lastName}` : `Employee ${employeeId}`
        const created = await apiService.createEmployee({
          svj_id: (svj as unknown as { id?: string })?.id ?? svjId,
          full_name: name,
          salary_amount: (editForm as unknown as Record<string, unknown>)['grossSalary'] ?? 0,
          employment_type: emp?.contractType === 'dpp' ? 'dpp' : 'vybor'
        })
        employeeId = String((created as unknown as Record<string, unknown>)?.id)
      }
      const payload = {
        employeeId: employeeId,
        month: (editForm as unknown as Record<string, unknown>)['month'] ?? parseInt(month!),
        year: (editForm as unknown as Record<string, unknown>)['year'] ?? parseInt(year!),
        // ensure DB-valid status
        status: toDbStatus(((editForm as unknown as Record<string, unknown>)['status']) as string | undefined ?? DEFAULT_DB_PAYROLL_STATUS),
        base_salary: (editForm as unknown as Record<string, unknown>)['grossSalary'] ?? 0,
        bonuses: (editForm as unknown as Record<string, unknown>)['bonuses'] ?? 0,
        gross_salary: (editForm as unknown as Record<string, unknown>)['grossSalary'] ?? 0,
        net_salary: (editForm as unknown as Record<string, unknown>)['netSalary'] ?? 0
      } as Partial<SalaryRecord>

      // use mutateAsync so we can await and show feedback
  console.debug('Saving payroll payload', payload)
  const resp = await updateSalaryMutation.mutateAsync(payload)
  console.debug('Save response', resp)

  // 🔧 Hard invalidate/refetch exact page keys so UI updates immediately
  const recordsKey = ['payroll', 'records', svjId, month]
  const totalsKey = ['payroll', 'totals', svjId, month]

  // Optional optimistic update: merge saved row into existing cached records if present
  try {
    queryClient.setQueryData(recordsKey, (prev: unknown) => {
      try {
        const prevArr = (prev as unknown[] ) || []
        const saved = resp as Record<string, unknown>
        if (!saved || !saved.id) return prevArr
        const idx = prevArr.findIndex(r => String((r as unknown as Record<string, unknown>)['id']) === String(saved.id))
        if (idx >= 0) {
          const copy = [...prevArr]
          copy[idx] = { ...(copy[idx] as object), ...saved }
          return copy
        }
        return [saved, ...prevArr]
      } catch (e) {
        return prev
      }
    })
  } catch (e) {
    // ignore optimistic set failures
  }

  // Invalidate and refetch the exact keys used by the page
  queryClient.invalidateQueries({ queryKey: recordsKey, refetchType: 'all' })
  queryClient.invalidateQueries({ queryKey: totalsKey, refetchType: 'all' })

  await Promise.allSettled([
    queryClient.refetchQueries({ queryKey: recordsKey, type: 'active' }),
    queryClient.refetchQueries({ queryKey: totalsKey, type: 'active' })
  ])
  console.debug('Refetch done for', { recordsKey, totalsKey })

  success('Uloženo', 'Mzdový záznam byl uložen do Supabase')
  setEditingEmployee(null)
  setEditForm({})
    } catch (err: unknown) {
      // better logging for unknown errors
  const message = (err as unknown && (err as { message?: string })?.message) ?? String(err)
  console.error('Chyba při ukládání mzdy', err)
  toastError('Chyba při ukládání', message)
    }
  }

  const handleCancelEdit = () => {
    setEditingEmployee(null)
    setEditForm({})
  }

  const handleApproveSalaries = () => {
    approveSalariesMutation.mutate()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getMonthName = (monthNum: number) => {
    return new Date(parseInt(year!), monthNum - 1).toLocaleDateString('cs-CZ', { month: 'long' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Návrh</Badge>
      case 'prepared':
        return <Badge className="bg-yellow-100 text-yellow-800">Připraveno</Badge>
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Schváleno</Badge>
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Vyplaceno</Badge>
      default:
        return <Badge variant="outline">Neznámý</Badge>
    }
  }

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'dpp': return 'DPP'
      case 'committee_member': return 'Člen výboru'
      case 'full_time': return 'Zaměstnanec'
      default: return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Načítání mezd...</span>
      </div>
    )
  }

  if (!payrollData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Mzdy nenalezeny</h3>
        <p className="text-gray-600 mb-4">Pro zadané období nebyly nalezeny žádné mzdy.</p>
        <Button asChild>
          <Link to="/payroll">Zpět na mzdovou agendu</Link>
        </Button>
      </div>
    )
  }

  const totalGross = payrollData.employees.reduce((sum, emp) => sum + (emp.salaryRecord?.grossSalary || 0), 0)
  const totalNet = payrollData.employees.reduce((sum, emp) => sum + (emp.salaryRecord?.netSalary || 0), 0)
  const totalTax = payrollData.employees.reduce((sum, emp) => sum + (emp.salaryRecord?.tax || 0), 0)
  const totalHealthInsurance = payrollData.employees.reduce((sum, emp) => sum + (emp.salaryRecord?.healthInsurance || 0), 0)
  const totalSocialInsurance = payrollData.employees.reduce((sum, emp) => sum + (emp.salaryRecord?.socialInsurance || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/payroll">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na workflow
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mzdy {getMonthName(parseInt(month!))} {year}
            </h1>
            <p className="text-gray-600">
              {(svj as unknown as { name?: string })?.name || ''} • {payrollData.employees.length} zaměstnanců
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {payrollData.status === 'ready_for_approval' && (
            <Button 
              onClick={handleApproveSalaries}
              disabled={approveSalariesMutation.isPending}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {approveSalariesMutation.isPending ? 'Schvaluji...' : 'Schválit vše'}
            </Button>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Přehled celkových částek */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Hrubé mzdy</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalGross)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Čisté mzdy</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalNet)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Daň z příjmu</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalTax)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Zdravotní pojištění</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalHealthInsurance)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Sociální pojištění</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalSocialInsurance)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seznam mezd zaměstnanců */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Seznam mezd zaměstnanců</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/employees/new?svjId=${svjId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat zaměstnance
              </Button>
              <Button variant="outline" size="sm">
                <Calculator className="h-4 w-4 mr-2" />
                Přepočítat vše
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollData.employees.map((employee) => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                        {(employee.firstName?.[0] ?? '')}{(employee.lastName?.[0] ?? '')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Badge variant="outline">
                          {getContractTypeLabel(employee.contractType)}
                        </Badge>
                        <span>ZP: {employee.healthInsurance}</span>
                        {employee.salaryRecord && getStatusBadge(employee.salaryRecord.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {editingEmployee === employee.id ? (
                      <>
                        <Button 
                          size="sm" 
                            onClick={handleSaveEmployee}
                            disabled={updateSalaryMutation.isPending || isNaN(Number(editForm.grossSalary)) || Number(editForm.grossSalary) < 0}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Uložit
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Zrušit
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEditEmployee(employee)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Upravit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRecalculateForEmployee(employee)}>
                          <Calculator className="h-4 w-4 mr-1" />
                          Přepočítat
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/employees/${employee.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          const opening = sendEmpId !== employee.id
                          const prefs = employeeMessagingService.get(employee.id)
                          const all = templatesService.getAll()
                          setSelectedTemplateId(prefs.defaultTemplateId || all[0]?.id || '')
                          setIncludeSlip(prefs.includeSlipByDefault ?? true)
                          setUploads(prefs.uploads)
                          setSendEmpId(opening ? employee.id : null)
                        }}>
                          <Mail className="h-4 w-4 mr-1" />
                          Odeslat
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Mzdové údaje */}
                {editingEmployee === employee.id ? (
                  // Edit mode
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hrubá mzda</label>
                      <input
                        type="number"
                        value={editForm.grossSalary ?? 0}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value)
                          if (Number.isNaN(v)) {
                            setEditForm({...editForm, grossSalary: NaN})
                            return
                          }
                          const computed = computeFromGross(v)
                          setEditForm({...editForm, ...computed})
                        }}
                        onBlur={(e) => {
                          const v = parseFloat(e.target.value)
                          if (!Number.isNaN(v)) {
                            const computed = computeFromGross(v)
                            setEditForm({...editForm, ...computed})
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Hrubá mzda"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Čistá mzda</label>
                      <input
                        type="number"
                        value={editForm.netSalary || 0}
                        onChange={(e) => setEditForm({...editForm, netSalary: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Čistá mzda"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Daň z příjmu</label>
                      <input
                        type="number"
                        value={editForm.tax || 0}
                        onChange={(e) => setEditForm({...editForm, tax: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Daň"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zdravotní pojištění</label>
                      <input
                        type="number"
                        value={editForm.healthInsurance || 0}
                        onChange={(e) => setEditForm({...editForm, healthInsurance: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ZP"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sociální pojištění</label>
                      <input
                        type="number"
                        value={editForm.socialInsurance || 0}
                        onChange={(e) => setEditForm({...editForm, socialInsurance: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SP"
                      />
                    </div>
                  </div>
                ) : (
                  // View mode
                  employee.salaryRecord ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Hrubá mzda</p>
                        <p className="font-medium text-lg">{formatCurrency(employee.salaryRecord.grossSalary)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Čistá mzda</p>
                        <p className="font-medium text-lg text-green-600">{formatCurrency(employee.salaryRecord.netSalary)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Daň z příjmu</p>
                        <p className="font-medium">{formatCurrency(employee.salaryRecord.tax)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Zdravotní pojištění</p>
                        <p className="font-medium">{formatCurrency(employee.salaryRecord.healthInsurance)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Sociální pojištění</p>
                        <p className="font-medium">{formatCurrency(employee.salaryRecord.socialInsurance)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>Mzda ještě nebyla zpracována</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        Zpracovat mzdu
                      </Button>
                    </div>
                  )
                )}

                {/* Inline panel pro odeslání e‑mailu */}
                {sendEmpId === employee.id && (
                  <div className="mt-4 border-t pt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`tmpl-${employee.id}`} className="block text-sm font-medium mb-1">Šablona e‑mailu</label>
                        <select
                          id={`tmpl-${employee.id}`}
                          aria-label="Šablona e‑mailu"
                          value={selectedTemplateId}
                          onChange={e => {
                            const id = e.target.value
                            setSelectedTemplateId(id)
                            const t = templatesService.getById(id)
                            setEmailSubject(t?.subject || '')
                            setEmailBody(t?.bodyPreview || '')
                          }}
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="">(prázdná)</option>
                          {templatesService.getAll().map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end justify-end gap-2"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Předmět e‑mailu</label>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Předmět" />
                      </div>
                      <div className="hidden md:block" />
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Tělo e‑mailu</label>
                        <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} className="w-full h-32 px-3 py-2 border rounded font-mono text-sm" placeholder="Text e‑mailu" />
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-1">Další přílohy</div>
                      <DropZone
                        onFiles={async (files) => {
                          for (const f of files) {
                            const data = await f.arrayBuffer()
                            const base64 = btoa(String.fromCharCode(...new Uint8Array(data)))
                            const att = employeeMessagingService.addUpload(employee.id, { name: f.name, mime: f.type || 'application/octet-stream', size: f.size, dataBase64: base64 })
                            setUploads(prev => [att, ...prev])
                          }
                        }}
                      />
                      {uploads.length > 0 && (
                        <ul className="mt-2 divide-y border rounded">
                          {uploads.map(u => (
                            <li key={u.id || u.name} className="p-2 flex items-center justify-between text-sm">
                              <div>
                                <div className="font-medium">{u.name}</div>
                                <div className="text-gray-500">{u.mime} • {(u.size/1024).toFixed(1)} kB</div>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => {
                                if (u.id) employeeMessagingService.removeUpload(employee.id, u.id)
                                setUploads(prev => prev.filter(x => (x.id || x.name) !== (u.id || u.name)))
                              }}>Odebrat</Button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={includeSlip} onChange={e => setIncludeSlip(e.target.checked)} aria-label="Přiložit výplatní pásku" />
                          Přiložit výplatní pásku
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={includeSettlement} onChange={e => setIncludeSettlement(e.target.checked)} aria-label="Přiložit vyúčtování mezd (PDF)" />
                          Vyúčtování mezd (PDF)
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={includeDppXml} onChange={e => setIncludeDppXml(e.target.checked)} aria-label="Přiložit výkaz příjmů DPP (XML)" />
                          Výkaz příjmů DPP (XML)
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={includeDppPdf} onChange={e => setIncludeDppPdf(e.target.checked)} aria-label="Přiložit výkaz příjmů DPP (PDF)" />
                          Výkaz příjmů DPP (PDF)
                        </label>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            employeeMessagingService.setDefaultTemplate(employee.id, selectedTemplateId || undefined)
                            employeeMessagingService.setIncludeSlip(employee.id, includeSlip)
                          }}
                        >
                          Uložit jako výchozí
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setSendEmpId(null)}>Zavřít</Button>
            <Button
                        onClick={() => {
                          const vars = {
                            jmeno: employee.firstName,
                            prijmeni: employee.lastName,
                            nazev_svj: (svj as unknown as { name?: string })?.name || 'SVJ',
                            rok: String(year),
                            mesic: getMonthName(parseInt(month!)),
                            hruba_mzda: String(employee.salaryRecord?.grossSalary ?? ''),
                            cista_mzda: String(employee.salaryRecord?.netSalary ?? ''),
                            dan: String(employee.salaryRecord?.tax ?? ''),
                            zdravotni: String(employee.salaryRecord?.healthInsurance ?? ''),
                            socialni: String(employee.salaryRecord?.socialInsurance ?? '')
                          }
                          const qs = new URLSearchParams()
                          if (selectedTemplateId) qs.set('templateId', selectedTemplateId)
                          qs.set('vars', encodeURIComponent(JSON.stringify(vars)))
                          qs.set('includeSlip', includeSlip ? '1' : '0')
              if (emailSubject) qs.set('subject', encodeURIComponent(emailSubject))
              if (emailBody) qs.set('body', encodeURIComponent(emailBody))
              const special: string[] = []
              if (includeSettlement) special.push('settlement')
              if (includeDppXml) special.push('dpp_xml')
              if (includeDppPdf) special.push('dpp_pdf')
              if (special.length) qs.set('special', special.join(','))
                          if (uploads.length) {
                            const plain = uploads.map(u => ({ name: u.name, mime: u.mime, size: u.size, dataBase64: u.dataBase64 }))
                            qs.set('uploads', encodeURIComponent(JSON.stringify(plain)))
                          }
                          navigate(`/email-compose?${qs.toString()}`)
                        }}
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" /> Pokračovat do e‑mailu
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rychlé akce */}
      <Card>
        <CardHeader>
          <CardTitle>Rychlé akce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Generovat výplatní pásky</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">Export pro banku</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Building2 className="h-6 w-6" />
              <span className="text-sm">Export pro ČSSZ</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Mail className="h-6 w-6" />
              <span className="text-sm">Odeslat e-mailem</span>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [dragOver, setDragOver] = useState(false)
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragOver(false)
        const files = Array.from(e.dataTransfer.files || [])
        if (files.length) onFiles(files)
      }}
      className={`mt-1 p-4 border-2 border-dashed rounded ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
      aria-label="Přetáhněte soubory sem"
      title="Přetáhněte soubory sem nebo klikněte pro výběr"
    >
      <div className="text-sm text-gray-600">Přetáhněte soubory sem nebo klikněte pro výběr</div>
      <input
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length) onFiles(files)
        }}
        className="mt-2"
        aria-label="Vybrat soubory"
      />
    </div>
  )
}
