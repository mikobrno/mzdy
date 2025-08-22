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
  }
}

// Mock hesla
const mockPasswords: { [email: string]: string } = {
  'admin@example.com': 'admin123',
  'ucetni@example.com': 'ucetni123',
  'manazer@example.com': 'manazer123'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Dev bypass: pokud je nastavena promenná VITE_DEV_BYPASS=true, preskocime
    // sign-in a nastavime demo uzivatele (jen pro vyvoj). Napojeni na
    // Supabase zustava neni zmeneno.
    const devBypass = (import.meta.env as any).VITE_DEV_BYPASS === 'true'
    if (devBypass) {
      if (mounted) {
        setUser(mockUsers['admin@example.com'])
        setIsLoading(false)
      }
      return () => {
        mounted = false
      }
    }

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data.session
        if (mounted && session?.user) {
          const mapped = mapSupabaseUser(session.user)
          setUser(mapped)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.session?.user) {
        setUser(mapSupabaseUser(data.session.user))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
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
