import { useState, useContext, createContext } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth musí být použito uvnitř AuthProvider')
  }
  return context
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>({
    id: '1',
    email: 'admin@example.com',
    firstName: 'Jan',
    lastName: 'Novák',
    role: 'super_admin',
    permissions: ['read_all', 'write_all', 'admin'],
    isActive: true,
    createdAt: new Date()
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock login - nahraďte skutečným API voláním
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({
        id: '1',
        email,
        firstName: 'Jan',
        lastName: 'Novák',
        role: 'super_admin',
        permissions: ['read_all', 'write_all', 'admin'],
        isActive: true,
        createdAt: new Date()
      })
    } catch (error) {
      throw new Error('Přihlášení se nezdařilo')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return {
    user,
    login,
    logout,
    isLoading
  }
}

export { AuthContext }