import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Mail, CheckCircle, Clock, Users } from 'lucide-react'
import { SVJ } from '@/types'
import { Link } from 'react-router-dom'

interface SVJOverviewCardProps {
  svj: SVJ
  completedMonths?: number
  totalEmployees?: number
}

export default function SVJOverviewCard({ 
  svj, 
  completedMonths = 8, 
  totalEmployees = 4 
}: SVJOverviewCardProps) {
  const monthsGrid = Array.from({ length: 12 }, (_, i) => i + 1)
  
  return (
    <Card className="group transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-fade-in border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
              {svj.name}
            </CardTitle>
            <p className="text-sm text-gray-600 max-w-md">
              {svj.quickDescription}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              IČO: {svj.ico}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Zpracované mzdy {new Date().getFullYear()}</span>
            <span className="text-sm text-gray-500">{completedMonths}/12</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            {monthsGrid.map((month) => (
              <div
                key={month}
                className={`h-6 rounded-sm flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  month <= completedMonths
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                } border hover:scale-110`}
                title={`${month}. měsíc ${month <= completedMonths ? '- Dokončeno' : '- Nedokončeno'}`}
              >
                {month <= completedMonths ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              </div>
            ))}
          </div>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Zaměstnanci:</span>
              <span className="font-medium text-gray-900">{totalEmployees}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Kontakt:</span>
              <span className="font-medium text-gray-900">{svj.contactPerson}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Výkazy:</span>
              <Badge variant={svj.reportDeliveryMethod === 'manager' ? 'default' : 'secondary'} className="text-xs">
                {svj.reportDeliveryMethod === 'manager' ? 'Správce' : 'Klient'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-3 border-t border-gray-100">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/svj/${svj.id}`}>
              <Building2 className="h-4 w-4 mr-2" />
              Detail SVJ
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link to={`/salaries/${svj.id}`}>
              Zpracovat mzdy
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}