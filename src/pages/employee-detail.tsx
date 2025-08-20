import { gql, useMutation, useQuery } from '@apollo/client'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/services/api'
import { AlertTriangle, ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { templatesService } from '@/services/templates'
import { employeeMessagingService } from '@/services/employeeMessaging'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

const GET_EMPLOYEE_DETAIL = gql`
  query GetEmployeeDetail($id: ID!) {
    employee(id: $id) {
      id
      firstName
      lastName
      email
      phone
      contractType
      salary
      healthInsurance
      startDate
      note
      executions {
        id
        name
        totalAmount
        monthlyDeduction
        variableSymbol
        status
      }
    }
  }
`

const UPDATE_EMPLOYEE_NOTE = gql`
  mutation UpdateEmployeeNote($id: ID!, $note: String) {
    updateEmployee(id: $id, input: { note: $note }) {
      id
      note
    }
  }
`

const CREATE_EXECUTION = gql`
  mutation CreateExecution($input: ExecutionInput!) {
    createExecution(input: $input) {
      id
      name
      totalAmount
      monthlyDeduction
      variableSymbol
      priority
      status
    }
  }
`;

const UPDATE_EXECUTION = gql`
  mutation UpdateExecution($id: ID!, $input: ExecutionInput!) {
    updateExecution(id: $id, input: $input) {
      id
      name
      totalAmount
      monthlyDeduction
      variableSymbol
      priority
      status
    }
  }
`;

const DELETE_EXECUTION = gql`
  mutation DeleteExecution($id: ID!) {
    deleteExecution(id: $id) {
      id
    }
  }
`;

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [allTemplates, setAllTemplates] = useState(() => templatesService.getAll())
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [includeSlip, setIncludeSlip] = useState<boolean>(true)
  const [prefsSaved, setPrefsSaved] = useState<boolean>(false)
  const [note, setNote] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExecution, setEditingExecution] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    monthlyDeduction: '',
    variableSymbol: '',
    priority: '',
    status: 'active',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [executionToDelete, setExecutionToDelete] = useState(null);

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => apiService.getEmployees(),
  })

  const { data, loading, error } = useQuery(GET_EMPLOYEE_DETAIL, { variables: { id } })
  const [updateNote] = useMutation(UPDATE_EMPLOYEE_NOTE)
  const [createExecution] = useMutation(CREATE_EXECUTION);
  const [updateExecution] = useMutation(UPDATE_EXECUTION);
  const [deleteExecution] = useMutation(DELETE_EXECUTION);

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

  useEffect(() => {
    if (data?.employee) {
      setNote(data.employee.note || '')
    }
  }, [data])

  const handleSaveNote = async () => {
    try {
      await updateNote({ variables: { id, note } })
      alert('Poznámka byla uložena.')
    } catch (err) {
      console.error(err)
      alert('Chyba při ukládání poznámky.')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && editingExecution) {
        await updateExecution({ variables: { id: editingExecution.id, input: { ...formData, employeeId: id } } });
        alert('Srážka byla úspěšně aktualizována.');
      } else {
        await createExecution({ variables: { input: { ...formData, employeeId: id } } });
        alert('Srážka byla úspěšně přidána.');
      }
      setFormData({
        name: '',
        totalAmount: '',
        monthlyDeduction: '',
        variableSymbol: '',
        priority: '',
        status: 'active',
      });
      setIsDialogOpen(false);
      // Refetch data here if needed
    } catch (error) {
      console.error(error);
      alert('Chyba při ukládání srážky.');
    }
  };

  const handleEditClick = (execution) => {
    setEditingExecution(execution);
    setFormData({
      name: execution.name,
      totalAmount: execution.totalAmount,
      monthlyDeduction: execution.monthlyDeduction,
      variableSymbol: execution.variableSymbol,
      priority: execution.priority,
      status: execution.status,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (execution) => {
    setExecutionToDelete(execution);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteExecution({ variables: { id: executionToDelete.id } });
      alert('Srážka byla úspěšně smazána.');
      setIsDeleteDialogOpen(false);
      setExecutionToDelete(null);
      // Refetch data here if needed
    } catch (error) {
      console.error(error);
      alert('Chyba při mazání srážky.');
    }
  };

  if (isLoading || loading) {
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

      {/* Poznámka */}
      <Card>
        <CardHeader>
          <CardTitle>Poznámka</CardTitle>
        </CardHeader>
        <CardContent>
          <label htmlFor="note" className="block text-sm font-medium mb-1">Poznámka</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Zadejte poznámku"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setNote('')} className="whitespace-nowrap">
              Zrušit
            </Button>
            <Button onClick={handleSaveNote} className="whitespace-nowrap">
              Uložit změny
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Srážky a exekuce */}
      <Card>
        <CardHeader>
          <CardTitle>Srážky a exekuce</CardTitle>
        </CardHeader>
        <CardContent>
          {employee.executions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Žádné srážky ani exekuce nebyly nalezeny.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Název srážky</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Celková částka</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Měsíční srážka</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Variabilní symbol</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Stav</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Akce</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employee.executions.map(execution => (
                    <tr key={execution.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{execution.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(execution.totalAmount)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(execution.monthlyDeduction)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{execution.variableSymbol}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge variant={execution.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                          {execution.status === 'active' ? 'Aktivní' : 'Pozastaveno'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        <Button variant="ghost" onClick={() => handleEditClick(execution)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteClick(execution)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tlačítko pro přidání nové srážky */}
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditMode(false);
              setFormData({
                name: '',
                totalAmount: '',
                monthlyDeduction: '',
                variableSymbol: '',
                priority: '',
                status: 'active',
              });
              setIsDialogOpen(true);
            }}>Přidat novou srážku</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Upravit srážku' : 'Přidat novou srážku'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Název srážky</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="totalAmount">Celková částka</Label>
                <Input id="totalAmount" name="totalAmount" type="number" value={formData.totalAmount} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="monthlyDeduction">Měsíční srážka</Label>
                <Input id="monthlyDeduction" name="monthlyDeduction" type="number" value={formData.monthlyDeduction} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="variableSymbol">Variabilní symbol</Label>
                <Input id="variableSymbol" name="variableSymbol" value={formData.variableSymbol} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="priority">Priorita</Label>
                <Input id="priority" name="priority" type="number" value={formData.priority} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="status">Stav</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status" className="w-full">
                    {formData.status}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktivní</SelectItem>
                    <SelectItem value="paused">Pozastaveno</SelectItem>
                    <SelectItem value="finished">Dokončeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Zrušit</Button>
              <Button onClick={handleSubmit}>{isEditMode ? 'Uložit změny' : 'Uložit'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Potvrzovací dialog pro smazání */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Opravdu si přejete smazat tuto srážku?</DialogTitle>
            <Dialog.Description>
              Tuto akci nelze vrátit zpět.
            </Dialog.Description>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Zrušit</Button>
            <Button variant="destructive" onClick={confirmDelete}>Smazat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
