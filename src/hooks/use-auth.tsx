import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { User } from '@/types'
import { nhost } from '@/lib/nhost'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  isInRole: (role: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Inicializace - kontrola aktuálního session
    const initAuth = () => {
      if (!mounted) return
      
      const nhostUser = nhost.auth.getUser()
      if (nhostUser) {
        setUser(mapNhostUser(nhostUser))
      }
      setIsLoading(false)
    }

    initAuth()

    // Listener na změny auth stavu
    const unsubscribe = nhost.auth.onAuthStateChanged((_event, session) => {
      if (!mounted) return
      
      if (session?.user) {
        setUser(mapNhostUser(session.user))
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { session, error } = await nhost.auth.signIn({ email, password })
      
      if (error) {
        throw new Error(error.message)
      }
      
      if (session?.user) {
        setUser(mapNhostUser(session.user))
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await nhost.auth.signOut()
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

  function mapNhostUser(nhostUser: any): User {
    // Mapování Nhost uživatele na naši User interface
    // Můžeme použít metadata nebo dodatečné query na users tabulku
    const role = nhostUser.metadata?.role || 'employee'
    const permissions: string[] = nhostUser.metadata?.permissions || []
    
    return {
      id: nhostUser.id,
      email: nhostUser.email || '',
      firstName: nhostUser.metadata?.firstName || nhostUser.displayName?.split(' ')[0] || '',
      lastName: nhostUser.metadata?.lastName || nhostUser.displayName?.split(' ').slice(1).join(' ') || '',
      role,
      permissions,
      isActive: true,
      createdAt: new Date(nhostUser.createdAt)
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
