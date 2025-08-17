import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { 
  Calculator,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Building2,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  svjName: string
  position: 'admin' | 'accountant' | 'manager'
  agreeToTerms: boolean
}

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    svjName: '',
    position: 'manager',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => {
      // Mock API volání
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: 'Registrace úspěšná' })
        }, 2000)
      })
    },
    onSuccess: () => {
      navigate('/login?registered=true')
    },
    onError: (error: any) => {
      setErrors({ 
        general: error.message || 'Registrace se nezdařila. Zkuste to prosím znovu.' 
      })
    }
  })

  const validateForm = (): {[key: string]: string} => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Jméno je povinné'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Příjmení je povinné'
    }
    
    if (!formData.email) {
      newErrors.email = 'E-mail je povinný'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail není ve správném formátu'
    }
    
    if (!formData.password) {
      newErrors.password = 'Heslo je povinné'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Heslo musí mít alespoň 8 znaků'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Heslo musí obsahovat malé písmeno, velké písmeno a číslici'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potvrzení hesla je povinné'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hesla se neshodují'
    }
    
    if (!formData.svjName.trim()) {
      newErrors.svjName = 'Název SVJ je povinný'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Musíte souhlasit s podmínkami užití'
    }
    
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    registerMutation.mutate(formData)
  }

  const positionOptions = [
    { value: 'admin', label: 'Administrátor', description: 'Plný přístup ke všem funkcím' },
    { value: 'accountant', label: 'Účetní', description: 'Správa mezd a finančních operací' },
    { value: 'manager', label: 'Manažer SVJ', description: 'Správa zaměstnanců a základních operací' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo a název */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mzdy SVJ</h1>
          <p className="text-gray-600">Vytvoření nového účtu pro správu SVJ</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Registrace</CardTitle>
            <CardDescription className="text-center">
              Vyplňte formulář pro vytvoření vašeho účtu
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Obecná chyba */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{errors.general}</span>
                </div>
              )}

              {/* Osobní údaje */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Jméno *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Vaše jméno"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Příjmení *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Vaše příjmení"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className={`pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* E-mail */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mailová adresa *
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
                    disabled={registerMutation.isPending}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Hesla */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Heslo *
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
                      disabled={registerMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={registerMutation.isPending}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Potvrzení hesla *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className={`pl-10 pr-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={registerMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={registerMutation.isPending}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* SVJ informace */}
              <div className="space-y-2">
                <label htmlFor="svjName" className="text-sm font-medium text-gray-700">
                  Název SVJ *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="svjName"
                    type="text"
                    placeholder="SVJ Krásná vyhlídka"
                    value={formData.svjName}
                    onChange={(e) => setFormData({...formData, svjName: e.target.value})}
                    className={`pl-10 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.svjName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={registerMutation.isPending}
                  />
                </div>
                {errors.svjName && (
                  <p className="text-sm text-red-600">{errors.svjName}</p>
                )}
              </div>

              {/* Pozice */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Vaše pozice *
                </label>
                <div className="space-y-2">
                  {positionOptions.map((option) => (
                    <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="position"
                        value={option.value}
                        checked={formData.position === option.value}
                        onChange={(e) => setFormData({...formData, position: e.target.value as any})}
                        className="text-blue-600 focus:ring-blue-500"
                        disabled={registerMutation.isPending}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Souhlas s podmínkami */}
              <div className="space-y-2">
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                    className={`mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                      errors.agreeToTerms ? 'border-red-300' : ''
                    }`}
                    disabled={registerMutation.isPending}
                  />
                  <span className="text-sm text-gray-700">
                    Souhlasím s{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
                      podmínkami užití
                    </Link>{' '}
                    a{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                      zásadami ochrany soukromí
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Registrace tlačítko */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registruji...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Vytvořit účet
                  </>
                )}
              </Button>
            </form>

            {/* Přihlášení odkaz */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Už máte účet?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  Přihlásit se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Mzdy SVJ. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </div>
  )
}
