import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calculator, 
  Mail, 
  Settings,
  LogOut,
  User,
  FileText,
  Briefcase,
  ChevronUp,
  ChevronDown,
  UserCog,
  Bell,
  Shield,
  HelpCircle
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
    title: 'Mzdová agenda',
    href: '/payroll',
    icon: Briefcase
  },
  {
    title: 'Šablony',
    href: '/templates',
    icon: FileText
  },
  {
    title: 'PDF',
    href: '/pdf',
    icon: FileText
  },
  {
    title: 'Komunikace',
    href: '/communication-campaigns',
    icon: Mail
  },
  // Administrace
  {
    title: 'Zdravotní pojišťovny',
    href: '/health-insurance-admin',
    icon: Shield
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

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
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
            
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
          <div className="relative">
            {/* User Info Button */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              {isUserMenuOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserCog className="h-4 w-4 mr-3" />
                    Můj profil
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Bell className="h-4 w-4 mr-3" />
                    Centrum notifikací
                  </Link>
                  <Link
                    to="/settings/security"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    Zabezpečení
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Nápověda
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      logout()
                    }}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Odhlásit se
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}