import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  isInRole: (role: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock uživatelé pro testování
const mockUsers: { [email: string]: User } = {
  'admin@example.com': {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Jan',
    lastName: 'Novák',
    role: 'super_admin' as any,
    permissions: ['read_all', 'write_all', 'admin'],
    isActive: true,
    createdAt: new Date()
  },
  'ucetni@example.com': {
    id: '2',
    email: 'ucetni@example.com',
    firstName: 'Marie',
    lastName: 'Svobodová',
    role: 'payroll_accountant' as any,
    permissions: ['payroll_read', 'payroll_write', 'employees_read'],
    isActive: true,
    createdAt: new Date()
  },
  'manazer@example.com': {
    id: '3',
    email: 'manazer@example.com',
    firstName: 'Petr',
    lastName: 'Dvořák',
    role: 'committee_member' as any,
    permissions: ['employees_read', 'svj_read'],
    isActive: true,
    createdAt: new Date()
  },
  'admin@onlinesprava.cz': {
    id: '123e4567-e89b-12d3-a456-426614174000', // Skutečné ID v databázi
    email: 'admin@onlinesprava.cz',
    firstName: 'Admin',
    lastName: 'Správa',
    role: 'super_admin' as any,
    permissions: ['read_all', 'write_all', 'admin'],
    isActive: true,
    createdAt: new Date()
  }
}

// Mock hesla
const mockPasswords: { [email: string]: string } = {
  'admin@example.com': 'admin123',
  'ucetni@example.com': 'ucetni123',
  'manazer@example.com': 'manazer123',
  'admin@onlinesprava.cz': '123456'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Pro vývoj používáme pouze mock přihlášení, přeskačíváme Supabase auth
    console.log('🔒 Používám mock přihlášení pro vývoj')
    if (mounted) {
      setUser(mockUsers['admin@onlinesprava.cz'])
      setIsLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Nejdřív zkusíme mock přihlášení pro známé účty
      if (mockUsers[email] && mockPasswords[email] === password) {
        setUser(mockUsers[email])
        setIsLoading(false)
        return
      }

      // Pokud není v mock datech, zkusíme Supabase
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Chyba při přihlášení:', error.message)
        throw new Error('Přihlášení selhalo. Zkontrolujte e-mail a heslo.')
      }
      if (data.session?.user) {
        setUser(mapSupabaseUser(data.session.user))
      }
    } catch (err: any) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsAdmin = () => {
    setUser(mockUsers['admin@example.com'])
  }

  const logout = async () => {
    // Přepneme na jiný mock uživatel nebo zůstaneme na stejném
    console.log('🔓 Odhlášení - zůstávám s mock uživatelem')
    // Můžeme přepnout na jiný účet nebo zůstat stejný
    setUser(mockUsers['admin@onlinesprava.cz'])
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.permissions?.includes('read_all') || user.permissions?.includes('write_all')) return true
    return user.permissions?.includes(permission) || false
  }

  const isInRole = (role: string | string[]): boolean => {
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role as any)
  }

  function mapSupabaseUser(sUser: { id: string; email?: string | null; user_metadata?: any }): User {
    // Zde lze doplnit fetch na profilovou tabulku (např. profiles) pro role/permissions
    const role = sUser.user_metadata?.role || 'employee'
    const permissions: string[] = sUser.user_metadata?.permissions || []
    return {
      id: sUser.id,
      email: sUser.email || '',
      firstName: sUser.user_metadata?.firstName || '',
      lastName: sUser.user_metadata?.lastName || '',
      role,
      permissions,
      isActive: true,
      createdAt: new Date()
    }
  }



  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      hasPermission,
      isInRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth musí být použito uvnitř AuthProvider')
  }
  return context
}

export { AuthContext }
