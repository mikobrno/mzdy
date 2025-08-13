import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calculator, 
  Mail, 
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    title: 'SVJ',
    href: '/svj',
    icon: Building2
  },
  {
    title: 'Zaměstnanci',
    href: '/employees',
    icon: Users
  },
  {
    title: 'Mzdy',
    href: '/salaries',
    icon: Calculator
  },
  {
    title: 'Komunikace',
    href: '/communication',
    icon: Mail
  },
  {
    title: 'Nastavení',
    href: '/settings',
    icon: Settings
  }
]

export default function Navigation() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 p-2">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mzdy SVJ</h1>
              <p className="text-xs text-gray-500">Správa mezd a komunikace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-blue-700" : "text-gray-500"
                )} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Odhlásit se
          </Button>
        </div>
      </div>
    </aside>
  )
}