import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/services/api'
import { Building2, Search, Users, CheckCircle, AlertTriangle, Plus, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SVJListPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const { data: svjList, isLoading } = useQuery({
    queryKey: ['svj-list'],
    queryFn: apiService.getSVJList
  })

  const filtered = (svjList || []).filter(s => {
    const mSearch = [s.name, s.ico, s.address, s.contactPerson, s.contactEmail]
      .filter(Boolean)
      .join(' ') 
      .toLowerCase()
      .includes(search.toLowerCase())
    const mStatus = status === 'all' || (!!s.isActive === (status === 'active'))
    return mSearch && mStatus
  })

  const activeCount = (svjList || []).filter(s => s.isActive !== false).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Načítání SVJ…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Správa SVJ</h1>
          <p className="text-gray-600">Zde je seznam všech SVJ a možnost jejich správy.</p>
        </div>
        <Button asChild variant="default" className="flex items-center gap-2" data-test="add-svj-btn">
          <Link to="/svj/new" data-test="add-svj-link">
            <Plus className="h-4 w-4" /> Přidat SVJ
          </Link>
        </Button>
      </div>

      {/* Statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Celkem SVJ</p>
                <p className="text-2xl font-bold">{svjList?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aktivní</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Neaktivní</p>
                <p className="text-2xl font-bold">{(svjList?.length ?? 0) - activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtry */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Hledat podle názvu, IČO, adresy…"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                aria-label="Hledat SVJ"
              />
            </div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrovat podle stavu"
            >
              <option value="all">Všechny stavy</option>
              <option value="active">Aktivní</option>
              <option value="inactive">Neaktivní</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Seznam SVJ */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-600">Žádná SVJ nenalezena.</CardContent>
          </Card>
        ) : (
          filtered.map((svj) => (
            <Card key={svj.id} className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/svj/${svj.id}`} className="text-lg font-medium text-blue-700 hover:underline">
                        {svj.name}
                      </Link>
                      {svj.isActive === false ? (
                        <Badge variant="secondary">Neaktivní</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200">Aktivní</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      IČO: {svj.ico} • {svj.address}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" /> Kontaktní osoba: {svj.contactPerson} • {svj.contactEmail}
                    </div>
                    {svj.registryData && (
                      <div className="text-xs text-gray-500 mt-1">
                        OR: {svj.registryData.officialName} • ověřeno {new Date(svj.registryData.verificationDate).toLocaleDateString('cs-CZ')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/svj/${svj.id}`}>Detail</Link>
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Mail className="h-4 w-4 mr-1" /> Kontaktovat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
