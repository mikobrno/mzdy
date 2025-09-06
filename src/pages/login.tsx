import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { 
  Calculator,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      login(email, password),
    onSuccess: () => {
      navigate('/')
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : undefined
      setErrors({ 
        general: message || 'Přihlášení se nezdařilo. Zkontrolujte přihlašovací údaje.' 
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    // Validace
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.email) {
      newErrors.email = 'E-mail je povinný'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail není ve správném formátu'
    }
    
    if (!formData.password) {
      newErrors.password = 'Heslo je povinné'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Heslo musí mít alespoň 6 znaků'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    loginMutation.mutate({
      email: formData.email,
      password: formData.password
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo a název */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mzdy SVJ</h1>
          <p className="text-gray-600">Správa mezd a komunikace pro SVJ</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Přihlášení</CardTitle>
            <CardDescription className="text-center">
              Zadejte své přihlašovací údaje pro pokračování
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Obecná chyba */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2" data-test="login-error">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{errors.general}</span>
                </div>
              )}

              {/* E-mail */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mailová adresa
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="vas.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={loginMutation.isPending}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Heslo */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Heslo
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`pl-10 pr-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loginMutation.isPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Zapamatovat si mě */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loginMutation.isPending}
                  />
                  <span className="text-sm text-gray-700">Zapamatovat si mě</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Zapomněli jste heslo?
                </Link>
              </div>

              {/* Přihlášení tlačítko */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Přihlašuji...
                  </>
                ) : (
                  'Přihlásit se'
                )}
              </Button>
            </form>

            {/* Demo účty */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">Demo účty pro testování:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Admin:</strong> admin@onlinesprava.cz / 123456
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Účetní:</strong> ucetni@example.com / ucetni123
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Manažer:</strong> manazer@example.com / manazer123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Mzdy SVJ. Všechna práva vyhrazena.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy" className="hover:text-gray-700">Ochrana soukromí</Link>
            <Link to="/terms" className="hover:text-gray-700">Podmínky užití</Link>
            <Link to="/support" className="hover:text-gray-700">Podpora</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
