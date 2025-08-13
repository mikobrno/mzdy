import { useQuery } from '@tanstack/react-query'
import { Building2, Users, Calculator, Mail, TrendingUp, AlertCircle } from 'lucide-react'
import StatsCard from '@/components/dashboard/stats-card'
import SVJOverviewCard from '@/components/dashboard/svj-overview-card'
import { apiService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { data: svjList, isLoading: svjLoading } = useQuery({
    queryKey: ['svj-list'],
    queryFn: apiService.getSVJList
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: apiService.getDashboardStats
  })

  const currentMonth = new Date().toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })

  if (svjLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Načítání...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Vítejte v systému Mzdy SVJ
        </h1>
        <p className="text-gray-600">
          Přehled všech spravovaných SVJ a aktuální stav mzdové agendy za {currentMonth}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Celkem SVJ"
          value={stats?.totalSvj || 0}
          icon={Building2}
          color="blue"
          trend={{
            value: 12,
            label: "oproti minulému měsíci",
            positive: true
          }}
        />
        
        <StatsCard
          title="Aktivní zaměstnanci"
          value={stats?.totalEmployees || 0}
          icon={Users}
          color="green"
        />
        
        <StatsCard
          title="Čekající mzdy"
          value={stats?.pendingSalaries || 0}
          icon={Calculator}
          color="orange"
        />
        
        <StatsCard
          title="Dokončené mzdy"
          value={stats?.completedSalariesThisMonth || 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Alert card for pending items */}
      {(stats?.pendingSalaries || 0) > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <span>Upozornění na nevyřízené mzdy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              Máte {stats?.pendingSalaries} nevyřízených mezd, které vyžadují vaši pozornost.
            </p>
            <Button asChild>
              <Link to="/salaries">
                Zobrazit čekající mzdy
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SVJ Overview Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Přehled spravovaných SVJ
          </h2>
          <Button asChild>
            <Link to="/svj/new">
              <Building2 className="h-4 w-4 mr-2" />
              Přidat nové SVJ
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {svjList?.map((svj) => (
            <SVJOverviewCard
              key={svj.id}
              svj={svj}
              completedMonths={Math.floor(Math.random() * 12) + 1} // Mock data
              totalEmployees={Math.floor(Math.random() * 8) + 2} // Mock data
            />
          ))}
        </div>

        {!svjList?.length && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Zatím nemáte žádná SVJ
              </h3>
              <p className="text-gray-600 mb-4">
                Začněte přidáním prvního SVJ do systému.
              </p>
              <Button asChild>
                <Link to="/svj/new">
                  Přidat první SVJ
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Rychlé akce</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/communication" className="flex flex-col items-center space-y-2">
                <Mail className="h-6 w-6" />
                <span>Odeslat výplatní pásky</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/employees" className="flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Spravovat zaměstnance</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/settings" className="flex flex-col items-center space-y-2">
                <Building2 className="h-6 w-6" />
                <span>Nastavení systému</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}