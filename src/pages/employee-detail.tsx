import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/services/api'
import { AlertTriangle, ArrowLeft, Edit } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { templatesService } from '@/services/templates'
import { employeeMessagingService } from '@/services/employeeMessaging'

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [allTemplates, setAllTemplates] = useState(() => templatesService.getAll())
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [includeSlip, setIncludeSlip] = useState<boolean>(true)
  const [prefsSaved, setPrefsSaved] = useState<boolean>(false)

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => apiService.getEmployees(),
  })

  const employee = employees?.find(e => e.id === id)

  useEffect(() => {
    // reload templates in case they changed while app runs
    setAllTemplates(templatesService.getAll())
  }, [])

  useEffect(() => {
    if (!employee?.id) return
    const prefs = employeeMessagingService.get(employee.id)
    setSelectedTemplateId(prefs.defaultTemplateId || '')
    setIncludeSlip(prefs.includeSlipByDefault ?? true)
  }, [employee?.id])

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
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Zaměstnanec nenalezen.</p>
            <Button asChild>
              <Link to="/employees">Zpět na seznam</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const contractLabel = employee.contractType === 'dpp' ? 'DPP' : employee.contractType === 'committee_member' ? 'Člen výboru' : 'Plný úvazek'

  return (
  <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Zpět
        </Button>
        <Button asChild>
          <Link to={`/employees/${employee.id}/edit`} className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Upravit
          </Link>
        </Button>
      </div>

  <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${employee.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
            </div>
            {employee.firstName} {employee.lastName}
            {!employee.isActive && <Badge variant="secondary">Neaktivní</Badge>}
            {employee.executions.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" /> Exekuce
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">E-mail</div>
              <div className="font-medium">{employee.email}</div>
            </div>
            <div>
              <div className="text-gray-600">Telefon</div>
              <div className="font-medium">{employee.phone}</div>
            </div>
            <div>
              <div className="text-gray-600">Typ smlouvy</div>
              <Badge className="text-xs">{contractLabel}</Badge>
            </div>
            <div>
              <div className="text-gray-600">Mzda</div>
              <div className="font-medium">{formatCurrency(employee.salary)}</div>
            </div>
            <div>
              <div className="text-gray-600">Zdravotní pojišťovna</div>
              <div className="font-medium">{employee.healthInsurance}</div>
            </div>
            <div>
              <div className="text-gray-600">Nástup</div>
              <div className="font-medium">{formatDate(employee.startDate)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historie aktivit */}
      <Card>
        <CardHeader>
          <CardTitle>Historie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Upraven bankovní účet</span>
            <span className="text-gray-500">před 3 dny</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Přidán záznam mzdy za červenec</span>
            <span className="text-gray-500">před 10 dny</span>
          </div>
        </CardContent>
      </Card>

      {/* Přiložené dokumenty */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumenty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3 border rounded-md flex items-center justify-between">
              <div>
                <p className="font-medium">Pracovní smlouva</p>
                <p className="text-gray-500">PDF • 320 kB</p>
              </div>
              <Button variant="outline" size="sm">Stáhnout</Button>
            </div>
            <div className="p-3 border rounded-md flex items-center justify-between">
              <div>
                <p className="font-medium">Růžové prohlášení</p>
                <p className="text-gray-500">PDF • 120 kB</p>
              </div>
              <Button variant="outline" size="sm">Stáhnout</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Komunikační preference */}
      <Card>
        <CardHeader>
          <CardTitle>E‑mailové preference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="default-template" className="block text-sm font-medium mb-1">Výchozí e‑mailová šablona</label>
              <select
                id="default-template"
                value={selectedTemplateId}
                onChange={e => { setSelectedTemplateId(e.target.value); setPrefsSaved(false) }}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">(Žádná)</option>
                {allTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Použije se předvyplněně při odesílání e‑mailů v Mzdové agendě.</p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeSlip} onChange={e => { setIncludeSlip(e.target.checked); setPrefsSaved(false) }} />
                Přikládat výplatní pásku ve výchozím nastavení
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link to="/templates">Spravovat šablony</Link>
            </Button>
            <div className="flex items-center gap-2">
              {prefsSaved && <span className="text-sm text-green-600">Uloženo</span>}
              <Button onClick={() => {
                employeeMessagingService.setDefaultTemplate(employee.id, selectedTemplateId || undefined)
                employeeMessagingService.setIncludeSlip(employee.id, includeSlip)
                setPrefsSaved(true)
              }}>Uložit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
