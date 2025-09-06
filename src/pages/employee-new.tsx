import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService } from '@/services/api'
import { useState } from 'react'
import { Employee } from '@/types'
import { Save, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { formatBankAccount, isValidBankAccount, formatBirthNumber, isValidBirthNumber } from '@/lib/validation'

export default function EmployeeNewPage() {
  const navigate = useNavigate()
  const { svjId: routeSvjId } = useParams<{ svjId: string }>()
  const [search] = useSearchParams()
  const querySvjId = search.get('svjId') || search.get('svj_id')
  const effectiveSvjId = routeSvjId || querySvjId || ''
  const { success, error } = useToast()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<Partial<Employee>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bankAccount: '',
    salary: 0,
    contractType: 'full_time',
    healthInsurance: '111',
    hasPinkDeclaration: false,
  svjId: effectiveSvjId,
    address: '',
    birthNumber: '',
    isActive: true,
    startDate: new Date(),
  })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Employee>) => apiService.createEmployee(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      success('Zaměstnanec vytvořen')
      navigate(`/employees/${created.id}`)
    },
    onError: (e: unknown) => {
      const msg = (e as { message?: string })?.message || String(e)
      error('Vytvoření se nezdařilo', msg)
    }
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.birthNumber && !isValidBirthNumber(String(form.birthNumber))) {
      return error('Neplatné rodné číslo')
    }
    if (form.bankAccount && !isValidBankAccount(String(form.bankAccount))) {
      return error('Neplatné číslo účtu (formát 123-123456789/0100)')
    }
    createMutation.mutate({
      ...form,
      svjId: effectiveSvjId,
      isActive: true
    })
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
          <CardTitle>Nový zaměstnanec</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span>Jméno</span>
              <input name="firstName" data-test="employee-first-name" className="border rounded px-3 py-2" value={form.firstName ?? ''} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span>Příjmení</span>
              <input name="lastName" data-test="employee-last-name" className="border rounded px-3 py-2" value={form.lastName ?? ''} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} required />
            </label>
            <label className="flex flex-col gap-1">
              <span>E-mail</span>
              <input name="email" data-test="employee-email" type="email" className="border rounded px-3 py-2" value={form.email ?? ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
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
              <Button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2" data-test="employee-save-btn">
                <Save className="h-4 w-4" /> Uložit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
