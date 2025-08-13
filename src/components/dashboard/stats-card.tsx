import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  }
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  color = 'blue'
}: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg hover:scale-[1.02] animate-fade-in",
      colors.border,
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={cn("rounded-lg p-2", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {trend && (
            <div className={cn(
              "text-sm font-medium",
              trend.positive ? "text-green-600" : "text-red-600"
            )}>
              {trend.positive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        {trend && (
          <p className="text-xs text-gray-500 mt-1">
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}