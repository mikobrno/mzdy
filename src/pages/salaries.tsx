import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiService } from '@/services/api'
import { Building2, Calendar, CheckCircle2, Clock, Search, TrendingUp } from 'lucide-react'

type PeriodStatus = 'draft' | 'prepared' | 'approved' | 'paid'

function deterministicStatus(id: string, year: number, month: number): PeriodStatus {
  // Simple deterministic hash → status
  const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + year + month
  const mod = sum % 4
  return ['draft', 'prepared', 'approved', 'paid'][mod] as PeriodStatus
}

export default function SalariesPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | PeriodStatus>('all')

  const { data: svjList, isLoading } = useQuery({
    queryKey: ['svj-list'],
    queryFn: apiService.getSVJList,
    staleTime: 1000 * 60 * 5,
  })

  const enriched = useMemo(() => {
    return (svjList || []).map((svj) => ({
      ...svj,
      periodStatus: deterministicStatus(svj.id, year, month) as PeriodStatus,
      employeesCount: Math.floor((parseInt(svj.id, 10) || 1) * 3) % 12 + 2,
    }))
  }, [svjList, year, month])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return enriched.filter((s) => {
      const matchSearch = `${s.name} ${s.ico} ${s.address}`.toLowerCase().includes(q)
      const matchStatus = status === 'all' || s.periodStatus === status
      return matchSearch && matchStatus
    })
  }, [enriched, search, status])

  const counts = useMemo(() => {
    const total = enriched.length
    const prepared = enriched.filter((s) => s.periodStatus === 'prepared').length
    const approved = enriched.filter((s) => s.periodStatus === 'approved').length
    const paid = enriched.filter((s) => s.periodStatus === 'paid').length
    return { total, prepared, approved, paid }
  }, [enriched])

  const openMonthly = (svjId: string) => {
    navigate(`/salaries/${svjId}/${year}/${month}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Načítání…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mzdová agenda</h1>
          <p className="text-gray-600">Správa mezd, výpočty a schvalování po SVJ.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">SVJ v přehledu</p>
                <p className="text-2xl font-bold">{counts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Připraveno</p>
                <p className="text-2xl font-bold">{counts.prepared}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Schváleno</p>
                <p className="text-2xl font-bold">{counts.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Vyplaceno</p>
                <p className="text-2xl font-bold">{counts.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat SVJ…"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                aria-label="Hledat SVJ"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                aria-label="Rok"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = now.getFullYear() - 2 + i
                  return (
                    <option key={y} value={y}>{y}</option>
                  )
                })}
              </select>
              <select
                aria-label="Měsíc"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleDateString('cs-CZ', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <select
              aria-label="Stav období"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Všechny stavy</option>
              <option value="draft">Návrh</option>
              <option value="prepared">Připraveno</option>
              <option value="approved">Schváleno</option>
              <option value="paid">Vyplaceno</option>
            </select>
            <div className="flex items-center justify-end">
              <Button variant="outline" onClick={() => { setSearch(''); setStatus('all'); setYear(now.getFullYear()); setMonth(now.getMonth() + 1) }}>
                Obnovit filtry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-600">Žádná SVJ nenalezena.</CardContent>
          </Card>
        ) : (
          filtered.map((svj) => (
            <Card key={svj.id} className="hover:bg-gray-50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{svj.name}</span>
                      <Badge variant="secondary">IČO {svj.ico}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">{svj.address}</div>
                    <div className="mt-1 text-xs text-gray-500">{svj.employeesCount} zaměstnanců</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Stav {month}.{year}</div>
                    <div className="mt-1">
                      {svj.periodStatus === 'draft' && (
                        <Badge variant="outline">Návrh</Badge>
                      )}
                      {svj.periodStatus === 'prepared' && (
                        <Badge className="bg-yellow-100 text-yellow-800">Připraveno</Badge>
                      )}
                      {svj.periodStatus === 'approved' && (
                        <Badge className="bg-blue-100 text-blue-800">Schváleno</Badge>
                      )}
                      {svj.periodStatus === 'paid' && (
                        <Badge className="bg-green-100 text-green-800">Vyplaceno</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => openMonthly(svj.id)}>Otevřít</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
