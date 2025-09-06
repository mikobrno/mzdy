import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Plus,
  Search,
  FileText,
  Download,
  Edit,
  Eye,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/services/api'
import { Employee, SVJ } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useToast } from '@/components/ui/toast'

export function EmployeesPage() {
  const queryClient = useQueryClient()
  const { success, error, warning } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSVJ, setSelectedSVJ] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('active')

  const { data: svjList } = useQuery({
    queryKey: ['svj-list'],
    queryFn: apiService.getSVJList
  })

  const { data: allEmployees, isLoading } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => apiService.getEmployees()
  })

  // Filtrování zaměstnanců
  const filteredEmployees = allEmployees?.filter(employee => {
    const matchesSearch = 
      (employee.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSVJ = selectedSVJ === 'all' || employee.svjId === selectedSVJ
    
    const matchesStatus = 
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && employee.isActive) ||
      (selectedStatus === 'inactive' && !employee.isActive)
    
    return matchesSearch && matchesSVJ && matchesStatus
  }) || []

  const terminateEmployeeMutation = useMutation({
    mutationFn: (employeeId: string) => apiService.terminateEmployee(employeeId),
    onMutate: async (employeeId: string) => {
      await queryClient.cancelQueries({ queryKey: ['employees', 'all'] })
      const prev = queryClient.getQueryData<Employee[]>(['employees', 'all'])
      if (prev) {
        queryClient.setQueryData<Employee[]>(['employees', 'all'], prev.map(e => e.id === employeeId ? { ...e, isActive: false, endDate: new Date() } : e))
      }
      return { prev }
    },
    onError: (e: any, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['employees', 'all'], ctx.prev)
      }
      error('Ukončení selhalo', String(e?.message ?? e))
    },
    onSuccess: () => {
      success('Zaměstnanec byl označen jako ukončený', 'Dokumenty k ukončení budou vygenerovány.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', 'all'] })
    }
  })

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'dpp': return 'DPP'
      case 'committee_member': return 'Člen výboru'
      case 'full_time': return 'Plný úvazek'
      default: return 'Ostatní'
    }
  }

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'dpp': return 'bg-blue-100 text-blue-800'
      case 'committee_member': return 'bg-green-100 text-green-800'
      case 'full_time': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSVJName = (svjId: string) => {
    return svjList?.find(svj => svj.id === svjId)?.name || 'Neznámé SVJ'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Načítání zaměstnanců...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Správa zaměstnanců</h1>
          <p className="text-gray-600">
            Přehled všech zaměstnanců napříč spravovanými SVJ
          </p>
        </div>
        <Button asChild data-test="add-employee-button">
          <Link to="/employees/new">
            <Plus className="h-4 w-4 mr-2" />
            Přidat zaměstnance
          </Link>
        </Button>
      </div>

      {/* Filtry a vyhledávání */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Vyhledávání */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Hledat podle jména nebo e-mailu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtr podle SVJ */}
            <select
              value={selectedSVJ}
              onChange={(e) => setSelectedSVJ(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrovat podle SVJ"
            >
              <option value="all">Všechna SVJ</option>
              {svjList?.map(svj => (
                <option key={svj.id} value={svj.id}>{svj.name}</option>
              ))}
            </select>

            {/* Filtr podle stavu */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrovat podle stavu"
            >
              <option value="all">Všechny stavy</option>
              <option value="active">Aktivní</option>
              <option value="inactive">Neaktivní</option>
            </select>

            {/* Rychlé akce */}
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Hromadný import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Celkem aktivních</p>
                <p className="text-2xl font-bold">{filteredEmployees.filter(e => e.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">DPP smlouvy</p>
                <p className="text-2xl font-bold">{filteredEmployees.filter(e => e.contractType === 'dpp').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Členové výborů</p>
                <p className="text-2xl font-bold">{filteredEmployees.filter(e => e.contractType === 'committee_member').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">S exekucemi</p>
                <p className="text-2xl font-bold">{filteredEmployees.filter(e => e.executions && e.executions.length > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seznam zaměstnanců */}
      <Card>
        <CardHeader>
          <CardTitle>Seznam zaměstnanců ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12" data-test="empty-state">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Žádní zaměstnanci nenalezeni
              </h3>
              <p className="text-gray-600 mb-4">
                Zkuste upravit filtry nebo přidat nového zaměstnance.
              </p>
              <Button asChild>
                <Link to="/employees/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Přidat prvního zaměstnance
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4" data-test="employees-table">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      employee.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {(employee.firstName || '').charAt(0)}{(employee.lastName || '').charAt(0)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {employee.firstName || 'N/A'} {employee.lastName || 'N/A'}
                        </h3>
                        {!employee.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Neaktivní
                          </Badge>
                        )}
                        {employee.executions && employee.executions.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Exekuce
                          </Badge>
                        )}
                        {employee.hasPinkDeclaration && (
                          <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700">
                            Růžové prohlášení
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{employee.email || 'Bez e-mailu'}</span>
                        <span>•</span>
                        <span>{getSVJName(employee.svjId)}</span>
                        <span>•</span>
                        <Badge className={`text-xs ${getContractTypeColor(employee.contractType)}`}>
                          {getContractTypeLabel(employee.contractType)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Mzda: {formatCurrency(employee.salary)}</span>
                        <span>•</span>
                        <span>ZP: {employee.healthInsurance}</span>
                        <span>•</span>
                        <span>Od: {formatDate(employee.startDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/employees/${employee.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/employees/${employee.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Upravit
                      </Link>
                    </Button>
                    
                    {employee.isActive && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const confirmed = window.confirm(`Opravdu chcete ukončit zaměstnance ${employee.firstName || 'N/A'} ${employee.lastName || 'N/A'}?\n\nTato akce označí zaměstnance jako neaktivního a vygeneruje dokumenty k ukončení.`)
                          if (confirmed) {
                            terminateEmployeeMutation.mutate(employee.id)
                          }
                        }}
                        disabled={terminateEmployeeMutation.isPending}
                        aria-label={`Ukončit zaměstnance ${employee.firstName || 'N/A'} ${employee.lastName || 'N/A'}`}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Ukončit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}