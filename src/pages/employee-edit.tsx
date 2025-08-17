import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService } from '@/services/api'
import { useState, useEffect } from 'react'
import { Employee } from '@/types'
import { Save, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { formatBankAccount, isValidBankAccount, formatBirthNumber, isValidBirthNumber } from '@/lib/validation'

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => apiService.getEmployees(),
  })

  const employee = employees?.find(e => e.id === id)

  const [form, setForm] = useState<Partial<Employee>>({})

  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        bankAccount: employee.bankAccount,
        salary: employee.salary,
        contractType: employee.contractType,
        healthInsurance: employee.healthInsurance,
        hasPinkDeclaration: employee.hasPinkDeclaration,
        startDate: employee.startDate,
      })
    }
  }, [employee])

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Employee>) => apiService.updateEmployee(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      success('Změny byly uloženy')
      navigate(`/employees/${id}`)
    },
    onError: (e: any) => error('Uložení se nezdařilo', String(e?.message ?? e))
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Načítání…</span>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Zaměstnanec nenalezen.</p>
            <Button asChild>
              <Link to="/employees">Zpět na seznam</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // simple client-side validation
    if (form.birthNumber && !isValidBirthNumber(String(form.birthNumber))) {
      return error('Neplatné rodné číslo')
    }
    if (form.bankAccount && !isValidBankAccount(String(form.bankAccount))) {
      return error('Neplatné číslo účtu (formát 123-123456789/0100)')
    }
    updateMutation.mutate(form)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Zpět
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upravit zaměstnance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span>Jméno</span>
              <input className="border rounded px-3 py-2" value={form.firstName ?? ''} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span>Příjmení</span>
              <input className="border rounded px-3 py-2" value={form.lastName ?? ''} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span>E-mail</span>
              <input type="email" className="border rounded px-3 py-2" value={form.email ?? ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span>Telefon</span>
              <input className="border rounded px-3 py-2" value={form.phone ?? ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
            </label>
            <label className="flex flex-col gap-1">
              <span>Rodné číslo</span>
              <input
                className="border rounded px-3 py-2"
                value={form.birthNumber ? formatBirthNumber(String(form.birthNumber)) : ''}
                onChange={e => setForm(f => ({...f, birthNumber: e.target.value }))}
                placeholder="YYMMDD/XXXX"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Číslo účtu</span>
              <input
                className="border rounded px-3 py-2"
                value={form.bankAccount ? formatBankAccount(String(form.bankAccount)) : ''}
                onChange={e => setForm(f => ({...f, bankAccount: formatBankAccount(e.target.value)}))}
                placeholder="(prefix-)číslo/XXXX"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Mzda</span>
              <input type="number" className="border rounded px-3 py-2" value={form.salary ?? 0} onChange={e => setForm(f => ({...f, salary: Number(e.target.value)}))} />
            </label>
            <label className="flex flex-col gap-1">
              <span>Typ smlouvy</span>
              <select className="border rounded px-3 py-2" value={form.contractType ?? 'full_time'} onChange={e => setForm(f => ({...f, contractType: e.target.value as Employee['contractType']}))}>
                <option value="full_time">Plný úvazek</option>
                <option value="dpp">DPP</option>
                <option value="committee_member">Člen výboru</option>
              </select>
            </label>
            <label className="flex items-center gap-2 col-span-full">
              <input type="checkbox" checked={!!form.hasPinkDeclaration} onChange={e => setForm(f => ({...f, hasPinkDeclaration: e.target.checked}))} />
              <span>Růžové prohlášení podepsáno</span>
            </label>
            <div className="col-span-full flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Zrušit</Button>
              <Button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Uložit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
