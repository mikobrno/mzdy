import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Building2, 
  Users, 
  Calculator, 
  Mail, 
  Edit, 
  Save, 
  X, 
  Plus,
  FileText,
  CreditCard,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Archive,
  Download,
  ArrowLeft,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  AlertCircle,
  Eye,
  Settings,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/services/api'
import { SVJ, Employee, SalaryRecord } from '@/types'
import { cn } from '@/lib/utils'
import { svjNotesService, type SvjNote } from '@/services/svjNotes'

export default function SVJDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<SVJ>>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'payroll' | 'history' | 'notes'>('overview')
  const [notes, setNotes] = useState<SvjNote[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')

  const { data: svj, isLoading } = useQuery({
    queryKey: ['svj', id],
    queryFn: () => apiService.getSVJ(id!),
    enabled: !!id
  })

  const { data: employees } = useQuery({
    queryKey: ['employees', id],
    queryFn: () => apiService.getEmployees(id),
    enabled: !!id
  })

  const { data: payrolls } = useQuery({
    queryKey: ['payrolls', id],
    queryFn: () => apiService.getSalaryRecords(id!, new Date().getFullYear()),
    enabled: !!id
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SVJ>) => apiService.updateSVJ(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['svj', id] })
      setIsEditing(false)
    }
  })

  useEffect(() => {
    if (svj) {
      setEditForm(svj)
  setNotes(svjNotesService.list(svj.id))
    }
  }, [svj])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Načítání...</span>
      </div>
    )
  }

  if (!svj) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">SVJ nenalezeno</h3>
        <p className="text-gray-600 mb-4">Požadované SVJ neexistuje nebo k němu nemáte přístup.</p>
        <Button asChild>
          <Link to="/">Zpět na dashboard</Link>
        </Button>
      </div>
    )
  }

  const handleSave = () => {
    updateMutation.mutate(editForm)
  }

  const handleCancel = () => {
    setEditForm(svj)
    setIsEditing(false)
  }

  const activeEmployees = employees?.filter(emp => emp.isActive) || []
  const inactiveEmployees = employees?.filter(emp => !emp.isActive) || []
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Payroll statistics
  const totalPaidThisYear = payrolls?.reduce((sum, p) => sum + p.netSalary, 0) || 0
  const pendingPayrolls = payrolls?.filter(p => p.status === 'draft' || p.status === 'prepared').length || 0
  const completedPayrolls = payrolls?.filter(p => p.status === 'paid').length || 0

  // Mock mzdový přehled po měsících
  const monthlyPayrollStatus = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthPayrolls = payrolls?.filter(p => p.month === month) || []
    return {
      month,
      name: new Date(currentYear, i).toLocaleDateString('cs-CZ', { month: 'long' }),
      status: monthPayrolls.length > 0 ? 
        (monthPayrolls.every(p => p.status === 'paid') ? 'completed' : 
         monthPayrolls.some(p => p.status === 'approved') ? 'approved' : 'draft') : 'none',
      count: monthPayrolls.length,
      total: monthPayrolls.reduce((sum, p) => sum + p.netSalary, 0)
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('cs-CZ')
  }

  const getEmployeeContractTypeLabel = (type: string) => {
    switch (type) {
      case 'dpp': return 'DPP'
      case 'committee_member': return 'Člen výboru'
      case 'full_time': return 'Zaměstnanec'
      default: return type
    }
  }

  const getPayrollStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Dokončeno</Badge>
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Schváleno</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Rozpracováno</Badge>
      default:
        return <Badge variant="outline">Nezpracováno</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="bg-transparent border-b-2 border-blue-500 focus:outline-none text-3xl font-bold"
                  placeholder="Název SVJ"
                />
              ) : (
                svj.name
              )}
              {svj.registryData?.isVerified && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ověřeno
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.quickDescription || ''}
                  onChange={(e) => setEditForm({ ...editForm, quickDescription: e.target.value })}
                  className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                  placeholder="Popis SVJ"
                />
              ) : (
                svj.quickDescription
              )}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Uložit
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Zrušit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Upravit
              </Button>
              <Button asChild>
                <Link to={`/payroll`}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Zpracovat mzdy
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hlavní statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní zaměstnanci</p>
                <p className="text-2xl font-bold text-gray-900">{activeEmployees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Čekající mzdy</p>
                <p className="text-2xl font-bold text-orange-600">{pendingPayrolls}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dokončené mzdy</p>
                <p className="text-2xl font-bold text-green-600">{completedPayrolls}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vyplaceno {currentYear}</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalPaidThisYear)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert pro nevyřízené mzdy */}
      {pendingPayrolls > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Upozornění na nevyřízené mzdy</h4>
                  <p className="text-sm text-orange-700">
                    Máte {pendingPayrolls} nevyřízených mezd, které vyžadují vaši pozornost.
                  </p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link to={`/payroll`}>
                  Zobrazit mzdy
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            Přehled
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'employees'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Zaměstnanci ({activeEmployees.length})
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'payroll'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Calculator className="h-4 w-4 inline mr-2" />
            Mzdová agenda {currentYear}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Historie a akce
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            📝 Poznámky
          </button>
        </nav>
      </div>

  {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Základní informace */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Základní údaje</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">IČO</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.ico || ''}
                        onChange={(e) => setEditForm({ ...editForm, ico: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="IČO"
                      />
                    ) : (
                      <p className="font-mono text-sm">{svj.ico}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Datová schránka</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.dataBoxId || ''}
                        onChange={(e) => setEditForm({ ...editForm, dataBoxId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ID datové schránky"
                      />
                    ) : (
                      <p className="font-mono text-sm">{svj.dataBoxId}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Adresa sídla</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Adresa sídla SVJ"
                    />
                  ) : (
                    <p className="text-sm">{svj.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bankovní účet (IBAN)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.bankAccount || ''}
                      onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="IBAN bankovního účtu"
                    />
                  ) : (
                    <p className="font-mono text-sm">{svj.bankAccount}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Kontaktní informace */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Kontaktní údaje</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Kontaktní osoba</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.contactPerson || ''}
                        onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Jméno kontaktní osoby"
                      />
                    ) : (
                      <p>{svj.contactPerson}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">E-mail</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.contactEmail || ''}
                        onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="kontakt@svj.cz"
                      />
                    ) : (
                      <p>{svj.contactEmail}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Způsob odesílání výkazů</label>
                  {isEditing ? (
                    <select
                      value={editForm.reportDeliveryMethod || 'manager'}
                      onChange={(e) => setEditForm({ ...editForm, reportDeliveryMethod: e.target.value as 'manager' | 'client' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Způsob odesílání výkazů"
                    >
                      <option value="manager">Odesílá správce</option>
                      <option value="client">Odesílá klient</option>
                    </select>
                  ) : (
                    <Badge variant={svj.reportDeliveryMethod === 'manager' ? 'default' : 'secondary'}>
                      {svj.reportDeliveryMethod === 'manager' ? 'Odesílá správce' : 'Odesílá klient'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar s akcemi a statistikami */}
          <div className="space-y-6">
            {/* Rychlé akce */}
            <Card>
              <CardHeader>
                <CardTitle>Rychlé akce</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link to={`/payroll`}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Zpracovat mzdy
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to={`/employees?svj=${svj.id}`}>
                    <Users className="h-4 w-4 mr-2" />
                    Spravovat zaměstnance
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to={`/communication/templates?svj=${svj.id}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    E-mailové šablony
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Archivovat rok
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export dat
                </Button>
              </CardContent>
            </Card>

            {/* Systémové informace */}
            <Card>
              <CardHeader>
                <CardTitle>Systémové informace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Vytvořeno:</span>
                  <span>{formatDate(svj.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aktualizováno:</span>
                  <span>{formatDate(svj.updatedAt)}</span>
                </div>
                {svj.registryData?.verificationDate && (
                  <div className="flex justify-between">
                    <span>Ověřeno z rejstříku:</span>
                    <span>{formatDate(svj.registryData.verificationDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Seznam zaměstnanců</h2>
            <div className="flex gap-2">
              <Button asChild>
                <Link to={`/employees?svj=${svj.id}`}>
                  <Users className="h-4 w-4 mr-2" /> Spravovat zaměstnance
                </Link>
              </Button>
              <Button onClick={() => navigate(`/employees/new?svjId=${svj.id}`)}>
                <Plus className="h-4 w-4 mr-2" /> Přidat zaměstnance
              </Button>
            </div>
          </div>

          {(!employees || employees.length === 0) ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">Žádní zaměstnanci nebyli nalezeni.</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {employees.map(emp => (
                <Card key={emp.id}>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${emp.isActive ? 'bg-green-500' : 'bg-gray-400'}`}>
                          {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                          <div className="text-sm text-gray-600">{getEmployeeContractTypeLabel(emp.contractType)} • {formatCurrency(emp.salary)}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/employees/${emp.id}`}>Detail</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/employees/${emp.id}/edit`}>Upravit</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Mzdová agenda {currentYear}</h2>
            <div className="flex gap-2">
              <Button asChild>
                <Link to={`/payroll`}>Zobrazit mzdovou agendu</Link>
              </Button>
              <Button onClick={() => navigate(`/payroll/${svj.id}/${currentYear}/${currentMonth}`)}>
                Zpracovat tento měsíc
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {monthlyPayrollStatus.map(m => (
              <Card key={m.month}>
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gray-600 mb-2">{m.name}</div>
                  <div className="text-xl font-bold mb-2">{m.count} záznamů</div>
                  <div className="mb-3">{getPayrollStatusBadge(m.status)}</div>
                  <div className="text-sm text-gray-600 mb-2">Celkem: {formatCurrency(m.total)}</div>
                  <div className="flex justify-center">
                    <Button size="sm" asChild>
                      <Link to={`/payroll/${svj.id}/${currentYear}/${m.month}`}>Otevřít</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Historie a akce</h2>
            <div className="flex gap-2">
              <Button asChild>
                <Link to={`/payroll`}>Přejít na mzdy</Link>
              </Button>
            </div>
          </div>

          {(!payrolls || payrolls.length === 0) ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">Zatím žádná historie mzdových záznamů.</CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {payrolls.map(p => (
                <Card key={p.id}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.year} / {p.month}</div>
                      <div className="text-sm text-gray-600">Status: {p.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(p.netSalary)}</div>
                      <div className="text-sm text-gray-500">Vytvořeno: {new Date(p.createdAt).toLocaleDateString('cs-CZ')}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Přidat poznámku</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Předmět poznámky"
                  aria-label="Předmět poznámky"
                />
                <textarea
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  className="w-full h-32 px-3 py-2 border rounded"
                  placeholder="Text poznámky"
                  aria-label="Text poznámky"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setNewTitle(''); setNewBody('') }}>Vyčistit</Button>
                  <Button onClick={() => {
                    if (!svj) return
                    if (!newTitle.trim() && !newBody.trim()) return
                    const created = svjNotesService.create({ svjId: svj.id, title: newTitle, body: newBody })
                    setNotes(prev => [created, ...prev])
                    setNewTitle(''); setNewBody('')
                  }}>Uložit</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seznam poznámek</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-gray-600 text-sm">Zatím žádné poznámky.</p>
                ) : (
                  <div className="space-y-3">
                    {notes
                      .slice()
                      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt))
                      .map(n => (
                      <div key={n.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {n.pinned && <Badge className="bg-yellow-100 text-yellow-800">Připnuto</Badge>}
                            <div className="font-medium">{n.title || '(bez předmětu)'}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { const u = svjNotesService.togglePin(n.id); if (u) setNotes(prev => prev.map(x => x.id === u.id ? u : x)) }}>Připnout</Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              const title = prompt('Upravit předmět', n.title) ?? n.title
                              const body = prompt('Upravit text', n.body) ?? n.body
                              const u = svjNotesService.update(n.id, { title, body })
                              if (u) setNotes(prev => prev.map(x => x.id === u.id ? u : x))
                            }}>Upravit</Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => { svjNotesService.remove(n.id); setNotes(prev => prev.filter(x => x.id !== n.id)) }}>Smazat</Button>
                          </div>
                        </div>
                        {n.body && <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{n.body}</div>}
                        <div className="text-xs text-gray-500 mt-2">Aktualizováno: {new Date(n.updatedAt).toLocaleString('cs-CZ')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tip</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Poznámky vidí jen tým účetních. Připnuté poznámky se zobrazí nahoře.
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
