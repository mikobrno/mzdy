import { useState, useMemo } from 'react'
import { Search, Filter, X, ArrowUpDown, Calendar, MapPin, Users, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SearchFiltersProps {
  onSearchChange: (search: string) => void
  onFiltersChange: (filters: FilterOptions) => void
  initialFilters?: FilterOptions
  totalResults?: number
  isLoading?: boolean
}

export interface FilterOptions {
  search: string
  isActive?: boolean
  employeeCountRange?: {
    min?: number
    max?: number
  }
  createdDateRange?: {
    from?: Date
    to?: Date
  }
  sortBy: 'name' | 'createdAt' | 'employeeCount' | 'lastActivity'
  sortOrder: 'asc' | 'desc'
  regions?: string[]
  hasDataBox?: boolean
}

const defaultFilters: FilterOptions = {
  search: '',
  sortBy: 'name',
  sortOrder: 'asc'
}

export function AdvancedSearchFilters({ 
  onSearchChange, 
  onFiltersChange, 
  initialFilters = defaultFilters,
  totalResults = 0,
  isLoading = false 
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
    
    if (key === 'search') {
      onSearchChange(value)
    }
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    onSearchChange('')
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.isActive !== undefined) count++
    if (filters.employeeCountRange?.min || filters.employeeCountRange?.max) count++
    if (filters.createdDateRange?.from || filters.createdDateRange?.to) count++
    if (filters.regions?.length) count++
    if (filters.hasDataBox !== undefined) count++
    return count
  }, [filters])

  const sortOptions = [
    { value: 'name', label: 'Název' },
    { value: 'createdAt', label: 'Datum vytvoření' },
    { value: 'employeeCount', label: 'Počet zaměstnanců' },
    { value: 'lastActivity', label: 'Poslední aktivita' }
  ]

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">Vyhledávání a filtry</CardTitle>
            {totalResults > 0 && (
              <Badge variant="secondary">
                {totalResults} výsledků
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                Vymazat ({activeFilterCount})
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtry
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hlavní vyhledávání */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat podle názvu, IČO, adresy..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Rychlé filtry */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Rychlé filtry:</span>
          
          <Button
            variant={filters.isActive === true ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('isActive', filters.isActive === true ? undefined : true)}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Aktivní
          </Button>
          
          <Button
            variant={filters.isActive === false ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('isActive', filters.isActive === false ? undefined : false)}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Neaktivní
          </Button>

          <Button
            variant={filters.hasDataBox === true ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('hasDataBox', filters.hasDataBox === true ? undefined : true)}
          >
            S datovou schránkou
          </Button>
        </div>

        {/* Řazení */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Řadit podle:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {filters.sortOrder === 'asc' ? 'Vzestupně' : 'Sestupně'}
          </Button>
        </div>

        {/* Rozšířené filtry */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Počet zaměstnanců */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Počet zaměstnanců
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Od"
                    min="0"
                    value={filters.employeeCountRange?.min || ''}
                    onChange={(e) => updateFilter('employeeCountRange', {
                      ...filters.employeeCountRange,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Do"
                    min="0"
                    value={filters.employeeCountRange?.max || ''}
                    onChange={(e) => updateFilter('employeeCountRange', {
                      ...filters.employeeCountRange,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Datum vytvoření */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Datum vytvoření
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.createdDateRange?.from?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilter('createdDateRange', {
                      ...filters.createdDateRange,
                      from: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={filters.createdDateRange?.to?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilter('createdDateRange', {
                      ...filters.createdDateRange,
                      to: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Región */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Región
                </label>
                <select
                  multiple
                  value={filters.regions || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value)
                    updateFilter('regions', selected.length > 0 ? selected : undefined)
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  size={4}
                >
                  <option value="praha">Praha</option>
                  <option value="brno">Brno</option>
                  <option value="ostrava">Ostrava</option>
                  <option value="plzen">Plzeň</option>
                  <option value="liberec">Liberec</option>
                  <option value="olomouc">Olomouc</option>
                  <option value="budejovice">České Budějovice</option>
                  <option value="hradec">Hradec Králové</option>
                </select>
              </div>
            </div>

            {/* Aktivní filtry přehled */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <span className="text-sm text-gray-600">Aktivní filtry:</span>
                
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Hledání: "{filters.search}"
                    <button onClick={() => updateFilter('search', '')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {filters.isActive !== undefined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.isActive ? 'Aktivní' : 'Neaktivní'}
                    <button onClick={() => updateFilter('isActive', undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {(filters.employeeCountRange?.min || filters.employeeCountRange?.max) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Zaměstnanci: {filters.employeeCountRange?.min || 0} - {filters.employeeCountRange?.max || '∞'}
                    <button onClick={() => updateFilter('employeeCountRange', undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {filters.regions?.length && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Regiony: {filters.regions.length}
                    <button onClick={() => updateFilter('regions', undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {filters.hasDataBox && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    S datovou schránkou
                    <button onClick={() => updateFilter('hasDataBox', undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading indikátor */}
        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Načítání...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
