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
  signUpWithEmail: (email: string, password: string) => Promise<any>
  sendPasswordResetEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// (Původní mock uživatelé byly odstraněny — nyní čistě Supabase Auth)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Inicializuj stav z aktuální session Supabase a přihlášení posluchače změn
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (mounted && data?.session?.user) {
          setUser(mapSupabaseUser(data.session.user))
        }
      } catch (e) {
        // Pokud Supabase není dostupné, ponecháme uživatele jako null (fallback je stále možný)
        console.warn('Supabase session check failed, falling back to no-session', e)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      try { listener?.subscription?.unsubscribe() } catch (e) { /* ignore */ }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
  // Pouze Supabase auth
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

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Supabase signOut failed, clearing local user anyway', e)
    }
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

  async function signUpWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        console.error('Chyba při registraci:', error.message)
        throw new Error('Registrace selhala. Zkontrolujte zadané údaje.')
      }
      return data
    } catch (err) {
      throw err
    }
  }

  async function sendPasswordResetEmail(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        console.error('Chyba při odesílání resetu hesla:', error.message)
        throw new Error('Odeslání resetu hesla selhalo. Zkontrolujte e-mailovou adresu.')
      }
    } catch (err) {
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      hasPermission,
      isInRole,
      signUpWithEmail,
      sendPasswordResetEmail
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
